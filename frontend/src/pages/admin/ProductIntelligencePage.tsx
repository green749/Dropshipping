import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchProductIntelligenceSummary,
  fetchProductIntelligenceList,
  fetchProductDetailIntelligence,
  setTimeframe,
  setSearchQuery,
  setCategoryFilter,
  setDealerFilter,
  setStatusFilter,
  setStockStatusFilter,
  setProfitabilityFilter,
  setClassificationFilter,
  setSort,
  setPage,
} from '../../store/slices/productIntelligenceSlice';
import {
  fetchProductResearchList,
  setSearchQuery as setResearchSearchQuery,
  setStatusFilter as setResearchStatusFilter,
  setCategoryFilter as setResearchCategoryFilter,
  setDealerFilter as setResearchDealerFilter,
  setTagFilter as setResearchTagFilter,
  setPage as setResearchPage,
  createProductResearchAction,
  updateProductResearchAction,
  deleteProductResearchAction,
  convertProductResearchAction,
} from '../../store/slices/productResearchSlice';
import { fetchBusinesses } from '../../store/slices/businessSlice';
import { ProductIntelligenceSummaryCards } from './intelligence/ProductIntelligenceSummaryCards';
import { ProductIntelligenceTable } from './intelligence/ProductIntelligenceTable';
import { ProductDetailDrawer } from './intelligence/ProductDetailDrawer';
import { ProductResearchWorkspace } from './intelligence/ProductResearchWorkspace';
import { useDebounce } from '../../hooks/useDebounce';
import { dealerApi } from '../../api/dealerApi';
import {
  Package,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const ProductIntelligencePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'matrix' | 'research'>('matrix');

  // Redux state
  const intelligenceState = useAppSelector((state) => state.productIntelligence);
  const researchState = useAppSelector((state) => state.productResearch);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);

  // Business-scoped dealers (only dealers assigned to the active business)
  const [businessDealers, setBusinessDealers] = useState<{ id: string; name: string }[]>([]);

  // Drilldown Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Debounced searches
  const debouncedMatrixSearch = useDebounce(intelligenceState.searchQuery, 300);
  const debouncedResearchSearch = useDebounce(researchState.searchQuery, 300);

  // Fetch dealers scoped to the active business whenever it changes
  useEffect(() => {
    if (selectedBusiness?.id) {
      dealerApi.getBusinessDealers(selectedBusiness.id)
        .then((res) => {
          const list = (res.data || []) as any[];
          setBusinessDealers(
            list.map((d) => ({
              id: d.id,
              name: d.company_name || d.contact_name || 'Supplier',
            }))
          );
        })
        .catch(() => setBusinessDealers([]));
    } else {
      setBusinessDealers([]);
    }
  }, [selectedBusiness?.id]);

  // Categories list extracted from items or defaults
  const categories = useMemo(() => {
    const set = new Set<string>([
      'Electronics',
      'Home & Living',
      'Accessories',
      'Fashion',
      'Fitness',
      'Beauty',
      'Travel',
    ]);
    (intelligenceState.items || []).forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [intelligenceState.items]);

  // Load Initial Data
  const loadData = () => {
    dispatch(fetchBusinesses());
    dispatch(
      fetchProductIntelligenceSummary({
        timeframe: intelligenceState.timeframe,
        business_id: selectedBusiness?.id,
      })
    );
    dispatch(
      fetchProductIntelligenceList({
        timeframe: intelligenceState.timeframe,
        business_id: selectedBusiness?.id,
        search: debouncedMatrixSearch,
        category: intelligenceState.categoryFilter !== 'ALL' ? intelligenceState.categoryFilter : undefined,
        dealer_id: intelligenceState.dealerFilter !== 'ALL' ? intelligenceState.dealerFilter : undefined,
        status: intelligenceState.statusFilter !== 'ALL' ? intelligenceState.statusFilter : undefined,
        stock_status: intelligenceState.stockStatusFilter !== 'ALL' ? intelligenceState.stockStatusFilter : undefined,
        profitability: intelligenceState.profitabilityFilter !== 'ALL' ? intelligenceState.profitabilityFilter : undefined,
        classification: intelligenceState.classificationFilter !== 'ALL' ? intelligenceState.classificationFilter : undefined,
        sortBy: intelligenceState.sortBy,
        sortOrder: intelligenceState.sortOrder,
        page: intelligenceState.pagination.page,
        limit: intelligenceState.pagination.limit,
      })
    );
    dispatch(
      fetchProductResearchList({
        business_id: selectedBusiness?.id,
        search: debouncedResearchSearch,
        status: researchState.statusFilter !== 'ALL' ? researchState.statusFilter : undefined,
        category: researchState.categoryFilter !== 'ALL' ? researchState.categoryFilter : undefined,
        dealer_id: researchState.dealerFilter !== 'ALL' ? researchState.dealerFilter : undefined,
        tag: researchState.tagFilter !== 'ALL' ? researchState.tagFilter : undefined,
        page: researchState.pagination.page,
        limit: researchState.pagination.limit,
      })
    );
  };

  useEffect(() => {
    loadData();
  }, [
    dispatch,
    selectedBusiness?.id,
    intelligenceState.timeframe,
    debouncedMatrixSearch,
    intelligenceState.categoryFilter,
    intelligenceState.dealerFilter,
    intelligenceState.statusFilter,
    intelligenceState.stockStatusFilter,
    intelligenceState.profitabilityFilter,
    intelligenceState.classificationFilter,
    intelligenceState.sortBy,
    intelligenceState.sortOrder,
    intelligenceState.pagination.page,
    debouncedResearchSearch,
    researchState.statusFilter,
    researchState.categoryFilter,
    researchState.dealerFilter,
    researchState.tagFilter,
    researchState.pagination.page,
  ]);

  const handleOpenDetail = (productId: string) => {
    setSelectedProductId(productId);
    dispatch(
      fetchProductDetailIntelligence({
        id: productId,
        timeframe: intelligenceState.timeframe,
      })
    );
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#16123F] dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#FFE26A]" />
            Product Intelligence & Research Engine
          </h1>
          <p className="text-xs text-[#16123F]/65 dark:text-slate-400 mt-1">
            Data-driven product discovery, sales velocity, net profit analytics, stock runout intelligence, and multi-supplier benchmark
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-slate-800/80 border border-[#C7DDCC] dark:border-slate-700 rounded-2xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-[#16123F] text-white shadow-xs'
                : 'text-[#16123F]/70 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('research')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'research'
                ? 'bg-[#16123F] text-white shadow-xs'
                : 'text-[#16123F]/70 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Research Workspace</span>
            {researchState.pagination.total > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white">
                {researchState.pagination.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <ProductIntelligenceSummaryCards
            summary={intelligenceState.summary}
            isLoading={intelligenceState.isLoadingSummary}
          />

          {/* Opportunity Matrix Table */}
          <ProductIntelligenceTable
            items={intelligenceState.items}
            categories={categories}
            dealers={businessDealers}
            searchQuery={intelligenceState.searchQuery}
            categoryFilter={intelligenceState.categoryFilter}
            dealerFilter={intelligenceState.dealerFilter}
            statusFilter={intelligenceState.statusFilter}
            stockStatusFilter={intelligenceState.stockStatusFilter}
            profitabilityFilter={intelligenceState.profitabilityFilter}
            classificationFilter={intelligenceState.classificationFilter}
            sortBy={intelligenceState.sortBy}
            sortOrder={intelligenceState.sortOrder}
            timeframe={intelligenceState.timeframe}
            pagination={intelligenceState.pagination}
            isLoading={intelligenceState.isLoadingList}
            onSearchChange={(q) => dispatch(setSearchQuery(q))}
            onCategoryChange={(c) => dispatch(setCategoryFilter(c))}
            onDealerChange={(d) => dispatch(setDealerFilter(d))}
            onStatusChange={(s) => dispatch(setStatusFilter(s))}
            onStockStatusChange={(s) => dispatch(setStockStatusFilter(s))}
            onProfitabilityChange={(p) => dispatch(setProfitabilityFilter(p))}
            onClassificationChange={(c) => dispatch(setClassificationFilter(c))}
            onSortChange={(f) => dispatch(setSort({ sortBy: f }))}
            onTimeframeChange={(t) => dispatch(setTimeframe(t))}
            onPageChange={(p) => dispatch(setPage(p))}
            onOpenDetail={handleOpenDetail}
          />
        </div>
      )}

      {activeTab === 'research' && (
        <ProductResearchWorkspace
          items={researchState.items}
          dealers={businessDealers}
          categories={categories}
          searchQuery={researchState.searchQuery}
          statusFilter={researchState.statusFilter}
          categoryFilter={researchState.categoryFilter}
          dealerFilter={researchState.dealerFilter}
          tagFilter={researchState.tagFilter}
          pagination={researchState.pagination}
          isLoading={researchState.isLoadingList}
          isMutating={researchState.isMutating}
          isConverting={researchState.isConverting}
          onSearchChange={(q) => dispatch(setResearchSearchQuery(q))}
          onStatusChange={(s) => dispatch(setResearchStatusFilter(s))}
          onCategoryChange={(c) => dispatch(setResearchCategoryFilter(c))}
          onDealerChange={(d) => dispatch(setResearchDealerFilter(d))}
          onTagChange={(t) => dispatch(setResearchTagFilter(t))}
          onPageChange={(p) => dispatch(setResearchPage(p))}
          onCreateItem={(payload) =>
            dispatch(
              createProductResearchAction({
                ...payload,
                business_id: selectedBusiness?.id,
              })
            )
          }
          onUpdateItem={(id, payload) =>
            dispatch(
              updateProductResearchAction({
                id,
                payload: {
                  ...payload,
                  business_id: selectedBusiness?.id,
                },
              })
            )
          }
          onDeleteItem={(id) => dispatch(deleteProductResearchAction(id))}
          onConvertItem={(id, conversionData) =>
            dispatch(
              convertProductResearchAction({
                id,
                conversionData: {
                  ...conversionData,
                  business_id: selectedBusiness?.id,
                },
              })
            )
          }
        />
      )}

      {/* Deep Drilldown Drawer */}
      <ProductDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedProductId(null);
        }}
        detail={intelligenceState.selectedDetail}
        isLoading={intelligenceState.isLoadingDetail}
      />
    </div>
  );
};
