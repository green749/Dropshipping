import { takeLatest, put, call } from 'redux-saga/effects';
import { financeApi } from '../../api/financeApi';
import {
  fetchProfitSummary,
  fetchProfitTimeline,
  fetchProductProfitability,
  fetchOrderProfitability,
  fetchExpenses,
  fetchExpenseSummary,
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  setLoading,
  setExpensesLoading,
  setError,
  setProfitSummary,
  setProfitTimeline,
  setProductProfitability,
  setOrderProfitability,
  setExpenses,
  setExpenseSummary,
  expenseCreated,
  expenseUpdated,
  expenseDeleted,
} from '../slices/financeSlice';

function* handleFetchProfitSummary(action: ReturnType<typeof fetchProfitSummary>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const response = yield call(financeApi.getProfitSummary, action.payload);
    yield put(setProfitSummary(response.data));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load profit summary'));
  }
}

function* handleFetchProfitTimeline(action: ReturnType<typeof fetchProfitTimeline>): Generator<any, void, any> {
  try {
    const response = yield call(financeApi.getProfitTimeline, action.payload);
    yield put(setProfitTimeline(response.data || []));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load profit timeline'));
  }
}

function* handleFetchProductProfitability(action: ReturnType<typeof fetchProductProfitability>): Generator<any, void, any> {
  try {
    const response = yield call(financeApi.getProductProfitability, action.payload);
    yield put(setProductProfitability(response.data || []));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load product profitability'));
  }
}

function* handleFetchOrderProfitability(action: ReturnType<typeof fetchOrderProfitability>): Generator<any, void, any> {
  try {
    const response = yield call(financeApi.getOrderProfitability, action.payload);
    yield put(setOrderProfitability(response.data || []));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load order profitability'));
  }
}

function* handleFetchExpenses(action: ReturnType<typeof fetchExpenses>): Generator<any, void, any> {
  try {
    yield put(setExpensesLoading(true));
    const response = yield call(financeApi.getExpenses, action.payload);
    yield put(
      setExpenses({
        data: response.data || [],
        pagination: response.pagination,
      })
    );
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load expenses'));
  }
}

function* handleFetchExpenseSummary(action: ReturnType<typeof fetchExpenseSummary>): Generator<any, void, any> {
  try {
    const response = yield call(financeApi.getExpenseSummary, action.payload);
    yield put(setExpenseSummary(response.data));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load expense summary'));
  }
}

function* handleCreateExpense(action: ReturnType<typeof createExpenseAction>): Generator<any, void, any> {
  try {
    yield put(setExpensesLoading(true));
    const response = yield call(financeApi.createExpense, action.payload);
    yield put(expenseCreated(response.data));
    // Refresh profit summary and timeline in background
    yield put(fetchProfitSummary({ business_id: action.payload.business_id }));
    yield put(fetchProfitTimeline({ business_id: action.payload.business_id }));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to create expense'));
  }
}

function* handleUpdateExpense(action: ReturnType<typeof updateExpenseAction>): Generator<any, void, any> {
  try {
    yield put(setExpensesLoading(true));
    const response = yield call(financeApi.updateExpense, action.payload.id, action.payload.data);
    yield put(expenseUpdated(response.data));
    // Refresh summary
    yield put(fetchProfitSummary({ business_id: action.payload.data.business_id }));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to update expense'));
  }
}

function* handleDeleteExpense(action: ReturnType<typeof deleteExpenseAction>): Generator<any, void, any> {
  try {
    yield put(setExpensesLoading(true));
    yield call(financeApi.deleteExpense, action.payload);
    yield put(expenseDeleted(action.payload));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to delete expense'));
  }
}

export function* financeSaga() {
  yield takeLatest(fetchProfitSummary.type, handleFetchProfitSummary);
  yield takeLatest(fetchProfitTimeline.type, handleFetchProfitTimeline);
  yield takeLatest(fetchProductProfitability.type, handleFetchProductProfitability);
  yield takeLatest(fetchOrderProfitability.type, handleFetchOrderProfitability);
  yield takeLatest(fetchExpenses.type, handleFetchExpenses);
  yield takeLatest(fetchExpenseSummary.type, handleFetchExpenseSummary);
  yield takeLatest(createExpenseAction.type, handleCreateExpense);
  yield takeLatest(updateExpenseAction.type, handleUpdateExpense);
  yield takeLatest(deleteExpenseAction.type, handleDeleteExpense);
}
