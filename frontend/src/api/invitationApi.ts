import { apiClient } from './client';
import type { DealerInvitation, ApiResponse, User } from '../types';

export const invitationApi = {
  async getByToken(token: string) {
    const response = await apiClient.get<ApiResponse<DealerInvitation>>(`/dealers/invitations/${token}`);
    return response.data;
  },

  async acceptInvitation(data: {
    token: string;
    name: string;
    password: string;
    company_name?: string;
    phone?: string;
  }) {
    const response = await apiClient.post<
      ApiResponse<{
        user: User;
        token: string;
        accessToken?: string;
        refreshToken?: string;
        dealer?: any;
      }>
    >('/dealers/accept-invite', data);
    return response.data;
  },

  async inviteDealer(data: { email: string; business_id?: string; company_name?: string }) {
    const response = await apiClient.post<ApiResponse<{ invitation: DealerInvitation; inviteLink: string }>>('/dealers/invite', data);
    return response.data;
  },

  async inviteMarketer(data: { email: string; business_id?: string }) {
    const response = await apiClient.post<ApiResponse<{ invitation: DealerInvitation; inviteLink: string }>>('/marketing/invite', data);
    return response.data;
  },

  async inviteSales(data: { email: string; business_id?: string }) {
    const response = await apiClient.post<ApiResponse<{ invitation: DealerInvitation; inviteLink: string }>>('/dealers/invite', {
      ...data,
      role: 'SALES',
    });
    return response.data;
  },

  async getAllInvitations(params?: { business_id?: string; role?: string; status?: string }) {
    const response = await apiClient.get<ApiResponse<DealerInvitation[]>>('/dealers/invitations', { params });
    return response.data;
  },

  async resendInvitation(id: string) {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string; emailPreviewUrl?: string }>>(`/dealers/invitations/${id}/resend`);
    return response.data;
  },
};
