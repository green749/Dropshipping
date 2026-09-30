import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { customerApi } from '../../api/customerApi';
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  setLoading,
  setError,
  setCustomers,
  setSelectedCustomer,
  customerCreated,
  customerUpdated,
  customerDeleted,
} from '../slices/customerSlice';
import type { SagaAction } from '../sagaUtils';

function* handleFetchCustomers(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(customerApi.getAll, action.payload);
    yield put(setCustomers(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load customers';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleFetchCustomerById(action: SagaAction<string>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(customerApi.getById, action.payload);
    yield put(setSelectedCustomer(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load customer';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleCreateCustomer(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(customerApi.create, action.payload);
    yield put(customerCreated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to create customer';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleUpdateCustomer(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(customerApi.update, action.payload.id, action.payload.data);
    yield put(customerUpdated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to update customer';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleDeleteCustomer(action: SagaAction<string>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    yield call(customerApi.delete, action.payload);
    yield put(customerDeleted(action.payload));
    action.meta?.resolve?.(action.payload);
  } catch (err: any) {
    const msg = err.message || 'Failed to delete customer';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

export function* customerSaga() {
  yield all([
    takeLatest(fetchCustomers.type, handleFetchCustomers),
    takeLatest(fetchCustomerById.type, handleFetchCustomerById),
    takeEvery(createCustomer.type, handleCreateCustomer),
    takeEvery(updateCustomer.type, handleUpdateCustomer),
    takeEvery(deleteCustomer.type, handleDeleteCustomer),
  ]);
}
