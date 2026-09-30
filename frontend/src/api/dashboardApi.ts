import { apiClient } from './client';
import type { DropshipperOverview, DealerDashboardData, MarketingDashboardData, ApiResponse } from '../types';

export const dashboardApi = {
  async getOverview(params?: { business_id?: string }) {
    const businessId = params?.business_id;
    const url = businessId ? `/dashboard/overview?business_id=${encodeURIComponent(businessId)}` : '/dashboard/overview';
    const response = await apiClient.get<ApiResponse<DropshipperOverview>>(url);
    return response.data;
  },

  async getDealerDashboard(params?: { business_id?: string }) {
    const businessId = params?.business_id;
    const url = businessId ? `/dashboard/dealer?business_id=${encodeURIComponent(businessId)}` : '/dashboard/dealer';
    const response = await apiClient.get<ApiResponse<DealerDashboardData>>(url);
    return response.data;
  },

  async getMarketingDashboard(params?: { business_id?: string }) {
    const businessId = params?.business_id;
    const url = businessId ? `/dashboard/marketing?business_id=${encodeURIComponent(businessId)}` : '/dashboard/marketing';
    const response = await apiClient.get<ApiResponse<MarketingDashboardData>>(url);
    return response.data;
  },
};
