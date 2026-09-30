import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Business } from '../../types';
import { createSagaAction } from '../sagaUtils';
import { logout } from './authSlice';

import {
  getStoredBusinessId,
  getStoredBusiness,
  setStoredBusiness,
  setStoredBusinessId,
  getStoredBusinessesList,
  setStoredBusinessesList,
  clearStoredBusinessData,
  purgeLegacyLocalStorageKeys,
  isAllBusinessesSelected,
  SESSION_KEYS,
} from '../../utils/sessionStorage';

interface BusinessState {
  businesses: Business[];
  selectedBusiness: Business | null;
  isLoading: boolean;
  error: string | null;
}

// Purge any legacy localStorage keys to eliminate duplicate or fragmented storage
purgeLegacyLocalStorageKeys();

// Respect user's explicit "All Businesses" selection on initial load
const initialStoredBusiness = isAllBusinessesSelected() ? null : getStoredBusiness();
const initialStoredBusinessesList = getStoredBusinessesList();

const initialState: BusinessState = {
  businesses: initialStoredBusinessesList,
  selectedBusiness: initialStoredBusiness,
  isLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchBusinesses = createSagaAction<void, Business[]>('business/fetchAll');
export const createBusiness = createSagaAction<Partial<Business>, Business>('business/create');

export const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    selectBusiness: (state, action: PayloadAction<Business | null>) => {
      state.selectedBusiness = action.payload;
      setStoredBusiness(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setBusinesses: (state, action: PayloadAction<Business[]>) => {
      state.isLoading = false;
      state.businesses = action.payload;
      state.error = null;
      setStoredBusinessesList(action.payload);

      // Preserve explicit "All Storefronts" selection if sentinel is stored or isAllBusinessesSelected is true
      if (isAllBusinessesSelected() || getStoredBusinessId() === SESSION_KEYS.ALL_BUSINESSES_SENTINEL) {
        state.selectedBusiness = null;
        setStoredBusiness(null);
        return;
      }

      const storedId = getStoredBusinessId();
      const currentId = state.selectedBusiness?.id || storedId;

      // Check if current selected business exists in returned list
      if (currentId && currentId !== SESSION_KEYS.ALL_BUSINESSES_SENTINEL) {
        const found = action.payload.find((b) => b.id === currentId);
        if (found) {
          state.selectedBusiness = found;
          setStoredBusiness(found);
          return;
        }
      }

      // Default to first business if current selection is invalid
      if (action.payload.length > 0) {
        state.selectedBusiness = action.payload[0];
        setStoredBusiness(action.payload[0]);
      } else {
        state.selectedBusiness = null;
        setStoredBusiness(null);
      }
    },
    businessCreated: (state, action: PayloadAction<Business>) => {
      state.isLoading = false;
      state.businesses.unshift(action.payload);
      state.selectedBusiness = action.payload;
      setStoredBusiness(action.payload);
      setStoredBusinessesList(state.businesses);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.selectedBusiness = null;
      state.businesses = [];
      clearStoredBusinessData();
    });
  },
});

export const {
  selectBusiness,
  setLoading,
  setError,
  setBusinesses,
  businessCreated,
} = businessSlice.actions;

export default businessSlice.reducer;
