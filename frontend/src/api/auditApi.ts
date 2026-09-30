import { apiClient } from './client';
import type { AuditLog, ApiResponse } from '../types';

export const auditApi = {
  async getAll(params?: { page?: number; limit?: number }) {
    const response = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);
    return response.data;
  },
};
