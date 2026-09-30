import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../../types';
import { createSagaAction } from '../sagaUtils';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  isLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchOrders = createSagaAction<{ business_id?: string; status?: string } | undefined, Order[]>('order/fetchAll');
export const createOrder = createSagaAction<Partial<Order>, Order>('order/create');
export const updateOrderStatus = createSagaAction<{ id: string; status: string }, Order>('order/updateStatus');

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setOrders: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      const raw = action.payload;
      if (Array.isArray(raw)) state.orders = raw;
      else if (Array.isArray(raw?.data)) state.orders = raw.data;
      else if (Array.isArray(raw?.orders)) state.orders = raw.orders;
      else state.orders = [];
    },
    orderCreated: (state, action: PayloadAction<Order>) => {
      state.isLoading = false;
      state.orders.unshift(action.payload);
    },
    orderStatusUpdated: (state, action: PayloadAction<Order>) => {
      state.isLoading = false;
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.orders = [];
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.orders = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { setLoading, setError, setOrders, orderCreated, orderStatusUpdated } = orderSlice.actions;
export default orderSlice.reducer;
