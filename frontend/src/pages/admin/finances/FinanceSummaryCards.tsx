import React from 'react';
import type { ProfitSummary } from '../../../types';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FinanceSummaryCardsProps {
  summary: ProfitSummary | null;
  isLoading: boolean;
}

export const FinanceSummaryCards: React.FC<FinanceSummaryCardsProps> = ({ summary, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const netProfit = summary?.netProfit ?? 0;
  const isProfitable = netProfit >= 0;
  const margin = summary?.profitMargin ?? 0;
  const totalOrders = summary?.totalOrdersCount ?? summary?.orderCount ?? 0;
  const gatewayFee = summary?.gatewayFees ?? summary?.totalGatewayFees ?? 0;
  const marketingSpend = summary?.marketingSpend ?? summary?.totalMarketingSpend ?? 0;
  const operatingExpenses = summary?.totalExpenses ?? summary?.totalOperatingExpenses ?? 0;

  if (isLoading && !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[28px] border border-[#C7DDCC] p-6 shadow-xs animate-pulse h-36"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {/* 1. Net Profit Card (Theme Midnight #16123F with Gold/Mint Accents) */}
      <div className="bg-[#16123F] text-white p-6 rounded-[28px] border border-[#16123F] shadow-md flex flex-col justify-between relative overflow-hidden group">
        {/* Glow backdrop subtle effect */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#75C9B7]/15 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <span className="text-[11px] font-black tracking-wider uppercase text-[#FFE26A]">
            Net Profit (Actual)
          </span>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              isProfitable
                ? 'bg-[#75C9B7] text-[#16123F]'
                : 'bg-rose-500/30 text-rose-300'
            }`}
          >
            {isProfitable ? <ArrowUpRight className="w-4 h-4 font-bold" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        </div>

        <div className="my-2 z-10">
          <div className="text-2xl font-black tracking-tight text-white">
            {formatCurrency(netProfit)}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs z-10 pt-1 border-t border-white/10">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
              margin >= 20
                ? 'bg-[#FFE26A] text-[#16123F]'
                : margin >= 0
                ? 'bg-[#ABD699] text-[#16123F]'
                : 'bg-rose-500/30 text-rose-300'
            }`}
          >
            {Number(margin || 0).toFixed(1)}% Margin
          </span>
          <span className="text-white/70 text-[11px] font-medium">
            ₹{summary?.profitPerOrder != null ? Number(summary.profitPerOrder).toFixed(0) : '0'} / order
          </span>
        </div>
      </div>

      {/* 2. Total Gross Revenue (Theme Card) */}
      <div className="bg-white rounded-[28px] border border-[#C7DDCC] p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#555279]">
            Total Revenue
          </span>
          <div className="w-7 h-7 rounded-full bg-[#F0F6F2] text-[#16123F] flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-[#75C9B7]" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-2xl font-black text-[#16123F] tracking-tight">
            {formatCurrency(summary?.totalRevenue ?? 0)}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#555279] pt-2 border-t border-[#F0F6F2] font-medium">
          <span>{totalOrders} Orders</span>
          <span>AOV: {formatCurrency(summary?.averageOrderValue ?? 0)}</span>
        </div>
      </div>

      {/* 3. Gross Profit (Revenue - COGS) */}
      <div className="bg-white rounded-[28px] border border-[#C7DDCC] p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#555279]">
            Gross Profit
          </span>
          <div className="w-7 h-7 rounded-full bg-[#F0F6F2] text-[#75C9B7] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {formatCurrency(summary?.grossProfit ?? 0)}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#555279] pt-2 border-t border-[#F0F6F2] font-medium">
          <span>COGS: {formatCurrency(summary?.totalProductCost ?? 0)}</span>
          <span>Gateway (2%): {formatCurrency(gatewayFee)}</span>
        </div>
      </div>

      {/* 4. Total Expenses & Ads */}
      <div className="bg-white rounded-[28px] border border-[#C7DDCC] p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#555279]">
            Total Expenses & Ads
          </span>
          <div className="w-7 h-7 rounded-full bg-[#F0F6F2] text-[#16123F] flex items-center justify-center">
            <Receipt className="w-4 h-4 text-[#FFE26A]" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-2xl font-black text-[#16123F] tracking-tight">
            {formatCurrency(operatingExpenses)}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#555279] pt-2 border-t border-[#F0F6F2] font-medium">
          <span>Ads: {formatCurrency(marketingSpend)}</span>
          <span>Ops: {formatCurrency(operatingExpenses - marketingSpend > 0 ? operatingExpenses - marketingSpend : 0)}</span>
        </div>
      </div>
    </div>
  );
};
