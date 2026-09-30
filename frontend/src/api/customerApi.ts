import { apiClient } from './client';
import type { Customer, ApiResponse } from '../types';

export const customerApi = {
  async getAll(params?: { business_id?: string; search?: string; page?: number; limit?: number }) {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  async create(data: Partial<Customer>) {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  async update(id: string, data: Partial<Customer>) {
    const response = await apiClient.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/customers/${id}`);
    return response.data;
  },
};
