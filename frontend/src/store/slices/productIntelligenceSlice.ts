import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  ProductIntelligenceSummary,
  ProductOpportunityItem,
  ProductDetailIntelligence,
} from '../../types';
import type { ProductIntelligenceParams } from '../../api/productIntelligenceApi';
import { createSagaAction } from '../sagaUtils';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';


interface ProductIntelligenceState {
  summary: ProductIntelligenceSummary | null;
  items: ProductOpportunityItem[];
  selectedDetail: ProductDetailIntelligence | null;
  timeframe: string;
  startDate: string | null;
  endDate: string | null;
  searchQuery: string;
  categoryFilter: string;
  dealerFilter: string;
  statusFilter: string;
  stockStatusFilter: string;
  profitabilityFilter: string;
  classificationFilter: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoadingSummary: boolean;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  error: string | null;
}

const initialState: ProductIntelligenceState = {
  summary: null,
  items: [],
  selectedDetail: null,
  timeframe: '30d',
  startDate: null,
  endDate: null,
  searchQuery: '',
  categoryFilter: 'ALL',
  dealerFilter: 'ALL',
  statusFilter: 'ALL',
  stockStatusFilter: 'ALL',
  profitabilityFilter: 'ALL',
  classificationFilter: 'ALL',
  sortBy: 'revenue',
  sortOrder: 'DESC',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  isLoadingSummary: false,
  isLoadingList: false,
  isLoadingDetail: false,
  error: null,
};

// ─── SAGA ACTIONS ─────────────────────────────────────────────────────────
export const fetchProductIntelligenceSummary = createSagaAction<
  { timeframe?: string; startDate?: string; endDate?: string; business_id?: string } | undefined,
  ProductIntelligenceSummary
>('productIntelligence/fetchSummary');

export const fetchProductIntelligenceList = createSagaAction<
  ProductIntelligenceParams | undefined,
  { items: ProductOpportunityItem[]; pagination: any }
>('productIntelligence/fetchList');

export const fetchProductDetailIntelligence = createSagaAction<
  { id: string; timeframe?: string; startDate?: string; endDate?: string },
  ProductDetailIntelligence
>('productIntelligence/fetchDetail');

export const productIntelligenceSlice = createSlice({
  name: 'productIntelligence',
  initialState,
  reducers: {
    setTimeframe: (state, action: PayloadAction<string>) => {
      state.timeframe = action.payload;
    },
    setCustomDates: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
      state.pagination.page = 1;
    },
    setDealerFilter: (state, action: PayloadAction<string>) => {
      state.dealerFilter = action.payload;
      state.pagination.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.pagination.page = 1;
    },
    setStockStatusFilter: (state, action: PayloadAction<string>) => {
      state.stockStatusFilter = action.payload;
      state.pagination.page = 1;
    },
    setProfitabilityFilter: (state, action: PayloadAction<string>) => {
      state.profitabilityFilter = action.payload;
      state.pagination.page = 1;
    },
    setClassificationFilter: (state, action: PayloadAction<string>) => {
      state.classificationFilter = action.payload;
      state.pagination.page = 1;
    },
    setSort: (state, action: PayloadAction<{ sortBy: string; sortOrder?: 'ASC' | 'DESC' }>) => {
      if (state.sortBy === action.payload.sortBy && !action.payload.sortOrder) {
        state.sortOrder = state.sortOrder === 'DESC' ? 'ASC' : 'DESC';
      } else {
        state.sortBy = action.payload.sortBy;
        state.sortOrder = action.payload.sortOrder || 'DESC';
      }
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setSelectedDetail: (state, action: PayloadAction<ProductDetailIntelligence | null>) => {
      state.selectedDetail = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSummaryLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSummary = action.payload;
    },
    setListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingList = action.payload;
    },
    setDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingDetail = action.payload;
    },
    setSummarySuccess: (state, action: PayloadAction<ProductIntelligenceSummary>) => {
      state.summary = action.payload;
      state.isLoadingSummary = false;
      state.error = null;
    },
    setListSuccess: (
      state,
      action: PayloadAction<{ items: ProductOpportunityItem[]; pagination: any }>
    ) => {
      state.items = action.payload.items || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.isLoadingList = false;
      state.error = null;
    },
    setDetailSuccess: (state, action: PayloadAction<ProductDetailIntelligence>) => {
      state.selectedDetail = action.payload;
      state.isLoadingDetail = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoadingSummary = false;
      state.isLoadingList = false;
      state.isLoadingDetail = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.summary = null;
        state.items = [];
        state.selectedDetail = null;
        state.pagination = {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        };
        state.isLoadingSummary = true;
        state.isLoadingList = true;
        state.isLoadingDetail = false;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.summary = null;
        state.items = [];
        state.selectedDetail = null;
        state.isLoadingSummary = false;
        state.isLoadingList = false;
        state.isLoadingDetail = false;
        state.error = null;
      });
  },
});


export const {
  setTimeframe,
  setCustomDates,
  setSearchQuery,
  setCategoryFilter,
  setDealerFilter,
  setStatusFilter,
  setStockStatusFilter,
  setProfitabilityFilter,
  setClassificationFilter,
  setSort,
  setPage,
  setSelectedDetail,
  clearError,
  setSummaryLoading,
  setListLoading,
  setDetailLoading,
  setSummarySuccess,
  setListSuccess,
  setDetailSuccess,
  setError,
} = productIntelligenceSlice.actions;

export default productIntelligenceSlice.reducer;
