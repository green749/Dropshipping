import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchDealerPerformanceDetail } from '../../../store/slices/dealerPerformanceSlice';
import { DealerSlaConfigModal } from './DealerSlaConfigModal';
import { DealerStatusModal } from './DealerStatusModal';
import {
  ArrowLeft,
  Building2,
  Package,
  ShoppingCart,
  RotateCcw,
  CircleDollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Layers,
  Settings2,
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

export const DealerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedDealerDetail, isDetailLoading, error } = useAppSelector(
    (state) => state.dealerPerformance
  );
  const { selectedBusiness } = useAppSelector((state) => state.business);

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'PRODUCTS' | 'ORDERS' | 'QUALITY' | 'FINANCES' | 'TRENDS'
  >('OVERVIEW');

  const [slaModalDealer, setSlaModalDealer] = useState<any>(null);
  const [statusModalDealer, setStatusModalDealer] = useState<any>(null);

  useEffect(() => {
    if (id) {
      dispatch(
        fetchDealerPerformanceDetail({
          id,
          business_id: selectedBusiness?.id && selectedBusiness.id !== 'all' ? selectedBusiness.id : undefined,
        })
      );
    }
  }, [id, selectedBusiness?.id, dispatch]);

  useEffect(() => {
    if (error && (error.includes('403') || error.includes('404') || error.includes('Unauthorized') || error.includes('not found'))) {
      navigate('/admin/dealers');
    }
  }, [error, navigate]);


  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const detail = selectedDealerDetail;
  const dealer = detail?.dealer;
  const products = detail?.products || [];
  const orders = detail?.ordersQueue || [];
  const trends = detail?.trends || [];

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview & Profile', icon: Building2 },
    { id: 'PRODUCTS', label: `Products (${products.length})`, icon: Package },
    { id: 'ORDERS', label: `Order Queue (${orders.length})`, icon: ShoppingCart },
    { id: 'QUALITY', label: 'Quality & Returns/RTO', icon: RotateCcw },
    { id: 'FINANCES', label: 'Financial Economics', icon: CircleDollarSign },
    { id: 'TRENDS', label: '30-Day Trends', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 -m-6 animate-fade-in">
      {/* Sticky Page Header */}
      <div className="sticky top-0 z-30 bg-[#F8FAF8] dark:bg-slate-900 border-b border-[#C7DDCC]/60 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => navigate('/admin/dealers')}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#16123F] dark:hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 rounded-2xl bg-[#16123F] text-white flex items-center justify-center shadow-sm shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#16123F] dark:text-white truncate">
                  {isDetailLoading ? (
                    <span className="inline-block w-40 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : (
                    dealer?.company_name || (dealer as any)?.companyName || 'Supplier Detail'
                  )}
                </h1>
                {dealer?.status && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      dealer.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {dealer.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#16123F]/60 dark:text-slate-400 mt-0.5 truncate">
                Full-funnel supplier reliability, dispatch SLA monitoring, and quality audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSlaModalDealer(dealer)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-all cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Edit SLA
            </button>
            <button
              onClick={() => setStatusModalDealer(dealer)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              Status
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-0.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#16123F] text-[#16123F] dark:text-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Body */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isDetailLoading ? (
          <div className="py-32 text-center text-slate-400 animate-pulse">
            Loading supplier performance data...
          </div>
        ) : !detail ? (
          <div className="py-32 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No supplier data found for this ID.</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: formatCurrency(dealer?.revenue), sub: 'Lifetime GMV', color: 'text-emerald-600' },
                    { label: 'Fulfillment Rate', value: `${dealer?.fulfillmentRate ?? 0}%`, sub: 'Dispatched on time', color: 'text-blue-600' },
                    { label: 'Return / RTO Rate', value: `${dealer?.rtoRate ?? 0}%`, sub: 'Of total orders', color: 'text-amber-600' },
                    { label: 'Avg Dispatch Days', value: `${dealer?.avgDispatchDays ?? 0}d`, sub: 'From confirmation', color: 'text-violet-600' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{kpi.label}</span>
                      <span className={`text-2xl font-black block ${kpi.color}`}>{kpi.value}</span>
                      <span className="text-[11px] text-slate-400">{kpi.sub}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-[#16123F] dark:text-white">Contact Information</h3>
                    {dealer?.contact_name && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Building2 className="w-4 h-4 text-slate-400 shrink-0" />{dealer.contact_name}</div>}
                    {dealer?.email && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Mail className="w-4 h-4 text-slate-400 shrink-0" />{dealer.email}</div>}
                    {dealer?.phone && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Phone className="w-4 h-4 text-slate-400 shrink-0" />{dealer.phone}</div>}
                    {dealer?.created_at && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Calendar className="w-4 h-4 text-slate-400 shrink-0" />Joined {new Date(dealer.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs space-y-3">
                    <h3 className="text-sm font-bold text-[#16123F] dark:text-white">SLA Configuration</h3>
                    {[
                      { label: 'Dispatch SLA', value: `${dealer?.sla_dispatch_days ?? 2} days` },
                      { label: 'Delivery SLA', value: `${dealer?.sla_delivery_days ?? 7} days` },
                      { label: 'Return Window', value: `${dealer?.sla_return_window ?? 7} days` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1">
                        <span className="text-xs text-slate-500">{item.label}</span>
                        <span className="text-xs font-bold text-[#16123F] dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'PRODUCTS' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
                {products.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-sm">No products assigned to this supplier.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        {['Product', 'SKU', 'Category', 'Stock', 'Selling Price', 'Status'].map((h) => (
                          <th key={h} className="text-left px-5 py-3 font-bold text-slate-500 uppercase tracking-wide text-[10px]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {products.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3 font-semibold text-[#16123F] dark:text-white">{p.name}</td>
                          <td className="px-5 py-3 font-mono text-slate-500">{p.sku}</td>
                          <td className="px-5 py-3 text-slate-500">{p.category}</td>
                          <td className="px-5 py-3 text-slate-600">{p.stock_quantity ?? 0}</td>
                          <td className="px-5 py-3 text-emerald-600 font-bold">{formatCurrency(p.selling_price)}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'ORDERS' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
                {orders.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-sm">No pending orders in queue.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                          <th key={h} className="text-left px-5 py-3 font-bold text-slate-500 uppercase tracking-wide text-[10px]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {orders.map((o: any) => (
                        <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="px-5 py-3 font-mono text-slate-500">{o.id?.slice(0, 8)}…</td>
                          <td className="px-5 py-3 text-[#16123F] dark:text-white font-semibold">{o.customer_name || o.customerName || '—'}</td>
                          <td className="px-5 py-3 text-emerald-600 font-bold">{formatCurrency(o.total_amount || o.totalAmount)}</td>
                          <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">{o.status}</span></td>
                          <td className="px-5 py-3 text-slate-400">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* QUALITY TAB */}
            {activeTab === 'QUALITY' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Return Ratio', value: `${dealer?.returnRate ?? 0}%`, sub: `${0} returned items`, icon: RotateCcw, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'RTO Ratio', value: `${dealer?.rtoRate ?? 0}%`, sub: `${0} undelivered packages`, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'Refunds Total', value: formatCurrency(dealer?.refundsTotal), sub: 'Total credited to buyers', icon: CircleDollarSign, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'Quality Health', value: (dealer?.returnRate ?? 0) < 5 ? 'EXCELLENT' : (dealer?.returnRate ?? 0) < 15 ? 'GOOD' : 'POOR', sub: 'Threshold: <15%', icon: CheckCircle2, color: (dealer?.returnRate ?? 0) < 5 ? 'text-emerald-600' : 'text-amber-500', bg: (dealer?.returnRate ?? 0) < 5 ? 'bg-emerald-50' : 'bg-amber-50' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-3">{item.label}</span>
                      <span className={`text-2xl font-black block ${item.color}`}>{item.value}</span>
                      <span className="text-[11px] text-slate-400">{item.sub}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* FINANCES TAB */}
            {activeTab === 'FINANCES' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Total Revenue', value: formatCurrency(dealer?.revenue), sub: 'Gross turnover' },
                  { label: 'Total Orders', value: String(dealer?.totalOrders ?? 0), sub: 'Fulfilled shipments' },
                  { label: 'Avg Order Value', value: formatCurrency(dealer?.avgOrderValue), sub: 'Per transaction' },
                  { label: 'Commission Earned', value: formatCurrency((dealer as any)?.commissionEarned), sub: 'Platform commission' },
                  { label: 'Net Payable', value: formatCurrency((dealer as any)?.netPayable), sub: 'After deductions' },
                  { label: 'Pending Payouts', value: formatCurrency((dealer as any)?.pendingPayouts), sub: 'Awaiting settlement' },
                ].map((item) => (
                  <div key={item.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{item.label}</span>
                    <span className="text-xl font-black text-[#16123F] dark:text-white block">{item.value}</span>
                    <span className="text-[11px] text-slate-400">{item.sub}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TRENDS TAB */}
            {activeTab === 'TRENDS' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-[#16123F] dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    30-Day Daily Orders & Fulfillment Trend
                  </h3>
                  <span className="text-[10px] text-slate-400">Database-driven records</span>
                </div>
                {trends.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-sm">No trend data available for this period.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="fulfilled" name="Fulfilled" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="returns" name="Returns" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {slaModalDealer && (
        <DealerSlaConfigModal
          isOpen={Boolean(slaModalDealer)}
          onClose={() => setSlaModalDealer(null)}
          dealer={slaModalDealer}
        />
      )}
      {statusModalDealer && (
        <DealerStatusModal
          isOpen={Boolean(statusModalDealer)}
          onClose={() => setStatusModalDealer(null)}
          dealer={statusModalDealer}
        />
      )}
    </div>
  );
};
