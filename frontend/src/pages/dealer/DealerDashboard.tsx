import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrders } from '../../store/slices/orderSlice';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchDealerDashboard } from '../../store/slices/dashboardSlice';
import { fetchBusinesses } from '../../store/slices/businessSlice';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Truck,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Boxes,
  ShieldCheck,
  Timer,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const DealerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.order);
  const { products } = useAppSelector((state) => state.product);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);
  const { dealerData } = useAppSelector((state) => state.dashboard);



  const [activeBusinessContext, setActiveBusinessContext] = useState<string>('ALL');
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d' | 'month'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [rightPanelTab, setRightPanelTab] = useState<'queue' | 'inventory'>('queue');

  // Update clock every minute for accurate SLA countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);
    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchDealerDashboard(params));
    dispatch(fetchOrders(params));
    dispatch(fetchProducts(params));
    dispatch(fetchBusinesses());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    refreshData();
  }, [dispatch, selectedBusiness?.id]);

  const assignedProductsCount =
    products.length > 0
      ? products.length
      : (dealerData?.totalProducts ?? dealerData?.assigned_products ?? 0);

  const totalStockUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.stock_quantity ?? 0), 0);
  }, [products]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => ['PENDING', 'ACCEPTED', 'PROCESSING', 'NEW'].includes(o.status));
  }, [orders]);

  const totalSales =
    dealerData?.total_sales ?? dealerData?.totalEarnings ?? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const lowStockItems = useMemo(() => {
    return products.filter((p) => (p.stock_quantity ?? 0) <= 10);
  }, [products]);

  const filteredOrders = useMemo(() => {
    if (activeBusinessContext === 'ALL') return orders;
    return orders.filter((o) => o.business_id === activeBusinessContext);
  }, [orders, activeBusinessContext]);

  // Dynamic user initials
  const userInitials = useMemo(() => {
    if (!user?.name) return 'DL';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  // Categories stock breakdown for inventory progress
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; totalStock: number }> = {};
    const totalCatalogStock = products.reduce((s, p) => s + (p.stock_quantity ?? 0), 0);

    products.forEach((p) => {
      const cat = p.category || 'General';
      if (!map[cat]) map[cat] = { count: 0, totalStock: 0 };
      map[cat].count += 1;
      map[cat].totalStock += p.stock_quantity ?? 0;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      stock: data.totalStock,
      percentage: totalCatalogStock > 0 ? Math.round((data.totalStock / totalCatalogStock) * 100) : 0,
    })).slice(0, 4);
  }, [products]);

  // Real 7d / 30d / Quarter Velocity from database
  const velocityData = useMemo(() => {
    const now = new Date();
    const buckets: Array<{ label: string; revenue: number; dispatches: number; dateStart: Date; dateEnd: Date }> = [];
    
    if (chartTimeframe === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        buckets.push({ label, revenue: 0, dispatches: 0, dateStart: start, dateEnd: end });
      }
    } else if (chartTimeframe === '30d') {
      for (let i = 3; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const label = `W${4 - i}`;
        buckets.push({ label, revenue: 0, dispatches: 0, dateStart: start, dateEnd: end });
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 18 * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 18 * 24 * 60 * 60 * 1000);
        const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        buckets.push({ label, revenue: 0, dispatches: 0, dateStart: start, dateEnd: end });
      }
    }

    filteredOrders.forEach((o) => {
      const oDate = new Date(o.created_at || Date.now()).getTime();
      const amt = parseFloat(String(o.total_amount || 0)) || 0;
      const isDispatched = o.status === 'DELIVERED' || o.status === 'SHIPPED';
      
      for (const b of buckets) {
        if (oDate >= b.dateStart.getTime() && oDate <= b.dateEnd.getTime()) {
          b.revenue += amt;
          if (isDispatched) b.dispatches += 1;
          break;
        }
      }
    });

    const maxRev = Math.max(...buckets.map((b) => b.revenue), 10);
    const maxDisp = Math.max(...buckets.map((b) => b.dispatches), 1);

    const pointsRev = buckets.map((b, idx) => {
      const x = Math.round((idx / (buckets.length - 1 || 1)) * 500);
      const y = totalSales > 0 ? Math.round(140 - (b.revenue / maxRev) * 110) : 140;
      return { x, y, val: b.revenue };
    });

    const pointsDisp = buckets.map((b, idx) => {
      const x = Math.round((idx / (buckets.length - 1 || 1)) * 500);
      const y = filteredOrders.length > 0 ? Math.round(140 - (b.dispatches / maxDisp) * 110) : 140;
      return { x, y, val: b.dispatches };
    });

    let pathRev = `M ${pointsRev[0].x} ${pointsRev[0].y}`;
    let pathDisp = `M ${pointsDisp[0].x} ${pointsDisp[0].y}`;
    for (let i = 1; i < pointsRev.length; i++) {
      const p1 = pointsRev[i - 1];
      const p2 = pointsRev[i];
      const midX = (p1.x + p2.x) / 2;
      pathRev += ` C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;

      const d1 = pointsDisp[i - 1];
      const d2 = pointsDisp[i];
      pathDisp += ` C ${midX} ${d1.y}, ${midX} ${d2.y}, ${d2.x} ${d2.y}`;
    }

    const areaRev = `${pathRev} L 500 150 L 0 150 Z`;
    const areaDisp = `${pathDisp} L 500 150 L 0 150 Z`;

    let peakIdx = 0;
    let peakUnits = 0;
    buckets.forEach((b, idx) => {
      if (b.dispatches > peakUnits) {
        peakUnits = b.dispatches;
        peakIdx = idx;
      }
    });

    return {
      buckets,
      pointsRev,
      pointsDisp,
      pathRev,
      pathDisp,
      areaRev,
      areaDisp,
      peakLabel: buckets[peakIdx]?.label,
      peakUnits,
      peakPoint: pointsDisp[peakIdx],
    };
  }, [filteredOrders, chartTimeframe, totalSales]);

  // Live on-time dispatch rate
  const onTimeRate = useMemo(() => {
    const fulfilled = filteredOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'SHIPPED');
    if (fulfilled.length === 0) return 100;
    const onTime = fulfilled.filter((o) => {
      const created = new Date(o.created_at || Date.now()).getTime();
      const updated = new Date(o.updated_at || o.created_at || Date.now()).getTime();
      return (updated - created) <= 48 * 3600 * 1000;
    });
    return Math.round((onTime.length / fulfilled.length) * 100);
  }, [filteredOrders]);

  // Calculate live SLA remaining
  const getSlaRemainingText = (order: any) => {
    const assignedTime = order.assigned_at ? new Date(order.assigned_at).getTime() : new Date(order.created_at).getTime();
    const slaHours = 48;
    const deadline = assignedTime + slaHours * 3600 * 1000;
    const diffMs = deadline - currentTime.getTime();

    if (diffMs <= 0) {
      return { text: 'SLA BREACHED', isBreached: true };
    }

    const hours = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    return { text: `${hours}h ${mins}m left`, isBreached: false };
  };

  return (
    <div className="space-y-3.5 pb-2 animate-fade-in text-slate-800 max-w-full">
      {/* ─── 1. Ultra-Compact Header with Integrated Store Outlet Filter ─── */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#16123F] to-[#2E2868] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                <span>Operations Center</span>
                <span className="text-slate-300 font-normal">•</span>
                <span className="text-[#16123F] capitalize font-bold text-sm sm:text-base">
                  {user?.name || 'Dealer'}
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Node
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Supply chain dispatch, SLA compliance, and stock metrics
            </p>
          </div>
        </div>

        {/* Store Filter + Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Store Pills */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setActiveBusinessContext('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeBusinessContext === 'ALL'
                  ? 'bg-[#16123F] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Stores ({businesses.length})
            </button>
            {businesses.slice(0, 2).map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBusinessContext(b.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeBusinessContext === b.id
                    ? 'bg-[#75C9B7] text-[#16123F] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          <button
            onClick={refreshData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/dealer/orders')}
            className="px-3.5 py-1.5 rounded-xl bg-[#75C9B7] hover:bg-[#5eb6a3] text-[#16123F] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-[#16123F]" />
            <span>Fulfill</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Key Metrics Row: 4 Balanced Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Pending Dispatches */}
        <div 
          onClick={() => navigate('/dealer/orders')}
          className="bg-gradient-to-br from-[#FF9A8B] via-[#FF6A88] to-[#FF99AC] rounded-2xl p-4 text-white shadow-xs relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
              Pending Queue
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight">
              {pendingOrders.length}
            </div>
            <p className="text-[10px] text-white/90 font-medium">Awaiting warehouse packaging</p>
          </div>
          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
            <span className="text-white/80">SLA: 48 hrs</span>
            <span className="font-bold underline flex items-center gap-0.5">Dispatch &rarr;</span>
          </div>
        </div>

        {/* Metric 2: Catalog Ready SKUs */}
        <div 
          onClick={() => navigate('/dealer/products')}
          className="bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1] rounded-2xl p-4 text-white shadow-xs relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
              Catalog Readiness
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Boxes className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight">
              {assignedProductsCount} <span className="text-sm font-semibold text-white/80">SKUs</span>
            </div>
            <p className="text-[10px] text-white/90 font-medium truncate">
              {totalStockUnits.toLocaleString()} total units in supply
            </p>
          </div>
          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
            <span className="text-white/80">Supply Active</span>
            <span className="font-bold underline flex items-center gap-0.5">Manage &rarr;</span>
          </div>
        </div>

        {/* Metric 3: Wholesale Realized Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Wholesale Revenue
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums tracking-tight">
              ₹{Number(totalSales).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Realized wholesale value</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>{filteredOrders.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED').length} Dispatches</span>
            <span className="font-bold text-slate-700">₹ Active</span>
          </div>
        </div>

        {/* Metric 4: Compliance & On-Time Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              SLA Compliance
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums tracking-tight">
              {onTimeRate}%
            </div>
            <p className="text-[10px] text-slate-500 font-medium">48h fulfillment standard</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>{businesses.length} Outlets</span>
            <span className="font-bold text-emerald-600">Top Tier Node</span>
          </div>
        </div>
      </div>

      {/* ─── 3. Main Split View: Velocity Chart (Left) + Queue / Inventory Hub (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left (7 cols): Fulfillment & Revenue Velocity */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Fulfillment & Velocity Trends</span>
                {totalSales > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Live
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">Wholesale revenue vs. dispatch throughput</p>
            </div>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setChartTimeframe('7d')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  chartTimeframe === '7d' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setChartTimeframe('30d')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  chartTimeframe === '30d' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setChartTimeframe('month')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  chartTimeframe === 'month' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Quarter
              </button>
            </div>
          </div>

          {/* SVG Smooth Curve */}
          <div className="relative w-full h-36 sm:h-44 my-1">
            {velocityData.peakUnits > 0 && (
              <div
                style={{
                  left: `${Math.min(80, Math.max(20, (velocityData.peakPoint.x / 500) * 100))}%`,
                  top: `${Math.max(5, (velocityData.peakPoint.y / 150) * 100 - 15)}%`,
                }}
                className="absolute -translate-x-1/2 px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs flex items-center gap-1 z-10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-slate-700">
                  {velocityData.peakLabel} • Peak ({velocityData.peakUnits} u)
                </span>
              </div>
            )}

            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 150"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="curveGradRev" x1="0%" y1="0%" x2="0%" y2="1">
                  <stop offset="0%" stopColor="#75C9B7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#75C9B7" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="curveGradDisp" x1="0%" y1="0%" x2="0%" y2="1">
                  <stop offset="0%" stopColor="#FF7E5F" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#FF7E5F" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="30" x2="500" y2="30" stroke="#F8FAFC" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#F8FAFC" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#F8FAFC" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="145" x2="500" y2="145" stroke="#F1F5F9" strokeWidth="1" />

              <path d={velocityData.areaRev} fill="url(#curveGradRev)" />
              <path d={velocityData.areaDisp} fill="url(#curveGradDisp)" />
              <path d={velocityData.pathRev} fill="none" stroke="#38b2ac" strokeWidth="2.8" strokeLinecap="round" />
              <path d={velocityData.pathDisp} fill="none" stroke="#FF6B8B" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 uppercase">
            {velocityData.buckets.map((b) => (
              <span key={b.label} className={b.label === velocityData.peakLabel && velocityData.peakUnits > 0 ? 'text-indigo-600 font-extrabold' : ''}>
                {b.label}
              </span>
            ))}
          </div>

          {/* Mini Legend Footer */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#38b2ac]" />
                Revenue: ₹{Number(totalSales).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#FF6B8B]" />
                Dispatches: {filteredOrders.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED').length}
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600">
              {onTimeRate}% On-Time
            </span>
          </div>
        </div>

        {/* Right (5 cols): Toggleable Operations Hub (Live Queue / Stock Breakdown) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            {/* Header Tabs */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRightPanelTab('queue')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    rightPanelTab === 'queue'
                      ? 'bg-[#16123F] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Dispatch Queue ({filteredOrders.length})</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('inventory')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    rightPanelTab === 'inventory'
                      ? 'bg-[#16123F] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Inventory Health</span>
                </button>
              </div>

              <button
                onClick={() => navigate(rightPanelTab === 'queue' ? '/dealer/orders' : '/dealer/products')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TAB 1: Dispatch Queue */}
            {rightPanelTab === 'queue' && (
              filteredOrders.length === 0 ? (
                <div className="text-center py-6 px-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-80" />
                  <p className="text-xs font-bold text-slate-700">All Dispatches Clear</p>
                  <p className="text-[10px] text-slate-400">No pending orders assigned right now.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOrders.slice(0, 3).map((o) => {
                    const sla = getSlaRemainingText(o);
                    return (
                      <div
                        key={o.id}
                        onClick={() => navigate('/dealer/orders')}
                        className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-100 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs">
                            <span className="text-[8px] font-bold text-slate-400">ORD</span>
                            <span className="text-[10px] font-extrabold text-slate-800 leading-none">
                              {o.order_number ? o.order_number.slice(-3) : '##'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">{o.order_number}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                                o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              {sla.isBreached ? (
                                <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded flex items-center gap-0.5">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  {sla.text}
                                </span>
                              ) : (
                                <span className="bg-slate-100 px-1 rounded flex items-center gap-0.5">
                                  <Timer className="w-2.5 h-2.5 text-indigo-500" />
                                  {sla.text}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                            ₹{Number(o.total_amount || 0).toLocaleString()}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* TAB 2: Inventory Health */}
            {rightPanelTab === 'inventory' && (
              <div className="space-y-2.5">
                {categoryStats.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No catalog SKUs found.</p>
                ) : (
                  categoryStats.map((cat, idx) => {
                    const colors = ['bg-blue-500', 'bg-[#75C9B7]', 'bg-indigo-500', 'bg-amber-500'];
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-bold">
                            {cat.stock} units ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Notice Pill at bottom */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            {lowStockItems.length > 0 ? (
              <div className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md w-full justify-between">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  {lowStockItems.length} SKUs low stock (≤10 units)
                </span>
                <button
                  onClick={() => navigate('/dealer/products')}
                  className="font-bold underline hover:text-amber-900 cursor-pointer"
                >
                  Restock
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md w-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                All supplier catalog stock levels verified optimal
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
