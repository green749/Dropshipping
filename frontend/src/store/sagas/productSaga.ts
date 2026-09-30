import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { productApi } from '../../api/productApi';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setLoading,
  setError,
  setProducts,
  productCreated,
  productUpdated,
  productDeleted,
} from '../slices/productSlice';
import type { SagaAction } from '../sagaUtils';

export function* handleFetchProducts(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(productApi.getAll, action.payload);
    yield put(setProducts(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load products';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleCreateProduct(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(productApi.create, action.payload);
    yield put(productCreated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to create product';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleUpdateProduct(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    const res = yield call(productApi.update, action.payload.id, action.payload.data);
    yield put(productUpdated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to update product';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleDeleteProduct(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    yield call(productApi.delete, action.payload);
    yield put(productDeleted(action.payload));
    action.meta?.resolve?.(action.payload);
  } catch (err: any) {
    const msg = err.message || 'Failed to delete product';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

export function* productSaga() {
  yield all([
    takeLatest(fetchProducts.type, handleFetchProducts),
    takeEvery(createProduct.type, handleCreateProduct),
    takeEvery(updateProduct.type, handleUpdateProduct),
    takeEvery(deleteProduct.type, handleDeleteProduct),
  ]);
}
