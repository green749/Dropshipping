import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ReturnRecord } from '../../types';
import { returnApi } from '../../api/returnApi';
import { createSagaAction } from '../sagaUtils';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';

interface ReturnState {
  returns: ReturnRecord[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReturnState = {
  returns: [],
  isLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchReturns = createSagaAction<{ business_id?: string; dealer_id?: string; status?: string } | undefined, ReturnRecord[]>('return/fetchAll');
export const createReturn = createSagaAction<Partial<ReturnRecord>, ReturnRecord>('return/create');
export const updateReturnStatus = createSagaAction<{ id: string; status: ReturnRecord['status']; resolution?: string }, ReturnRecord>('return/updateStatus');

export const returnSlice = createSlice({
  name: 'return',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setReturns: (state, action: PayloadAction<ReturnRecord[]>) => {
      state.isLoading = false;
      state.returns = action.payload;
      state.error = null;
    },
    returnCreated: (state, action: PayloadAction<ReturnRecord>) => {
      state.isLoading = false;
      state.returns.unshift(action.payload);
    },
    returnUpdated: (state, action: PayloadAction<ReturnRecord>) => {
      state.isLoading = false;
      const idx = state.returns.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.returns[idx] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.returns = [];
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.returns = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const {
  setLoading,
  setError,
  setReturns,
  returnCreated,
  returnUpdated,
} = returnSlice.actions;

export default returnSlice.reducer;
