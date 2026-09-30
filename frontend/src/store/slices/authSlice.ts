import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { createSagaAction } from '../sagaUtils';
import { getCookie, setAuthCookies, clearAuthCookies } from '../../utils/cookie';
import { clearStoredBusinessId } from '../../utils/sessionStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Read accessToken, refreshToken and user from cookie
const accessToken = getCookie('accessToken');
const refreshToken = getCookie('refreshToken');
const userCookie = getCookie('auth_user');

let initialUser: User | null = null;
if (userCookie) {
  try {
    initialUser = JSON.parse(userCookie);
  } catch {
    initialUser = null;
  }
}

// Clean up any deprecated localStorage token/user to ensure strict cookie storage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  } catch {}
}

const initialState: AuthState = {
  user: initialUser,
  token: accessToken || null,
  accessToken: accessToken || null,
  refreshToken: refreshToken || null,
  isAuthenticated: Boolean(accessToken || refreshToken),
  isLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchProfile = createSagaAction<void, User>('auth/fetchProfile');
export const loginUser = createSagaAction<
  { email: string; password: string },
  { user: User; token?: string; accessToken?: string; refreshToken?: string }
>('auth/loginUser');

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAuth: (
      state,
      action: PayloadAction<{
        user: User;
        token?: string;
        accessToken?: string;
        refreshToken?: string;
      }>
    ) => {
      const access = action.payload.accessToken || action.payload.token || null;
      state.user = action.payload.user;
      state.token = access;
      state.accessToken = access;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      setAuthCookies({
        accessToken: access,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
      });
    },
    setTokens: (
      state,
      action: PayloadAction<{
        token?: string;
        accessToken?: string;
        refreshToken?: string;
      }>
    ) => {
      const access = action.payload.accessToken || action.payload.token || null;
      if (access) {
        state.token = access;
        state.accessToken = access;
      }
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = Boolean(access || state.refreshToken);

      setAuthCookies({
        accessToken: access,
        refreshToken: action.payload.refreshToken,
      });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      clearAuthCookies();
      clearStoredBusinessId();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, setAuth, setTokens, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
