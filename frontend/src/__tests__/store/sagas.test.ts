import { describe, it, expect } from 'vitest';
import { call, put } from 'redux-saga/effects';
import { authApi } from '../../api/authApi';
import { productApi } from '../../api/productApi';
import { handleLogin } from '../../store/sagas/authSaga';
import { handleFetchProducts } from '../../store/sagas/productSaga';
import {
  setLoading as setAuthLoading,
  setError as setAuthError,
  setAuth,
} from '../../store/slices/authSlice';
import {
  setLoading as setProductLoading,
  setError as setProductError,
  setProducts,
} from '../../store/slices/productSlice';

describe('Redux Sagas', () => {
  describe('authSaga - handleLogin', () => {
    const mockCredentials = { email: 'test@example.com', password: 'password123' };
    const mockUser = {
      id: 'u-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'DROPSHIPPER' as const,
      is_active: true,
    };
    const mockAuthResponse = {
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
      },
    };

    it('successfully processes login and dispatches setAuth', () => {
      let resolvedPayload: any = null;
      const action = {
        type: 'auth/loginUser',
        payload: mockCredentials,
        meta: {
          sagaPromise: true,
          resolve: (val: any) => { resolvedPayload = val; },
        },
      };

      const generator = handleLogin(action);

      // Step 1: setLoading(true)
      expect(generator.next().value).toEqual(put(setAuthLoading(true)));

      // Step 2: setError(null)
      expect(generator.next().value).toEqual(put(setAuthError(null)));

      // Step 3: call(authApi.login, payload)
      expect(generator.next().value).toEqual(call(authApi.login, mockCredentials));

      // Step 4: put(setAuth(data))
      expect(generator.next(mockAuthResponse).value).toEqual(put(setAuth(mockAuthResponse.data)));

      // Step 5: generator done
      const finish = generator.next();
      expect(finish.done).toBe(true);
      expect(resolvedPayload).toEqual(mockAuthResponse.data);
    });

    it('handles login failure and dispatches setError', () => {
      let rejectedReason: any = null;
      const action = {
        type: 'auth/loginUser',
        payload: mockCredentials,
        meta: {
          sagaPromise: true,
          reject: (err: any) => { rejectedReason = err; },
        },
      };

      const generator = handleLogin(action);

      expect(generator.next().value).toEqual(put(setAuthLoading(true)));
      expect(generator.next().value).toEqual(put(setAuthError(null)));
      expect(generator.next().value).toEqual(call(authApi.login, mockCredentials));

      const error = new Error('Invalid email or password');
      expect(generator.throw(error).value).toEqual(put(setAuthError('Invalid email or password')));

      const finish = generator.next();
      expect(finish.done).toBe(true);
      expect(rejectedReason).toBe('Invalid email or password');
    });
  });

  describe('productSaga - handleFetchProducts', () => {
    const mockProducts = [
      {
        id: 'p-1',
        name: 'Wireless Earbuds',
        price: 29.99,
        sku: 'EAR-001',
        stock: 50,
        category: 'Electronics',
        is_active: true,
      },
    ];

    it('fetches products and dispatches setProducts', () => {
      const action = {
        type: 'product/fetchAll',
        payload: undefined,
      };

      const generator = handleFetchProducts(action);

      expect(generator.next().value).toEqual(put(setProductLoading(true)));
      expect(generator.next().value).toEqual(put(setProductError(null)));
      expect(generator.next().value).toEqual(call(productApi.getAll, undefined));
      expect(generator.next({ data: mockProducts }).value).toEqual(put(setProducts(mockProducts)));

      const finish = generator.next();
      expect(finish.done).toBe(true);
    });
  });
});
