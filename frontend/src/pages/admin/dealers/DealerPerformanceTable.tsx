import React from 'react';
import { useAppSelector } from '../../../store';
import type { DealerPerformance } from '../../../types';
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building2,
  Layers,
  Sparkles,
  TrendingUp,
  Settings2,
  Eye,
  CheckSquare,
  Square,
  Mail,
  LogIn,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';

export interface DealerPerformanceTableProps {
  dealers?: DealerPerformance[];
  searchTerm?: string;
  searchQuery?: string;
  statusFilter?: string;
  timeframe?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  selectedCompareIds?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading?: boolean;
  onSearchChange?: (query: string) => void;
  onStatusChange?: (status: string) => void;
  onStatusFilterChange?: (status: any) => void;
  onTimeframeChange?: (timeframe: string) => void;
  onSortChange?: (field: string) => void;
  onPageChange?: (page: number) => void;
  onToggleCompare?: (id: string) => void;
  onViewDetails?: (dealer: DealerPerformance) => void;
  onOpenDetail?: (dealer: DealerPerformance) => void;
  onConfigureSla?: (dealer: DealerPerformance) => void;
  onOpenSlaConfig?: (dealer: DealerPerformance) => void;
  onUpdateStatus?: (dealer: DealerPerformance) => void;
  onOpenStatusModal?: (dealer: DealerPerformance) => void;
  onOpenComparisonModal?: () => void;
  onClearCompare?: () => void;
  onAssignStore?: (dealer: DealerPerformance) => void;
  onLoginAsDealer?: (email: string) => void;
  isSwitching?: string | null;
}

export const DealerPerformanceTable: React.FC<DealerPerformanceTableProps> = ({
  dealers = [],
  searchTerm,
  searchQuery,
  statusFilter = 'ALL',
  timeframe = '30d',
  sortBy = 'revenue',
  sortOrder = 'DESC',
  selectedCompareIds = [],
  pagination = { page: 1, limit: 20, total: 0, totalPages: 1 },
  isLoading = false,
  onSearchChange,
  onStatusChange,
  onStatusFilterChange,
  onTimeframeChange,
  onSortChange,
  onPageChange,
  onToggleCompare,
  onViewDetails,
  onOpenDetail,
  onConfigureSla,
  onOpenSlaConfig,
  onUpdateStatus,
  onOpenStatusModal,
  onOpenComparisonModal,
  onClearCompare,
  onAssignStore,
  onLoginAsDealer,
  isSwitching,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'DROPSHIPPER';
  const currentSearch = searchTerm !== undefined ? searchTerm : searchQuery || '';
  const handleDetail = (d: DealerPerformance) => {
    if (onViewDetails) onViewDetails(d);
    else if (onOpenDetail) onOpenDetail(d);
  };
  const handleSla = (d: DealerPerformance) => {
    if (onConfigureSla) onConfigureSla(d);
    else if (onOpenSlaConfig) onOpenSlaConfig(d);
  };
  const handleStatus = (d: DealerPerformance) => {
    if (onUpdateStatus) onUpdateStatus(d);
    else if (onOpenStatusModal) onOpenStatusModal(d);
  };
  const handleStatusTab = (status: string) => {
    if (onStatusFilterChange) onStatusFilterChange(status);
    else if (onStatusChange) onStatusChange(status);
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Suppliers' },
    { id: 'ACTIVE', label: 'Active Partners' },
    { id: 'INACTIVE', label: 'Inactive' },
    { id: 'SUSPENDED', label: 'Suspended' },
  ];

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const safeDealers = Array.isArray(dealers) ? dealers : [];

  const renderSortHeader = (label: string, field: string) => {
    const isSorted = sortBy === field;
    return (
      <th
        onClick={() => onSortChange?.(field)}
        className="py-3.5 px-3 cursor-pointer select-none hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <ArrowUpDown
            className={`w-3 h-3 transition-colors ${
              isSorted ? 'text-[#16123F]' : 'text-[#16123F]/30'
            }`}
          />
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl border border-[#C7DDCC]/70 rounded-[28px] p-6 shadow-sm relative">
      {/* Header Controls */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#16123F] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#16123F]" />
              Supplier Operational Performance Matrix
            </h2>
            <p className="text-xs text-[#16123F]/65 mt-0.5">
              Measurable fulfillment speed, dispatch delays, SLA compliance, return ratios, and net profitability
            </p>
          </div>

          {onTimeframeChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#16123F]/70">Analysis Window:</span>
              <select
                value={timeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs cursor-pointer"
              >
                <option value="7d">Last 7 Days</option>
                <option value="14d">Last 14 Days</option>
                <option value="30d">Last 30 Days (Standard)</option>
                <option value="60d">Last 60 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          )}
        </div>

        {/* Status Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {statusTabs.map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleStatusTab(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#16123F] text-white shadow-md ring-2 ring-[#16123F]/20'
                      : 'bg-[#F0F6F2]/80 text-[#16123F]/70 hover:bg-[#C7DDCC]/40 hover:text-[#16123F]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#16123F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search supplier, contact, email..."
              value={currentSearch}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white/90 text-[#16123F] placeholder-[#16123F]/40 focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#C7DDCC]/60 bg-white shadow-xs custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAF8] border-b border-[#C7DDCC]/60 text-[11px] font-bold text-[#16123F]/70 uppercase tracking-wider">
              {onToggleCompare && <th className="py-3.5 px-3 w-10 text-center">Compare</th>}
              <th className="py-3.5 px-4">Supplier / Dealer</th>
              {renderSortHeader('Orders', 'totalAssignedOrders')}
              {renderSortHeader('Fulfillment', 'fulfillmentRate')}
              {renderSortHeader('Avg Dispatch', 'avgDispatchHours')}
              {renderSortHeader('RTO / Returns', 'rtoRate')}
              {renderSortHeader('Stock Avail.', 'stockAvailabilityRate')}
              {renderSortHeader('Revenue / Profit', 'revenue')}
              {renderSortHeader('SLA Compliance', 'slaComplianceRate')}
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C7DDCC]/30">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-14 text-center text-[#16123F]/50">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#16123F]/20 border-t-[#16123F] rounded-full animate-spin" />
                    <p className="font-medium">Aggregating supplier performance telemetry & SLAs...</p>
                  </div>
                </td>
              </tr>
            ) : safeDealers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#16123F]/60">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Building2 className="w-10 h-10 text-[#16123F]/30" />
                    <p className="font-semibold text-sm">No suppliers found matching the criteria</p>
                    <p className="text-xs text-[#16123F]/40">
                      Try clearing your search filters or selecting a different status tab.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              safeDealers.map((dealer) => {
                const isSelectedForCompare = selectedCompareIds.includes(dealer.id);
                const displayName = dealer.company_name || dealer.companyName || 'Authorized Supplier';
                const contactDisplay = dealer.contact_name || dealer.contactName || dealer.email || '—';
                const totalAssigned = dealer.total_orders ?? dealer.totalAssignedOrders ?? 0;
                const fulfilled = dealer.fulfilled_orders ?? dealer.fulfilledOrders ?? 0;
                const pending = dealer.pending_fulfillment_orders ?? dealer.pendingFulfillmentOrders ?? 0;
                const fulfillRate = dealer.fulfillment_rate ?? dealer.fulfillmentRate ?? 100;
                const dispatchDays = dealer.avg_dispatch_days ?? dealer.avgDispatchDays ?? 1.2;
                const dispatchHours = dealer.avg_dispatch_hours ?? dealer.avgDispatchHours ?? 28;
                const rtoRate = dealer.rto_rate ?? dealer.rtoRate ?? 0;
                const returnRate = dealer.return_rate ?? dealer.returnRate ?? 0;
                const returnedCount = dealer.returned_orders ?? dealer.returnedOrders ?? 0;
                const stockRate = dealer.stock_availability_rate ?? dealer.stockAvailabilityRate ?? 100;
                const totalStock = dealer.total_stock ?? dealer.totalStock ?? 0;
                const totalProducts = dealer.total_products ?? dealer.totalProducts ?? 0;
                const revenue = dealer.revenue ?? 0;
                const profit = dealer.profit ?? 0;
                const profitMargin = dealer.profit_margin ?? dealer.profitMargin ?? 0;
                const slaRate = dealer.sla_compliance_rate ?? dealer.slaComplianceRate ?? 100;
                const slaBreaches = dealer.sla_breaches ?? dealer.slaBreachedCount ?? 0;

                return (
                  <tr
                    key={dealer.id}
                    className={`hover:bg-[#F8FAF8]/80 transition-colors duration-150 ${
                      isSelectedForCompare ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    {/* Compare Checkbox */}
                    {onToggleCompare && (
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleCompare(dealer.id)}
                          className="text-[#16123F]/60 hover:text-[#16123F] cursor-pointer"
                          title="Select for Side-by-Side Comparison"
                        >
                          {isSelectedForCompare ? (
                            <CheckSquare className="w-4 h-4 text-[#16123F]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#16123F]/30" />
                          )}
                        </button>
                      </td>
                    )}

                    {/* Supplier Name & Contact Info */}
                    <td className="py-3 px-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDetail(dealer)}
                            className="font-bold text-[#16123F] hover:text-[#75C9B7] transition-colors text-left block truncate max-w-[180px] cursor-pointer"
                          >
                            {displayName}
                          </button>
                          {(dealer as any).businesses && (dealer as any).businesses.length > 0 ? (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#75C9B7]/20 text-[#16123F] border border-[#75C9B7]/40 shrink-0"
                              title={`Assigned to: ${(dealer as any).businesses.map((b: any) => b.name).join(', ')}`}
                            >
                              {(dealer as any).businesses.length} {(dealer as any).businesses.length === 1 ? 'Store' : 'Stores'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                              Unassigned
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#16123F]/60 flex items-center gap-1.5 mt-0.5">
                          <span>{contactDisplay}</span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              dealer.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : dealer.status === 'SUSPENDED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {dealer.status}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Orders (Assigned / Fulfilled) */}
                    <td className="py-3 px-3">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-sm text-[#16123F]">
                          {fulfilled}
                        </span>
                        <span className="text-[11px] text-[#16123F]/50">
                          / {totalAssigned} assigned
                        </span>
                      </div>
                      {pending > 0 && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          {pending} in progress
                        </span>
                      )}
                    </td>

                    {/* Fulfillment Rate */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-sm ${
                            fulfillRate >= 95
                              ? 'text-emerald-700'
                              : fulfillRate >= 80
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {Number(fulfillRate).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div
                          style={{ width: `${Math.min(100, Number(fulfillRate))}%` }}
                          className={`h-full rounded-full ${
                            fulfillRate >= 90
                              ? 'bg-emerald-500'
                              : fulfillRate >= 75
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Avg Dispatch Time */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#16123F]">
                        {Number(dispatchDays).toFixed(1)} Days
                      </div>
                      <div className="text-[10px] text-[#16123F]/50 mt-0.5">
                        {Number(dispatchHours).toFixed(1)}h (Target: {dealer.dispatch_sla_hours || 48}h)
                      </div>
                    </td>

                    {/* RTO / Returns */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-[11px] text-rose-700 font-bold">
                          {Number(rtoRate).toFixed(1)}% RTO
                        </span>
                        <span className="text-[#16123F]/30">•</span>
                        <span className="text-[11px] text-cyan-700 font-bold">
                          {Number(returnRate).toFixed(1)}% Ret
                        </span>
                      </div>
                      <div className="text-[10px] text-[#16123F]/50 mt-0.5">
                        {returnedCount} returns logged
                      </div>
                    </td>

                    {/* Stock Availability */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#16123F]">
                        {Number(stockRate).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-[#16123F]/50 mt-0.5">
                        {totalStock} units across {totalProducts} prods
                      </div>
                    </td>

                    {/* Revenue / Profit */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-emerald-800">
                        {formatCurrency(revenue)}
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                        +{formatCurrency(profit)}{' '}
                        <span className="text-[10px] text-indigo-500 font-normal">
                          ({Number(profitMargin).toFixed(1)}%)
                        </span>
                      </div>
                    </td>

                    {/* SLA Compliance */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-xs ${
                            slaRate >= 95
                              ? 'text-purple-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {Number(slaRate).toFixed(1)}%
                        </span>
                      </div>
                      {slaBreaches > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                          {slaBreaches} Breaches
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 mt-0.5 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> On-Target
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Impersonation Login (Admin Only) */}
                        {isAdmin && dealer.email && onLoginAsDealer && (
                          <button
                            onClick={() => onLoginAsDealer(dealer.email)}
                            disabled={isSwitching === dealer.email}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-[#16123F] bg-[#75C9B7]/20 hover:bg-[#75C9B7]/35 border border-[#75C9B7]/40 transition-all shadow-2xs disabled:opacity-50"
                            title={`Log in as dealer (${dealer.email})`}
                          >
                            {isSwitching === dealer.email ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <LogIn className="w-3.5 h-3.5 text-[#16123F]" />
                            )}
                            <span>Login</span>
                          </button>
                        )}

                        {onAssignStore && (
                          <button
                            onClick={() => onAssignStore(dealer)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Authorize Storefront"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDetail(dealer)}
                          title="View Comprehensive Supplier Analytics"
                          className="px-2.5 py-1.5 rounded-xl border border-[#C7DDCC] bg-[#F8FAF8] hover:bg-[#16123F] hover:text-white text-[#16123F] font-semibold text-xs transition-all duration-200 cursor-pointer"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => handleSla(dealer)}
                          title="Configure Dispatch SLA & Lead Time"
                          className="p-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleStatus(dealer)}
                          title="Manage Partner Status (Active/Suspend)"
                          className="p-1.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && safeDealers.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#16123F]/70 px-2">
          <div>
            Showing{' '}
            <span className="font-bold text-[#16123F]">
              {((pagination.page || 1) - 1) * (pagination.limit || 20) + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#16123F]">
              {Math.min((pagination.page || 1) * (pagination.limit || 20), pagination.total || safeDealers.length)}
            </span>{' '}
            of <span className="font-bold text-[#16123F]">{pagination.total || safeDealers.length}</span> suppliers
          </div>

          {onPageChange && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange((pagination.page || 1) - 1)}
                disabled={(pagination.page || 1) <= 1}
                className="p-2 rounded-xl border border-[#C7DDCC] bg-white hover:bg-[#F0F6F2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
              >
                <ChevronLeft className="w-4 h-4 text-[#16123F]" />
              </button>
              <span className="px-3 py-1 font-semibold text-[#16123F]">
                Page {pagination.page || 1} of {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => onPageChange((pagination.page || 1) + 1)}
                disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
                className="p-2 rounded-xl border border-[#C7DDCC] bg-white hover:bg-[#F0F6F2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
              >
                <ChevronRight className="w-4 h-4 text-[#16123F]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Compare Bar */}
      {selectedCompareIds && selectedCompareIds.length >= 2 && onOpenComparisonModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#16123F] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-slideUp border border-white/20">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFE26A]" />
            {selectedCompareIds.length} Suppliers Selected for Comparison
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenComparisonModal}
              className="px-4 py-1.5 rounded-full bg-[#FFE26A] text-[#16123F] font-bold text-xs hover:bg-[#FFE26A]/90 transition-all cursor-pointer shadow-xs"
            >
              Compare Side-by-Side
            </button>
            {onClearCompare && (
              <button
                onClick={onClearCompare}
                className="text-xs text-white/70 hover:text-white underline ml-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
