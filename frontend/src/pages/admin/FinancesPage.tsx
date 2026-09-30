import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchProfitSummary,
  fetchProfitTimeline,
  fetchProductProfitability,
  fetchExpenses,
  fetchExpenseSummary,
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  setPeriod,
  setDateRange,
} from '../../store/slices/financeSlice';
import { fetchDealers } from '../../store/slices/dealerSlice';
import { addToast } from '../../store/slices/uiSlice';
import type { Expense } from '../../types';

import { FinanceSummaryCards } from './finances/FinanceSummaryCards';
import { ProfitTrendChart } from './finances/ProfitTrendChart';
import { ProductProfitabilityTable } from './finances/ProductProfitabilityTable';
import { ExpenseManagementSection } from './finances/ExpenseManagementSection';
import { AddExpenseModal } from './finances/AddExpenseModal';
import { OrderEconomicsModal } from './finances/OrderEconomicsModal';

import {
  TrendingUp,
  RefreshCw,
  Plus,
  Building2,
  ShoppingBag,
} from 'lucide-react';

export const FinancesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedBusiness } = useAppSelector((state) => state.business);
  const { dealers } = useAppSelector((state) => state.dealer);
  const {
    profitSummary,
    profitTimeline,
    productProfitability,
    expenses,
    expenseSummary,
    expensePagination,
    selectedPeriod,
    startDate,
    endDate,
    isLoading,
    isExpensesLoading,
  } = useAppSelector((state) => state.finance);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isOrderEconomicsOpen, setIsOrderEconomicsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const businessId = selectedBusiness?.id || 'all';

  const loadFinancialData = useCallback(() => {
    const baseParams = {
      business_id: businessId,
      period: selectedPeriod,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    dispatch(fetchProfitSummary(baseParams));
    dispatch(fetchProfitTimeline(baseParams));
    dispatch(fetchProductProfitability(baseParams));
    dispatch(fetchExpenses({ ...baseParams, page: 1, limit: 20 }));
    dispatch(fetchExpenseSummary(baseParams));
    dispatch(fetchDealers());
  }, [dispatch, businessId, selectedPeriod, startDate, endDate]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    loadFinancialData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handlePeriodChange = (newPeriod: string) => {
    dispatch(setPeriod(newPeriod));
  };

  const handleCustomDateChange = (start: string, end: string) => {
    dispatch(setDateRange({ startDate: start, endDate: end }));
  };

  const handleAddExpenseSubmit = async (data: any) => {
    if (editingExpense) {
      await dispatch(updateExpenseAction({ id: editingExpense.id, data }) as any);
      dispatch(addToast({ type: 'success', message: 'Expense record updated successfully' }));
    } else {
      await dispatch(createExpenseAction(data) as any);
      dispatch(addToast({ type: 'success', message: 'New expense logged successfully' }));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await dispatch(deleteExpenseAction(id) as any);
    dispatch(addToast({ type: 'success', message: 'Expense deleted successfully' }));
    dispatch(fetchProfitSummary({ business_id: businessId, period: selectedPeriod }));
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setIsAddModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans text-[#16123F]">
      {/* Top Header Styled with App Design System */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#FFE26A] text-[#16123F] shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-[#16123F] tracking-tight">
              Profit & Expense Analytics
            </h1>
          </div>
          <p className="text-xs text-[#555279] mt-1 font-medium">
            Real-time multi-tenant profit calculation combining gross sales, COGS, payment gateway fees (2%), ad spends, and business overheads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Order Economics Button */}
          <button
            onClick={() => setIsOrderEconomicsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border border-[#C7DDCC] bg-[#F0F6F2] hover:bg-[#E2ECE5] text-[#16123F] transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#75C9B7]" />
            Order Unit Economics
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-full border border-[#C7DDCC] bg-[#F0F6F2] hover:bg-[#E2ECE5] text-[#16123F] flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#75C9B7]' : ''}`} />
          </button>

          {/* Record Expense CTA */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-[#16123F] bg-[#FFE26A] hover:bg-[#ebce58] rounded-full transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 font-black" />
            Record Expense
          </button>
        </div>
      </div>

      {/* Selected Business Scope Notice Card (Theme Styled) */}
      {selectedBusiness && (
        <div className="flex items-center justify-between px-5 py-3 bg-[#F0F6F2] border border-[#C7DDCC] rounded-[20px] text-xs text-[#16123F] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#75C9B7]/20 text-[#16123F]">
              <Building2 className="w-4 h-4" />
            </span>
            <span>
              Active Business Scope:{' '}
              <strong className="font-extrabold text-[#16123F]">{selectedBusiness.name}</strong>
            </span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFE26A] text-[#16123F]">
            Target Margin: {selectedBusiness.profit_margin || 25}%
          </span>
        </div>
      )}

      {/* 1. Summary Cards */}
      <FinanceSummaryCards summary={profitSummary} isLoading={isLoading} />

      {/* 2. Profit Trend Chart & Cost Distribution */}
      <ProfitTrendChart
        timeline={profitTimeline}
        summary={profitSummary}
        expenseBreakdown={expenseSummary?.categories || []}
        period={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        startDate={startDate}
        endDate={endDate}
        onCustomDateChange={handleCustomDateChange}
        isLoading={isLoading}
      />

      {/* 3. Product Profitability Table */}
      <ProductProfitabilityTable
        products={productProfitability}
        dealers={dealers}
        isLoading={isLoading}
      />

      {/* 4. Operating Expenses Management */}
      <ExpenseManagementSection
        expenses={expenses}
        categorySummary={expenseSummary?.categories || []}
        pagination={expensePagination}
        isLoading={isExpensesLoading}
        onAddClick={handleOpenAddModal}
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleDeleteExpense}
        onPageChange={(page) => {
          if (businessId) {
            dispatch(
              fetchExpenses({
                business_id: businessId,
                period: selectedPeriod,
                page,
                limit: 20,
              })
            );
          }
        }}
      />

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleAddExpenseSubmit}
        businessId={businessId || ''}
        initialData={editingExpense}
        isLoading={isExpensesLoading}
      />

      {/* Order Economics Modal */}
      {businessId && (
        <OrderEconomicsModal
          isOpen={isOrderEconomicsOpen}
          onClose={() => setIsOrderEconomicsOpen(false)}
          businessId={businessId}
        />
      )}
    </div>
  );
};
export default FinancesPage;
