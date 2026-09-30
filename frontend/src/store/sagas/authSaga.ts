import { call, put, takeLatest, all } from 'redux-saga/effects';
import { authApi } from '../../api/authApi';
import {
  loginUser,
  fetchProfile,
  setLoading,
  setError,
  setAuth,
  logout,
} from '../slices/authSlice';
import { getCookie } from '../../utils/cookie';
import type { SagaAction } from '../sagaUtils';

export function* handleLogin(action: SagaAction<{ email: string; password: string }>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(authApi.login, action.payload);
    yield put(setAuth(res.data));
    action.meta?.resolve?.(res.data);
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Invalid email or password';
    yield put(setError(message));
    action.meta?.reject?.(message);
  }
}

export function* handleFetchProfile(action: SagaAction<void>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const res = yield call(authApi.getProfile);
    const accessToken = getCookie('accessToken') || '';
    const refreshToken = getCookie('refreshToken') || '';
    yield put(setAuth({ user: res.data, token: accessToken, accessToken, refreshToken }));
    action.meta?.resolve?.(res.data);
  } catch (err: any) {
    yield put(logout());
    action.meta?.reject?.(err.message || 'Failed to fetch user profile');
  }
}

export function* authSaga() {
  yield all([
    takeLatest(loginUser.type, handleLogin),
    takeLatest(fetchProfile.type, handleFetchProfile),
  ]);
}
