import { apiClient } from './client';
import type {
  ApiResponse,
  Expense,
  ExpenseSummaryResponse,
  ProfitSummary,
  ProfitTrendPoint,
  ProductProfitability,
  OrderProfitability,
} from '../types';

export interface FinanceQueryParams {
  business_id?: string;
  startDate?: string;
  endDate?: string;
  period?: 'today' | '7d' | '30d' | '90d' | 'custom' | string;
}

export interface ProductProfitQueryParams extends FinanceQueryParams {
  category?: string;
  dealer_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ExpenseQueryParams extends FinanceQueryParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ExpensePayload {
  business_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
}

export const financeApi = {
  // Profit & Revenue Analytics
  async getProfitSummary(params?: FinanceQueryParams) {
    const response = await apiClient.get<ApiResponse<ProfitSummary>>('/finances/summary', { params });
    return response.data;
  },

  async getProfitTimeline(params?: FinanceQueryParams) {
    const response = await apiClient.get<ApiResponse<ProfitTrendPoint[]>>('/finances/timeline', { params });
    return response.data;
  },

  async getProductProfitability(params?: ProductProfitQueryParams) {
    const response = await apiClient.get<ApiResponse<ProductProfitability[]>>('/finances/products', { params });
    return response.data;
  },

  async getOrderProfitability(params?: FinanceQueryParams & { page?: number; limit?: number }) {
    const response = await apiClient.get<ApiResponse<OrderProfitability[]>>('/finances/orders', { params });
    return response.data;
  },

  // Expense Management CRUD
  async getExpenses(params?: ExpenseQueryParams) {
    const response = await apiClient.get<ApiResponse<Expense[]>>('/expenses', { params });
    return response.data;
  },

  async getExpenseById(id: string) {
    const response = await apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return response.data;
  },

  async createExpense(data: ExpensePayload) {
    const response = await apiClient.post<ApiResponse<Expense>>('/expenses', data);
    return response.data;
  },

  async updateExpense(id: string, data: Partial<ExpensePayload>) {
    const response = await apiClient.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return response.data;
  },

  async deleteExpense(id: string) {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/expenses/${id}`);
    return response.data;
  },

  async getExpenseSummary(params?: FinanceQueryParams) {
    const response = await apiClient.get<ApiResponse<ExpenseSummaryResponse>>('/expenses/summary', { params });
    return response.data;
  },
};
