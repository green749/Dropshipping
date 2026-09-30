import { apiClient } from './client';
import type {
  ProductResearchItem,
  ProductResearchPayload,
  ProductConversionPayload,
  Product,
  ApiResponse,
} from '../types';

export interface ProductResearchParams {
  search?: string;
  status?: string;
  category?: string;
  dealer_id?: string;
  tag?: string;
  minMargin?: number;
  maxMargin?: number;
  business_id?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const productResearchApi = {
  async getAll(params?: ProductResearchParams) {
    const response = await apiClient.get<ApiResponse<ProductResearchItem[]>>('/product-research', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<ProductResearchItem>>(`/product-research/${id}`);
    return response.data;
  },

  async create(payload: ProductResearchPayload) {
    const response = await apiClient.post<ApiResponse<ProductResearchItem>>('/product-research', payload);
    return response.data;
  },

  async update(id: string, payload: Partial<ProductResearchPayload>) {
    const response = await apiClient.patch<ApiResponse<ProductResearchItem>>(`/product-research/${id}`, payload);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/product-research/${id}`);
    return response.data;
  },

  async convertToProduct(id: string, conversionData: ProductConversionPayload) {
    const response = await apiClient.post<ApiResponse<{ product: Product; researchItem: ProductResearchItem }>>(
      `/product-research/${id}/convert`,
      conversionData
    );
    return response.data;
  },
};
