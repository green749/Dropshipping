import { takeLatest, put, call } from 'redux-saga/effects';
import { returnApi } from '../../api/returnApi';
import {
  fetchReturns,
  createReturn,
  updateReturnStatus,
  setLoading,
  setError,
  setReturns,
  returnCreated,
  returnUpdated,
} from '../slices/returnSlice';

function* handleFetchReturns(action: ReturnType<typeof fetchReturns>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const response = yield call(returnApi.getAll, action.payload);
    yield put(setReturns(response.data || []));
  } catch (err: any) {
    yield put(setError(err.message || 'Failed to load returns'));
  }
}

function* handleCreateReturn(action: ReturnType<typeof createReturn>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const response = yield call(returnApi.create, action.payload);
    yield put(returnCreated(response.data));
  } catch (err: any) {
    yield put(setError(err.message || 'Failed to create return'));
  }
}

function* handleUpdateReturnStatus(action: ReturnType<typeof updateReturnStatus>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const response = yield call(returnApi.updateStatus, action.payload.id, action.payload.status, action.payload.resolution);
    yield put(returnUpdated(response.data));
  } catch (err: any) {
    yield put(setError(err.message || 'Failed to update return status'));
  }
}

export function* returnSaga() {
  yield takeLatest(fetchReturns.type, handleFetchReturns);
  yield takeLatest(createReturn.type, handleCreateReturn);
  yield takeLatest(updateReturnStatus.type, handleUpdateReturnStatus);
}
