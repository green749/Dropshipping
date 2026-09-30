import React, { useState } from 'react';
import type { ProductInventoryDetail } from '../../../types';
import {
  X,
  Package,
  RotateCcw,
  PlusCircle,
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface InventoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: ProductInventoryDetail | null;
  isLoading: boolean;
  onOpenStockIn: () => void;
  onOpenAdjustment: () => void;
}

export const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({
  isOpen,
  onClose,
  detail,
  isLoading,
  onOpenStockIn,
  onOpenAdjustment,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const product = detail?.product;
  const dealer = detail?.dealer;
  const sales = detail?.salesMetrics;
  const forecast = detail?.forecasting;
  const trend = detail?.salesTrend || [];
  const transactions = detail?.recentTransactions || [];

  const marginPct =
    product && Number(product.sellingPrice || 0) > 0
      ? (((Number(product.sellingPrice || 0) - Number(product.costPrice || 0)) / Number(product.sellingPrice || 1)) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-2xl border border-[#C7DDCC]/80 rounded-[32px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#C7DDCC]/60 flex items-center justify-between bg-[#F8FAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#16123F] text-white flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#16123F]">
                Product Inventory Intelligence
              </h2>
              <p className="text-xs text-[#16123F]/60">
                Detailed stock movements, multi-window velocity, and explainable forecasting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#16123F]/50 hover:text-[#16123F] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading || !detail ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-[#16123F]/20 border-t-[#16123F] rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[#16123F]/70">
                Loading intelligence calculations and sales velocity history...
              </p>
            </div>
          ) : (
            <>
              {/* Product Hero Info */}
              <div className="flex flex-col md:flex-row items-start gap-5 p-5 rounded-2xl bg-[#F0F6F2]/70 border border-[#C7DDCC]/70">
                <img
                  src={
                    product?.images && product.images.length > 0
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80'
                  }
                  alt={product?.name}
                  className="w-24 h-24 rounded-2xl object-cover border border-[#C7DDCC] shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16123F] text-white">
                      {product?.category}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-white border border-[#C7DDCC] text-[#16123F]">
                      {product?.sku}
                    </span>
                    {forecast?.potentialStockoutRisk && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Stockout Risk
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#16123F] truncate">
                    {product?.name}
                  </h3>
                  <p className="text-xs text-[#16123F]/70 mt-1 line-clamp-2">
                    {product?.description || 'No description provided.'}
                  </p>

                  {/* Pricing Matrix */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                    <div>
                      <span className="text-[#16123F]/50">Cost Price: </span>
                      <span className="font-bold text-[#16123F]">
                        {formatCurrency(product?.costPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16123F]/50">Selling Price: </span>
                      <span className="font-bold text-[#16123F]">
                        {formatCurrency(product?.sellingPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16123F]/50">Gross Margin: </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{marginPct}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#16123F]/80">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-semibold">
                        {dealer?.companyName || 'Direct Supplier'}
                      </span>
                      <span className="text-[11px] text-[#16123F]/50">
                        ({dealer?.leadTimeDays || 3}d Lead Time)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Inflow Buttons */}
                <div className="flex md:flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={onOpenStockIn}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Stock-In
                  </button>
                  <button
                    onClick={onOpenAdjustment}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 font-semibold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" /> Adjust Stock
                  </button>
                </div>
              </div>

              {/* Stock Status & Forecasting Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                  <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                    Available Stock
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {product?.availableStock.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[#16123F]/50 mt-0.5">
                    {product?.reservedQuantity} units in pending orders
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                  <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                    Inventory Value
                  </p>
                  <p className="text-2xl font-bold text-[#16123F] mt-1">
                    {formatCurrency(product?.inventoryValue)}
                  </p>
                  <p className="text-[11px] text-[#16123F]/50 mt-0.5">
                    Based on unit cost basis
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                  <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                    Daily Sales Velocity
                  </p>
                  <p className="text-2xl font-bold text-cyan-700 mt-1 flex items-center gap-1.5">
                    {sales?.dailySalesVelocity} <span className="text-xs font-semibold text-[#16123F]/50">/ day</span>
                  </p>
                  <p className="text-[11px] text-[#16123F]/50 mt-0.5">
                    {sales?.unitsSoldWindow} units sold in window
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                  <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                    Days of Stock Left
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      (forecast?.daysOfStockRemaining || 0) <= 5
                        ? 'text-rose-600'
                        : (forecast?.daysOfStockRemaining || 0) <= 14
                        ? 'text-amber-600'
                        : 'text-indigo-700'
                    }`}
                  >
                    {forecast?.daysOfStockRemaining !== null
                      ? `${forecast?.daysOfStockRemaining} Days`
                      : 'N/A'}
                  </p>
                  <p className="text-[11px] text-[#16123F]/50 mt-0.5">
                    {forecast?.inventoryStatus} status
                  </p>
                </div>
              </div>

              {/* Explainable Forecasting Calculation Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-200/80">
                <div className="flex items-center gap-2 mb-3">
                  <RotateCcw className="w-4 h-4 text-indigo-700" />
                  <h4 className="font-bold text-[#16123F] text-sm">
                    Explainable Reorder Forecast & Safety Buffer
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3.5 rounded-xl bg-white/90 border border-indigo-100">
                    <div className="flex justify-between items-center text-[#16123F]/80">
                      <span>Supplier Lead Time:</span>
                      <span className="font-bold text-[#16123F]">{forecast?.leadTimeDays} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-[#16123F]/80">
                      <span>Safety Stock Target:</span>
                      <span className="font-bold text-[#16123F]">{forecast?.safetyStock} Units</span>
                    </div>
                    <div className="flex justify-between items-center text-[#16123F]/80">
                      <span>Target Buffer Horizon:</span>
                      <span className="font-bold text-[#16123F]">{forecast?.targetStockDays} Days</span>
                    </div>
                    <div className="pt-2 border-t border-indigo-100 flex justify-between items-center font-bold text-indigo-900">
                      <span>Calculated Reorder Point:</span>
                      <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {forecast?.reorderPointUnits} Units
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white/90 border border-indigo-100">
                    <div>
                      <p className="font-semibold text-[#16123F] mb-1">
                        Procurement Recommendation:
                      </p>
                      {forecast?.reorderRecommended ? (
                        <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                          <p className="font-bold">
                            ⚠️ Reorder +{forecast.recommendedReorderQty} units immediately
                          </p>
                          <p className="text-[11px] text-purple-700 mt-0.5">
                            Available stock ({product?.availableStock}) is at or below the reorder point ({forecast.reorderPointUnits}).
                          </p>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                          <p className="font-bold">
                            ✅ Current inventory levels are sufficient
                          </p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Available stock ({product?.availableStock}) exceeds the calculated reorder trigger point ({forecast?.reorderPointUnits}).
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-[#16123F]/50 mt-2 italic">
                      Formula: Reorder Point = (Sales Velocity × Supplier Lead Time) + Safety Stock
                    </p>
                  </div>
                </div>
              </div>

              {/* 30-Day Sales Trend Bar Chart */}
              <div className="p-5 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#16123F]" />
                    <h4 className="font-bold text-[#16123F] text-sm">
                      30-Day Daily Sales Trend (Units Sold)
                    </h4>
                  </div>
                  <span className="text-xs text-[#16123F]/50 font-medium">
                    Actual Order Dispatch Ledger
                  </span>
                </div>

                <div className="h-40 flex items-end gap-1.5 pt-6 pb-2 border-b border-[#C7DDCC]/40">
                  {trend.map((point) => {
                    const maxUnits = Math.max(...trend.map((p) => p.unitsSold), 5);
                    const heightPct = Math.max(8, (point.unitsSold / maxUnits) * 100);

                    return (
                      <div
                        key={point.date}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 bg-[#16123F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {point.date}: {point.unitsSold} units
                        </div>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            point.unitsSold > 0
                              ? 'bg-gradient-to-t from-[#16123F] to-[#75C9B7] group-hover:from-emerald-600 group-hover:to-teal-400'
                              : 'bg-slate-200/60'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-[#16123F]/40 mt-1 px-1">
                  <span>{trend[0]?.date}</span>
                  <span>{trend[Math.floor(trend.length / 2)]?.date}</span>
                  <span>{trend[trend.length - 1]?.date} (Today)</span>
                </div>
              </div>

              {/* Recent Inventory Transactions Ledger */}
              <div className="p-5 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#16123F]" />
                    <h4 className="font-bold text-[#16123F] text-sm">
                      Recent Stock Movement History (Audit Trail)
                    </h4>
                  </div>
                  <span className="text-xs text-[#16123F]/50 font-medium">
                    Showing latest {transactions.length} events
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#C7DDCC]/60 text-[11px] font-bold text-[#16123F]/60">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Quantity</th>
                        <th className="py-2 px-3">Previous → New</th>
                        <th className="py-2 px-3">Reason / Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C7DDCC]/30">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[#16123F]/40 italic">
                            No recent stock transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => {
                          const isPositive = tx.quantity > 0;
                          return (
                            <tr key={tx.id} className="hover:bg-[#F8FAF8]">
                              <td className="py-2 px-3 text-[#16123F]/70 whitespace-nowrap">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-3">
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#16123F]/5 text-[#16123F]">
                                  {tx.transaction_type}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-bold">
                                <span
                                  className={
                                    isPositive ? 'text-emerald-700' : 'text-rose-700'
                                  }
                                >
                                  {isPositive ? `+${tx.quantity}` : tx.quantity}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-[#16123F]/70">
                                {tx.previous_quantity} → {tx.new_quantity}
                              </td>
                              <td className="py-2 px-3 text-[#16123F]/80">
                                <div>{tx.reason || 'General inventory transaction'}</div>
                                {tx.reference && (
                                  <div className="text-[10px] text-[#16123F]/40">
                                    Ref: {tx.reference}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#C7DDCC]/60 bg-[#F8FAF8] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#16123F] text-white font-semibold text-xs hover:bg-[#16123F]/90 transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
