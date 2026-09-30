import { takeLatest, put, call } from 'redux-saga/effects';
import { dealerPerformanceApi } from '../../api/dealerPerformanceApi';
import {
  fetchDealerPerformanceSummary,
  fetchDealerPerformanceList,
  fetchDealerPerformanceDetail,
  fetchDealerComparison,
  updateDealerSlaAction,
  updateDealerStatusAction,
  setLoading,
  setDetailLoading,
  setCompareLoading,
  setMutating,
  setError,
  setSummary,
  setDealers,
  setDetail,
  setComparison,
  mutationSuccess,
} from '../slices/dealerPerformanceSlice';

function* handleFetchSummary(action: ReturnType<typeof fetchDealerPerformanceSummary>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const response = yield call(dealerPerformanceApi.getSummary, action.payload);
    yield put(setSummary(response.data));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load dealer performance summary'));
  }
}

function* handleFetchList(action: ReturnType<typeof fetchDealerPerformanceList>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const response = yield call(dealerPerformanceApi.getList, action.payload);
    yield put(
      setDealers({
        dealers: response.data || [],
        pagination: response.pagination,
      })
    );
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load dealer performance list'));
  }
}

function* handleFetchDetail(action: ReturnType<typeof fetchDealerPerformanceDetail>): Generator<any, void, any> {
  try {
    yield put(setDetailLoading(true));
    const response = yield call(dealerPerformanceApi.getDetail, action.payload.id, {
      business_id: action.payload.business_id,
      timeframe: action.payload.timeframe,
    });
    yield put(setDetail(response.data));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load dealer details'));
  }
}

function* handleFetchComparison(action: ReturnType<typeof fetchDealerComparison>): Generator<any, void, any> {
  try {
    yield put(setCompareLoading(true));
    const response = yield call(dealerPerformanceApi.getComparison, action.payload.dealerIds, {
      business_id: action.payload.business_id,
      timeframe: action.payload.timeframe,
    });
    yield put(setComparison(response.data?.dealers || []));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load dealer comparison'));
  }
}

function* handleUpdateSla(action: ReturnType<typeof updateDealerSlaAction>): Generator<any, void, any> {
  try {
    yield put(setMutating(true));
    yield call(() => dealerPerformanceApi.updateSla(action.payload.id || '', action.payload.data));
    yield put(mutationSuccess());
    yield put(fetchDealerPerformanceSummary(undefined));
    yield put(fetchDealerPerformanceList(undefined));
    if (action.payload?.id) {
      yield put(fetchDealerPerformanceDetail({ id: action.payload.id }));
    }
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to update dealer SLA'));
  }
}

function* handleUpdateStatus(action: ReturnType<typeof updateDealerStatusAction>): Generator<any, void, any> {
  try {
    yield put(setMutating(true));
    yield call(() => dealerPerformanceApi.updateStatus(action.payload.id || '', action.payload.status || 'ACTIVE'));
    yield put(mutationSuccess());
    yield put(fetchDealerPerformanceSummary(undefined));
    yield put(fetchDealerPerformanceList(undefined));
    if (action.payload?.id) {
      yield put(fetchDealerPerformanceDetail({ id: action.payload.id }));
    }
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to update dealer status'));
  }
}

export function* dealerPerformanceSaga() {
  yield takeLatest(fetchDealerPerformanceSummary.type, handleFetchSummary);
  yield takeLatest(fetchDealerPerformanceList.type, handleFetchList);
  yield takeLatest(fetchDealerPerformanceDetail.type, handleFetchDetail);
  yield takeLatest(fetchDealerComparison.type, handleFetchComparison);
  yield takeLatest(updateDealerSlaAction.type, handleUpdateSla);
  yield takeLatest(updateDealerStatusAction.type, handleUpdateStatus);
}
