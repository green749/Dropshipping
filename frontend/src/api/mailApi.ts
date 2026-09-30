import { apiClient } from './client';
import type { ApiResponse } from '../types';

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  templateType: 'INVITATION' | 'ORDER_NOTIFICATION' | 'NOTIFICATION' | 'TEST' | 'GENERAL';
  status: 'SENT' | 'FAILED' | 'QUEUED';
  previewUrl?: string | null;
  messageId?: string;
  sentAt: string;
  html?: string;
  error?: string | null;
}

export const mailApi = {
  async getLogs() {
    const response = await apiClient.get<ApiResponse<EmailLog[]>>('/mail/logs');
    return response.data;
  },

  async getLogById(id: string) {
    const response = await apiClient.get<ApiResponse<EmailLog>>(`/mail/logs/${id}`);
    return response.data;
  },

  async sendTestEmail(to?: string) {
    const response = await apiClient.post<ApiResponse<{ success: boolean; previewUrl?: string; messageId?: string }>>('/mail/test', { to });
    return response.data;
  },

  async sendCustomEmail(data: { to: string; subject: string; message: string; type?: string }) {
    const response = await apiClient.post<ApiResponse<{ success: boolean; previewUrl?: string }>>('/mail/send', data);
    return response.data;
  },
};
