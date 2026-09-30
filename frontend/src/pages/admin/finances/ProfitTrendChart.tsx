import React, { useState } from 'react';
import type { ProfitTrendPoint, ProfitSummary, ExpenseCategorySummary } from '../../../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Calendar, Layers, TrendingUp } from 'lucide-react';

interface ProfitTrendChartProps {
  timeline: ProfitTrendPoint[];
  summary: ProfitSummary | null;
  expenseBreakdown: ExpenseCategorySummary[];
  period: string;
  onPeriodChange: (period: string) => void;
  startDate: string;
  endDate: string;
  onCustomDateChange: (start: string, end: string) => void;
  isLoading: boolean;
}

export const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({
  timeline,
  summary,
  period,
  onPeriodChange,
  startDate,
  endDate,
  onCustomDateChange,
  isLoading,
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  const formatCurrency = (val: number) => {
    const num = Number(val || 0);
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num}`;
  };

  const handlePeriodClick = (p: string) => {
    if (p === 'custom') {
      setShowCustomInputs(true);
      onPeriodChange('custom');
    } else {
      setShowCustomInputs(false);
      onPeriodChange(p);
    }
  };

  const handleApplyCustomDate = () => {
    if (customStart && customEnd) {
      onCustomDateChange(customStart, customEnd);
    }
  };

  const totalRev = summary?.totalRevenue || 1;
  const productCost = summary?.totalProductCost || 0;
  const marketingSpend = summary?.marketingSpend ?? summary?.totalMarketingSpend ?? 0;
  const gatewayFees = summary?.gatewayFees ?? summary?.totalGatewayFees ?? 0;
  const totalExpenses = summary?.totalExpenses ?? summary?.totalOperatingExpenses ?? 0;
  const refunds = summary?.refunds ?? summary?.totalRefunds ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* Main Profit & Revenue Timeline Chart (2 Cols) */}
      <div className="lg:col-span-2 bg-white rounded-[32px] p-6 border border-[#C7DDCC] shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-extrabold text-[#16123F] flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#F0F6F2] text-[#75C9B7]">
                <TrendingUp className="w-4 h-4" />
              </span>
              Profit & Revenue Trend
            </h3>
            <p className="text-xs text-[#555279] mt-0.5 font-medium">
              Daily database performance tracking revenue, operating costs, and actual net profit
            </p>
          </div>

          {/* Period Selector Pills with Theme Colors */}
          <div className="flex items-center gap-1 bg-[#F0F6F2] p-1 rounded-full border border-[#C7DDCC]/70">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodClick(p.id)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-[#FFE26A] text-[#16123F] shadow-xs ring-1 ring-[#FFE26A]/50'
                    : 'text-[#555279] hover:text-[#16123F]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {showCustomInputs && (
          <div className="flex flex-wrap items-center gap-3 p-3 mb-4 bg-[#F8FAF8] rounded-2xl border border-[#C7DDCC]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#555279]">
              <span>From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#555279]">
              <span>To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F]"
              />
            </div>
            <button
              onClick={handleApplyCustomDate}
              className="px-3.5 py-1 text-xs font-bold bg-[#FFE26A] hover:bg-[#ebce58] text-[#16123F] rounded-full transition-colors shadow-xs"
            >
              Apply
            </button>
          </div>
        )}

        {/* Recharts Area Chart */}
        <div className="w-full h-72 pt-2">
          {isLoading && timeline.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-[#555279] text-sm animate-pulse">
              Loading financial trajectory...
            </div>
          ) : timeline.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#555279] text-sm">
              <Calendar className="w-8 h-8 mb-2 opacity-40 text-[#75C9B7]" />
              <span>No order or expense records found for this period</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGradTheme" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#75C9B7" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#75C9B7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="revGradTheme" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16123F" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16123F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#C7DDCC" opacity={0.6} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#555279', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  tick={{ fill: '#555279', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white text-[#16123F] p-3 rounded-2xl border border-[#C7DDCC] shadow-lg text-xs space-y-1 font-medium">
                          <div className="font-extrabold text-[#16123F] pb-1 border-b border-[#F0F6F2]">
                            {label}
                          </div>
                          {payload.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex justify-between gap-4">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-bold">
                                ₹{Number(entry.value).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={30}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#16123F"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revGradTheme)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses + Costs"
                  stroke="#E15B64"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Profit"
                  stroke="#75C9B7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#profitGradTheme)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Financial Breakdown & Cost Distribution (1 Col) */}
      <div className="bg-white rounded-[32px] p-6 border border-[#C7DDCC] shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#16123F] flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-[#F0F6F2] text-[#75C9B7]">
              <Layers className="w-4 h-4" />
            </span>
            Cost Distribution
          </h3>
          <p className="text-xs text-[#555279] mb-5 font-medium">
            Deductions from gross revenue for selected window
          </p>

          <div className="space-y-4">
            {/* 1. Product COGS */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#16123F]">Product Cost (COGS)</span>
                <span className="text-[#16123F] font-black">
                  ₹{Number(productCost).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2 bg-[#F0F6F2] rounded-full overflow-hidden border border-[#C7DDCC]/50">
                <div
                  className="h-full bg-[#75C9B7] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (productCost / totalRev) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* 2. Marketing & Ads */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#16123F]">Marketing & Ads</span>
                <span className="text-[#16123F] font-black">
                  ₹{Number(marketingSpend).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2 bg-[#F0F6F2] rounded-full overflow-hidden border border-[#C7DDCC]/50">
                <div
                  className="h-full bg-[#FFE26A] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (marketingSpend / totalRev) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* 3. Operations & Software */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#16123F]">Operations & Software</span>
                <span className="text-[#16123F] font-black">
                  ₹{Number(totalExpenses - marketingSpend > 0 ? totalExpenses - marketingSpend : 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2 bg-[#F0F6F2] rounded-full overflow-hidden border border-[#C7DDCC]/50">
                <div
                  className="h-full bg-[#ABD699] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, ((totalExpenses - marketingSpend) / totalRev) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* 4. Payment Gateway (2%) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#16123F]">Payment Gateway Fee (2%)</span>
                <span className="text-[#16123F] font-black">
                  ₹{Number(gatewayFees).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2 bg-[#F0F6F2] rounded-full overflow-hidden border border-[#C7DDCC]/50">
                <div
                  className="h-full bg-[#16123F] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (gatewayFees / totalRev) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* 5. Returns & Refunds */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#16123F]">Refunds & Returns</span>
                <span className="text-[#16123F] font-black">
                  ₹{Number(refunds).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2 bg-[#F0F6F2] rounded-full overflow-hidden border border-[#C7DDCC]/50">
                <div
                  className="h-full bg-[#E15B64] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (refunds / totalRev) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#C7DDCC]/70 flex justify-between items-center text-xs">
          <span className="text-[#555279] font-medium">Effective Margin Retention</span>
          <span className="font-black text-[#16123F] bg-[#FFE26A] px-2.5 py-0.5 rounded-full shadow-xs">
            {summary?.profitMargin?.toFixed(1) || 0}%
          </span>
        </div>
      </div>
    </div>
  );
};
