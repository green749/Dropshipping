import React from 'react';
import type { InventorySummary, InventoryStatus } from '../../../types';
import {
  Package,
  Layers,
  CircleDollarSign,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Archive,
  RotateCcw,
} from 'lucide-react';

interface InventorySummaryCardsProps {
  summary: InventorySummary | null;
  activeFilter: InventoryStatus;
  onSelectFilter: (status: InventoryStatus) => void;
  isLoading: boolean;
}

export const InventorySummaryCards: React.FC<InventorySummaryCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter,
  isLoading,
}) => {
  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const cards = [
    {
      id: 'ALL' as InventoryStatus,
      title: 'Total Catalog',
      value: summary?.totalProducts ?? 0,
      subValue: `${(summary?.totalStockUnits ?? 0).toLocaleString()} Total Units`,
      icon: Package,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200/60',
      badge: 'Active Products',
    },
    {
      id: 'INVENTORY_VALUE',
      title: 'Inventory Value',
      value: formatCurrency(summary?.totalInventoryValue),
      subValue: `${(summary?.totalAvailableUnits ?? 0).toLocaleString()} Available Units`,
      icon: CircleDollarSign,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200/60',
      badge: 'At Cost Basis',
    },
    {
      id: 'LOW_STOCK' as InventoryStatus,
      title: 'Low Stock Alert',
      value: summary?.lowStockCount ?? 0,
      subValue: `${formatCurrency(summary?.lowStockValue)} value at risk`,
      icon: AlertTriangle,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200/60',
      badge: 'Threshold Breached',
      alert: (summary?.lowStockCount ?? 0) > 0,
    },
    {
      id: 'OUT_OF_STOCK' as InventoryStatus,
      title: 'Out of Stock',
      value: summary?.outOfStockCount ?? 0,
      subValue: 'Stockout Lost Sales Risk',
      icon: XCircle,
      color: 'from-rose-500/10 to-red-500/10 text-rose-700 border-rose-200/60',
      badge: 'Immediate Inflow Needed',
      alert: (summary?.outOfStockCount ?? 0) > 0,
    },
    {
      id: 'REORDER_RECOMMENDED' as InventoryStatus,
      title: 'Reorder Point Reached',
      value: summary?.reorderRecommendedCount ?? 0,
      subValue: 'Lead-time + Safety Stock trigger',
      icon: RotateCcw,
      color: 'from-purple-500/10 to-violet-500/10 text-purple-700 border-purple-200/60',
      badge: 'PO Recommended',
      alert: (summary?.reorderRecommendedCount ?? 0) > 0,
    },
    {
      id: 'FAST_MOVING' as InventoryStatus,
      title: 'Fast-Moving Products',
      value: summary?.fastMovingCount ?? 0,
      subValue: 'High daily sales velocity',
      icon: TrendingUp,
      color: 'from-cyan-500/10 to-blue-500/10 text-cyan-700 border-cyan-200/60',
      badge: 'High Velocity',
    },
    {
      id: 'OVERSTOCKED' as InventoryStatus,
      title: 'Overstocked Items',
      value: summary?.overstockedCount ?? 0,
      subValue: `${formatCurrency(summary?.overstockedValue)} tied up capital`,
      icon: Layers,
      color: 'from-yellow-500/10 to-amber-500/10 text-amber-800 border-yellow-200/60',
      badge: '>3x Target Days',
    },
    {
      id: 'DEAD_STOCK' as InventoryStatus,
      title: 'Dead Stock (30d+)',
      value: summary?.deadStockCount ?? 0,
      subValue: `${formatCurrency(summary?.deadStockValue)} idle inventory`,
      icon: Archive,
      color: 'from-slate-500/10 to-zinc-500/10 text-slate-700 border-slate-200/60',
      badge: '0 Sales in Window',
      alert: (summary?.deadStockCount ?? 0) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = card.id !== 'INVENTORY_VALUE';
        const isSelected = isClickable && activeFilter === card.id;

        return (
          <div
            key={card.title}
            onClick={() => {
              if (isClickable) {
                onSelectFilter(card.id as InventoryStatus);
              }
            }}
            className={`relative overflow-hidden rounded-[24px] bg-white/85 backdrop-blur-xl border p-5 transition-all duration-300 ${
              isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''
            } ${
              isSelected
                ? 'border-[#16123F] ring-2 ring-[#16123F]/15 shadow-md bg-[#F8FAF8]'
                : 'border-[#C7DDCC]/70 shadow-sm hover:border-[#16123F]/30'
            }`}
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
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
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
