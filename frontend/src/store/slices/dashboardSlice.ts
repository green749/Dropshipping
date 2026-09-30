import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DropshipperOverview, DealerDashboardData, MarketingDashboardData } from '../../types';
import { createSagaAction } from '../sagaUtils';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';

interface DashboardState {
  overview: DropshipperOverview | null;
  dealerData: DealerDashboardData | null;
  marketingData: MarketingDashboardData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  overview: null,
  dealerData: null,
  marketingData: null,
  isLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchOverview = createSagaAction<{ business_id?: string } | void, DropshipperOverview>('dashboard/fetchOverview');
export const fetchDealerDashboard = createSagaAction<{ business_id?: string } | void, DealerDashboardData>('dashboard/fetchDealer');
export const fetchMarketingDashboard = createSagaAction<{ business_id?: string } | void, MarketingDashboardData>('dashboard/fetchMarketing');

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setOverview: (state, action: PayloadAction<DropshipperOverview>) => {
      state.isLoading = false;
      state.overview = action.payload;
      state.error = null;
    },
    setDealerData: (state, action: PayloadAction<DealerDashboardData>) => {
      state.isLoading = false;
      state.dealerData = action.payload;
    },
    setMarketingData: (state, action: PayloadAction<MarketingDashboardData>) => {
      state.isLoading = false;
      state.marketingData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.overview = null;
        state.dealerData = null;
        state.marketingData = null;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.overview = null;
        state.dealerData = null;
        state.marketingData = null;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const {
  setLoading,
  setError,
  setOverview,
  setDealerData,
  setMarketingData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
