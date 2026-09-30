import { apiClient } from './client';
import type { Order, ApiResponse } from '../types';

export const orderApi = {
  async getAll(params?: { business_id?: string; status?: string; page?: number; limit?: number }) {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  async create(data: Partial<Order>) {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  async update(id: string, data: Partial<Order>) {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string) {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/orders/${id}`);
    return response.data;
  },
};
