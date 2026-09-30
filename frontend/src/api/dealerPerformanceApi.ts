import { apiClient } from './client';
import type {
  ApiResponse,
  DealerPerformanceSummary,
  DealerPerformance,
  DealerPerformanceDetail,
  DealerComparisonData,
  DealerSlaUpdatePayload,
} from '../types';

export interface DealerPerformanceQueryParams {
  business_id?: string;
  timeframe?: string;
  dateRange?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const dealerPerformanceApi = {
  async getSummary(params?: { business_id?: string; timeframe?: string }) {
    const response = await apiClient.get<ApiResponse<DealerPerformanceSummary>>(
      '/dealers/performance/summary',
      { params }
    );
    return response.data;
  },

  async getList(params?: DealerPerformanceQueryParams) {
    const response = await apiClient.get<ApiResponse<DealerPerformance[]>>(
      '/dealers/performance/list',
      { params }
    );
    return response.data;
  },

  async getDetail(id: string, params?: { business_id?: string; timeframe?: string }) {
    const response = await apiClient.get<ApiResponse<DealerPerformanceDetail>>(
      `/dealers/${id}/performance`,
      { params }
    );
    return response.data;
  },

  async getComparison(dealerIds: string[], params?: { business_id?: string; timeframe?: string }) {
    const response = await apiClient.get<ApiResponse<DealerComparisonData>>(
      '/dealers/performance/comparison',
      {
        params: {
          ...params,
          dealerIds: dealerIds.join(','),
        },
      }
    );
    return response.data;
  },

  async updateSla(id: string, data: DealerSlaUpdatePayload) {
    const response = await apiClient.patch<ApiResponse<any>>(`/dealers/${id}/sla`, data);
    return response.data;
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
    const response = await apiClient.patch<ApiResponse<any>>(`/dealers/${id}/status`, { status });
    return response.data;
  },
};
