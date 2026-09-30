import React, { useState, useEffect } from 'react';
import type { DealerPerformanceDetail } from '../../../types';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchDealerPerformanceDetail } from '../../../store/slices/dealerPerformanceSlice';
import {
  X,
  Building2,
  Package,
  ShoppingCart,
  RotateCcw,
  CircleDollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Layers,
  Settings2,
} from 'lucide-react';

export interface DealerDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dealerId?: string | null;
  detail?: DealerPerformanceDetail | null;
  isLoading?: boolean;
  onOpenSlaConfig?: (dealer?: any) => void;
  onConfigureSla?: (dealer: any) => void;
  onOpenStatusModal?: (dealer?: any) => void;
  onUpdateStatus?: (dealer: any) => void;
}

export const DealerDetailDrawer: React.FC<DealerDetailDrawerProps> = ({
  isOpen,
  onClose,
  dealerId,
  detail: propDetail,
  isLoading: propLoading,
  onOpenSlaConfig,
  onConfigureSla,
  onOpenStatusModal,
  onUpdateStatus,
}) => {
  const dispatch = useAppDispatch();
  const { selectedDealerDetail, isDetailLoading } = useAppSelector(
    (state) => state.dealerPerformance
  );
  const { selectedBusiness } = useAppSelector((state) => state.business);

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'PRODUCTS' | 'ORDERS' | 'QUALITY' | 'FINANCES' | 'TRENDS'
  >('OVERVIEW');

  useEffect(() => {
    if (isOpen && dealerId) {
      dispatch(
        fetchDealerPerformanceDetail({
          id: dealerId,
          business_id: selectedBusiness?.id && selectedBusiness.id !== 'all' ? selectedBusiness.id : undefined,
        })
      );
    }
  }, [isOpen, dealerId, selectedBusiness?.id, dispatch]);

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [selectedBusiness?.id]);


  if (!isOpen) return null;

  const detail = propDetail || selectedDealerDetail;
  const isLoading = propLoading !== undefined ? propLoading : isDetailLoading;

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const dealer = detail?.dealer;
  const products = detail?.products || [];
  const orders = detail?.ordersQueue || [];
  const trends = detail?.trends || [];
  const returnBreakdown = (dealer as any)?.returnBreakdown || (dealer as any)?.return_breakdown;

  const handleSla = () => {
    if (onConfigureSla && dealer) onConfigureSla(dealer);
    else if (onOpenSlaConfig) onOpenSlaConfig(dealer);
  };

  const handleStatus = () => {
    if (onUpdateStatus && dealer) onUpdateStatus(dealer);
    else if (onOpenStatusModal) onOpenStatusModal(dealer);
  };

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview & Profile', icon: Building2 },
    { id: 'PRODUCTS', label: `Products (${products.length})`, icon: Package },
    { id: 'ORDERS', label: `Order Queue (${orders.length})`, icon: ShoppingCart },
    { id: 'QUALITY', label: 'Quality & Returns/RTO', icon: RotateCcw },
    { id: 'FINANCES', label: 'Financial Economics', icon: CircleDollarSign },
    { id: 'TRENDS', label: '30-Day Trends', icon: TrendingUp },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-2xl border border-[#C7DDCC]/80 rounded-[32px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#C7DDCC]/60 flex items-center justify-between bg-[#F8FAF8]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#16123F] text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#16123F]">
                  {dealer?.company_name || (dealer as any)?.companyName || 'Supplier Performance Telemetry'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    dealer?.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {dealer?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-[#16123F]/60 mt-0.5">
                Full-funnel supplier reliability, dispatch SLA monitoring, and quality audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSla}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5" /> Edit SLA
            </button>
            <button
              onClick={handleStatus}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              <Settings2 className="w-3.5 h-3.5" /> Status
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#16123F]/50 hover:text-[#16123F] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-6 border-b border-[#C7DDCC]/60 bg-[#F0F6F2]/60 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-[#16123F] text-[#16123F] bg-white/70'
                    : 'border-transparent text-[#16123F]/60 hover:text-[#16123F]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading || !dealer ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-[#16123F]/20 border-t-[#16123F] rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[#16123F]/70">
                Aggregating supplier fulfillment metrics, queue records, and ledger...
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Top Profile & SLA Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs space-y-2">
                      <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                        Contact Information
                      </p>
                      <p className="font-bold text-sm text-[#16123F]">
                        {dealer.contact_name || (dealer as any).contactName || 'Primary Representative'}
                      </p>
                      <div className="text-xs text-[#16123F]/70 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" /> {dealer.email}
                      </div>
                      {dealer.phone && (
                        <div className="text-xs text-[#16123F]/70 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" /> {dealer.phone}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs space-y-2">
                      <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                        SLA & Lead Time Commitments
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#16123F]/60">Dispatch SLA:</span>
                        <span className="font-bold text-[#16123F]">
                          {dealer.dispatch_sla_hours || (dealer as any).dispatchSlaHours || 48} Hours
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#16123F]/60">Fulfillment SLA:</span>
                        <span className="font-bold text-[#16123F]">
                          {dealer.fulfillment_sla_hours || (dealer as any).fulfillmentSlaHours || 72} Hours
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#16123F]/60">Supplier Lead Time:</span>
                        <span className="font-bold text-[#16123F]">
                          {dealer.average_lead_time_days || (dealer as any).averageLeadTimeDays || 2} Days
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs space-y-2">
                      <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                        Credit Line & Terms
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#16123F]/60">Credit Limit:</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(dealer.credit_limit || (dealer as any).creditLimit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#16123F]/60">Payment Terms:</span>
                        <span className="font-bold text-[#16123F]">
                          {dealer.payment_terms || (dealer as any).paymentTerms || 'NET30'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#16123F]/60">Commission Rate:</span>
                        <span className="font-bold text-[#16123F]">
                          {dealer.commission_rate || (dealer as any).commissionRate || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Performance KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                      <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                        Fulfillment Rate
                      </p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">
                        {Number(dealer.fulfillment_rate ?? (dealer as any).fulfillmentRate ?? 100).toFixed(1)}%
                      </p>
                      <p className="text-[11px] text-[#16123F]/50 mt-0.5">
                        {dealer.fulfilled_orders ?? (dealer as any).fulfilledOrders ?? 0} / {dealer.total_orders ?? (dealer as any).totalAssignedOrders ?? 0} orders
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                      <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                        Average Dispatch
                      </p>
                      <p className="text-2xl font-bold text-[#16123F] mt-1">
                        {Number(dealer.avg_dispatch_days ?? (dealer as any).avgDispatchDays ?? 1.2).toFixed(1)} Days
                      </p>
                      <p className="text-[11px] text-[#16123F]/50 mt-0.5">
                        {Number(dealer.avg_dispatch_hours ?? (dealer as any).avgDispatchHours ?? 28).toFixed(1)} hours processing
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                      <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                        Revenue Generated
                      </p>
                      <p className="text-2xl font-bold text-teal-800 mt-1">
                        {formatCurrency(dealer.revenue)}
                      </p>
                      <p className="text-[11px] text-[#16123F]/50 mt-0.5">
                        {dealer.fulfilled_orders ?? (dealer as any).fulfilledOrders ?? 0} completed orders
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs">
                      <p className="text-[11px] font-bold text-[#16123F]/60 uppercase">
                        Net Profit Margin
                      </p>
                      <p className="text-2xl font-bold text-indigo-700 mt-1">
                        {Number(dealer.profit_margin ?? (dealer as any).profitMargin ?? 0).toFixed(1)}%
                      </p>
                      <p className="text-[11px] text-[#16123F]/50 mt-0.5">
                        +{formatCurrency(dealer.profit)} profit
                      </p>
                    </div>
                  </div>

                  {(dealer.rating_notes || (dealer as any).ratingNotes) && (
                    <div className="p-4 rounded-2xl bg-[#F0F6F2] border border-[#C7DDCC]/70 text-xs">
                      <p className="font-bold text-[#16123F] mb-1">Operational Notes:</p>
                      <p className="text-[#16123F]/80">{dealer.rating_notes || (dealer as any).ratingNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCTS CATALOG */}
              {activeTab === 'PRODUCTS' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-[#C7DDCC]/60 bg-white shadow-xs custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F8FAF8] border-b border-[#C7DDCC]/60 text-[11px] font-bold text-[#16123F]/70 uppercase">
                          <th className="py-3 px-4">Product Name & SKU</th>
                          <th className="py-3 px-3">Cost Price</th>
                          <th className="py-3 px-3">Selling Price</th>
                          <th className="py-3 px-3">Available Stock</th>
                          <th className="py-3 px-3">Units Sold</th>
                          <th className="py-3 px-3">Revenue</th>
                          <th className="py-3 px-3">Returns</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C7DDCC]/30">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-[#16123F]/40 italic">
                              No products assigned to this supplier.
                            </td>
                          </tr>
                        ) : (
                          products.map((p) => (
                            <tr key={p.id} className="hover:bg-[#F8FAF8]">
                              <td className="py-3 px-4">
                                <div className="font-bold text-[#16123F]">{p.name}</div>
                                <div className="font-mono text-[10px] text-[#16123F]/50">{p.sku}</div>
                              </td>
                              <td className="py-3 px-3 font-medium">{formatCurrency(p.cost_price ?? (p as any).costPrice)}</td>
                              <td className="py-3 px-3 font-medium">{formatCurrency(p.selling_price ?? (p as any).sellingPrice)}</td>
                              <td className="py-3 px-3 font-bold text-emerald-700">{p.stock_quantity ?? (p as any).availableStock ?? 0}</td>
                              <td className="py-3 px-3 font-bold text-[#16123F]">{(p as any).unitsSold ?? (p as any).units_sold ?? 0}</td>
                              <td className="py-3 px-3 font-bold text-teal-800">{formatCurrency(p.revenue)}</td>
                              <td className="py-3 px-3">
                                {((p as any).returnsCount || (p as any).returns_count || 0) > 0 ? (
                                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                                    {(p as any).returnsCount || (p as any).returns_count}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">0</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: OPERATIONAL ORDER QUEUE & SLA */}
              {activeTab === 'ORDERS' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-[#C7DDCC]/60 bg-white shadow-xs custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F8FAF8] border-b border-[#C7DDCC]/60 text-[11px] font-bold text-[#16123F]/70 uppercase">
                          <th className="py-3 px-4">Order #</th>
                          <th className="py-3 px-3">Customer</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Amount</th>
                          <th className="py-3 px-3">Assigned Date</th>
                          <th className="py-3 px-3">SLA Status & Deadline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C7DDCC]/30">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-[#16123F]/40 italic">
                              No active orders assigned to this supplier.
                            </td>
                          </tr>
                        ) : (
                          orders.map((o) => (
                            <tr key={o.id} className="hover:bg-[#F8FAF8]">
                              <td className="py-3 px-4 font-mono font-bold text-[#16123F]">
                                {o.order_number || (o as any).orderNumber}
                              </td>
                              <td className="py-3 px-3 text-[#16123F]/80">{(o as any).customerName || (o as any).customer_name || 'Customer'}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16123F]/5 text-[#16123F]">
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-bold text-[#16123F]">
                                {formatCurrency(o.total_amount || (o as any).totalAmount)}
                              </td>
                              <td className="py-3 px-3 text-[#16123F]/70 whitespace-nowrap">
                                {new Date(o.created_at || (o as any).createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3">
                                {(o as any).isBreached || (o as any).sla_breached ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" /> SLA Breached
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <Clock className="w-3 h-3 text-emerald-600" /> In SLA Window
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: QUALITY & RETURNS / RTO */}
              {activeTab === 'QUALITY' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Returns Reasons Card */}
                    <div className="p-5 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs space-y-3">
                      <h4 className="font-bold text-[#16123F] text-sm flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-rose-600" />
                        Customer Return Reasons Breakdown
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span>Damaged in Transit / Factory Defect:</span>
                          <span className="font-bold text-rose-700">{returnBreakdown?.damaged ?? 0}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span>Defective / Broken Part:</span>
                          <span className="font-bold text-rose-700">{returnBreakdown?.defective ?? 0}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span>Wrong Product Dispatched:</span>
                          <span className="font-bold text-amber-700">{returnBreakdown?.wrongItem ?? (returnBreakdown as any)?.wrong_product ?? 0}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span>Quality / Expectation Mismatch:</span>
                          <span className="font-bold text-amber-700">{returnBreakdown?.quality ?? 0}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span>Customer Changed Mind:</span>
                          <span className="font-bold text-slate-700">{returnBreakdown?.changedMind ?? (returnBreakdown as any)?.customer_changed_mind ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* COD RTO Analytics Card */}
                    <div className="p-5 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs space-y-3">
                      <h4 className="font-bold text-[#16123F] text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        COD RTO (Return to Origin) Metrics
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span>Total RTO Dispatches:</span>
                          <span className="font-bold text-rose-700">{dealer.rto_orders ?? (dealer as any).rtoOrders ?? 0} orders</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span>Supplier RTO Rate:</span>
                          <span className="font-bold text-rose-700">{Number(dealer.rto_rate ?? (dealer as any).rtoRate ?? 0).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span>Estimated RTO Reverse Shipping Cost:</span>
                          <span className="font-bold text-[#16123F]">{formatCurrency((dealer as any).rto_cost || (dealer as any).rtoCost || 0)}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#16123F]/50 italic">
                        Note: RTO indicates orders where delivery could not be completed. Supplier dispatch speed directly correlates with lower RTO.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FINANCIAL ECONOMICS */}
              {activeTab === 'FINANCES' && (
                <div className="p-5 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs space-y-4">
                  <h4 className="font-bold text-[#16123F] text-sm">
                    Supplier Financial Unit Economics & Payables
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[#16123F]/60 font-semibold">Total Revenue (GMV):</span>
                      <p className="text-lg font-bold text-[#16123F] mt-1">{formatCurrency(dealer.revenue)}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[#16123F]/60 font-semibold">Supplier Product Cost:</span>
                      <p className="text-lg font-bold text-amber-700 mt-1">{formatCurrency((dealer as any).supplier_cost || (dealer as any).supplierCost || (dealer as any).product_cost || 0)}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[#16123F]/60 font-semibold">Net Profit Contribution:</span>
                      <p className="text-lg font-bold text-emerald-700 mt-1">+{formatCurrency(dealer.profit)}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[#16123F]/60 font-semibold">Profit Margin:</span>
                      <p className="text-lg font-bold text-indigo-700 mt-1">{Number(dealer.profit_margin ?? (dealer as any).profitMargin ?? 0).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: 30-DAY DAILY TRENDS */}
              {activeTab === 'TRENDS' && (
                <div className="p-5 rounded-2xl bg-white border border-[#C7DDCC]/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#16123F] text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#16123F]" />
                      30-Day Daily Orders & Fulfillment Trend
                    </h4>
                    <span className="text-xs text-[#16123F]/50">Database-driven records</span>
                  </div>

                  <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 border-b border-[#C7DDCC]/40">
                    {trends.map((point) => {
                      const maxOrders = Math.max(...trends.map((p) => p.orders), 3);
                      const heightPct = Math.max(6, (point.orders / maxOrders) * 100);

                      return (
                        <div
                          key={point.date}
                          className="flex-1 flex flex-col items-center group relative h-full justify-end"
                        >
                          <div className="absolute -top-10 bg-[#16123F] text-white text-[10px] font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {point.date}: {point.orders} orders ({formatCurrency(point.revenue)})
                          </div>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              point.orders > 0
                                ? 'bg-gradient-to-t from-[#16123F] to-[#75C9B7] group-hover:from-emerald-600 group-hover:to-teal-400'
                                : 'bg-slate-200/60'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-[#16123F]/40 px-1">
                    <span>{trends[0]?.date}</span>
                    <span>{trends[Math.floor(trends.length / 2)]?.date}</span>
                    <span>{trends[trends.length - 1]?.date} (Today)</span>
                  </div>
                </div>
              )}
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
