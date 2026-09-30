import { apiClient } from './client';
import type {
  ProductIntelligenceSummary,
  ProductOpportunityItem,
  ProductDetailIntelligence,
  ApiResponse,
} from '../types';

export interface ProductIntelligenceParams {
  timeframe?: string;
  startDate?: string;
  endDate?: string;
  business_id?: string;
  category?: string;
  dealer_id?: string;
  status?: string;
  stock_status?: string;
  profitability?: string;
  classification?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const productIntelligenceApi = {
  async getSummary(params?: { timeframe?: string; startDate?: string; endDate?: string; business_id?: string }) {
    const response = await apiClient.get<ApiResponse<ProductIntelligenceSummary>>('/products/intelligence/summary', {
      params,
    });
    return response.data;
  },

  async getList(params?: ProductIntelligenceParams) {
    const response = await apiClient.get<ApiResponse<ProductOpportunityItem[]>>('/products/intelligence', {
      params,
    });
    return response.data;
  },

  async getDetail(id: string, params?: { timeframe?: string; startDate?: string; endDate?: string }) {
    const response = await apiClient.get<ApiResponse<ProductDetailIntelligence>>(`/products/intelligence/${id}`, {
      params,
    });
    return response.data;
  },

  async getSalesTrend(id: string, params?: { timeframe?: string; startDate?: string; endDate?: string }) {
    const response = await apiClient.get<ApiResponse<any>>(`/products/intelligence/${id}/sales-trend`, {
      params,
    });
    return response.data;
  },

  async getProfitability(id: string, params?: { timeframe?: string; startDate?: string; endDate?: string }) {
    const response = await apiClient.get<ApiResponse<any>>(`/products/intelligence/${id}/profitability`, {
      params,
    });
    return response.data;
  },

  async getDealerPerformance(id: string) {
    const response = await apiClient.get<ApiResponse<any>>(`/products/intelligence/${id}/dealer-performance`);
    return response.data;
  },
};
