import { takeLatest, put, call } from 'redux-saga/effects';
import { inventoryApi } from '../../api/inventoryApi';
import { fetchProducts } from '../slices/productSlice';
import { fetchDealerDashboard } from '../slices/dashboardSlice';
import {
  fetchInventorySummary,
  fetchInventoryProducts,
  fetchProductInventoryDetail,
  fetchInventoryTransactions,
  fetchInventoryMovementTrend,
  submitStockAdjustment,
  submitStockIn,
  setLoading,
  setDetailLoading,
  setTransactionsLoading,
  setMovementLoading,
  setMutating,
  setError,
  setSummary,
  setProducts,
  setProductDetail,
  setTransactions,
  setMovementTrend,
  mutationSuccess,
} from '../slices/inventorySlice';

function* handleFetchSummary(action: ReturnType<typeof fetchInventorySummary>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const response = yield call(inventoryApi.getSummary, action.payload);
    yield put(setSummary(response.data));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load inventory summary'));
  }
}

function* handleFetchProducts(action: ReturnType<typeof fetchInventoryProducts>): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const response = yield call(inventoryApi.getProducts, action.payload);
    yield put(
      setProducts({
        products: response.data || [],
        pagination: response.pagination,
      })
    );
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load inventory products'));
  }
}

function* handleFetchProductDetail(action: ReturnType<typeof fetchProductInventoryDetail>): Generator<any, void, any> {
  try {
    yield put(setDetailLoading(true));
    const response = yield call(inventoryApi.getProductDetail, action.payload.id, {
      velocityPeriod: action.payload.velocityPeriod,
    });
    yield put(setProductDetail(response.data));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load product details'));
  }
}

function* handleFetchTransactions(action: ReturnType<typeof fetchInventoryTransactions>): Generator<any, void, any> {
  try {
    yield put(setTransactionsLoading(true));
    const response = yield call(inventoryApi.getTransactions, action.payload);
    yield put(
      setTransactions({
        transactions: response.data || [],
        pagination: response.pagination,
      })
    );
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load inventory transactions'));
  }
}

function* handleFetchMovementTrend(action: ReturnType<typeof fetchInventoryMovementTrend>): Generator<any, void, any> {
  try {
    yield put(setMovementLoading(true));
    const response = yield call(inventoryApi.getMovementTrend, action.payload);
    yield put(setMovementTrend(response.data || []));
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to load movement trend'));
  }
}

function* handleSubmitAdjustment(action: ReturnType<typeof submitStockAdjustment>): Generator<any, void, any> {
  try {
    yield put(setMutating(true));
    yield call(inventoryApi.adjustStock, action.payload);
    yield put(mutationSuccess());
    yield put(fetchInventorySummary(undefined));
    yield put(fetchInventoryProducts(undefined));
    yield put(fetchProducts());
    yield put(fetchDealerDashboard());
    if (action.payload.product_id) {
      yield put(fetchProductInventoryDetail({ id: action.payload.product_id }));
      yield put(fetchInventoryTransactions({ product_id: action.payload.product_id }));
    }
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to submit stock adjustment'));
  }
}

function* handleSubmitStockIn(action: ReturnType<typeof submitStockIn>): Generator<any, void, any> {
  try {
    yield put(setMutating(true));
    yield call(inventoryApi.stockIn, action.payload);
    yield put(mutationSuccess());
    yield put(fetchInventorySummary(undefined));
    yield put(fetchInventoryProducts(undefined));
    yield put(fetchProducts());
    yield put(fetchDealerDashboard());
    if (action.payload.product_id) {
      yield put(fetchProductInventoryDetail({ id: action.payload.product_id }));
      yield put(fetchInventoryTransactions({ product_id: action.payload.product_id }));
    }
  } catch (err: any) {
    yield put(setError(err.response?.data?.message || err.message || 'Failed to submit stock-in'));
  }
}

export function* inventorySaga() {
  yield takeLatest(fetchInventorySummary.type, handleFetchSummary);
  yield takeLatest(fetchInventoryProducts.type, handleFetchProducts);
  yield takeLatest(fetchProductInventoryDetail.type, handleFetchProductDetail);
  yield takeLatest(fetchInventoryTransactions.type, handleFetchTransactions);
  yield takeLatest(fetchInventoryMovementTrend.type, handleFetchMovementTrend);
  yield takeLatest(submitStockAdjustment.type, handleSubmitAdjustment);
  yield takeLatest(submitStockIn.type, handleSubmitStockIn);
}
