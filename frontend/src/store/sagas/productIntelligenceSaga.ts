import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { productIntelligenceApi } from '../../api/productIntelligenceApi';
import {
  fetchProductIntelligenceSummary,
  fetchProductIntelligenceList,
  fetchProductDetailIntelligence,
  setSummaryLoading,
  setListLoading,
  setDetailLoading,
  setSummarySuccess,
  setListSuccess,
  setDetailSuccess,
  setError,
} from '../slices/productIntelligenceSlice';
import type { RootState } from '../index';

function* handleFetchSummary(action: ReturnType<typeof fetchProductIntelligenceSummary>): Generator<any, void, any> {
  try {
    yield put(setSummaryLoading(true));
    const state: RootState = yield select();
    const { timeframe, startDate, endDate } = state.productIntelligence;
    const { selectedBusiness } = state.business;

    const params = {
      timeframe,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      business_id: selectedBusiness?.id,
      ...action.payload,
    };

    const res = yield call(productIntelligenceApi.getSummary, params);
    yield put(setSummarySuccess(res.data || res));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load product intelligence summary'));
  }
}

function* handleFetchList(action: ReturnType<typeof fetchProductIntelligenceList>): Generator<any, void, any> {
  try {
    yield put(setListLoading(true));
    const state: RootState = yield select();
    const {
      timeframe,
      startDate,
      endDate,
      searchQuery,
      categoryFilter,
      dealerFilter,
      statusFilter,
      stockStatusFilter,
      profitabilityFilter,
      classificationFilter,
      sortBy,
      sortOrder,
      pagination,
    } = state.productIntelligence;
    const { selectedBusiness } = state.business;

    const params = {
      timeframe,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      business_id: selectedBusiness?.id,
      search: searchQuery || undefined,
      category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      dealer_id: dealerFilter !== 'ALL' ? dealerFilter : undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      stock_status: stockStatusFilter !== 'ALL' ? stockStatusFilter : undefined,
      profitability: profitabilityFilter !== 'ALL' ? profitabilityFilter : undefined,
      classification: classificationFilter !== 'ALL' ? classificationFilter : undefined,
      sortBy,
      sortOrder,
      page: pagination.page,
      limit: pagination.limit,
      ...action.payload,
    };

    const res = yield call(productIntelligenceApi.getList, params);
    yield put(setListSuccess({ items: res.data || [], pagination: res.pagination }));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load product opportunity matrix'));
  }
}

function* handleFetchDetail(action: ReturnType<typeof fetchProductDetailIntelligence>): Generator<any, void, any> {
  try {
    yield put(setDetailLoading(true));
    const state: RootState = yield select();
    const { timeframe, startDate, endDate } = state.productIntelligence;

    const params = {
      timeframe,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      ...action.payload,
    };

    const res = yield call(productIntelligenceApi.getDetail, action.payload.id, params);
    yield put(setDetailSuccess(res.data || res));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load product intelligence drilldown'));
  }
}

export function* productIntelligenceSaga() {
  yield takeLatest(fetchProductIntelligenceSummary.type, handleFetchSummary);
  yield takeLatest(fetchProductIntelligenceList.type, handleFetchList);
  yield takeLatest(fetchProductDetailIntelligence.type, handleFetchDetail);
}
