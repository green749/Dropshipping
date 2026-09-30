import React from 'react';
import type { IntelligentProduct, InventoryStatus, Dealer } from '../../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface InventoryTableProps {
  products: IntelligentProduct[];
  dealers: Dealer[];
  categories: string[];
  activeStatus: InventoryStatus;
  searchQuery: string;
  selectedCategory: string;
  selectedDealerId: string;
  velocityPeriod: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  onStatusChange: (status: InventoryStatus) => void;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onDealerChange: (dealerId: string) => void;
  onVelocityPeriodChange: (days: number) => void;
  onPageChange: (page: number) => void;
  onOpenDetail: (product: IntelligentProduct) => void;
  onOpenStockIn: (product: IntelligentProduct) => void;
  onOpenAdjustment: (product: IntelligentProduct) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  dealers,
  categories,
  activeStatus,
  searchQuery,
  selectedCategory,
  selectedDealerId,
  velocityPeriod,
  pagination,
  isLoading,
  onStatusChange,
  onSearchChange,
  onCategoryChange,
  onDealerChange,
  onVelocityPeriodChange,
  onPageChange,
  onOpenDetail,
  onOpenStockIn,
  onOpenAdjustment,
}) => {
  const statusTabs: Array<{ id: InventoryStatus; label: string }> = [
    { id: 'ALL', label: 'All Products' },
    { id: 'LOW_STOCK', label: 'Low Stock' },
    { id: 'OUT_OF_STOCK', label: 'Out of Stock' },
    { id: 'REORDER_RECOMMENDED', label: 'Reorder Needed' },
    { id: 'FAST_MOVING', label: 'Fast Moving' },
    { id: 'SLOW_MOVING', label: 'Slow Moving' },
    { id: 'OVERSTOCKED', label: 'Overstocked' },
    { id: 'DEAD_STOCK', label: 'Dead Stock' },
  ];

  const getStatusBadge = (status: InventoryStatus, reorderRecommended: boolean) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Out of Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Low Stock
          </span>
        );
      case 'OVERSTOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
            Overstocked
          </span>
        );
      case 'DEAD_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Dead Stock
          </span>
        );
      case 'FAST_MOVING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
            Fast Moving
          </span>
        );
      case 'SLOW_MOVING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Slow Moving
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            In Stock
          </span>
        );
    }
  };

  const getDaysRemainingBadge = (days: number | null) => {
    if (days === null) {
      return (
        <span className="text-xs font-medium text-[#16123F]/40 italic">
          No Sales Data
        </span>
      );
    }
    if (days <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          {days} days left
        </span>
      );
    }
    if (days <= 14) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          {days} days left
        </span>
      );
    }
    if (days >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-yellow-100/70 text-yellow-900 border border-yellow-200">
          {days} days (High)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-100/70 text-emerald-800 border border-emerald-200">
        {days} days
      </span>
    );
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl border border-[#C7DDCC]/70 rounded-[28px] p-6 shadow-sm">
      {/* Header & Status Tabs */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#16123F] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#16123F]" />
              Product Inventory & Forecasting Engine
            </h2>
            <p className="text-xs text-[#16123F]/65 mt-0.5">
              Real-time available stock, sales velocity, reorder calculation, and supplier lead times
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#16123F]/70">
              Velocity Window:
            </span>
            <select
              value={velocityPeriod}
              onChange={(e) => onVelocityPeriodChange(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs cursor-pointer"
            >
              <option value={7}>7 Days (Recent Trend)</option>
              <option value={14}>14 Days (Standard Baseline)</option>
              <option value={30}>30 Days (Monthly Velocity)</option>
              <option value={60}>60 Days (Seasonal Run)</option>
              <option value={90}>90 Days (Quarterly Average)</option>
            </select>
          </div>
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => {
            const isSelected = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
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

        {/* Search and Dropdown Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#16123F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white/90 text-[#16123F] placeholder-[#16123F]/40 focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white/90 text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs cursor-pointer"
            >
              <option value="">All Product Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Dealer Filter */}
          <div className="relative">
            <select
              value={selectedDealerId}
              onChange={(e) => onDealerChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white/90 text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs cursor-pointer"
            >
              <option value="">All Suppliers & Dealers</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#C7DDCC]/60 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAF8] border-b border-[#C7DDCC]/60 text-[11px] font-bold text-[#16123F]/70 uppercase tracking-wider">
              <th className="py-3.5 px-4">Product & SKU</th>
              <th className="py-3.5 px-3">Dealer & Lead Time</th>
              <th className="py-3.5 px-3">Stock Units (Available / Total)</th>
              <th className="py-3.5 px-3">Sales Velocity</th>
              <th className="py-3.5 px-3">Days Remaining</th>
              <th className="py-3.5 px-3">Reorder Point & Qty</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C7DDCC]/40 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#16123F]/50">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#16123F]/20 border-t-[#16123F] rounded-full animate-spin" />
                    <p className="font-medium">Calculating inventory intelligence & velocities...</p>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#16123F]/60">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-10 h-10 text-[#16123F]/30" />
                    <p className="font-semibold text-sm">No inventory items matched your criteria</p>
                    <p className="text-xs text-[#16123F]/40">
                      Try clearing your search query or selecting a different status filter tab.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((item) => {
                const firstImg =
                  item.images && item.images.length > 0
                    ? item.images[0]
                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#F8FAF8]/80 transition-colors duration-150"
                  >
                    {/* Product & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={firstImg}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#C7DDCC]/80 shadow-xs flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => onOpenDetail(item)}
                            className="font-bold text-[#16123F] hover:text-[#75C9B7] transition-colors text-left truncate max-w-[220px] block cursor-pointer"
                          >
                            {item.name}
                          </button>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-[#16123F]/60 bg-[#16123F]/5 px-1.5 py-0.5 rounded">
                              {item.sku}
                            </span>
                            <span className="text-[11px] text-[#16123F]/50">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dealer & Lead Time */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#16123F]">
                        {item.dealerName || 'Direct Supplier'}
                      </div>
                      <div className="text-[11px] text-[#16123F]/60 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {item.leadTimeDays}d lead time
                      </div>
                    </td>

                    {/* Stock Units (Available / Reserved) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`font-bold text-sm ${
                            item.availableStock <= 0
                              ? 'text-rose-600'
                              : item.availableStock <= item.lowStockThreshold
                              ? 'text-amber-600'
                              : 'text-[#16123F]'
                          }`}
                        >
                          {item.availableStock.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[#16123F]/50">
                          / {item.stockQuantity.toLocaleString()} total
                        </span>
                      </div>
                      {item.reservedQuantity > 0 && (
                        <div className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                          {item.reservedQuantity} reserved
                        </div>
                      )}
                    </td>

                    {/* Sales Velocity */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#16123F]">
                          {item.dailyVelocity}
                        </span>
                        <span className="text-[11px] text-[#16123F]/55">
                          units/day
                        </span>
                        {item.velocitySurge && (
                          <span
                            title="Sales surge: 7d velocity increased by 2x+"
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-700 bg-cyan-100/80 px-1.5 py-0.5 rounded"
                          >
                            <Sparkles className="w-2.5 h-2.5" /> Surge
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#16123F]/50 mt-0.5">
                        {item.unitsSold} sold in {velocityPeriod}d
                      </div>
                    </td>

                    {/* Days of Stock Remaining */}
                    <td className="py-3.5 px-3">
                      {getDaysRemainingBadge(item.daysRemaining)}
                    </td>

                    {/* Reorder Point & Recommended Quantity */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 font-medium text-[#16123F]">
                        <span className="text-[11px] text-[#16123F]/60">Trigger:</span>
                        <span className="font-bold text-xs">{item.reorderPoint}</span>
                      </div>
                      {item.reorderRecommended ? (
                        <div className="text-[11px] font-bold text-purple-700 mt-0.5 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3 text-purple-600" />
                          Order +{item.recommendedReorder} units
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#16123F]/40 mt-0.5">
                          Healthy buffer
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(item.status, item.reorderRecommended)}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Drilldown Details Button */}
                        <button
                          onClick={() => onOpenDetail(item)}
                          title="View Comprehensive Inventory Analytics"
                          className="px-2.5 py-1.5 rounded-xl border border-[#C7DDCC] bg-[#F8FAF8] hover:bg-[#16123F] hover:text-white text-[#16123F] font-semibold text-xs transition-all duration-200 cursor-pointer"
                        >
                          Details
                        </button>

                        {/* Stock-In Button */}
                        <button
                          onClick={() => onOpenStockIn(item)}
                          title="Stock-In Procurement Intake"
                          className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* Stock Adjustment Button */}
                        <button
                          onClick={() => onOpenAdjustment(item)}
                          title="Adjust Inventory (Damaged / Correction)"
                          className="p-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
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
      {!isLoading && products.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#16123F]/70 px-2">
          <div>
            Showing{' '}
            <span className="font-bold text-[#16123F]">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#16123F]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-[#16123F]">{pagination.total}</span> products
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-[#C7DDCC] bg-white hover:bg-[#F0F6F2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
            >
              <ChevronLeft className="w-4 h-4 text-[#16123F]" />
            </button>
            <span className="px-3 py-1 font-semibold text-[#16123F]">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl border border-[#C7DDCC] bg-white hover:bg-[#F0F6F2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
            >
              <ChevronRight className="w-4 h-4 text-[#16123F]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
