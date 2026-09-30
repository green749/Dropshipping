import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  ProductResearchItem,
  ProductResearchPayload,
  ProductConversionPayload,
  Product,
} from '../../types';
import type { ProductResearchParams } from '../../api/productResearchApi';
import { createSagaAction } from '../sagaUtils';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';


interface ProductResearchState {
  items: ProductResearchItem[];
  selectedItem: ProductResearchItem | null;
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  dealerFilter: string;
  tagFilter: string;
  minMargin: number | undefined;
  maxMargin: number | undefined;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoadingList: boolean;
  isLoadingItem: boolean;
  isMutating: boolean;
  isConverting: boolean;
  error: string | null;
}

const initialState: ProductResearchState = {
  items: [],
  selectedItem: null,
  searchQuery: '',
  statusFilter: 'ALL',
  categoryFilter: 'ALL',
  dealerFilter: 'ALL',
  tagFilter: 'ALL',
  minMargin: undefined,
  maxMargin: undefined,
  sortBy: 'created_at',
  sortOrder: 'DESC',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  isLoadingList: false,
  isLoadingItem: false,
  isMutating: false,
  isConverting: false,
  error: null,
};

// ─── SAGA ACTIONS ─────────────────────────────────────────────────────────
export const fetchProductResearchList = createSagaAction<
  ProductResearchParams | undefined,
  { items: ProductResearchItem[]; pagination: any }
>('productResearch/fetchList');

export const fetchProductResearchById = createSagaAction<string, ProductResearchItem>(
  'productResearch/fetchById'
);

export const createProductResearchAction = createSagaAction<
  ProductResearchPayload,
  ProductResearchItem
>('productResearch/create');

export const updateProductResearchAction = createSagaAction<
  { id: string; payload: Partial<ProductResearchPayload> },
  ProductResearchItem
>('productResearch/update');

export const deleteProductResearchAction = createSagaAction<string, void>(
  'productResearch/delete'
);

export const convertProductResearchAction = createSagaAction<
  { id: string; conversionData: ProductConversionPayload },
  { product: Product; researchItem: ProductResearchItem }
>('productResearch/convert');

export const productResearchSlice = createSlice({
  name: 'productResearch',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
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
    setTagFilter: (state, action: PayloadAction<string>) => {
      state.tagFilter = action.payload;
      state.pagination.page = 1;
    },
    setMarginFilter: (state, action: PayloadAction<{ min?: number; max?: number }>) => {
      state.minMargin = action.payload.min;
      state.maxMargin = action.payload.max;
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
    setSelectedItem: (state, action: PayloadAction<ProductResearchItem | null>) => {
      state.selectedItem = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingList = action.payload;
    },
    setItemLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingItem = action.payload;
    },
    setMutating: (state, action: PayloadAction<boolean>) => {
      state.isMutating = action.payload;
    },
    setConverting: (state, action: PayloadAction<boolean>) => {
      state.isConverting = action.payload;
    },
    setListSuccess: (
      state,
      action: PayloadAction<{ items: ProductResearchItem[]; pagination: any }>
    ) => {
      state.items = action.payload.items || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.isLoadingList = false;
      state.error = null;
    },
    setItemSuccess: (state, action: PayloadAction<ProductResearchItem>) => {
      state.selectedItem = action.payload;
      state.isLoadingItem = false;
      state.error = null;
    },
    mutationSuccess: (state) => {
      state.isMutating = false;
      state.isConverting = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoadingList = false;
      state.isLoadingItem = false;
      state.isMutating = false;
      state.isConverting = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.items = [];
        state.selectedItem = null;
        state.pagination = {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        };
        state.isLoadingList = true;
        state.isLoadingItem = false;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.selectedItem = null;
        state.isLoadingList = false;
        state.isLoadingItem = false;
        state.error = null;
      });
  },
});


export const {
  setSearchQuery,
  setStatusFilter,
  setCategoryFilter,
  setDealerFilter,
  setTagFilter,
  setMarginFilter,
  setSort,
  setPage,
  setSelectedItem,
  clearError,
  setListLoading,
  setItemLoading,
  setMutating,
  setConverting,
  setListSuccess,
  setItemSuccess,
  mutationSuccess,
  setError,
} = productResearchSlice.actions;

export default productResearchSlice.reducer;
