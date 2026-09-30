import React from 'react';

export const ChartSkeleton: React.FC<{ height?: string; label?: string }> = ({
  height = 'h-72',
  label = 'Loading chart visualization...',
}) => {
  return (
    <div
      className={`w-full ${height} rounded-xl bg-white border border-[rgba(5,23,71,0.08)]/50 flex flex-col items-center justify-center gap-3 animate-pulse`}
    >
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      <span className="text-xs text-[#535F80] font-medium">{label}</span>
    </div>
  );
};
