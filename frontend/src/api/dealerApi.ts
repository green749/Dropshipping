import { apiClient } from './client';
import type { Dealer, ApiResponse } from '../types';

export const dealerApi = {
  async getAll(params?: { business_id?: string; page?: number; limit?: number }) {
    const response = await apiClient.get<ApiResponse<Dealer[]>>('/dealers', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<Dealer>>(`/dealers/${id}`);
    return response.data;
  },

  async create(data: Partial<Dealer>) {
    const response = await apiClient.post<ApiResponse<Dealer>>('/dealers', data);
    return response.data;
  },

  async update(id: string, data: Partial<Dealer>) {
    const response = await apiClient.patch<ApiResponse<Dealer>>(`/dealers/${id}`, data);
    return response.data;
  },

  // Business-Dealer assignment
  async assignToBusinesses(businessId: string, dealerId: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/businesses/${businessId}/dealers/${dealerId}`
    );
    return response.data;
  },

  async unassignFromBusiness(businessId: string, dealerId: string) {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/businesses/${businessId}/dealers/${dealerId}`
    );
    return response.data;
  },

  async getBusinessDealers(businessId: string) {
    const response = await apiClient.get<ApiResponse<Dealer[]>>(
      `/businesses/${businessId}/dealers`
    );
    return response.data;
  },
};
