import React from 'react';
import type { ProductOpportunityItem, ProductClassification } from '../../../types';
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Boxes,
  Eye,
  Package,
  Building2,
} from 'lucide-react';

interface ProductIntelligenceTableProps {
  items: ProductOpportunityItem[];
  categories?: string[];
  dealers?: { id: string; name: string }[];
  searchQuery: string;
  categoryFilter: string;
  dealerFilter: string;
  statusFilter: string;
  stockStatusFilter: string;
  profitabilityFilter: string;
  classificationFilter: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  timeframe: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading?: boolean;
  onSearchChange: (q: string) => void;
  onCategoryChange: (c: string) => void;
  onDealerChange: (d: string) => void;
  onStatusChange: (s: string) => void;
  onStockStatusChange: (s: string) => void;
  onProfitabilityChange: (p: string) => void;
  onClassificationChange: (c: string) => void;
  onSortChange: (field: string) => void;
  onTimeframeChange: (t: string) => void;
  onPageChange: (p: number) => void;
  onOpenDetail: (productId: string) => void;
  onOpenSupplierComparison?: (productId: string) => void;
}

export const ProductIntelligenceTable: React.FC<ProductIntelligenceTableProps> = ({
  items = [],
  categories = [],
  dealers = [],
  searchQuery,
  categoryFilter,
  dealerFilter,
  statusFilter,
  stockStatusFilter,
  profitabilityFilter,
  classificationFilter,
  sortBy,
  sortOrder,
  timeframe,
  pagination,
  isLoading = false,
  onSearchChange,
  onCategoryChange,
  onDealerChange,
  onStatusChange,
  onStockStatusChange,
  onProfitabilityChange,
  onClassificationChange,
  onSortChange,
  onTimeframeChange,
  onPageChange,
  onOpenDetail,
  onOpenSupplierComparison,
}) => {
  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getClassificationBadge = (tag: ProductClassification) => {
    switch (tag) {
      case 'HIGH_DEMAND':
        return { label: 'High Demand', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'FAST_MOVING':
        return { label: 'Fast Moving', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'SLOW_MOVING':
        return { label: 'Slow Moving', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'LOW_DEMAND':
        return { label: 'Low Demand', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'NO_SALES':
        return { label: 'No Sales', color: 'bg-slate-100 text-slate-500 border-slate-200' };
      case 'OVERSTOCKED':
        return { label: 'Overstocked', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'LOW_STOCK':
        return { label: 'Low Stock', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'OUT_OF_STOCK':
        return { label: 'Out of Stock', color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' };
      case 'PROFITABLE':
        return { label: 'Profitable', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'LOSS_MAKING':
        return { label: 'Loss Making', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HIGH_RETURN':
        return { label: 'High Return', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'HIGH_RTO':
        return { label: 'High RTO', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: tag, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const renderSortHeader = (label: string, field: string) => {
    const isSorted = sortBy === field;
    return (
      <th
        onClick={() => onSortChange(field)}
        className="py-3.5 px-3 cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold text-[11px] uppercase tracking-wider text-[#16123F]/80 dark:text-slate-300"
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <ArrowUpDown
            className={`w-3 h-3 transition-colors ${
              isSorted ? 'text-[#16123F] dark:text-white font-bold' : 'text-[#16123F]/30 dark:text-slate-600'
            }`}
          />
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-[#C7DDCC]/80 dark:border-slate-800 rounded-[28px] p-6 shadow-sm relative">
      {/* Header Controls */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#16123F] dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-[#16123F] dark:text-[#FFE26A]" />
              Product Performance & Opportunity Matrix
            </h2>
            <p className="text-xs text-[#16123F]/65 dark:text-slate-400 mt-0.5">
              Multi-dimensional sales velocity, net margin, stock runout forecasting, return ratios, and multi-supplier benchmark
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#16123F]/70 dark:text-slate-400">Analysis Period:</span>
            <select
              value={timeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#C7DDCC] bg-white dark:bg-slate-800 text-[#16123F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="14d">Last 14 Days</option>
              <option value="30d">Last 30 Days (Standard)</option>
              <option value="60d">Last 60 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16123F]/40 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search product name, SKU, category..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800/80 text-[#16123F] dark:text-white placeholder-[#16123F]/40 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#16123F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Dealer Filter */}
          <div>
            <select
              value={dealerFilter}
              onChange={(e) => onDealerChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#16123F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Suppliers</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={stockStatusFilter}
              onChange={(e) => onStockStatusChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#16123F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Stock States</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="OVERSTOCKED">Overstocked</option>
            </select>
          </div>

          {/* Profitability Filter */}
          <div>
            <select
              value={profitabilityFilter}
              onChange={(e) => onProfitabilityChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#16123F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Profitability</option>
              <option value="PROFITABLE">Profitable Only</option>
              <option value="LOSS_MAKING">Loss Making Only</option>
              <option value="NO_SALES">Zero Sales SKUs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-[#C7DDCC]/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#C7DDCC]/70 dark:border-slate-800 bg-[#F4F9F5]/70 dark:bg-slate-800/60 text-[#16123F]">
              <th className="py-3.5 px-3 font-bold text-[11px] uppercase tracking-wider text-[#16123F]/80 dark:text-slate-300 pl-4">
                Product Details
              </th>
              <th className="py-3.5 px-3 font-bold text-[11px] uppercase tracking-wider text-[#16123F]/80 dark:text-slate-300">
                Category / Supplier
              </th>
              {renderSortHeader('Selling Price', 'selling_price')}
              {renderSortHeader('COGS', 'cost_price')}
              {renderSortHeader('Stock Avail', 'available_stock')}
              {renderSortHeader('Orders', 'orders_count')}
              {renderSortHeader('Units Sold', 'units_sold')}
              {renderSortHeader('Revenue', 'revenue')}
              {renderSortHeader('Net Profit', 'net_profit')}
              {renderSortHeader('Margin %', 'profit_margin')}
              {renderSortHeader('Velocity', 'sales_velocity')}
              {renderSortHeader('Runout', 'days_of_stock')}
              {renderSortHeader('Return %', 'return_rate')}
              <th className="py-3.5 px-3 font-bold text-[11px] uppercase tracking-wider text-[#16123F]/80 dark:text-slate-300">
                Classifications
              </th>
              <th className="py-3.5 px-3 font-bold text-[11px] uppercase tracking-wider text-[#16123F]/80 dark:text-slate-300 text-right pr-4">
                Analytics
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C7DDCC]/40 dark:divide-slate-800 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={15} className="py-16 text-center text-[#16123F]/60 dark:text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#16123F] border-t-transparent rounded-full animate-spin" />
                    <span>Aggregating multi-source product intelligence metrics...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-16 text-center text-[#16123F]/60 dark:text-slate-400">
                  <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <p className="font-bold text-sm text-[#16123F] dark:text-white">No products found</p>
                  <p className="text-xs text-slate-500 mt-1">Try changing your search query, category, or timeframe filters.</p>
                </td>
              </tr>
            ) : (
              items.map((p) => {
                const isProfitable = p.net_profit > 0;
                const isLoss = p.net_profit < 0;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F4F9F5]/40 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onOpenDetail(p.id)}
                  >
                    {/* Product */}
                    <td className="py-3 px-3 pl-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.images && p.images[0]
                              ? p.images[0]
                              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80'
                          }
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shrink-0 shadow-2xs"
                        />
                        <div className="max-w-[180px]">
                          <span className="font-bold text-[#16123F] dark:text-white block truncate hover:text-indigo-600 transition-colors" title={p.name}>
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#16123F]/50 dark:text-slate-400 block mt-0.5">
                            {p.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Dealer */}
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-semibold text-[#16123F] dark:text-slate-200 block truncate">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-[#16123F]/60 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <Building2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          {p.dealer?.name || 'Primary Supplier'}
                        </span>
                      </div>
                    </td>

                    {/* Selling Price */}
                    <td className="py-3 px-3 font-semibold text-[#16123F] dark:text-slate-200">
                      {formatCurrency(p.selling_price)}
                    </td>

                    {/* Cost Price / COGS */}
                    <td className="py-3 px-3 text-[#16123F]/80 dark:text-slate-300">
                      {formatCurrency(p.cost_price)}
                    </td>

                    {/* Available Stock */}
                    <td className="py-3 px-3">
                      <div>
                        <span
                          className={`font-bold block ${
                            p.available_stock <= 0
                              ? 'text-rose-600'
                              : p.available_stock <= (p.reorder_level || 15)
                              ? 'text-amber-600'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {p.available_stock} units
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Total: {p.stock_quantity}
                        </span>
                      </div>
                    </td>

                    {/* Orders Count */}
                    <td className="py-3 px-3 font-semibold text-[#16123F] dark:text-slate-200">
                      {p.orders_count}
                    </td>

                    {/* Units Sold */}
                    <td className="py-3 px-3 font-bold text-[#16123F] dark:text-white">
                      {p.units_sold}
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-3 font-bold text-[#16123F] dark:text-white">
                      {formatCurrency(p.revenue)}
                    </td>

                    {/* Net Profit */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-black ${
                          isProfitable
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isLoss
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {p.revenue > 0 ? (isProfitable ? '+' : '') + formatCurrency(p.net_profit) : '—'}
                      </span>
                    </td>

                    {/* Profit Margin % */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          p.profit_margin >= 30
                            ? 'bg-emerald-100/70 text-emerald-800'
                            : p.profit_margin > 0
                            ? 'bg-amber-100/70 text-amber-800'
                            : p.profit_margin < 0
                            ? 'bg-rose-100/70 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.revenue > 0 ? `${p.profit_margin}%` : '—'}
                      </span>
                    </td>

                    {/* Velocity */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#16123F] dark:text-slate-200 block">
                        {p.sales_velocity} <span className="text-[10px] text-slate-400">/day</span>
                      </span>
                    </td>

                    {/* Days of Stock Remaining */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          p.days_of_stock <= 7
                            ? 'text-rose-600 font-bold'
                            : p.days_of_stock <= 14
                            ? 'text-amber-600'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.days_of_stock > 365 ? '365+ d' : `${p.days_of_stock} d`}
                      </span>
                    </td>

                    {/* Return Rate */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-medium ${
                          p.return_rate > 15 ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {p.units_sold > 0 ? `${p.return_rate}%` : '0%'}
                      </span>
                    </td>

                    {/* Classifications */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {p.classifications.slice(0, 2).map((tag, i) => {
                          const badge = getClassificationBadge(tag);
                          return (
                            <span
                              key={i}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          );
                        })}
                        {p.classifications.length > 2 && (
                          <span className="text-[9px] text-slate-400 self-center">
                            +{p.classifications.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Analytics Action */}
                    <td className="py-3 px-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDetail(p.id)}
                          className="px-2.5 py-1.5 rounded-xl border border-[#C7DDCC] bg-white dark:bg-slate-800 hover:bg-[#16123F] hover:text-white dark:hover:bg-slate-700 text-[#16123F] dark:text-white font-bold text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                          title="Open Deep Drilldown Analytics"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Insights</span>
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
      {!isLoading && items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#16123F]/70 dark:text-slate-400 px-2">
          <div>
            Showing{' '}
            <span className="font-bold text-[#16123F] dark:text-white">
              {((pagination.page || 1) - 1) * (pagination.limit || 20) + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#16123F] dark:text-white">
              {Math.min((pagination.page || 1) * (pagination.limit || 20), pagination.total || items.length)}
            </span>{' '}
            of <span className="font-bold text-[#16123F] dark:text-white">{pagination.total || items.length}</span> products
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange((pagination.page || 1) - 1)}
              disabled={(pagination.page || 1) <= 1}
              className="p-2 rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6F2] dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4 text-[#16123F] dark:text-white" />
            </button>
            <span className="px-3 py-1 font-semibold text-[#16123F] dark:text-white">
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange((pagination.page || 1) + 1)}
              disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
              className="p-2 rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6F2] dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4 text-[#16123F] dark:text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
