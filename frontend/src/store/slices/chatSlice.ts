import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatContact, ChatMessageItem, ChatUser } from '../../api/chatApi';
import { logout } from './authSlice';
import { selectBusiness } from './businessSlice';


export const getConversationKey = (businessId?: string | null, partnerId?: string | null): string => {
  const bId = businessId && businessId !== 'all' && businessId !== 'null' && businessId !== 'undefined'
    ? businessId
    : 'global';
  const pId = partnerId || 'general';
  return `${bId}:${pId}`;
};

interface ChatState {
  contacts: ChatContact[];
  selectedPartnerId: string | null;
  selectedPartner: ChatUser | null;
  // Keyed by `${businessId || 'global'}:${partnerId}`
  messages: Record<string, ChatMessageItem[]>;
  onlineUserIds: string[];
  typingUsers: Record<string, boolean>;
  totalUnreadCount: number;
  isChatDrawerOpen: boolean;
  isLoadingContacts: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  contacts: [],
  selectedPartnerId: null,
  selectedPartner: null,
  messages: {},
  onlineUserIds: [],
  typingUsers: {},
  totalUnreadCount: 0,
  isChatDrawerOpen: false,
  isLoadingContacts: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<ChatContact[]>) => {
      state.contacts = action.payload;
      state.totalUnreadCount = action.payload.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

      // If current selected partner is not in the contacts list, default to Admin contact
      if (
        action.payload.length > 0 &&
        (!state.selectedPartnerId || !action.payload.some((c) => c.id === state.selectedPartnerId))
      ) {
        const adminContact =
          action.payload.find((c) => c.role === 'DROPSHIPPER' || c.isPlatformAdmin) || action.payload[0];
        state.selectedPartnerId = adminContact.id;
        state.selectedPartner = {
          id: adminContact.id,
          name: adminContact.name,
          email: adminContact.email,
          role: adminContact.role,
          is_active: adminContact.is_active,
        };
      } else if (action.payload.length === 0) {
        state.selectedPartnerId = null;
        state.selectedPartner = null;
      }
    },
    setSelectedPartnerId: (state, action: PayloadAction<string | null>) => {
      state.selectedPartnerId = action.payload;
      if (action.payload) {
        // Find partner in contacts
        const contact = state.contacts.find((c) => c.id === action.payload);
        if (contact) {
          state.selectedPartner = {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            role: contact.role,
            is_active: contact.is_active,
          };
          // Reset unread count for this contact
          state.totalUnreadCount = Math.max(0, state.totalUnreadCount - (contact.unreadCount || 0));
          contact.unreadCount = 0;
        }
      } else {
        state.selectedPartner = null;
      }
    },
    setSelectedPartner: (state, action: PayloadAction<ChatUser | null>) => {
      state.selectedPartner = action.payload;
      if (action.payload) {
        state.selectedPartnerId = action.payload.id;
      }
    },
    setMessagesForPartner: (
      state,
      action: PayloadAction<{ businessId?: string | null; partnerId: string; messages: ChatMessageItem[] }>
    ) => {
      const { businessId, partnerId, messages } = action.payload;
      const key = getConversationKey(businessId, partnerId);
      state.messages[key] = (Array.isArray(messages) ? messages : []).map((m) => ({
        ...m,
        created_at: m.created_at || (m as any).createdAt || (m as any).timestamp || new Date().toISOString(),
      }));
    },
    addMessage: (
      state,
      action: PayloadAction<{ currentUserId: string; currentBusinessId?: string | null; message: ChatMessageItem }>
    ) => {
      const { currentUserId, currentBusinessId, message } = action.payload;
      const normalizedCreatedAt =
        message.created_at ||
        (message as any).createdAt ||
        (message as any).timestamp ||
        new Date().toISOString();
      const normalizedMessage: ChatMessageItem = {
        ...message,
        created_at: normalizedCreatedAt,
      };

      const bizId = normalizedMessage.business_id || currentBusinessId || null;

      if (normalizedMessage.message_type === 'BROADCAST') {
        const targetRole = normalizedMessage.target_role || 'ALL';
        const isFromSelf = normalizedMessage.sender_id === currentUserId;

        if (!isFromSelf) {
          // Received broadcast from Admin
          const adminPartnerId = normalizedMessage.sender_id;
          const key = getConversationKey(bizId, adminPartnerId);
          if (!state.messages[key]) {
            state.messages[key] = [];
          }
          const exists = state.messages[key].some((m) => m.id === normalizedMessage.id);
          if (!exists) {
            state.messages[key].push(normalizedMessage);
          }
          const contact = state.contacts.find((c) => c.id === adminPartnerId);
          if (contact) {
            contact.lastMessage = {
              id: normalizedMessage.id,
              content: `📢 ${normalizedMessage.content}`,
              created_at: normalizedCreatedAt,
              sender_id: normalizedMessage.sender_id,
              is_read: false,
            };
            if (state.selectedPartnerId !== adminPartnerId) {
              contact.unreadCount = (contact.unreadCount || 0) + 1;
              state.totalUnreadCount += 1;
            }
          }
        } else {
          // Admin sent a broadcast: distribute to contacts matching target_role (or all)
          state.contacts.forEach((contact) => {
            if (targetRole === 'ALL' || contact.role === targetRole) {
              const key = getConversationKey(bizId, contact.id);
              if (!state.messages[key]) {
                state.messages[key] = [];
              }
              const exists = state.messages[key].some((m) => m.id === normalizedMessage.id);
              if (!exists) {
                state.messages[key].push(normalizedMessage);
              }
              contact.lastMessage = {
                id: normalizedMessage.id,
                content: `📢 ${normalizedMessage.content}`,
                created_at: normalizedCreatedAt,
                sender_id: normalizedMessage.sender_id,
                is_read: true,
              };
            }
          });
        }

        // Re-sort contacts
        state.contacts.sort((a, b) => {
          const timeA = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
          const timeB = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
          return timeB - timeA;
        });
        return;
      }

      const partnerId =
        normalizedMessage.sender_id === currentUserId
          ? normalizedMessage.receiver_id || 'broadcast'
          : normalizedMessage.sender_id;

      const key = getConversationKey(bizId, partnerId);
      if (!state.messages[key]) {
        state.messages[key] = [];
      }

      // Avoid duplicates
      const exists = state.messages[key].some((m) => m.id === normalizedMessage.id);
      if (!exists) {
        state.messages[key].push(normalizedMessage);
      }

      // Update contact's lastMessage and unread count
      const contact = state.contacts.find((c) => c.id === partnerId);
      if (contact) {
        contact.lastMessage = {
          id: normalizedMessage.id,
          content: normalizedMessage.content,
          created_at: normalizedCreatedAt,
          sender_id: normalizedMessage.sender_id,
          is_read: normalizedMessage.is_read,
        };

        // If message is from partner and chat drawer is closed OR partner not focused, increment unread count
        if (
          normalizedMessage.sender_id !== currentUserId &&
          (!state.isChatDrawerOpen || state.selectedPartnerId !== partnerId)
        ) {
          contact.unreadCount = (contact.unreadCount || 0) + 1;
          state.totalUnreadCount += 1;
        }
      } else if (normalizedMessage.sender && normalizedMessage.sender.id !== currentUserId) {
        // If partner is not in existing contact list, add them dynamically
        const isUnread = !state.isChatDrawerOpen || state.selectedPartnerId !== normalizedMessage.sender.id;
        const newContact: ChatContact = {
          id: normalizedMessage.sender.id,
          name: normalizedMessage.sender.name,
          email: normalizedMessage.sender.email,
          role: normalizedMessage.sender.role,
          is_active: true,
          lastMessage: {
            id: normalizedMessage.id,
            content: normalizedMessage.content,
            created_at: normalizedCreatedAt,
            sender_id: normalizedMessage.sender_id,
            is_read: normalizedMessage.is_read,
          },
          unreadCount: isUnread ? 1 : 0,
        };
        state.contacts.unshift(newContact);
        if (isUnread) {
          state.totalUnreadCount += 1;
        }
      }

      // Re-sort contacts so newest active conversation stays on top
      state.contacts.sort((a, b) => {
        const timeA = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
        const timeB = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
        return timeB - timeA;
      });
    },
    markMessagesAsReadLocally: (
      state,
      action: PayloadAction<{ businessId?: string | null; partnerId: string }>
    ) => {
      const { businessId, partnerId } = action.payload;
      const key = getConversationKey(businessId, partnerId);
      if (state.messages[key]) {
        state.messages[key].forEach((m) => {
          m.is_read = true;
        });
      }
      const contact = state.contacts.find((c) => c.id === partnerId);
      if (contact) {
        state.totalUnreadCount = Math.max(0, state.totalUnreadCount - (contact.unreadCount || 0));
        contact.unreadCount = 0;
      }
    },
    setOnlineUserIds: (state, action: PayloadAction<string[]>) => {
      state.onlineUserIds = action.payload;
    },
    setUserTyping: (
      state,
      action: PayloadAction<{ partnerId: string; isTyping: boolean }>
    ) => {
      const { partnerId, isTyping } = action.payload;
      state.typingUsers[partnerId] = isTyping;
    },
    setTotalUnreadCount: (state, action: PayloadAction<number>) => {
      state.totalUnreadCount = action.payload;
    },
    setChatDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatDrawerOpen = action.payload;
      if (action.payload && state.selectedPartnerId) {
        const contact = state.contacts.find((c) => c.id === state.selectedPartnerId);
        if (contact && contact.unreadCount) {
          state.totalUnreadCount = Math.max(0, state.totalUnreadCount - contact.unreadCount);
          contact.unreadCount = 0;
        }
      }
    },
    toggleChatDrawer: (state) => {
      state.isChatDrawerOpen = !state.isChatDrawerOpen;
      if (state.isChatDrawerOpen && state.selectedPartnerId) {
        const contact = state.contacts.find((c) => c.id === state.selectedPartnerId);
        if (contact && contact.unreadCount) {
          state.totalUnreadCount = Math.max(0, state.totalUnreadCount - contact.unreadCount);
          contact.unreadCount = 0;
        }
      }
    },
    setLoadingContacts: (state, action: PayloadAction<boolean>) => {
      state.isLoadingContacts = action.payload;
    },
    setLoadingMessages: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMessages = action.payload;
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetChatOnBusinessChange: (state) => {
      state.contacts = [];
      state.selectedPartnerId = null;
      state.selectedPartner = null;
      state.totalUnreadCount = 0;
      state.typingUsers = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.contacts = [];
        state.selectedPartnerId = null;
        state.selectedPartner = null;
        state.totalUnreadCount = 0;
        state.typingUsers = {};
        state.isLoadingContacts = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.contacts = [];
        state.selectedPartnerId = null;
        state.selectedPartner = null;
        state.messages = {};
        state.onlineUserIds = [];
        state.typingUsers = {};
        state.totalUnreadCount = 0;
        state.isChatDrawerOpen = false;
        state.isLoadingContacts = false;
        state.isLoadingMessages = false;
        state.isSending = false;
        state.error = null;
      });
  },

});

export const {
  setContacts,
  setSelectedPartnerId,
  setSelectedPartner,
  setMessagesForPartner,
  addMessage,
  markMessagesAsReadLocally,
  setOnlineUserIds,
  setUserTyping,
  setTotalUnreadCount,
  setChatDrawerOpen,
  toggleChatDrawer,
  setLoadingContacts,
  setLoadingMessages,
  setSending,
  setError,
  resetChatOnBusinessChange,
} = chatSlice.actions;

export default chatSlice.reducer;
