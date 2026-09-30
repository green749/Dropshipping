import { apiClient } from './client';
import type { Campaign, SocialAccount, Post, Ad, ApiResponse } from '../types';

export const marketingApi = {
  // Campaigns
  async getCampaigns(params?: { business_id?: string; status?: string }) {
    const response = await apiClient.get<ApiResponse<Campaign[]>>('/campaigns', { params });
    return response.data;
  },

  async getCampaignById(id: string) {
    const response = await apiClient.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return response.data;
  },

  async createCampaign(data: Partial<Campaign>) {
    const response = await apiClient.post<ApiResponse<Campaign>>('/campaigns', data);
    return response.data;
  },

  async updateCampaign(id: string, data: Partial<Campaign>) {
    const response = await apiClient.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, data);
    return response.data;
  },

  async deleteCampaign(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/campaigns/${id}`);
    return response.data;
  },

  // Social Accounts
  async getSocialAccounts(params?: { business_id?: string }) {
    const response = await apiClient.get<ApiResponse<SocialAccount[]>>('/social-accounts', { params });
    return response.data;
  },

  async createSocialAccount(data: Partial<SocialAccount>) {
    const response = await apiClient.post<ApiResponse<SocialAccount>>('/social-accounts', data);
    return response.data;
  },

  async updateSocialAccount(id: string, data: Partial<SocialAccount>) {
    const response = await apiClient.patch<ApiResponse<SocialAccount>>(`/social-accounts/${id}`, data);
    return response.data;
  },

  async deleteSocialAccount(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/social-accounts/${id}`);
    return response.data;
  },

  // Posts
  async getPosts(params?: { campaign_id?: string; status?: string }) {
    const response = await apiClient.get<ApiResponse<Post[]>>('/posts', { params });
    return response.data;
  },

  async createPost(data: Partial<Post>) {
    const response = await apiClient.post<ApiResponse<Post>>('/posts', data);
    return response.data;
  },

  async updatePost(id: string, data: Partial<Post>) {
    const response = await apiClient.patch<ApiResponse<Post>>(`/posts/${id}`, data);
    return response.data;
  },

  async publishPost(id: string) {
    const response = await apiClient.post<ApiResponse<Post>>(`/posts/${id}/publish`);
    return response.data;
  },

  async deletePost(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/posts/${id}`);
    return response.data;
  },

  // Ads
  async getAds(params?: { campaign_id?: string; status?: string }) {
    const response = await apiClient.get<ApiResponse<Ad[]>>('/ads', { params });
    return response.data;
  },

  async createAd(data: Partial<Ad>) {
    const response = await apiClient.post<ApiResponse<Ad>>('/ads', data);
    return response.data;
  },

  async updateAd(id: string, data: Partial<Ad>) {
    const response = await apiClient.patch<ApiResponse<Ad>>(`/ads/${id}`, data);
    return response.data;
  },

  async deleteAd(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/ads/${id}`);
    return response.data;
  },

  // AI Content Generator (Google Gemini & ChatGPT)
  async generateAiContent(data: {
    provider: 'gemini' | 'chatgpt';
    mediaType: 'image' | 'video';
    productName: string;
    productImage?: string;
    category?: string;
    price?: number | string;
    theme?: string;
    aspectRatio?: string;
    platform?: string;
    prompt?: string;
    businessName?: string;
  }) {
    const response = await apiClient.post<ApiResponse<any>>('/marketing/ai/generate', data);
    return response.data;
  },

  async generateAiChat(data: {
    conversationId?: string;
    productId: string;
    productName: string;
    productImage?: string;
    message: string;
    generationType: 'image' | 'video';
    aiModel?: string;
  }) {
    const response = await apiClient.post<ApiResponse<any>>('/marketing/ai/chat', data);
    return response.data;
  },

  async generateAiImage(data: {
    productId: string;
    productName: string;
    productImage?: string;
    prompt: string;
    previousImageUrl?: string | null;
    aiModel?: string;
  }) {
    const response = await apiClient.post<ApiResponse<any>>('/marketing/ai/image', data);
    return response.data;
  },

  async generateAiVideo(data: {
    productId: string;
    productName: string;
    productImage?: string;
    prompt: string;
    previousVideoUrl?: string | null;
    aiModel?: string;
  }) {
    const response = await apiClient.post<ApiResponse<any>>('/marketing/ai/video', data);
    return response.data;
  },

  async getAiProviders() {
    const response = await apiClient.get<ApiResponse<any[]>>('/marketing/ai/providers');
    return response.data;
  },

  async getVideoTemplates() {
    const response = await apiClient.get<ApiResponse<any[]>>('/marketing/ai/templates');
    return response.data;
  },
};
