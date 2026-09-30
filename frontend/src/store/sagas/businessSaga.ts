import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { businessApi } from '../../api/businessApi';
import {
  fetchBusinesses,
  createBusiness,
  setLoading,
  setError,
  setBusinesses,
  businessCreated,
} from '../slices/businessSlice';
import type { SagaAction } from '../sagaUtils';

function* handleFetchBusinesses(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(businessApi.getAll);
    const list = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.data?.businesses)
      ? res.data.businesses
      : Array.isArray(res?.businesses)
      ? res.businesses
      : Array.isArray(res)
      ? res
      : [];
    yield put(setBusinesses(list));
    action.meta?.resolve?.(list);
  } catch (err: any) {
    const msg = err.message || 'Failed to load businesses';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleCreateBusiness(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(businessApi.create, action.payload);
    yield put(businessCreated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to create business';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

export function* businessSaga() {
  yield all([
    takeLatest(fetchBusinesses.type, handleFetchBusinesses),
    takeEvery(createBusiness.type, handleCreateBusiness),
  ]);
}
