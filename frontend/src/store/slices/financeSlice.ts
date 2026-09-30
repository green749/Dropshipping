import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Expense,
  ExpenseSummaryResponse,
  ProfitSummary,
  ProfitTrendPoint,
  ProductProfitability,
  OrderProfitability,
} from '../../types';
import { createSagaAction } from '../sagaUtils';
import type {
  FinanceQueryParams,
  ProductProfitQueryParams,
  ExpenseQueryParams,
  ExpensePayload,
} from '../../api/financeApi';
import { selectBusiness } from './businessSlice';
import { logout } from './authSlice';


interface FinanceState {
  profitSummary: ProfitSummary | null;
  profitTimeline: ProfitTrendPoint[];
  productProfitability: ProductProfitability[];
  orderProfitability: OrderProfitability[];
  expenses: Expense[];
  expenseSummary: ExpenseSummaryResponse | null;
  expensePagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedPeriod: string;
  startDate: string;
  endDate: string;
  isLoading: boolean;
  isExpensesLoading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  profitSummary: null,
  profitTimeline: [],
  productProfitability: [],
  orderProfitability: [],
  expenses: [],
  expenseSummary: null,
  expensePagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  selectedPeriod: '30d',
  startDate: '',
  endDate: '',
  isLoading: false,
  isExpensesLoading: false,
  error: null,
};

// Redux Saga Actions
export const fetchProfitSummary = createSagaAction<FinanceQueryParams | undefined, ProfitSummary>('finance/fetchProfitSummary');
export const fetchProfitTimeline = createSagaAction<FinanceQueryParams | undefined, ProfitTrendPoint[]>('finance/fetchProfitTimeline');
export const fetchProductProfitability = createSagaAction<ProductProfitQueryParams | undefined, ProductProfitability[]>('finance/fetchProductProfitability');
export const fetchOrderProfitability = createSagaAction<FinanceQueryParams | undefined, OrderProfitability[]>('finance/fetchOrderProfitability');
export const fetchExpenses = createSagaAction<ExpenseQueryParams | undefined, { data: Expense[]; pagination?: any }>('finance/fetchExpenses');
export const fetchExpenseSummary = createSagaAction<FinanceQueryParams | undefined, ExpenseSummaryResponse>('finance/fetchExpenseSummary');
export const createExpenseAction = createSagaAction<ExpensePayload, Expense>('finance/createExpense');
export const updateExpenseAction = createSagaAction<{ id: string; data: Partial<ExpensePayload> }, Expense>('finance/updateExpense');
export const deleteExpenseAction = createSagaAction<string, { id: string }>('finance/deleteExpense');

export const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setExpensesLoading: (state, action: PayloadAction<boolean>) => {
      state.isExpensesLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isExpensesLoading = false;
    },
    setPeriod: (state, action: PayloadAction<string>) => {
      state.selectedPeriod = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setProfitSummary: (state, action: PayloadAction<ProfitSummary>) => {
      state.isLoading = false;
      state.profitSummary = action.payload;
      state.error = null;
    },
    setProfitTimeline: (state, action: PayloadAction<ProfitTrendPoint[]>) => {
      state.isLoading = false;
      state.profitTimeline = action.payload;
      state.error = null;
    },
    setProductProfitability: (state, action: PayloadAction<ProductProfitability[]>) => {
      state.isLoading = false;
      state.productProfitability = action.payload;
      state.error = null;
    },
    setOrderProfitability: (state, action: PayloadAction<OrderProfitability[]>) => {
      state.isLoading = false;
      state.orderProfitability = action.payload;
      state.error = null;
    },
    setExpenses: (
      state,
      action: PayloadAction<{ data: Expense[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>
    ) => {
      state.isExpensesLoading = false;
      state.expenses = action.payload.data;
      if (action.payload.pagination) {
        state.expensePagination = action.payload.pagination;
      }
      state.error = null;
    },
    setExpenseSummary: (state, action: PayloadAction<ExpenseSummaryResponse>) => {
      state.expenseSummary = action.payload;
    },
    expenseCreated: (state, action: PayloadAction<Expense>) => {
      state.isExpensesLoading = false;
      state.expenses.unshift(action.payload);
      state.expensePagination.total += 1;
    },
    expenseUpdated: (state, action: PayloadAction<Expense>) => {
      state.isExpensesLoading = false;
      const idx = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) {
        state.expenses[idx] = action.payload;
      }
    },
    expenseDeleted: (state, action: PayloadAction<string>) => {
      state.isExpensesLoading = false;
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      state.expensePagination.total = Math.max(0, state.expensePagination.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectBusiness, (state) => {
        state.profitSummary = null;
        state.profitTimeline = [];
        state.productProfitability = [];
        state.orderProfitability = [];
        state.expenses = [];
        state.expenseSummary = null;
        state.isLoading = true;
        state.isExpensesLoading = true;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.profitSummary = null;
        state.profitTimeline = [];
        state.productProfitability = [];
        state.orderProfitability = [];
        state.expenses = [];
        state.expenseSummary = null;
        state.isLoading = false;
        state.isExpensesLoading = false;
        state.error = null;
      });
  },
});


export const {
  setLoading,
  setExpensesLoading,
  setError,
  setPeriod,
  setDateRange,
  setProfitSummary,
  setProfitTimeline,
  setProductProfitability,
  setOrderProfitability,
  setExpenses,
  setExpenseSummary,
  expenseCreated,
  expenseUpdated,
  expenseDeleted,
} = financeSlice.actions;

export default financeSlice.reducer;
