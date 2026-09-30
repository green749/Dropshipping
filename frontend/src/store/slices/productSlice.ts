import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types';
import { productApi } from '../../api/productApi';
import { createSagaAction } from '../sagaUtils';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';


interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchProducts = createSagaAction<Parameters<typeof productApi.getAll>[0] | undefined, Product[]>('product/fetchAll');
export const createProduct = createSagaAction<Partial<Product>, Product>('product/create');
export const updateProduct = createSagaAction<{ id: string; data: Partial<Product> }, Product>('product/update');
export const deleteProduct = createSagaAction<string, string>('product/delete');

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearProductError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setProducts: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      if (Array.isArray(action.payload)) {
        state.products = action.payload;
      } else if (action.payload && Array.isArray(action.payload.data)) {
        state.products = action.payload.data;
      } else if (action.payload && Array.isArray(action.payload.products)) {
        state.products = action.payload.products;
      } else {
        state.products = [];
      }
    },
    productCreated: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const item = action.payload?.data || action.payload;
      if (item && item.id) {
        state.products.unshift(item);
      }
    },
    productUpdated: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const item = action.payload?.data || action.payload;
      if (item && item.id) {
        const idx = state.products.findIndex((p) => p.id === item.id);
        if (idx !== -1) state.products[idx] = item;
      }
    },
    productDeleted: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.products = [];
        state.selectedProduct = null;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.products = [];
        state.selectedProduct = null;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const {
  setSelectedProduct,
  clearProductError,
  setLoading,
  setError,
  setProducts,
  productCreated,
  productUpdated,
  productDeleted,
} = productSlice.actions;

export default productSlice.reducer;

