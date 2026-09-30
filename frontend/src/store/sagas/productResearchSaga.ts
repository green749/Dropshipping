import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { productResearchApi } from '../../api/productResearchApi';
import {
  fetchProductResearchList,
  fetchProductResearchById,
  createProductResearchAction,
  updateProductResearchAction,
  deleteProductResearchAction,
  convertProductResearchAction,
  setListLoading,
  setItemLoading,
  setMutating,
  setConverting,
  setListSuccess,
  setItemSuccess,
  mutationSuccess,
  setError,
} from '../slices/productResearchSlice';
import { addToast } from '../slices/uiSlice';
import type { RootState } from '../index';

function* handleFetchList(action: ReturnType<typeof fetchProductResearchList>): Generator<any, void, any> {
  try {
    yield put(setListLoading(true));
    const state: RootState = yield select();
    const {
      searchQuery,
      statusFilter,
      categoryFilter,
      dealerFilter,
      tagFilter,
      minMargin,
      maxMargin,
      sortBy,
      sortOrder,
      pagination,
    } = state.productResearch;
    const { selectedBusiness } = state.business;

    const params = {
      business_id: selectedBusiness?.id,
      search: searchQuery || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      dealer_id: dealerFilter !== 'ALL' ? dealerFilter : undefined,
      tag: tagFilter !== 'ALL' ? tagFilter : undefined,
      minMargin: minMargin !== undefined ? minMargin : undefined,
      maxMargin: maxMargin !== undefined ? maxMargin : undefined,
      sortBy,
      sortOrder,
      page: pagination.page,
      limit: pagination.limit,
      ...action.payload,
    };

    const res = yield call(productResearchApi.getAll, params);
    yield put(setListSuccess({ items: res.data || [], pagination: res.pagination }));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load research workspace items'));
  }
}

function* handleFetchById(action: ReturnType<typeof fetchProductResearchById>): Generator<any, void, any> {
  try {
    yield put(setItemLoading(true));
    const res = yield call(productResearchApi.getById, action.payload);
    yield put(setItemSuccess(res.data || res));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load research item'));
  }
}

function* handleCreate(action: ReturnType<typeof createProductResearchAction>): Generator<any, void, any> {
  try {
    yield put(setMutating(true));
    const res = yield call(productResearchApi.create, action.payload);
    yield put(mutationSuccess());
    yield put(
      addToast({
        type: 'success',
        message: `Product research item "${res.data?.product_name || 'Item'}" added to workspace`,
      })
    );
    yield put(fetchProductResearchList(undefined));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to create research item'));
    yield put(
      addToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to create research item',
      })
    );
  }
}

function* handleUpdate(action: ReturnType<typeof updateProductResearchAction>): Generator<any, void, any> {
  try {
    yield put(setMutating(true));
    const res = yield call(productResearchApi.update, action.payload.id, action.payload.payload);
    yield put(mutationSuccess());
    yield put(
      addToast({
        type: 'success',
        message: `Research item "${res.data?.product_name || 'Item'}" updated`,
      })
    );
    yield put(fetchProductResearchList(undefined));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to update research item'));
    yield put(
      addToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to update research item',
      })
    );
  }
}

function* handleDelete(action: ReturnType<typeof deleteProductResearchAction>): Generator<any, void, any> {
  try {
    yield put(setMutating(true));
    yield call(productResearchApi.delete, action.payload);
    yield put(mutationSuccess());
    yield put(
      addToast({
        type: 'info',
        message: 'Product research item removed from workspace',
      })
    );
    yield put(fetchProductResearchList(undefined));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to delete research item'));
  }
}

function* handleConvert(action: ReturnType<typeof convertProductResearchAction>): Generator<any, void, any> {
  try {
    yield put(setConverting(true));
    const res = yield call(
      productResearchApi.convertToProduct,
      action.payload.id,
      action.payload.conversionData
    );
    yield put(mutationSuccess());
    yield put(
      addToast({
        type: 'success',
        message: `🎉 Research item converted to live Product "${res.data?.product?.name}"!`,
      })
    );
    yield put(fetchProductResearchList(undefined));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to convert research item to live product'));
    yield put(
      addToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to convert research item to product',
      })
    );
  }
}

export function* productResearchSaga() {
  yield takeLatest(fetchProductResearchList.type, handleFetchList);
  yield takeLatest(fetchProductResearchById.type, handleFetchById);
  yield takeLatest(createProductResearchAction.type, handleCreate);
  yield takeLatest(updateProductResearchAction.type, handleUpdate);
  yield takeLatest(deleteProductResearchAction.type, handleDelete);
  yield takeLatest(convertProductResearchAction.type, handleConvert);
}
