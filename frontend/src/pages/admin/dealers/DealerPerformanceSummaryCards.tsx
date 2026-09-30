import React from 'react';
import type { DealerPerformanceSummary } from '../../../types';
import {
  Users,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react';

interface DealerPerformanceSummaryCardsProps {
  summary: DealerPerformanceSummary | null;
  isLoading: boolean;
}

export const DealerPerformanceSummaryCards: React.FC<DealerPerformanceSummaryCardsProps> = ({
  summary,
  isLoading,
}) => {
  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const cards = [
    {
      title: 'Active Suppliers',
      value: `${summary?.activeDealers ?? 0} / ${summary?.totalDealers ?? 0}`,
      subValue: 'Assigned Partner Network',
      icon: Users,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200/60',
      badge: 'Network Capacity',
    },
    {
      title: 'Orders Fulfilled',
      value: `${summary?.ordersFulfilled ?? 0} orders`,
      subValue: `${summary?.overallFulfillmentRate ?? 100}% Fulfillment Rate`,
      icon: CheckCircle2,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200/60',
      badge: 'Dispatched & Delivered',
    },
    {
      title: 'Avg Dispatch Time',
      value: `${summary?.avgDispatchDays ?? 1.2} Days`,
      subValue: `${summary?.avgDispatchHours ?? 28}h from order assignment`,
      icon: Clock,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200/60',
      badge: 'Speed of Processing',
    },
    {
      title: 'SLA Compliance',
      value: `${summary?.overallSlaCompliance ?? 100}%`,
      subValue: `${summary?.totalSlaBreaches ?? 0} SLA Breaches logged`,
      icon: AlertTriangle,
      color: 'from-purple-500/10 to-violet-500/10 text-purple-700 border-purple-200/60',
      badge: 'Target On-Time Dispatch',
      alert: (summary?.totalSlaBreaches ?? 0) > 0,
    },
    {
      title: 'Supplier RTO Rate',
      value: `${summary?.overallRtoRate ?? 0}%`,
      subValue: `${summary?.rtoOrders ?? 0} returned to origin`,
      icon: RotateCcw,
      color: 'from-rose-500/10 to-red-500/10 text-rose-700 border-rose-200/60',
      badge: 'COD Transit Risk',
    },
    {
      title: 'Supplier Return Rate',
      value: `${summary?.overallReturnRate ?? 0}%`,
      subValue: `${summary?.returnedOrders ?? 0} customer returns`,
      icon: RotateCcw,
      color: 'from-cyan-500/10 to-blue-500/10 text-cyan-700 border-cyan-200/60',
      badge: 'Quality & Defect Ratio',
    },
    {
      title: 'Supplier Revenue',
      value: formatCurrency(summary?.totalRevenue),
      subValue: `${formatCurrency(summary?.totalProductCost)} Product Cost`,
      icon: CircleDollarSign,
      color: 'from-teal-500/10 to-emerald-500/10 text-teal-800 border-teal-200/60',
      badge: 'Gross Merchandise Value',
    },
    {
      title: 'Supplier Net Profit',
      value: formatCurrency(summary?.totalProfit),
      subValue: `${summary?.profitMargin ?? 0}% Profit Margin`,
      icon: TrendingUp,
      color: 'from-indigo-500/10 to-purple-500/10 text-indigo-700 border-indigo-200/60',
      badge: 'Net Profit Contribution',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-[24px] bg-white/85 backdrop-blur-xl border border-[#C7DDCC]/70 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#16123F]/5 text-[#16123F]/80 mb-2">
                  {card.badge}
                </span>
                <p className="text-xs font-semibold text-[#16123F]/60 uppercase tracking-wider">
                  {card.title}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center border shadow-xs ${card.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              {isLoading ? (
                <div className="h-8 w-24 bg-[#16123F]/10 animate-pulse rounded-lg my-1" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-[#16123F] tracking-tight">
                    {card.value}
                  </h3>
                  {card.alert && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-[#16123F]/65 font-medium mt-1 truncate">
                {card.subValue}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
