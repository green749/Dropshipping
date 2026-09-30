import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchInventorySummary,
  fetchInventoryProducts,
  fetchProductInventoryDetail,
  fetchInventoryTransactions,
  fetchInventoryMovementTrend,
  submitStockAdjustment,
  submitStockIn,
  setVelocityPeriod,
  setFilterStatus,
  setSearchQuery,
  setSelectedCategory,
  setSelectedDealerId,
  setPage,
  clearSelectedProductDetail,
} from '../../store/slices/inventorySlice';
import { fetchDealers } from '../../store/slices/dealerSlice';
import { addToast } from '../../store/slices/uiSlice';
import type { IntelligentProduct, InventoryStatus, StockAdjustmentPayload, StockInPayload } from '../../types';

import { InventorySummaryCards } from './inventory/InventorySummaryCards';
import { InventoryTable } from './inventory/InventoryTable';
import { InventoryDetailModal } from './inventory/InventoryDetailModal';
import { StockInModal } from './inventory/StockInModal';
import { StockAdjustmentModal } from './inventory/StockAdjustmentModal';
import { StockMovementLedger } from './inventory/StockMovementLedger';

import {
  Package,
  RefreshCw,
  PlusCircle,
  SlidersHorizontal,
  Building2,
  History,
  Layers,
  TrendingUp,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedBusiness } = useAppSelector((state) => state.business);
  const { dealers } = useAppSelector((state) => state.dealer);
  const {
    summary,
    products,
    pagination,
    selectedProductDetail,
    transactions,
    transactionsPagination,
    movementTrend,
    velocityPeriod,
    filterStatus,
    searchQuery,
    selectedCategory,
    selectedDealerId,
    isLoading,
    isDetailLoading,
    isTransactionsLoading,
    isMutating,
  } = useAppSelector((state) => state.inventory);

  const [activeView, setActiveView] = useState<'INVENTORY' | 'LEDGER'>('INVENTORY');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [stockInModalOpen, setStockInModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<IntelligentProduct | null>(null);
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);

  const businessId = selectedBusiness?.id;

  // Derive unique categories from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const loadData = useCallback(() => {
    dispatch(fetchDealers(businessId ? { business_id: businessId } : undefined));
    dispatch(
      fetchInventorySummary({
        business_id: businessId,
        velocityPeriod,
        dealer_id: selectedDealerId || undefined,
        category: selectedCategory || undefined,
      })
    );
    dispatch(
      fetchInventoryProducts({
        business_id: businessId,
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        dealer_id: selectedDealerId || undefined,
        status: filterStatus,
        velocityPeriod,
      })
    );
    dispatch(
      fetchInventoryTransactions({
        business_id: businessId,
        page: ledgerPage,
        limit: 20,
        transaction_type: ledgerTypeFilter || undefined,
      })
    );
    dispatch(fetchInventoryMovementTrend({ business_id: businessId, days: 14 }));
  }, [
    dispatch,
    businessId,
    velocityPeriod,
    selectedDealerId,
    selectedCategory,
    pagination.page,
    pagination.limit,
    searchQuery,
    filterStatus,
    ledgerPage,
    ledgerTypeFilter,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    loadData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleOpenDetail = (prod: IntelligentProduct) => {
    setActiveModalProduct(prod);
    dispatch(fetchProductInventoryDetail({ id: prod.id, velocityPeriod }));
    setDetailModalOpen(true);
  };

  const handleOpenStockIn = (prod?: IntelligentProduct) => {
    setActiveModalProduct(prod || null);
    setStockInModalOpen(true);
  };

  const handleOpenAdjustment = (prod?: IntelligentProduct) => {
    setActiveModalProduct(prod || null);
    setAdjustModalOpen(true);
  };

  const handleSubmitStockIn = async (payload: StockInPayload) => {
    await dispatch(submitStockIn(payload) as any);
    dispatch(addToast({ type: 'success', message: `Stock-In receipt of +${payload.quantity} units recorded successfully!` }));
    loadData();
  };

  const handleSubmitAdjustment = async (payload: StockAdjustmentPayload) => {
    await dispatch(submitStockAdjustment(payload) as any);
    dispatch(addToast({ type: 'success', message: 'Manual stock adjustment applied and recorded in audit ledger' }));
    loadData();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16123F] text-white">
              INVENTORY MANAGEMENT
            </span>
            {selectedBusiness && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#16123F]/70 bg-[#F0F6F2] px-2 py-0.5 rounded-md border border-[#C7DDCC]">
                <Building2 className="w-3.5 h-3.5 text-[#16123F]" />
                {selectedBusiness.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#16123F] tracking-tight mt-1">
            Inventory Intelligence & Forecasting
          </h1>
          <p className="text-xs text-[#16123F]/65 mt-0.5">
            Real-time stock availability, multi-window sales velocities, and automated reorder recommendations
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Tab Switcher */}
          <div className="bg-[#F0F6F2] p-1 rounded-2xl border border-[#C7DDCC] flex items-center shadow-2xs">
            <button
              onClick={() => setActiveView('INVENTORY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'INVENTORY'
                  ? 'bg-white text-[#16123F] shadow-xs'
                  : 'text-[#16123F]/60 hover:text-[#16123F]'
              }`}
            >
              Catalog & Forecast
            </button>
            <button
              onClick={() => setActiveView('LEDGER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'LEDGER'
                  ? 'bg-white text-[#16123F] shadow-xs'
                  : 'text-[#16123F]/60 hover:text-[#16123F]'
              }`}
            >
              Movement Ledger
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-2xl border border-[#C7DDCC] bg-white hover:bg-[#F0F6F2] text-[#16123F] transition-all shadow-xs cursor-pointer"
            title="Refresh Inventory Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenStockIn()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Stock-In
          </button>

          <button
            onClick={() => handleOpenAdjustment()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#16123F] hover:bg-[#16123F]/90 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Adjust Stock
          </button>
        </div>
      </div>

      {/* Top Summary KPI Cards */}
      <InventorySummaryCards
        summary={summary}
        activeFilter={filterStatus}
        onSelectFilter={(status) => dispatch(setFilterStatus(status))}
        isLoading={isLoading}
      />

      {/* Main Content Area: Catalog & Forecasting or Movement Ledger */}
      {activeView === 'INVENTORY' ? (
        <InventoryTable
          products={products}
          dealers={dealers}
          categories={categories}
          activeStatus={filterStatus}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          selectedDealerId={selectedDealerId}
          velocityPeriod={velocityPeriod}
          pagination={pagination}
          isLoading={isLoading}
          onStatusChange={(status) => dispatch(setFilterStatus(status))}
          onSearchChange={(search) => dispatch(setSearchQuery(search))}
          onCategoryChange={(cat) => dispatch(setSelectedCategory(cat))}
          onDealerChange={(dealerId) => dispatch(setSelectedDealerId(dealerId))}
          onVelocityPeriodChange={(days) => dispatch(setVelocityPeriod(days))}
          onPageChange={(p) => dispatch(setPage(p))}
          onOpenDetail={handleOpenDetail}
          onOpenStockIn={handleOpenStockIn}
          onOpenAdjustment={handleOpenAdjustment}
        />
      ) : (
        <StockMovementLedger
          transactions={transactions}
          pagination={transactionsPagination}
          isLoading={isTransactionsLoading}
          selectedType={ledgerTypeFilter}
          onTypeChange={setLedgerTypeFilter}
          onPageChange={setLedgerPage}
        />
      )}

      {/* Product Detail Intelligence Modal / Drawer */}
      <InventoryDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          dispatch(clearSelectedProductDetail());
        }}
        detail={selectedProductDetail}
        isLoading={isDetailLoading}
        onOpenStockIn={() => {
          setDetailModalOpen(false);
          handleOpenStockIn(activeModalProduct || undefined);
        }}
        onOpenAdjustment={() => {
          setDetailModalOpen(false);
          handleOpenAdjustment(activeModalProduct || undefined);
        }}
      />

      {/* Stock-In Procurement Modal */}
      <StockInModal
        isOpen={stockInModalOpen}
        onClose={() => setStockInModalOpen(false)}
        product={activeModalProduct}
        allProducts={products}
        dealers={dealers}
        onSubmit={handleSubmitStockIn}
        isSubmitting={isMutating}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        product={activeModalProduct}
        allProducts={products}
        onSubmit={handleSubmitAdjustment}
        isSubmitting={isMutating}
      />
    </div>
  );
};
