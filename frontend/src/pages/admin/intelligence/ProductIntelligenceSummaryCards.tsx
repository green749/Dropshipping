import React from 'react';
import type { ProductIntelligenceSummary } from '../../../types';
import {
  Package,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Flame,
  DollarSign,
  Boxes,
  RotateCcw,
  Clock,
} from 'lucide-react';

interface ProductIntelligenceSummaryCardsProps {
  summary: ProductIntelligenceSummary | null;
  isLoading?: boolean;
}

export const ProductIntelligenceSummaryCards: React.FC<ProductIntelligenceSummaryCardsProps> = ({
  summary,
  isLoading = false,
}) => {
  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 animate-pulse">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Catalog',
      value: summary?.totalProducts ?? 0,
      subtext: `${summary?.activeProducts ?? 0} active in catalog`,
      icon: Package,
      iconBg: 'bg-[#16123F]',
      iconColor: 'text-white',
      accentColor: 'border-[#C7DDCC]',
    },
    {
      title: 'Active Products',
      value: summary?.activeProducts ?? 0,
      subtext: 'Catalog available for sale',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      accentColor: 'border-emerald-200',
    },
    {
      title: 'Products With Sales',
      value: summary?.productsWithSales ?? 0,
      subtext: `${summary?.timeframe || '30d'} active demand`,
      icon: Flame,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      accentColor: 'border-amber-200',
    },
    {
      title: 'Products No Sales',
      value: summary?.productsWithNoSales ?? 0,
      subtext: 'Zero orders in period',
      icon: Clock,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-500',
      accentColor: 'border-slate-200',
    },
    {
      title: 'Low Stock Alert',
      value: summary?.lowStockProducts ?? 0,
      subtext: 'At or below reorder level',
      icon: AlertTriangle,
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      accentColor: 'border-rose-200',
    },
    {
      title: 'Out of Stock',
      value: summary?.outOfStockProducts ?? 0,
      subtext: '0 inventory available',
      icon: Boxes,
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-700',
      accentColor: 'border-rose-300',
    },
    {
      title: 'High Return Ratio',
      value: summary?.highReturnProducts ?? 0,
      subtext: '>15% return rate threshold',
      icon: RotateCcw,
      iconBg: 'bg-purple-500/15',
      iconColor: 'text-purple-600',
      accentColor: 'border-purple-200',
    },
    {
      title: 'High RTO Rate',
      value: summary?.highRtoProducts ?? 0,
      subtext: '>10% undelivered / RTO',
      icon: RotateCcw,
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      accentColor: 'border-rose-200',
    },
    {
      title: 'Profitable SKUs',
      value: summary?.profitableProducts ?? 0,
      subtext: `Total Profit: ${formatCurrency(summary?.totalNetProfit)}`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      accentColor: 'border-emerald-200',
    },
    {
      title: 'Loss-Making SKUs',
      value: summary?.lossMakingProducts ?? 0,
      subtext: `Avg Margin: ${summary?.averageMarginPercent ?? 0}%`,
      icon: DollarSign,
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      accentColor: 'border-rose-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border ${card.accentColor} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold text-[#16123F]/70 dark:text-slate-400 tracking-tight leading-tight">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-xl ${card.iconBg} ${card.iconColor} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-xl font-black text-[#16123F] dark:text-white block tracking-tight">
                {card.value}
              </span>
              <span className="text-[10px] font-medium text-[#16123F]/60 dark:text-slate-400 mt-0.5 block truncate">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
