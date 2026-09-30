import { call, put, takeLatest, all } from 'redux-saga/effects';
import { dashboardApi } from '../../api/dashboardApi';
import {
  fetchOverview,
  fetchDealerDashboard,
  fetchMarketingDashboard,
  setLoading,
  setError,
  setOverview,
  setDealerData,
  setMarketingData,
} from '../slices/dashboardSlice';
import type { SagaAction } from '../sagaUtils';

function* handleFetchOverview(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(dashboardApi.getOverview, action.payload);
    yield put(setOverview(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load dashboard';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleFetchDealerDashboard(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const res = yield call(dashboardApi.getDealerDashboard, action.payload);
    yield put(setDealerData(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load dealer dashboard';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleFetchMarketingDashboard(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const res = yield call(dashboardApi.getMarketingDashboard, action.payload);
    yield put(setMarketingData(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load marketing dashboard';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

export function* dashboardSaga() {
  yield all([
    takeLatest(fetchOverview.type, handleFetchOverview),
    takeLatest(fetchDealerDashboard.type, handleFetchDealerDashboard),
    takeLatest(fetchMarketingDashboard.type, handleFetchMarketingDashboard),
  ]);
}
