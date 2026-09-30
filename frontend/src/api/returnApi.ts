import { apiClient } from './client';
import type { ApiResponse, ReturnRecord } from '../types';

export const returnApi = {
  async getAll(params?: { business_id?: string; dealer_id?: string; status?: string }) {
    try {
      const response = await apiClient.get<ApiResponse<ReturnRecord[]>>('/returns', { params });
      return response.data;
    } catch (error) {
      // Return localStorage cached returns if endpoint is handling locally
      const stored = localStorage.getItem('dropship_returns');
      const returns: ReturnRecord[] = stored ? JSON.parse(stored) : [];
      let filtered = returns;
      if (params?.business_id) filtered = filtered.filter((r) => r.business_id === params.business_id);
      if (params?.dealer_id) filtered = filtered.filter((r) => r.dealer_id === params.dealer_id);
      if (params?.status && params.status !== 'ALL') filtered = filtered.filter((r) => r.status === params.status);
      return { success: true, data: filtered };
    }
  },

  async create(data: Partial<ReturnRecord>) {
    try {
      const response = await apiClient.post<ApiResponse<ReturnRecord>>('/returns', data);
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('dropship_returns');
      const returns: ReturnRecord[] = stored ? JSON.parse(stored) : [];
      const newReturn: ReturnRecord = {
        id: `ret_${Date.now()}`,
        order_id: data.order_id || `ord_${Date.now()}`,
        order_number: data.order_number || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        business_id: data.business_id || '',
        customer_id: data.customer_id,
        customer_name: data.customer_name || 'Customer',
        dealer_id: data.dealer_id,
        dealer_name: data.dealer_name || 'Wholesale Supplier',
        product_id: data.product_id,
        product_name: data.product_name || 'Product Item',
        reason: data.reason || 'Customer return requested',
        status: data.status || 'REQUESTED',
        requested_date: new Date().toISOString(),
        refund_amount: data.refund_amount || 0,
        resolution: data.resolution || 'Pending inspection by dealer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      returns.unshift(newReturn);
      localStorage.setItem('dropship_returns', JSON.stringify(returns));
      return { success: true, data: newReturn };
    }
  },

  async updateStatus(id: string, status: ReturnRecord['status'], resolution?: string) {
    try {
      const response = await apiClient.patch<ApiResponse<ReturnRecord>>(`/returns/${id}/status`, { status, resolution });
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('dropship_returns');
      const returns: ReturnRecord[] = stored ? JSON.parse(stored) : [];
      const idx = returns.findIndex((r) => r.id === id);
      if (idx !== -1) {
        returns[idx].status = status;
        if (resolution) returns[idx].resolution = resolution;
        if (status === 'APPROVED') returns[idx].approved_date = new Date().toISOString();
        if (status === 'RECEIVED') returns[idx].received_date = new Date().toISOString();
        returns[idx].updated_at = new Date().toISOString();
        localStorage.setItem('dropship_returns', JSON.stringify(returns));
        return { success: true, data: returns[idx] };
      }
      throw error;
    }
  },
};
