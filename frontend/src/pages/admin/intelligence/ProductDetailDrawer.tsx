import React, { useState } from 'react';
import type { ProductDetailIntelligence } from '../../../types';
import {
  X,
  Package,
  TrendingUp,
  Boxes,
  Building2,
  RotateCcw,
  Sparkles,
  DollarSign,
  Scale,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ProductDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  detail: ProductDetailIntelligence | null;
  isLoading?: boolean;
}

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  isOpen,
  onClose,
  detail,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sales' | 'profit' | 'inventory' | 'dealer' | 'returns' | 'research'
  >('overview');

  if (!isOpen) return null;

  const formatCurrency = (val?: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const product = detail?.product;
  const sales = detail?.sales;
  const profitability = detail?.profitability;
  const inventory = detail?.inventory;
  const dealer = detail?.dealer;
  const returns = detail?.returns;
  const research = detail?.research;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 bg-[#F8FAF8] dark:bg-slate-900/90">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={
                product?.images && product.images[0]
                  ? product.images[0]
                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=80'
              }
              alt={product?.name || 'Product'}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#16123F] dark:text-white truncate max-w-md">
                  {product?.name || 'Product Intelligence Insights'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#75C9B7]/20 text-[#16123F] border border-[#75C9B7]/40">
                  {product?.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="font-mono">{product?.sku}</span>
                <span>•</span>
                <span>{product?.category}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-600">
                  Selling: {formatCurrency(product?.selling_price)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 px-6 pt-3 pb-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: Package },
            { id: 'sales', label: 'Sales & Demand', icon: TrendingUp },
            { id: 'profit', label: 'Profit & Margins', icon: DollarSign },
            { id: 'inventory', label: 'Inventory Intelligence', icon: Boxes },
            { id: 'dealer', label: 'Supplier & Multi-Dealer', icon: Building2 },
            { id: 'returns', label: 'Returns & RTO', icon: RotateCcw },
            { id: 'research', label: 'Research & Notes', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#16123F] text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-24 text-center text-slate-400 animate-pulse">
              Loading comprehensive product analytics...
            </div>
          ) : !detail ? (
            <div className="py-24 text-center text-slate-400">No product detail data available.</div>
          ) : (
            <>
              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Selling Price</span>
                      <span className="text-lg font-black text-[#16123F] dark:text-white block">
                        {formatCurrency(product?.selling_price)}
                      </span>
                      <span className="text-[10px] text-slate-500">Retail Catalog</span>
                    </div>

                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Product Cost</span>
                      <span className="text-lg font-black text-[#16123F] dark:text-white block">
                        {formatCurrency(product?.cost_price)}
                      </span>
                      <span className="text-[10px] text-slate-500">Wholesale COGS</span>
                    </div>

                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Units Sold</span>
                      <span className="text-lg font-black text-emerald-600 block">{sales?.unitsSold ?? 0}</span>
                      <span className="text-[10px] text-slate-500">{sales?.ordersCount ?? 0} total orders</span>
                    </div>

                    <div className="bg-[#16123F] p-4 rounded-2xl text-white shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-[#FFE26A] block mb-1">Net Profit</span>
                      <span className="text-lg font-black block">{formatCurrency(profitability?.netProfit)}</span>
                      <span className="text-[10px] text-slate-300">Margin: {profitability?.profitMargin ?? 0}%</span>
                    </div>
                  </div>

                  {/* Description & Attributes */}
                  <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description & Specs</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {product?.description || 'No extended description recorded for this product.'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Category</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{product?.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Available Stock</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{inventory?.availableStock} units</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Primary Supplier</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{dealer?.assigned?.name || 'Primary Dealer'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SALES TAB */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  {/* Sales KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Revenue</span>
                      <span className="text-lg font-black text-[#16123F] dark:text-white block">
                        {formatCurrency(sales?.revenue)}
                      </span>
                    </div>
                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Units Sold</span>
                      <span className="text-lg font-black text-emerald-600 block">{sales?.unitsSold ?? 0}</span>
                    </div>
                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sales Velocity</span>
                      <span className="text-lg font-black text-blue-600 block">
                        {sales?.salesVelocity ?? 0} <span className="text-xs font-normal text-slate-500">/day</span>
                      </span>
                    </div>
                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Orders</span>
                      <span className="text-lg font-black text-[#16123F] dark:text-white block">
                        {sales?.ordersCount ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Daily Sales & Revenue Trend Chart */}
                  <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Daily Revenue & Profit Trend (Real Transaction Aggregation)
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sales?.trend || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              typeof value === 'number' ? formatCurrency(value) : value,
                              name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Net Profit' : name,
                            ]}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#16123F"
                            strokeWidth={2.5}
                            dot={{ r: 3 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="profit"
                            name="Net Profit"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Recent Orders Including This SKU
                    </h3>
                    {sales?.recentOrders && sales.recentOrders.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {sales.recentOrders.map((ord: any) => (
                          <div key={ord.id} className="py-2.5 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-[#16123F] dark:text-white block font-mono">
                                {ord.order_number}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(ord.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {formatCurrency(ord.total_price)} ({ord.quantity} qty)
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-600">
                                {ord.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No orders logged in this period.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 3. PROFIT TAB */}
              {activeTab === 'profit' && (
                <div className="space-y-6">
                  {/* Centralized Profit Waterfall Table */}
                  <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#16123F] dark:text-white">
                          Centralized Profit & Cost Allocation Breakdown
                        </h3>
                        <p className="text-xs text-slate-500">
                          Integrated with the centralized profit engine deducting COGS, gateway, shipping, and returns
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800">
                        Margin: {profitability?.profitMargin ?? 0}%
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs pt-2">
                      <div className="py-2.5 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>(+) Gross Product Revenue</span>
                        <span className="text-emerald-600">{formatCurrency(profitability?.revenue)}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>(-) Wholesale Product Cost (COGS)</span>
                        <span className="text-rose-600">-{formatCurrency(profitability?.cogs)}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>(-) 2% Payment Gateway Fees</span>
                        <span className="text-rose-600">-{formatCurrency(profitability?.gatewayFee)}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>(-) Allocated Fulfillment & Shipping</span>
                        <span className="text-rose-600">-{formatCurrency(profitability?.shippingCost)}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>(-) Return Refunds & RTO Processing</span>
                        <span className="text-rose-600">-{formatCurrency(profitability?.returnCost)}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>(-) Allocated Marketing & Ad Spend</span>
                        <span className="text-rose-600">-{formatCurrency(profitability?.marketingCost)}</span>
                      </div>
                      <div className="pt-3 pb-1 flex items-center justify-between font-black text-sm text-[#16123F] dark:text-white">
                        <span>(=) True Calculated Net Profit</span>
                        <span className={profitability && profitability.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {formatCurrency(profitability?.netProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. INVENTORY TAB */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  {/* Inventory Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Available Stock</span>
                      <span className="text-lg font-black text-emerald-600 block">{inventory?.availableStock ?? 0}</span>
                      <span className="text-[10px] text-slate-400">Total: {inventory?.stockQuantity} | Res: {inventory?.reservedQuantity}</span>
                    </div>

                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Days Remaining</span>
                      <span className="text-lg font-black text-blue-600 block">
                        {inventory?.daysOfStockRemaining ?? 0} days
                      </span>
                      <span className="text-[10px] text-slate-400">At {inventory?.salesVelocity}/day velocity</span>
                    </div>

                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reorder Point</span>
                      <span className="text-lg font-black text-amber-600 block">
                        {inventory?.calculatedReorderPoint ?? 0} units
                      </span>
                      <span className="text-[10px] text-slate-400">Safety stock: {inventory?.safetyStock}</span>
                    </div>

                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Recommended Reorder</span>
                      <span className="text-lg font-black text-[#16123F] dark:text-white block">
                        {inventory?.recommendedReorderQuantity ?? 0} units
                      </span>
                      <span className="text-[10px] text-slate-400">Target: {inventory?.targetStockDays} days</span>
                    </div>
                  </div>

                  {/* Stock Movement History */}
                  <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-slate-500" />
                      Stock Intake & Movement Log
                    </h3>
                    {inventory?.movementHistory && inventory.movementHistory.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {inventory.movementHistory.map((tx: any) => (
                          <div key={tx.id} className="py-2.5 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {tx.reason || tx.transaction_type}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(tx.createdAt || tx.created_at).toLocaleString()} • Ref: {tx.reference || 'N/A'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`font-bold block ${tx.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} units
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Bal: {tx.new_quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No stock movements recorded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 5. DEALER & MULTI-SUPPLIER TAB */}
              {activeTab === 'dealer' && (
                <div className="space-y-6">
                  {/* Current Assigned Dealer */}
                  {dealer?.assigned && (
                    <div className="p-5 rounded-2xl bg-[#F4F9F5] dark:bg-slate-800/60 border border-[#C7DDCC] flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-emerald-600" />
                          <h3 className="text-sm font-bold text-[#16123F] dark:text-white">
                            Current Supplier: {dealer.assigned.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Contact: {dealer.assigned.contactName || 'N/A'} • {dealer.assigned.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Lead Time</span>
                          <span>{dealer.assigned.leadTimeDays} days</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Fulfillment Rate</span>
                          <span className="text-emerald-600">{dealer.assigned.fulfillmentRate}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-Supplier Benchmark Matrix */}
                  <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-slate-500" />
                      Multi-Supplier Cost & Margin Comparison
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
                            <th className="py-2.5 px-3">Supplier</th>
                            <th className="py-2.5 px-3">Product Cost</th>
                            <th className="py-2.5 px-3">Est. Shipping</th>
                            <th className="py-2.5 px-3">Total Fulfillment</th>
                            <th className="py-2.5 px-3">Lead Time</th>
                            <th className="py-2.5 px-3">Est. Margin %</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {dealer?.allSuppliers && dealer.allSuppliers.length > 0 ? (
                            dealer.allSuppliers.map((s, idx) => (
                              <tr key={idx} className={s.isCurrentSupplier ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-bold' : ''}>
                                <td className="py-3 px-3">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                    {s.name}
                                  </span>
                                  {s.isCurrentSupplier && (
                                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                                      Active Partner
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{formatCurrency(s.costPrice)}</td>
                                <td className="py-3 px-3 text-slate-500">{formatCurrency(s.shippingEstimate)}</td>
                                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{formatCurrency(s.totalFulfillmentCost)}</td>
                                <td className="py-3 px-3">{s.leadTimeDays} days</td>
                                <td className="py-3 px-3">
                                  <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                    {s.estimatedMargin}%
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right text-emerald-600 font-semibold">{s.status}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400">
                                No alternative suppliers configured for this category.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. RETURNS & RTO TAB */}
              {activeTab === 'returns' && (
                <div className="space-y-6">
                  {/* Returns KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Return Ratio</span>
                      <span className={`text-lg font-black block ${returns && returns.returnRate > 15 ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                        {returns?.returnRate ?? 0}%
                      </span>
                      <span className="text-[10px] text-slate-400">{returns?.returnCount ?? 0} returned items</span>
                    </div>

                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">RTO Ratio</span>
                      <span className={`text-lg font-black block ${returns && returns.rtoRate > 10 ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                        {returns?.rtoRate ?? 0}%
                      </span>
                      <span className="text-[10px] text-slate-400">{returns?.rtoCount ?? 0} undelivered packages</span>
                    </div>

                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Refunds Total</span>
                      <span className="text-lg font-black text-rose-600 block">
                        {formatCurrency(returns?.refundTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400">Total credited to buyers</span>
                    </div>

                    <div className="bg-[#F8FAF8] dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Quality Health</span>
                      <span className="text-lg font-black text-emerald-600 block">
                        {returns && returns.returnRate < 5 ? 'EXCELLENT' : returns && returns.returnRate < 15 ? 'GOOD' : 'ATTENTION'}
                      </span>
                      <span className="text-[10px] text-slate-400">Threshold: &lt;15%</span>
                    </div>
                  </div>

                  {/* Return Reasons Breakdown */}
                  <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Customer Return & RTO Reasons Distribution
                    </h3>
                    {returns?.reasonsBreakdown && returns.reasonsBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {returns.reasonsBreakdown.map((r, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{r.reason}</span>
                              <span className="text-slate-500">{r.count} times ({r.percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-rose-500 h-2 rounded-full"
                                style={{ width: `${r.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No returns or RTO logged for this product.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 7. RESEARCH TAB */}
              {activeTab === 'research' && (
                <div className="space-y-6">
                  {research ? (
                    <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          <h3 className="text-sm font-bold text-[#16123F] dark:text-white">
                            Linked Product Research Item
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                          {research.status || 'APPROVED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Source</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{research.source || 'Manual Discovery'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Target Audience</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{research.targetAudience || 'General Audience'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Competitor Benchmark</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {research.competitorPrice ? formatCurrency(Number(research.competitorPrice)) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tags</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {research.tags && research.tags.length > 0 ? (
                              research.tags.map((t, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                                  #{t}
                                </span>
                              ))
                            ) : (
                              <span>No tags</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-slate-400 block text-[10px] mb-1">Research Notes</span>
                        <div className="p-3.5 rounded-xl bg-[#F8FAF8] dark:bg-slate-900/60 border border-slate-200 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {research.notes || 'No research notes entered.'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200">
                      <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        No product research item linked directly to this live SKU.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        You can create new product experiments in the Product Research Workspace.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 bg-[#F8FAF8] dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Product Intelligence &amp; Research Engine</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#16123F] text-white text-xs font-bold hover:bg-[#16123F]/90 transition-all cursor-pointer shadow-xs"
            >
              Close Drilldown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
