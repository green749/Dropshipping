import { apiClient } from './client';
import type { User, ApiResponse } from '../types';

export interface AuthResponse {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export const authApi = {
  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  },

  async register(data: { name: string; email: string; password: string; role?: string }) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  async refreshToken(refreshToken?: string) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {}
  },

  async getProfile() {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async loginAsUser(data: { email?: string; userId?: string }) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login-as', data);
    return response.data;
  },

  async getAllUsers() {
    const response = await apiClient.get<ApiResponse<User[]>>('/auth/users');
    return response.data;
  },
};
