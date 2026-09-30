import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { notificationApi } from '../../api/notificationApi';
import {
  fetchNotifications,
  markNotificationRead,
  setLoading,
  setNotifications,
  markNotificationReadSuccess,
} from '../slices/notificationSlice';
import type { SagaAction } from '../sagaUtils';

function* handleFetchNotifications(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const res = yield call(notificationApi.getAll);
    yield put(setNotifications(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    yield put(setLoading(false));
    action.meta?.reject?.(err.message || 'Failed to load notifications');
  }
}

function* handleMarkNotificationRead(action: SagaAction<string>): Generator<any, void, any> {
  try {
    const res = yield call(notificationApi.markAsRead, action.payload);
    yield put(markNotificationReadSuccess(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    action.meta?.reject?.(err.message || 'Failed to mark notification');
  }
}

export function* notificationSaga() {
  yield all([
    takeLatest(fetchNotifications.type, handleFetchNotifications),
    takeEvery(markNotificationRead.type, handleMarkNotificationRead),
  ]);
}
