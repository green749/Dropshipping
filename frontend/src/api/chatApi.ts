import { apiClient } from './client';

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: 'DROPSHIPPER' | 'DEALER' | 'MARKETING' | 'SALES';
  is_active?: boolean;
  company_name?: string | null;
}

export interface ChatMessageItem {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  business_id?: string | null;
  content: string;
  attachment_url?: string | null;
  message_type: 'DIRECT' | 'BROADCAST' | 'SYSTEM';
  target_role?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at?: string;
  sender?: ChatUser;
  receiver?: ChatUser;
}

export interface ChatContact {
  id: string;
  name: string;
  email: string;
  role: 'DROPSHIPPER' | 'DEALER' | 'MARKETING' | 'SALES';
  is_active?: boolean;
  company_name?: string | null;
  isPlatformAdmin?: boolean;
  lastMessage?: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
  } | null;
  unreadCount: number;
}

export interface SendMessagePayload {
  receiver_id: string;
  content: string;
  attachment_url?: string;
  business_id?: string;
}

export interface SendBroadcastPayload {
  content: string;
  target_role?: 'ALL' | 'DEALER' | 'MARKETING' | 'SALES';
  attachment_url?: string;
  business_id?: string;
}

export const chatApi = {
  getContacts: async (params?: { business_id?: string }) => {
    const res = await apiClient.get<any>('/chat/contacts', { params });
    const raw = res.data;
    const data = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.message) ? raw.message : Array.isArray(raw) ? raw : [];
    return { success: true, data: data as ChatContact[] };
  },

  getMessages: async (partnerId: string, params?: { business_id?: string }) => {
    const res = await apiClient.get<any>(`/chat/messages/${partnerId}`, { params });
    const raw = res.data;
    const payload = raw?.data || raw?.message || raw;
    return {
      success: true,
      data: payload as { partner: ChatUser; messages: ChatMessageItem[] },
    };
  },

  sendMessage: async (payload: SendMessagePayload) => {
    const res = await apiClient.post<any>('/chat/messages', payload);
    const raw = res.data;
    return {
      success: true,
      data: (raw?.data || raw?.message || raw) as ChatMessageItem,
    };
  },

  sendBroadcast: async (payload: SendBroadcastPayload) => {
    const res = await apiClient.post<any>('/chat/broadcast', payload);
    const raw = res.data;
    return {
      success: true,
      data: (raw?.data || raw?.message || raw) as ChatMessageItem,
    };
  },

  markAsRead: async (partnerId: string, params?: { business_id?: string }) => {
    const res = await apiClient.put<any>(`/chat/read/${partnerId}`, {}, { params });
    return {
      success: true,
      data: res.data?.data || res.data,
    };
  },

  getUnreadCount: async (params?: { business_id?: string }) => {
    const res = await apiClient.get<any>('/chat/unread-count', { params });
    const raw = res.data;
    const payload = raw?.data || raw?.message || raw;
    return {
      success: true,
      data: payload as { unreadCount: number },
    };
  },
};

