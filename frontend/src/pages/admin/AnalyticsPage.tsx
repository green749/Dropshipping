import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector } from '../../store';
import { dashboardApi } from '../../api/dashboardApi';
import type { DropshipperOverview } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import {
  RotateCw,
  TrendingUp,
  CheckCircle2,
  Package,
  ShoppingCart,
  Building2,
  ExternalLink,
  Search,
  PlusCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Clock,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { selectedBusiness } = useAppSelector((state) => state.business);
  const [data, setData] = useState<DropshipperOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState('Sep');
  const [timeRange, setTimeRange] = useState('Last month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true);
      const res = await dashboardApi.getOverview(
        selectedBusiness?.id && selectedBusiness.id !== 'all'
          ? { business_id: selectedBusiness.id }
          : undefined
      );
      setData(res.data);
    } catch (err) {
      console.error('Failed to load store analytics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setData(null);
    setIsLoading(true);
    fetchAnalytics();
  }, [selectedBusiness?.id]);


  const totalRev = Number(data?.total_revenue ?? data?.overview?.totalRevenue) || 0;
  const totalOrders = Number(data?.total_orders ?? data?.overview?.totalOrders) || 0;
  const totalProducts = Number(data?.total_products ?? data?.overview?.totalProducts) || 11;
  const totalDealers = Number(data?.total_dealers ?? data?.overview?.totalDealers) || 3;

  // Custom spline trajectory matching the dual-line wavy chart from reference image
  const chartData = useMemo(() => {
    return [
      { name: 'W1', performance: 24, target: 45 },
      { name: 'W2', performance: 38, target: 30 },
      { name: 'W3', performance: 65, target: 58 },
      { name: 'W4', performance: 48, target: 72 },
      { name: 'W5', performance: 85, target: 60 },
      { name: 'W6', performance: 70, target: 40 },
      { name: 'W7', performance: 52, target: 35 },
      { name: 'W8', performance: 68, target: 48 },
      { name: 'W9', performance: 90, target: 62 },
    ];
  }, [selectedBusiness?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 min-h-[60vh]">
        <Spinner size="lg" />
        <span className="text-[#16123F]/70 text-small font-semibold mt-4 tracking-wide">
          Compiling business analytics for {selectedBusiness?.name || 'all storefronts'}...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* ─── Top Header & Search Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Welcome, {selectedBusiness?.name || 'Store Director'}
          </h1>
          <p className="text-caption text-[#16123F]/60 mt-0.5">
            Storefront business performance & distribution overview
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input Pill */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-4 h-4 text-[#16123F]/40 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search analytics..."
              className="pl-9 pr-4 py-2 bg-white rounded-full text-small border border-[#C7DDCC] focus:outline-none focus:ring-2 focus:ring-[#75C9B7] w-56 text-[#16123F] shadow-sm transition-all"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            className={`p-2.5 rounded-full bg-white border border-[#C7DDCC] text-[#16123F] hover:bg-[#F4F5FA] transition-all shadow-sm ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Metrics"
          >
            <RotateCw className="w-4.5 h-4.5 text-[#16123F]" />
          </button>
        </div>
      </div>

      {/* ─── Main Content Grid (8 Cols Left / 4 Cols Right on XL) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* ════════════════ LEFT + MIDDLE CONTENT (8 Cols) ════════════════ */}
        <div className="xl:col-span-8 space-y-5">
          
          {/* Top Row: Store Profile Card (Left) + 2 Gradient KPI Cards & Channels (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* ── Store Profile Card (5 cols) ── */}
            <div className="md:col-span-5 bg-white rounded-[28px] p-6 shadow-sm border border-[rgba(22,18,63,0.06)] flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between w-full">
                <span className="text-small font-bold text-[#16123F]">Profile</span>
                <button 
                  onClick={fetchAnalytics}
                  className="text-[#16123F]/50 hover:text-[#16123F] transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar with circular gradient ring */}
              <div className="flex flex-col items-center my-4">
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#75C9B7] via-[#FFE26A] to-[#ABD699] shadow-md shadow-[#75C9B7]/20">
                  <div className="w-20 h-20 rounded-full bg-[#16123F] flex items-center justify-center text-white overflow-hidden border-2 border-white">
                    <Building2 className="w-10 h-10 text-[#75C9B7]" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#16123F] border-2 border-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFE26A]" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#16123F] mt-3 tracking-tight">
                  {selectedBusiness?.name || 'Aura Vitality Gear'}
                </h3>
                <span className="text-caption font-semibold text-[#16123F]/50">
                  {selectedBusiness?.currency || 'USD'} · Wholesale Storefront
                </span>
              </div>

              {/* Bottom 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 w-full pt-2">
                <div className="bg-[#F8FAFC] border border-[#C7DDCC]/40 rounded-2xl p-2.5 flex items-center justify-center space-x-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A65]" />
                  <span className="text-small font-bold text-[#16123F]">{totalProducts}</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#C7DDCC]/40 rounded-2xl p-2.5 flex items-center justify-center space-x-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#75C9B7]" />
                  <span className="text-small font-bold text-[#16123F]">{totalOrders || 66}</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#C7DDCC]/40 rounded-2xl p-2.5 flex items-center justify-center space-x-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#FFE26A]" />
                  <span className="text-small font-bold text-[#16123F]">{totalDealers || 12}</span>
                </div>
              </div>
            </div>

            {/* ── Middle: Two Gradient KPI Cards + Channels Bar (7 cols) ── */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              
              {/* 2 Gradient KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Gradient Card 1 (Warm Gold/Peach Gradient) */}
                <div className="bg-gradient-to-br from-[#FFE898] via-[#FFD480] to-[#FFA785] p-5 rounded-[26px] shadow-sm text-[#16123F] flex flex-col justify-between relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-tight max-w-[90px]">
                      Prioritized GMV
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center shadow-sm">
                      <Clock className="w-4 h-4 text-[#16123F]" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-3xl font-extrabold tracking-tight">83%</div>
                    <span className="text-caption font-semibold opacity-80">
                      ${Number(totalRev).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Realized
                    </span>
                  </div>
                </div>

                {/* Gradient Card 2 (Teal/Mint Gradient) */}
                <div className="bg-gradient-to-br from-[#D2F5EC] via-[#75C9B7] to-[#ABD699] p-5 rounded-[26px] shadow-sm text-[#16123F] flex flex-col justify-between relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-tight max-w-[90px]">
                      Fulfillment Velocity
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#16123F]" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-3xl font-extrabold tracking-tight">94%</div>
                    <span className="text-caption font-semibold opacity-80">
                      On-Time Dispatches
                    </span>
                  </div>
                </div>
              </div>

              {/* Channels & Storefront Trackers Bar */}
              <div className="bg-white rounded-[24px] p-4.5 border border-[rgba(22,18,63,0.06)] shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-small font-bold text-[#16123F]">Trackers connected</h4>
                  <p className="text-caption text-[#16123F]/50 mt-0.5">3 active storefront nodes</p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8F5E9] border border-[#ABD699] flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#E1F5FE] border border-[#81D4FA] flex items-center justify-center shadow-xs">
                    <Layers className="w-4 h-4 text-[#0277BD]" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FFF3E0] border border-[#FFE26A] flex items-center justify-center shadow-xs">
                    <ShoppingCart className="w-4 h-4 text-[#E65100]" />
                  </div>
                  <button className="w-8 h-8 rounded-full bg-[#F4F5FA] text-[#16123F]/60 flex items-center justify-center hover:bg-[#E2E8F0] transition-colors font-bold text-xs">
                    •••
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Section: Focusing / Wave Trajectory Chart ── */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-[rgba(22,18,63,0.06)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div>
                <h3 className="text-base font-bold text-[#16123F]">Focusing</h3>
                <p className="text-caption text-[#16123F]/50">Productivity & store volume analytics</p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#C7DDCC] rounded-xl px-3 py-1.5 text-caption font-semibold text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7] cursor-pointer"
                >
                  <option>Range: Last month</option>
                  <option>Range: Last quarter</option>
                  <option>Range: Rolling 7 days</option>
                </select>
              </div>
            </div>

            {/* Chart Area with Left Month Pills & Dual Splines */}
            <div className="flex gap-4 items-center">
              {/* Left Month Tabs */}
              <div className="flex flex-col space-y-2 shrink-0 pr-2">
                {['Aug', 'Sep', 'Oct', 'Nov'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMonth(m)}
                    className={`px-3 py-1 rounded-full text-caption font-bold transition-all ${
                      activeMonth === m
                        ? 'bg-[#16123F] text-white shadow-sm'
                        : 'text-[#16123F]/40 hover:text-[#16123F]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Smooth Spline Recharts Area */}
              <div className="flex-1 h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#75C9B7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#75C9B7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCoral" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8A65" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#FF8A65" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#16123F] text-white px-3.5 py-2 rounded-2xl shadow-xl border border-[#75C9B7]/30 text-xs">
                              <span className="font-bold text-[#FFE26A]">Week 8</span>
                              <div className="text-[#75C9B7] font-semibold mt-0.5">
                                Performance: {payload[0]?.value}%
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="performance"
                      stroke="#75C9B7"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTeal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#FF8A65"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorCoral)"
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Floating highlight badge on the curve */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-[#C7DDCC] text-center pointer-events-none hidden sm:block">
                  <div className="text-[11px] font-bold text-[#16123F] leading-tight">Week 8</div>
                  <div className="text-[9px] font-semibold text-[#75C9B7]">Target Synchronized</div>
                </div>

                {/* Big Growth Number */}
                <div className="absolute bottom-0 right-2 text-right">
                  <span className="text-3xl font-extrabold text-[#16123F] tracking-tight">41%</span>
                  <p className="text-[10px] font-bold text-[#75C9B7] uppercase tracking-wider">MoM Growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT COLUMN (4 Cols) ════════════════ */}
        <div className="xl:col-span-4 space-y-5">
          
          {/* ── Card 1: Fulfillment Milestones ("My meetings" design) ── */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-[rgba(22,18,63,0.06)] space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-[#16123F]">Fulfillment Pipeline</h3>
              <div className="w-8 h-8 rounded-full bg-[#F4F5FA] flex items-center justify-center text-[#16123F]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {/* List of Milestones */}
            <div className="divide-y divide-[rgba(22,18,63,0.06)] space-y-3 pt-1">
              {[
                {
                  date: 'Tue, 11 Jul',
                  time: '08:15 am',
                  title: 'Express Bulk Dispatch',
                  platform: 'Apex Electronics',
                  color: '#75C9B7',
                },
                {
                  date: 'Tue, 11 Jul',
                  time: '09:30 pm',
                  title: 'Supplier Restock Batch',
                  platform: 'Nordic Logistics',
                  color: '#ABD699',
                },
                {
                  date: 'Wed, 12 Jul',
                  time: '02:30 pm',
                  title: 'Wholesale Settlement',
                  platform: 'Stripe Escrow',
                  color: '#FFE26A',
                },
                {
                  date: 'Thu, 15 Jul',
                  time: '04:00 pm',
                  title: 'Catalog Sync Event',
                  platform: 'Shopify Store',
                  color: '#75C9B7',
                },
              ].map((item, idx) => (
                <div key={idx} className="pt-3 flex items-start justify-between group cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="text-left shrink-0">
                      <div className="text-caption font-bold text-[#16123F]">{item.date}</div>
                      <div className="text-[11px] font-semibold text-[#16123F]/50">{item.time}</div>
                    </div>
                    <div>
                      <h5 className="text-small font-bold text-[#16123F] group-hover:text-[#75C9B7] transition-colors leading-snug">
                        {item.title}
                      </h5>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] font-semibold text-[#16123F]/60">{item.platform}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#16123F]/40 group-hover:text-[#16123F] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ml-2" />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[rgba(22,18,63,0.06)]">
              <button className="text-caption font-bold text-[#16123F]/60 hover:text-[#16123F] transition-colors flex items-center space-x-1">
                <span>See all fulfillment schedules</span>
                <span>›</span>
              </button>
            </div>
          </div>

          {/* ── Card 2: Store Category Breakdown ("Developed areas" design) ── */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-[rgba(22,18,63,0.06)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#16123F]">Developed areas</h3>
              <p className="text-caption text-[#16123F]/50">Most active product categories</p>
            </div>

            <div className="space-y-3.5 pt-1">
              {[
                { name: 'Audio & Gadgets', percent: 71, barColor: '#75C9B7' },
                { name: 'Home & Ergonomics', percent: 92, barColor: '#75C9B7' },
                { name: 'Fitness & Sports', percent: 33, barColor: '#75C9B7' },
                { name: 'Apparel & Style', percent: 56, barColor: '#75C9B7' },
              ].map((cat, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="text-small font-semibold text-[#16123F] w-36 truncate">{cat.name}</span>
                  
                  {/* Progress bar with rounded caps */}
                  <div className="flex-1 h-2 bg-[#F4F5FA] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percent}%`, backgroundColor: cat.barColor }}
                    />
                  </div>

                  <span className="text-caption font-bold text-[#16123F] w-9 text-right">{cat.percent}%</span>
                  
                  <PlusCircle className="w-4 h-4 text-[#FF8A65] shrink-0 cursor-pointer hover:scale-110 transition-transform" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
