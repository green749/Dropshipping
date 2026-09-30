import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { useNavigate } from 'react-router-dom';
import {
  fetchDealers,
  updateDealer,
  assignDealerToBusiness,
} from '../../store/slices/dealerSlice';
import {
  fetchDealerPerformanceSummary,
  fetchDealerPerformanceList,
  fetchDealerPerformanceDetail,
  toggleCompareId,
  clearCompareIds,
  setSearchQuery,
  setStatusFilter as setSliceStatusFilter,
  setSort,
  setPage,
} from '../../store/slices/dealerPerformanceSlice';
import { fetchBusinesses } from '../../store/slices/businessSlice';
import { openModal, addToast } from '../../store/slices/uiSlice';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import { Select } from '../../components/common/Select';
import { useDebounce } from '../../hooks/useDebounce';
import type { Dealer, DealerPerformance } from '../../types';
import {
  UserPlus,
  Scale,
  Calendar,
  Building2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { DealerPerformanceSummaryCards } from './dealers/DealerPerformanceSummaryCards';
import { DealerPerformanceTable } from './dealers/DealerPerformanceTable';
import { DealerDetailDrawer } from './dealers/DealerDetailDrawer';
import { DealerComparisonModal } from './dealers/DealerComparisonModal';
import { DealerSlaConfigModal } from './dealers/DealerSlaConfigModal';
import { DealerStatusModal } from './dealers/DealerStatusModal';
import { useImpersonate } from '../../hooks/useImpersonate';

export const DealersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'DROPSHIPPER';
  const { handleLoginAsUser, isSwitching } = useImpersonate();
  const { dealers: rawDealers, isLoading: isDealersLoading } = useAppSelector((state) => state.dealer);
  const {
    summary,
    dealers: performanceList,
    selectedCompareIds,
    pagination,
    sortBy,
    sortOrder,
    isLoading: isPerformanceLoading,
  } = useAppSelector((state) => state.dealerPerformance);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ALL');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();

  // SLA Config Modal
  const [slaModalDealer, setSlaModalDealer] = useState<DealerPerformance | null>(null);

  // Status Modal
  const [statusModalDealer, setStatusModalDealer] = useState<DealerPerformance | null>(null);

  // Comparison Modal
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Assignment Modal
  const [assigningDealer, setAssigningDealer] = useState<DealerPerformance | Dealer | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);

  const currentBusinessId = selectedBusiness?.id && selectedBusiness.id !== 'all' ? selectedBusiness.id : undefined;

  // Load Performance & Dealer data
  const loadData = () => {
    setIsRefreshing(true);
    dispatch(fetchBusinesses());
    dispatch(fetchDealers(currentBusinessId ? { business_id: currentBusinessId } : undefined));
    dispatch(fetchDealerPerformanceSummary({ dateRange, business_id: currentBusinessId }));
    dispatch(
      fetchDealerPerformanceList({
        dateRange,
        business_id: currentBusinessId,
        search: debouncedSearch,
        status: statusFilter,
        sortBy,
        sortOrder,
      })
    );
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    setSlaModalDealer(null);
    setStatusModalDealer(null);
    setIsComparisonOpen(false);
    setAssigningDealer(null);
    loadData();
  }, [dispatch, selectedBusiness?.id, dateRange, debouncedSearch, statusFilter, sortBy, sortOrder]);


  // Navigate to dealer detail page
  const handleViewDetails = (dealer: DealerPerformance) => {
    navigate(`/admin/dealers/${dealer.id}`);
  };

  // Open Assign Modal
  const handleOpenAssign = (dealer: DealerPerformance) => {
    setAssigningDealer(dealer);
    setSelectedBusinessId(selectedBusiness?.id || businesses[0]?.id || '');
    setAssignError(null);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDealer || !selectedBusinessId) {
      setAssignError('Please select a business storefront.');
      return;
    }

    setAssignError(null);
    const res = await dispatch(
      assignDealerToBusiness({
        businessId: selectedBusinessId,
        dealerId: assigningDealer.id,
      })
    );

    if (assignDealerToBusiness.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Dealer authorized for store successfully' }));
      setAssigningDealer(null);
      loadData();
    } else {
      const errorMsg = (res.payload as any)?.message || 'Failed to assign dealer';
      setAssignError(errorMsg);
    }
  };

  const safePerformanceList = Array.isArray(performanceList) ? performanceList : [];

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#75C9B7]/20 text-[#16123F] border border-[#75C9B7]/40">
              Operations & Fulfillment Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16123F] tracking-tight">
            Supplier & Dealer Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent supplier KPIs, dispatch SLAs, fulfillment accuracy, RTO rates, and gross profitability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          {/* Refresh Button */}
          <button
            onClick={loadData}
            title="Refresh Performance Data"
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition-all active:scale-95 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Compare Suppliers Modal Button */}
          <button
            onClick={() => setIsComparisonOpen(true)}
            disabled={safePerformanceList.length < 2}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-[#16123F]" />
            <span>Compare Suppliers</span>
          </button>

          {/* Invite New Dealer */}
          <button
            onClick={() => dispatch(openModal('invite'))}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Supplier</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector Pill Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Analytics Timeframe:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { label: 'Today', value: 'today' },
            { label: 'Last 7 Days', value: '7d' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Last 90 Days', value: '90d' },
            { label: 'All Time', value: 'all' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDateRange(tab.value)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                dateRange === tab.value
                  ? 'bg-white text-[#16123F] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level Summary KPI Cards */}
      <DealerPerformanceSummaryCards
        summary={summary}
        isLoading={isPerformanceLoading}
      />

      {/* Performance Analytics & Operations Table */}
      <DealerPerformanceTable
        dealers={safePerformanceList}
        isLoading={isPerformanceLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field) => dispatch(setSort({ sortBy: field }))}
        selectedCompareIds={selectedCompareIds}
        onToggleCompare={(id) => dispatch(toggleCompareId(id))}
        onOpenComparisonModal={() => setIsComparisonOpen(true)}
        onClearCompare={() => dispatch(clearCompareIds())}
        pagination={pagination}
        onPageChange={(p) => dispatch(setPage(p))}
        onViewDetails={handleViewDetails}
        onConfigureSla={(dealer) => setSlaModalDealer(dealer)}
        onUpdateStatus={(dealer) => setStatusModalDealer(dealer)}
        onAssignStore={handleOpenAssign}
        onLoginAsDealer={isAdmin ? (email) => handleLoginAsUser(email, 'DEALER') : undefined}
        isSwitching={isSwitching}
      />


      {/* Multi-Dealer Comparison Modal */}
      <DealerComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        dealers={safePerformanceList}
      />

      {/* SLA Configuration Modal */}
      <DealerSlaConfigModal
        isOpen={Boolean(slaModalDealer)}
        onClose={() => setSlaModalDealer(null)}
        dealer={slaModalDealer}
        onSuccess={loadData}
      />

      {/* Operational Status Modal */}
      <DealerStatusModal
        isOpen={Boolean(statusModalDealer)}
        onClose={() => setStatusModalDealer(null)}
        dealer={statusModalDealer}
        onSuccess={loadData}
      />

      {/* Storefront Assignment Modal */}
      <Modal
        isOpen={Boolean(assigningDealer)}
        onClose={() => {
          setAssigningDealer(null);
          setAssignError(null);
        }}
        title="Authorize Dealer for Business Storefront"
      >
        <form onSubmit={handleAssign} noValidate className="space-y-4">
          <FormAlert message={assignError} onClose={() => setAssignError(null)} />

          <div className="p-3.5 rounded-2xl bg-[#F8F9FB] border border-slate-200/60 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {assigningDealer?.company_name || (assigningDealer as any)?.contact_name}
              </p>
              <p className="text-[11px] text-slate-400">
                Dealer ID: {assigningDealer?.id.slice(0, 8)}...
              </p>
            </div>
          </div>

          <FormField
            label="Select Storefront Organization"
            htmlFor="assign-business-select"
            required
          >
            <Select
              id="assign-business-select"
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              placeholder="Select Business Storefront"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.slug})
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setAssigningDealer(null);
                setAssignError(null);
              }}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs"
            >
              Confirm Store Authorization
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default DealersPage;
