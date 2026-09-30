import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Campaign, SocialAccount, Post, Ad } from '../../types';
import { marketingApi } from '../../api/marketingApi';
import { createSagaAction } from '../sagaUtils';

interface MarketingState {
  campaigns: Campaign[];
  socialAccounts: SocialAccount[];
  posts: Post[];
  ads: Ad[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MarketingState = {
  campaigns: [],
  socialAccounts: [],
  posts: [],
  ads: [],
  isLoading: false,
  error: null,
};

import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';

// ─── Saga Actions ─────────────────────────────────────────────────────────────
export const fetchCampaigns = createSagaAction<Parameters<typeof marketingApi.getCampaigns>[0] | undefined, Campaign[]>('marketing/fetchCampaigns');
export const createCampaign = createSagaAction<Partial<Campaign>, Campaign>('marketing/createCampaign');
export const updateCampaign = createSagaAction<{ id: string; data: Partial<Campaign> }, Campaign>('marketing/updateCampaign');
export const deleteCampaign = createSagaAction<string, string>('marketing/deleteCampaign');

export const fetchSocialAccounts = createSagaAction<Parameters<typeof marketingApi.getSocialAccounts>[0] | undefined | void, SocialAccount[]>('marketing/fetchSocialAccounts');
export const createSocialAccount = createSagaAction<Partial<SocialAccount>, SocialAccount>('marketing/createSocialAccount');
export const deleteSocialAccount = createSagaAction<string, string>('marketing/deleteSocialAccount');

export const fetchPosts = createSagaAction<Parameters<typeof marketingApi.getPosts>[0] | undefined, Post[]>('marketing/fetchPosts');
export const createPost = createSagaAction<Partial<Post>, Post>('marketing/createPost');
export const publishPost = createSagaAction<string, Post>('marketing/publishPost');
export const deletePost = createSagaAction<string, string>('marketing/deletePost');

export const fetchAds = createSagaAction<Parameters<typeof marketingApi.getAds>[0] | undefined, Ad[]>('marketing/fetchAds');
export const createAd = createSagaAction<Partial<Ad>, Ad>('marketing/createAd');
export const deleteAd = createSagaAction<string, string>('marketing/deleteAd');

export const fetchMarketingData = createSagaAction<{ business_id?: string } | undefined | void, any>('marketing/fetchAll');


export const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {
    clearMarketingError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setCampaigns: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      const raw = action.payload;
      if (Array.isArray(raw)) state.campaigns = raw;
      else if (Array.isArray(raw?.data)) state.campaigns = raw.data;
      else state.campaigns = [];
    },
    campaignCreated: (state, action: PayloadAction<Campaign>) => {
      state.campaigns.unshift(action.payload);
    },
    campaignUpdated: (state, action: PayloadAction<Campaign>) => {
      const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.campaigns[idx] = action.payload;
    },
    campaignDeleted: (state, action: PayloadAction<string>) => {
      state.campaigns = state.campaigns.filter((c) => c.id !== action.payload);
    },
    setSocialAccounts: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const raw = action.payload;
      if (Array.isArray(raw)) state.socialAccounts = raw;
      else if (Array.isArray(raw?.data)) state.socialAccounts = raw.data;
      else state.socialAccounts = [];
    },
    socialAccountCreated: (state, action: PayloadAction<SocialAccount>) => {
      state.socialAccounts.unshift(action.payload);
    },
    socialAccountDeleted: (state, action: PayloadAction<string>) => {
      state.socialAccounts = state.socialAccounts.filter((s) => s.id !== action.payload);
    },
    setPosts: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const raw = action.payload;
      if (Array.isArray(raw)) state.posts = raw;
      else if (Array.isArray(raw?.data)) state.posts = raw.data;
      else state.posts = [];
    },
    postCreated: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    postPublished: (state, action: PayloadAction<Post>) => {
      const idx = state.posts.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.posts[idx] = action.payload;
    },
    postDeleted: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
    setAds: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const raw = action.payload;
      if (Array.isArray(raw)) state.ads = raw;
      else if (Array.isArray(raw?.data)) state.ads = raw.data;
      else state.ads = [];
    },
    adCreated: (state, action: PayloadAction<Ad>) => {
      state.ads.unshift(action.payload);
    },
    adDeleted: (state, action: PayloadAction<string>) => {
      state.ads = state.ads.filter((a) => a.id !== action.payload);
    },
    setMarketingAllData: (state, action: PayloadAction<{ campaigns: Campaign[]; socialAccounts: SocialAccount[]; posts: Post[]; ads: Ad[] }>) => {
      state.isLoading = false;
      state.campaigns = action.payload.campaigns;
      state.socialAccounts = action.payload.socialAccounts;
      state.posts = action.payload.posts;
      state.ads = action.payload.ads;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.campaigns = [];
        state.socialAccounts = [];
        state.posts = [];
        state.ads = [];
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.campaigns = [];
        state.socialAccounts = [];
        state.posts = [];
        state.ads = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});


export const {
  clearMarketingError,
  setLoading,
  setError,
  setCampaigns,
  campaignCreated,
  campaignUpdated,
  campaignDeleted,
  setSocialAccounts,
  socialAccountCreated,
  socialAccountDeleted,
  setPosts,
  postCreated,
  postPublished,
  postDeleted,
  setAds,
  adCreated,
  adDeleted,
  setMarketingAllData,
} = marketingSlice.actions;

export default marketingSlice.reducer;
