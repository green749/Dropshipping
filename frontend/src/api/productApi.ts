import { apiClient } from './client';
import type { Product, ApiResponse } from '../types';

export const productApi = {
  async getAll(params?: { business_id?: string; category?: string }) {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  async create(data: Partial<Product>) {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },

  async update(id: string, data: Partial<Product>) {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
    return response.data;
  },
};
