import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { chatApi, type ChatMessageItem } from '../api/chatApi';
import { socketService } from '../services/socketService';
import { getCookie } from '../utils/cookie';
import {
  setContacts,
  setSelectedPartnerId,
  setMessagesForPartner,
  addMessage,
  markMessagesAsReadLocally,
  setOnlineUserIds,
  setUserTyping,
  setLoadingContacts,
  setLoadingMessages,
  setSending,
  setError,
  resetChatOnBusinessChange,
  getConversationKey,
} from '../store/slices/chatSlice';

export const useChat = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedBusiness } = useAppSelector((state) => state.business);
  const {
    contacts,
    selectedPartnerId,
    selectedPartner,
    messages,
    onlineUserIds,
    typingUsers,
    totalUnreadCount,
    isChatDrawerOpen,
    isLoadingContacts,
    isLoadingMessages,
    isSending,
  } = useAppSelector((state) => state.chat);

  const activePartnerRef = useRef<string | null>(null);
  activePartnerRef.current = selectedPartnerId;

  const currentBusinessId =
    selectedBusiness?.id && selectedBusiness.id !== 'all' ? selectedBusiness.id : null;
  const currentBusinessIdRef = useRef<string | null>(null);
  currentBusinessIdRef.current = currentBusinessId;

  // 1. Initialize WebSocket Connection when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketService.disconnect();
      return;
    }

    const getAuthToken = () => {
      return (
        getCookie('accessToken') ||
        getCookie('token') ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('accessToken') || localStorage.getItem('token')
          : '') ||
        ''
      );
    };

    const token = getAuthToken();
    const socket = socketService.connect(token, currentBusinessId || undefined);

    if (socket) {
      const handleOnlineUsers = (userIds: string[]) => {
        dispatch(setOnlineUserIds(userIds));
      };

      const handleReceiveMessage = (msg: ChatMessageItem) => {
        if (user) {
          dispatch(
            addMessage({
              currentUserId: user.id,
              currentBusinessId: currentBusinessIdRef.current,
              message: msg,
            })
          );

          // If currently chatting with this sender in the same business context, mark as read
          const msgBizId = msg.business_id || null;
          const isSameBiz =
            !msgBizId ||
            !currentBusinessIdRef.current ||
            msgBizId === currentBusinessIdRef.current;

          if (activePartnerRef.current === msg.sender_id && isSameBiz) {
            socketService.markRead(msg.sender_id, currentBusinessIdRef.current || undefined);
          }
        }
      };

      const handleMessageSent = (msg: ChatMessageItem) => {
        if (user) {
          dispatch(
            addMessage({
              currentUserId: user.id,
              currentBusinessId: currentBusinessIdRef.current,
              message: msg,
            })
          );
        }
      };

      const handleReceiveBroadcast = (broadcast: ChatMessageItem) => {
        if (user) {
          dispatch(
            addMessage({
              currentUserId: user.id,
              currentBusinessId: currentBusinessIdRef.current,
              message: broadcast,
            })
          );
        }
      };

      const handleUserTyping = ({
        senderId,
        isTyping,
        businessId,
      }: {
        senderId: string;
        isTyping: boolean;
        businessId?: string;
      }) => {
        const isSameBiz =
          !businessId ||
          !currentBusinessIdRef.current ||
          businessId === currentBusinessIdRef.current;

        if (isSameBiz) {
          dispatch(setUserTyping({ partnerId: senderId, isTyping }));
        }
      };

      const handleMessagesRead = ({
        readerId,
        businessId,
      }: {
        readerId: string;
        businessId?: string;
      }) => {
        dispatch(
          markMessagesAsReadLocally({
            businessId: businessId || currentBusinessIdRef.current,
            partnerId: readerId,
          })
        );
      };

      const handleErrorMessage = ({ message }: { message: string }) => {
        dispatch(setError(message || 'You are not allowed to message this user.'));
      };

      socket.on('online_users', handleOnlineUsers);
      socket.on('receive_message', handleReceiveMessage);
      socket.on('message_sent', handleMessageSent);
      socket.on('receive_broadcast', handleReceiveBroadcast);
      socket.on('user_typing', handleUserTyping);
      socket.on('messages_read', handleMessagesRead);
      socket.on('message_error', handleErrorMessage);
      socket.on('error_message', handleErrorMessage);

      return () => {
        socket.off('online_users', handleOnlineUsers);
        socket.off('receive_message', handleReceiveMessage);
        socket.off('message_sent', handleMessageSent);
        socket.off('receive_broadcast', handleReceiveBroadcast);
        socket.off('user_typing', handleUserTyping);
        socket.off('messages_read', handleMessagesRead);
        socket.off('message_error', handleErrorMessage);
        socket.off('error_message', handleErrorMessage);
      };
    }
  }, [isAuthenticated, user?.id, dispatch]);

  // 2. Handle Business Switching: join/leave socket rooms & reset state
  useEffect(() => {
    if (socketService.isConnected()) {
      if (currentBusinessId) {
        socketService.joinBusiness(currentBusinessId);
      }
    }

    return () => {
      if (currentBusinessId && socketService.isConnected()) {
        socketService.leaveBusiness(currentBusinessId);
      }
    };
  }, [currentBusinessId]);

  // 3. Fetch Contacts List when business or auth changes
  const fetchContacts = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch(setLoadingContacts(true));
    try {
      const res = await chatApi.getContacts(
        currentBusinessId ? { business_id: currentBusinessId } : undefined
      );
      if (res.success && Array.isArray(res.data)) {
        dispatch(setContacts(res.data));

        // Auto-select contact if none is currently selected
        if (res.data.length > 0) {
          if (!activePartnerRef.current || !res.data.some((c) => c.id === activePartnerRef.current)) {
            const adminContact =
              res.data.find((c: any) => c.role === 'DROPSHIPPER' || c.isPlatformAdmin) || res.data[0];
            dispatch(setSelectedPartnerId(adminContact.id));
          }
        } else {
          dispatch(setSelectedPartnerId(null));
        }
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to load contacts'));
    } finally {
      dispatch(setLoadingContacts(false));
    }
  }, [isAuthenticated, currentBusinessId, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated, fetchContacts]);

  // 4. Fetch Message History for active partner
  const fetchMessages = useCallback(
    async (partnerId: string) => {
      if (!partnerId) return;
      dispatch(setLoadingMessages(true));
      try {
        const res = await chatApi.getMessages(
          partnerId,
          currentBusinessId ? { business_id: currentBusinessId } : undefined
        );
        if (res.success && res.data) {
          dispatch(
            setMessagesForPartner({
              businessId: currentBusinessId,
              partnerId,
              messages: res.data.messages || [],
            })
          );
          // Mark as read in WebSocket and local state
          socketService.markRead(partnerId, currentBusinessId || undefined);
          dispatch(
            markMessagesAsReadLocally({
              businessId: currentBusinessId,
              partnerId,
            })
          );
        }
      } catch (err: any) {
        dispatch(setError(err.message || 'Failed to load messages'));
      } finally {
        dispatch(setLoadingMessages(false));
      }
    },
    [currentBusinessId, dispatch]
  );

  useEffect(() => {
    if (selectedPartnerId) {
      fetchMessages(selectedPartnerId);
    }
  }, [selectedPartnerId, fetchMessages]);

  // 5. Send Message Handler
  const sendMessage = useCallback(
    async (content: string, attachmentUrl?: string) => {
      const targetPartnerId =
        selectedPartnerId || selectedPartner?.id || (contacts.length > 0 ? contacts[0].id : null);
      if (!targetPartnerId || !content.trim() || !user) return;

      dispatch(setSending(true));
      const messageText = content.trim();

      if (socketService.isConnected()) {
        socketService.sendMessage(
          {
            receiverId: targetPartnerId,
            content: messageText,
            attachmentUrl,
            businessId: currentBusinessId || undefined,
          },
          async (res) => {
            if (res?.error) {
              // Fallback to REST API if WebSocket returns error
              try {
                const apiRes = await chatApi.sendMessage({
                  receiver_id: targetPartnerId,
                  content: messageText,
                  attachment_url: attachmentUrl,
                  business_id: currentBusinessId || undefined,
                });
                if (apiRes.success && apiRes.data) {
                  dispatch(
                    addMessage({
                      currentUserId: user.id,
                      currentBusinessId,
                      message: apiRes.data,
                    })
                  );
                }
              } catch (err: any) {
                dispatch(setError(err.message || 'Failed to send message'));
              }
            } else if (res?.message) {
              dispatch(
                addMessage({
                  currentUserId: user.id,
                  currentBusinessId,
                  message: res.message,
                })
              );
            }
            dispatch(setSending(false));
          }
        );
      } else {
        // Direct REST API send if socket is disconnected
        try {
          const apiRes = await chatApi.sendMessage({
            receiver_id: targetPartnerId,
            content: messageText,
            attachment_url: attachmentUrl,
            business_id: currentBusinessId || undefined,
          });
          if (apiRes.success && apiRes.data) {
            dispatch(
              addMessage({
                currentUserId: user.id,
                currentBusinessId,
                message: apiRes.data,
              })
            );
          }
        } catch (err: any) {
          dispatch(setError(err.message || 'Failed to send message'));
        } finally {
          dispatch(setSending(false));
        }
      }
    },
    [selectedPartnerId, selectedPartner?.id, contacts, user, currentBusinessId, dispatch]
  );

  // 6. Send Broadcast Handler (Admin only)
  const sendBroadcast = useCallback(
    async (
      content: string,
      targetRole: 'ALL' | 'DEALER' | 'MARKETING' | 'SALES' = 'ALL',
      attachmentUrl?: string
    ) => {
      if (!content.trim() || !user || user.role !== 'DROPSHIPPER') return;

      dispatch(setSending(true));
      const messageText = content.trim();

      if (socketService.isConnected()) {
        socketService.sendBroadcast(
          {
            content: messageText,
            targetRole,
            attachmentUrl,
            businessId: currentBusinessId || undefined,
          },
          async (res) => {
            if (res?.error) {
              try {
                const apiRes = await chatApi.sendBroadcast({
                  content: messageText,
                  target_role: targetRole,
                  attachment_url: attachmentUrl,
                  business_id: currentBusinessId || undefined,
                });
                if (apiRes.success && apiRes.data) {
                  dispatch(
                    addMessage({
                      currentUserId: user.id,
                      currentBusinessId,
                      message: apiRes.data,
                    })
                  );
                }
              } catch (err: any) {
                dispatch(setError(err.message || 'Failed to send broadcast'));
              }
            } else if (res?.broadcast) {
              dispatch(
                addMessage({
                  currentUserId: user.id,
                  currentBusinessId,
                  message: res.broadcast,
                })
              );
            }
            dispatch(setSending(false));
          }
        );
      } else {
        try {
          const apiRes = await chatApi.sendBroadcast({
            content: messageText,
            target_role: targetRole,
            attachment_url: attachmentUrl,
            business_id: currentBusinessId || undefined,
          });
          if (apiRes.success && apiRes.data) {
            dispatch(
              addMessage({
                currentUserId: user.id,
                currentBusinessId,
                message: apiRes.data,
              })
            );
          }
        } catch (err: any) {
          dispatch(setError(err.message || 'Failed to send broadcast'));
        } finally {
          dispatch(setSending(false));
        }
      }
    },
    [user, currentBusinessId, dispatch]
  );

  // 7. Typing notification
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (selectedPartnerId) {
        socketService.emitTyping(selectedPartnerId, isTyping, currentBusinessId || undefined);
      }
    },
    [selectedPartnerId, currentBusinessId]
  );

  const activeConversationKey = selectedPartnerId
    ? getConversationKey(currentBusinessId, selectedPartnerId)
    : '';
  const currentMessages = activeConversationKey ? messages[activeConversationKey] || [] : [];

  return {
    currentUser: user,
    isAdmin: user?.role === 'DROPSHIPPER',
    contacts,
    selectedPartnerId,
    selectedPartner,
    currentMessages,
    onlineUserIds,
    isPartnerOnline: selectedPartnerId ? onlineUserIds.includes(selectedPartnerId) : false,
    isPartnerTyping: selectedPartnerId ? Boolean(typingUsers[selectedPartnerId]) : false,
    totalUnreadCount,
    isChatDrawerOpen,
    isLoadingContacts,
    isLoadingMessages,
    isSending,
    selectPartner: (id: string) => dispatch(setSelectedPartnerId(id)),
    fetchContacts,
    fetchMessages,
    sendMessage,
    sendBroadcast,
    sendTyping,
  };
};
