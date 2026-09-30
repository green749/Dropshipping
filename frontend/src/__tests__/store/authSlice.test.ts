import { describe, it, expect } from 'vitest';
import { authSlice, setAuth, logout, clearError } from '../../store/slices/authSlice';
import type { User } from '../../types';

describe('authSlice reducer', () => {
  const initialTestState = {
    user: null,
    token: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  const mockUser: User = {
    id: 'user-1',
    email: 'admin@dropship.com',
    role: 'DROPSHIPPER',
    name: 'Platform Admin',
    is_active: true,
  };


  it('handles setAuth action correctly', () => {
    const action = setAuth({
      user: mockUser,
      token: 'jwt-token-12345',
      accessToken: 'jwt-token-12345',
      refreshToken: 'jwt-refresh-67890',
    });

    const newState = authSlice.reducer(initialTestState, action);

    expect(newState.isAuthenticated).toBe(true);
    expect(newState.user).toEqual(mockUser);
    expect(newState.token).toBe('jwt-token-12345');
    expect(newState.accessToken).toBe('jwt-token-12345');
    expect(newState.refreshToken).toBe('jwt-refresh-67890');
    expect(newState.error).toBeNull();
  });

  it('handles logout action correctly', () => {
    const loggedInState = {
      user: mockUser,
      token: 'jwt-token-12345',
      accessToken: 'jwt-token-12345',
      refreshToken: 'jwt-refresh-67890',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    const newState = authSlice.reducer(loggedInState, logout());

    expect(newState.isAuthenticated).toBe(false);
    expect(newState.user).toBeNull();
    expect(newState.token).toBeNull();
    expect(newState.accessToken).toBeNull();
    expect(newState.refreshToken).toBeNull();
  });

  it('handles clearError action correctly', () => {
    const stateWithError = {
      ...initialTestState,
      error: 'Invalid credentials',
    };

    const newState = authSlice.reducer(stateWithError, clearError());
    expect(newState.error).toBeNull();
  });
});
