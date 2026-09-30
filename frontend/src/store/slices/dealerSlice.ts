import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Dealer } from '../../types';
import { createSagaAction } from '../sagaUtils';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';

interface DealerState {
  dealers: Dealer[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DealerState = {
  dealers: [],
  isLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchDealers = createSagaAction<{ business_id?: string; page?: number; limit?: number } | undefined | void, Dealer[]>('dealer/fetchAll');
export const createDealer = createSagaAction<Partial<Dealer>, Dealer>('dealer/create');
export const updateDealer = createSagaAction<{ id: string; data: Partial<Dealer> }, Dealer>('dealer/update');
export const assignDealerToBusiness = createSagaAction<{ businessId: string; dealerId: string }, { businessId: string; dealerId: string }>('dealer/assign');

export const dealerSlice = createSlice({
  name: 'dealer',
  initialState,
  reducers: {
    clearDealerError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setDealers: (state, action: PayloadAction<Dealer[]>) => {
      state.isLoading = false;
      state.dealers = action.payload;
      state.error = null;
    },
    dealerCreated: (state, action: PayloadAction<Dealer>) => {
      state.isLoading = false;
      state.dealers.unshift(action.payload);
    },
    dealerUpdated: (state, action: PayloadAction<Dealer>) => {
      state.isLoading = false;
      const idx = state.dealers.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        state.dealers[idx] = { ...state.dealers[idx], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.dealers = [];
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.dealers = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const {
  clearDealerError,
  setLoading,
  setError,
  setDealers,
  dealerCreated,
  dealerUpdated,
} = dealerSlice.actions;

export default dealerSlice.reducer;
