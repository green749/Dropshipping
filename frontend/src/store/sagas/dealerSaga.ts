import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { dealerApi } from '../../api/dealerApi';
import {
  fetchDealers,
  createDealer,
  updateDealer,
  assignDealerToBusiness,
  setLoading,
  setError,
  setDealers,
  dealerCreated,
  dealerUpdated,
} from '../slices/dealerSlice';
import type { SagaAction } from '../sagaUtils';

function* handleFetchDealers(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(dealerApi.getAll, action.payload);
    yield put(setDealers(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load dealers';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleCreateDealer(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(dealerApi.create, action.payload);
    yield put(dealerCreated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to create dealer';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleUpdateDealer(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(dealerApi.update, action.payload.id, action.payload.data);
    yield put(dealerUpdated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to update dealer';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleAssignDealer(action: SagaAction<{ businessId: string; dealerId: string }>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    yield call(dealerApi.assignToBusinesses, action.payload.businessId, action.payload.dealerId);
    yield put(setLoading(false));
    action.meta?.resolve?.(action.payload);
  } catch (err: any) {
    const msg = err.message || 'Failed to assign dealer';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

export function* dealerSaga() {
  yield all([
    takeLatest(fetchDealers.type, handleFetchDealers),
    takeEvery(createDealer.type, handleCreateDealer),
    takeEvery(updateDealer.type, handleUpdateDealer),
    takeEvery(assignDealerToBusiness.type, handleAssignDealer),
  ]);
}
