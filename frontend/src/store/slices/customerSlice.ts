import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Customer } from '../../types';
import { customerApi } from '../../api/customerApi';
import { createSagaAction } from '../sagaUtils';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchCustomers = createSagaAction<Parameters<typeof customerApi.getAll>[0] | undefined, Customer[]>('customer/fetchAll');
export const fetchCustomerById = createSagaAction<string, Customer>('customer/fetchById');
export const createCustomer = createSagaAction<Partial<Customer>, Customer>('customer/create');
export const updateCustomer = createSagaAction<{ id: string; data: Partial<Customer> }, Customer>('customer/update');
export const deleteCustomer = createSagaAction<string, string>('customer/delete');

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    clearCustomerError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.isLoading = false;
      state.customers = action.payload;
      state.error = null;
    },
    customerCreated: (state, action: PayloadAction<Customer>) => {
      state.isLoading = false;
      state.customers.unshift(action.payload);
    },
    customerUpdated: (state, action: PayloadAction<Customer>) => {
      state.isLoading = false;
      const idx = state.customers.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.customers[idx] = action.payload;
    },
    customerDeleted: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.customers = state.customers.filter((c) => c.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.customers = [];
        state.selectedCustomer = null;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.customers = [];
        state.selectedCustomer = null;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const {
  setSelectedCustomer,
  clearCustomerError,
  setLoading,
  setError,
  setCustomers,
  customerCreated,
  customerUpdated,
  customerDeleted,
} = customerSlice.actions;

export default customerSlice.reducer;
