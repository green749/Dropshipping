import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  InventorySummary,
  IntelligentProduct,
  ProductInventoryDetail,
  InventoryTransaction,
  InventoryMovementPoint,
  InventoryStatus,
  StockAdjustmentPayload,
  StockInPayload,
} from '../../types';
import { createSagaAction } from '../sagaUtils';
import type { InventoryQueryParams, InventoryTransactionsQueryParams } from '../../api/inventoryApi';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';


interface InventoryState {
  summary: InventorySummary | null;
  products: IntelligentProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedProductDetail: ProductInventoryDetail | null;
  transactions: InventoryTransaction[];
  transactionsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  movementTrend: InventoryMovementPoint[];
  velocityPeriod: number;
  filterStatus: InventoryStatus;
  searchQuery: string;
  selectedCategory: string;
  selectedDealerId: string;
  isLoading: boolean;
  isDetailLoading: boolean;
  isTransactionsLoading: boolean;
  isMovementLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  summary: null,
  products: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  selectedProductDetail: null,
  transactions: [],
  transactionsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  movementTrend: [],
  velocityPeriod: 14,
  filterStatus: 'ALL',
  searchQuery: '',
  selectedCategory: '',
  selectedDealerId: '',
  isLoading: false,
  isDetailLoading: false,
  isTransactionsLoading: false,
  isMovementLoading: false,
  isMutating: false,
  error: null,
};

// Redux Saga Actions
export const fetchInventorySummary = createSagaAction<
  { business_id?: string; velocityPeriod?: number | string; dealer_id?: string; category?: string } | undefined,
  InventorySummary
>('inventory/fetchSummary');

export const fetchInventoryProducts = createSagaAction<
  InventoryQueryParams | undefined,
  { products: IntelligentProduct[]; pagination: any }
>('inventory/fetchProducts');

export const fetchProductInventoryDetail = createSagaAction<
  { id: string; velocityPeriod?: number | string },
  ProductInventoryDetail
>('inventory/fetchProductDetail');

export const fetchInventoryTransactions = createSagaAction<
  InventoryTransactionsQueryParams | undefined,
  { transactions: InventoryTransaction[]; pagination: any }
>('inventory/fetchTransactions');

export const fetchInventoryMovementTrend = createSagaAction<
  { business_id?: string; days?: number; product_id?: string; dealer_id?: string } | undefined,
  InventoryMovementPoint[]
>('inventory/fetchMovementTrend');

export const submitStockAdjustment = createSagaAction<
  StockAdjustmentPayload,
  { product: any; transaction: InventoryTransaction }
>('inventory/submitAdjustment');

export const submitStockIn = createSagaAction<
  StockInPayload,
  { product: any; transaction: InventoryTransaction }
>('inventory/submitStockIn');

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setVelocityPeriod: (state, action: PayloadAction<number>) => {
      state.velocityPeriod = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<InventoryStatus>) => {
      state.filterStatus = action.payload;
      state.pagination.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.pagination.page = 1;
    },
    setSelectedDealerId: (state, action: PayloadAction<string>) => {
      state.selectedDealerId = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearSelectedProductDetail: (state) => {
      state.selectedProductDetail = null;
    },
    clearInventoryError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.isDetailLoading = action.payload;
    },
    setTransactionsLoading: (state, action: PayloadAction<boolean>) => {
      state.isTransactionsLoading = action.payload;
    },
    setMovementLoading: (state, action: PayloadAction<boolean>) => {
      state.isMovementLoading = action.payload;
    },
    setMutating: (state, action: PayloadAction<boolean>) => {
      state.isMutating = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isDetailLoading = false;
      state.isTransactionsLoading = false;
      state.isMovementLoading = false;
      state.isMutating = false;
    },
    setSummary: (state, action: PayloadAction<InventorySummary>) => {
      state.summary = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setProducts: (
      state,
      action: PayloadAction<{ products: IntelligentProduct[]; pagination: any }>
    ) => {
      state.products = action.payload.products || [];
      if (action.payload.pagination) {
        state.pagination = {
          page: action.payload.pagination.page || state.pagination.page,
          limit: action.payload.pagination.limit || state.pagination.limit,
          total: action.payload.pagination.total ?? state.products.length,
          totalPages: action.payload.pagination.totalPages || 1,
        };
      }
      state.isLoading = false;
      state.error = null;
    },
    setProductDetail: (state, action: PayloadAction<ProductInventoryDetail>) => {
      state.selectedProductDetail = action.payload;
      state.isDetailLoading = false;
      state.error = null;
    },
    setTransactions: (
      state,
      action: PayloadAction<{ transactions: InventoryTransaction[]; pagination: any }>
    ) => {
      state.transactions = action.payload.transactions || [];
      if (action.payload.pagination) {
        state.transactionsPagination = {
          page: action.payload.pagination.page || state.transactionsPagination.page,
          limit: action.payload.pagination.limit || state.transactionsPagination.limit,
          total: action.payload.pagination.total ?? state.transactions.length,
          totalPages: action.payload.pagination.totalPages || 1,
        };
      }
      state.isTransactionsLoading = false;
      state.error = null;
    },
    setMovementTrend: (state, action: PayloadAction<InventoryMovementPoint[]>) => {
      state.movementTrend = action.payload || [];
      state.isMovementLoading = false;
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
        state.products = [];
        state.pagination = {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        };
        state.selectedProductDetail = null;
        state.transactions = [];
        state.transactionsPagination = {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        };
        state.movementTrend = [];
        state.isLoading = true;
        state.isDetailLoading = false;
        state.isTransactionsLoading = false;
        state.isMovementLoading = false;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.summary = null;
        state.products = [];
        state.selectedProductDetail = null;
        state.transactions = [];
        state.movementTrend = [];
        state.isLoading = false;
        state.isDetailLoading = false;
        state.isTransactionsLoading = false;
        state.isMovementLoading = false;
        state.error = null;
      });
  },
});


export const {
  setVelocityPeriod,
  setFilterStatus,
  setSearchQuery,
  setSelectedCategory,
  setSelectedDealerId,
  setPage,
  clearSelectedProductDetail,
  clearInventoryError,
  setLoading,
  setDetailLoading,
  setTransactionsLoading,
  setMovementLoading,
  setMutating,
  setError,
  setSummary,
  setProducts,
  setProductDetail,
  setTransactions,
  setMovementTrend,
  mutationSuccess,
} = inventorySlice.actions;

export default inventorySlice.reducer;
