import { apiClient } from './client';
import type {
  ApiResponse,
  InventorySummary,
  IntelligentProduct,
  ProductInventoryDetail,
  InventoryTransaction,
  InventoryMovementPoint,
  StockAdjustmentPayload,
  StockInPayload,
} from '../types';

export interface InventoryQueryParams {
  business_id?: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  dealer_id?: string;
  status?: string;
  velocityPeriod?: number | string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface InventoryTransactionsQueryParams {
  business_id?: string;
  page?: number;
  limit?: number;
  product_id?: string;
  dealer_id?: string;
  transaction_type?: string;
  startDate?: string;
  endDate?: string;
}

export const inventoryApi = {
  async getSummary(params?: { business_id?: string; velocityPeriod?: number | string; dealer_id?: string; category?: string }) {
    const response = await apiClient.get<ApiResponse<InventorySummary>>('/inventory/summary', { params });
    return response.data;
  },

  async getProducts(params?: InventoryQueryParams) {
    const response = await apiClient.get<ApiResponse<IntelligentProduct[]>>('/inventory/products', { params });
    return response.data;
  },

  async getProductDetail(id: string, params?: { velocityPeriod?: number | string }) {
    const response = await apiClient.get<ApiResponse<ProductInventoryDetail>>(`/inventory/products/${id}`, { params });
    return response.data;
  },

  async getTransactions(params?: InventoryTransactionsQueryParams) {
    const response = await apiClient.get<ApiResponse<InventoryTransaction[]>>('/inventory/transactions', { params });
    return response.data;
  },

  async getMovementTrend(params?: { business_id?: string; days?: number; product_id?: string; dealer_id?: string }) {
    const response = await apiClient.get<ApiResponse<InventoryMovementPoint[]>>('/inventory/movement', { params });
    return response.data;
  },

  async adjustStock(data: StockAdjustmentPayload) {
    const response = await apiClient.post<ApiResponse<{ product: any; transaction: InventoryTransaction }>>(
      '/inventory/adjustment',
      data
    );
    return response.data;
  },

  async stockIn(data: StockInPayload) {
    const response = await apiClient.post<ApiResponse<{ product: any; transaction: InventoryTransaction }>>(
      '/inventory/stock-in',
      data
    );
    return response.data;
  },
};
