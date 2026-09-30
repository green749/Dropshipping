import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import businessReducer from './slices/businessSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import marketingReducer from './slices/marketingSlice';
import uiReducer from './slices/uiSlice';
import customerReducer from './slices/customerSlice';
import dealerReducer from './slices/dealerSlice';
import notificationReducer from './slices/notificationSlice';
import dashboardReducer from './slices/dashboardSlice';
import returnReducer from './slices/returnSlice';
import chatReducer from './slices/chatSlice';
import financeReducer from './slices/financeSlice';
import inventoryReducer from './slices/inventorySlice';
import dealerPerformanceReducer from './slices/dealerPerformanceSlice';
import productIntelligenceReducer from './slices/productIntelligenceSlice';
import productResearchReducer from './slices/productResearchSlice';
import rootSaga from './sagas/rootSaga';
import { sagaPromiseMiddleware } from './sagaUtils';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    business: businessReducer,
    product: productReducer,
    order: orderReducer,
    marketing: marketingReducer,
    ui: uiReducer,
    customer: customerReducer,
    dealer: dealerReducer,
    dealerPerformance: dealerPerformanceReducer,
    notification: notificationReducer,
    dashboard: dashboardReducer,
    return: returnReducer,
    chat: chatReducer,
    finance: financeReducer,
    inventory: inventoryReducer,
    productIntelligence: productIntelligenceReducer,
    productResearch: productResearchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      immutableCheck: false,
      serializableCheck: false,
    }).concat(sagaPromiseMiddleware, sagaMiddleware),
  devTools: import.meta.env.DEV ? { maxAge: 25, latency: 500 } : false,
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch & ((action: any) => Promise<any>);

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
