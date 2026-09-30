import { apiClient } from './client';
import type { Notification, ApiResponse } from '../types';

export const notificationApi = {
  async getAll() {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },
};
