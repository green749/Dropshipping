import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
}) => {
  return (
    <div className="surface-panel bg-white p-5 rounded-xl border border-[rgba(5,23,71,0.08)] relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-caption font-semibold text-[#535F80] tracking-wide uppercase">
            {title}
          </p>
          <div className="text-h2 font-bold tracking-tight text-[#051747] tabular-nums">
            {value}
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#081F62]/5 border border-[#081F62]/10 text-[#081F62] flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[rgba(5,23,71,0.05)] flex items-center justify-between text-caption">
        {change ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {change}
            </span>
            <span className="text-[#535F80] font-normal">vs prior period</span>
          </div>
        ) : subtitle ? (
          <span className="text-[#535F80] font-normal">{subtitle}</span>
        ) : (
          <span className="text-[#535F80] font-normal">Updated in real-time</span>
        )}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';
