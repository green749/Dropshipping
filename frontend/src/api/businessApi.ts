import { apiClient } from './client';
import type { Business, ApiResponse } from '../types';

export const businessApi = {
  async getAll() {
    const response = await apiClient.get<ApiResponse<Business[]>>('/businesses');
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<Business>>(`/businesses/${id}`);
    return response.data;
  },

  async create(data: Partial<Business>) {
    const response = await apiClient.post<ApiResponse<Business>>('/businesses', data);
    return response.data;
  },

  async update(id: string, data: Partial<Business>) {
    const response = await apiClient.patch<ApiResponse<Business>>(`/businesses/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/businesses/${id}`);
    return response.data;
  },
};
