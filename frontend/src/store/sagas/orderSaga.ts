import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { orderApi } from '../../api/orderApi';
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  setLoading,
  setError,
  setOrders,
  orderCreated,
  orderStatusUpdated,
} from '../slices/orderSlice';
import { fetchProducts } from '../slices/productSlice';
import type { SagaAction } from '../sagaUtils';
import type { Order } from '../../types';

function* handleFetchOrders(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(orderApi.getAll, action.payload);
    yield put(setOrders(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load orders';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleCreateOrder(action: SagaAction<Partial<Order>>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(orderApi.create, action.payload);
    yield put(orderCreated(res.data || res));
    yield put(fetchProducts());
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to create order';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleUpdateOrderStatus(action: SagaAction<{ id: string; status: string }>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(orderApi.updateStatus, action.payload.id, action.payload.status);
    yield put(orderStatusUpdated(res.data || res));
    yield put(fetchProducts());
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to update order status';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

export function* orderSaga() {
  yield all([
    takeLatest(fetchOrders.type, handleFetchOrders),
    takeLatest(createOrder.type, handleCreateOrder),
    takeEvery(updateOrderStatus.type, handleUpdateOrderStatus),
  ]);
}
