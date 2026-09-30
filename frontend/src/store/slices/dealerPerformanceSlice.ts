import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  DealerPerformanceSummary,
  DealerPerformance,
  DealerPerformanceDetail,
  DealerSlaUpdatePayload,
} from '../../types';
import { createSagaAction } from '../sagaUtils';
import type { DealerPerformanceQueryParams } from '../../api/dealerPerformanceApi';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';


interface DealerPerformanceState {
  summary: DealerPerformanceSummary | null;
  dealers: DealerPerformance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedDealerDetail: DealerPerformanceDetail | null;
  comparisonList: DealerPerformance[];
  selectedCompareIds: string[];
  timeframe: string;
  searchQuery: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  isLoading: boolean;
  isDetailLoading: boolean;
  isCompareLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: DealerPerformanceState = {
  summary: null,
  dealers: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  selectedDealerDetail: null,
  comparisonList: [],
  selectedCompareIds: [],
  timeframe: '30d',
  searchQuery: '',
  statusFilter: 'ALL',
  sortBy: 'revenue',
  sortOrder: 'DESC',
  isLoading: false,
  isDetailLoading: false,
  isCompareLoading: false,
  isMutating: false,
  error: null,
};

// Redux Saga Actions
export const fetchDealerPerformanceSummary = createSagaAction<
  { business_id?: string; timeframe?: string; dateRange?: string } | undefined,
  DealerPerformanceSummary
>('dealerPerformance/fetchSummary');

export const fetchDealerPerformanceList = createSagaAction<
  DealerPerformanceQueryParams | undefined,
  { dealers: DealerPerformance[]; pagination: any }
>('dealerPerformance/fetchList');

export const fetchDealerPerformanceDetail = createSagaAction<
  { id: string; business_id?: string; timeframe?: string; dateRange?: string },
  DealerPerformanceDetail
>('dealerPerformance/fetchDetail');

export const fetchDealerComparison = createSagaAction<
  { dealerIds: string[]; business_id?: string; timeframe?: string; dateRange?: string },
  DealerPerformance[]
>('dealerPerformance/fetchComparison');

export const updateDealerSla = createSagaAction<
  { dealerId?: string; id?: string; data: DealerSlaUpdatePayload },
  any
>('dealerPerformance/updateSla');

export const updateDealerSlaAction = updateDealerSla;

export const updateDealerStatus = createSagaAction<
  { dealerId?: string; id?: string; status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; data?: { status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; reason?: string } },
  any
>('dealerPerformance/updateStatus');

export const updateDealerStatusAction = updateDealerStatus;

export const dealerPerformanceSlice = createSlice({
  name: 'dealerPerformance',
  initialState,
  reducers: {
    setTimeframe: (state, action: PayloadAction<string>) => {
      state.timeframe = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.pagination.page = 1;
    },
    setSort: (
      state,
      action: PayloadAction<{ sortBy: string; sortOrder?: 'ASC' | 'DESC' }>
    ) => {
      if (state.sortBy === action.payload.sortBy) {
        state.sortOrder = state.sortOrder === 'ASC' ? 'DESC' : 'ASC';
      } else {
        state.sortBy = action.payload.sortBy;
        state.sortOrder = action.payload.sortOrder || 'DESC';
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    toggleCompareId: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedCompareIds.includes(id)) {
        state.selectedCompareIds = state.selectedCompareIds.filter((item) => item !== id);
      } else {
        if (state.selectedCompareIds.length < 4) {
          state.selectedCompareIds.push(id);
        }
      }
    },
    clearCompareIds: (state) => {
      state.selectedCompareIds = [];
      state.comparisonList = [];
    },
    clearSelectedDealerDetail: (state) => {
      state.selectedDealerDetail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.isDetailLoading = action.payload;
    },
    setCompareLoading: (state, action: PayloadAction<boolean>) => {
      state.isCompareLoading = action.payload;
    },
    setMutating: (state, action: PayloadAction<boolean>) => {
      state.isMutating = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isDetailLoading = false;
      state.isCompareLoading = false;
      state.isMutating = false;
    },
    setSummary: (state, action: PayloadAction<DealerPerformanceSummary>) => {
      state.summary = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setDealers: (
      state,
      action: PayloadAction<{ dealers: DealerPerformance[]; pagination: any }>
    ) => {
      state.dealers = action.payload.dealers || [];
      if (action.payload.pagination) {
        state.pagination = {
          page: action.payload.pagination.page || state.pagination.page,
          limit: action.payload.pagination.limit || state.pagination.limit,
          total: action.payload.pagination.total ?? state.dealers.length,
          totalPages: action.payload.pagination.totalPages || 1,
        };
      }
      state.isLoading = false;
      state.error = null;
    },
    setDetail: (state, action: PayloadAction<DealerPerformanceDetail>) => {
      state.selectedDealerDetail = action.payload;
      state.isDetailLoading = false;
      state.error = null;
    },
    setComparison: (state, action: PayloadAction<DealerPerformance[]>) => {
      state.comparisonList = action.payload || [];
      state.isCompareLoading = false;
      state.error = null;
    },
    mutationSuccess: (state) => {
      state.isMutating = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.summary = null;
        state.dealers = [];
        state.selectedDealerDetail = null;
        state.comparisonList = [];
        state.selectedCompareIds = [];
        state.pagination = {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        };
        state.isLoading = true;
        state.isDetailLoading = false;
        state.isCompareLoading = false;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.summary = null;
        state.dealers = [];
        state.selectedDealerDetail = null;
        state.comparisonList = [];
        state.selectedCompareIds = [];
        state.isLoading = false;
        state.isDetailLoading = false;
        state.isCompareLoading = false;
        state.error = null;
      });
  },
});


export const {
  setTimeframe,
  setSearchQuery,
  setStatusFilter,
  setSort,
  setPage,
  toggleCompareId,
  clearCompareIds,
  clearSelectedDealerDetail,
  clearError,
  setLoading,
  setDetailLoading,
  setCompareLoading,
  setMutating,
  setError,
  setSummary,
  setDealers,
  setDetail,
  setComparison,
  mutationSuccess,
} = dealerPerformanceSlice.actions;

export default dealerPerformanceSlice.reducer;
