import React from 'react';
import { Target, CheckCircle2, AlertCircle, TrendingUp, MousePointerClick, Heart, Eye, Sparkles } from 'lucide-react';

export const CampaignDashboard = ({ config, aiPlan, contentCalendar }: any) => {
  const totalContent = contentCalendar.length || 4;
  const approved = contentCalendar.filter((c: any) => c.status === 'APPROVED').length || 1;
  const pending = totalContent - approved;

  return (
    <div className="w-full space-y-5 font-sans">
      {/* ─── UNIFIED SINGLE-PANEL DASHBOARD DOCUMENT ─── */}
      <div className="bg-white rounded-2xl p-7 border border-[#C7DDCC] shadow-xs space-y-6 text-[#16123F]">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F6F2]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-[#75C9B7] text-[#16123F] text-[10px] font-black uppercase">
                Active Plan
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-[#16123F] tracking-tight">
              {config.name || 'AI Planned Strategy'}
            </h1>
            <p className="text-xs text-[#555279] mt-0.5">Objective: {config.objective || 'Brand Awareness'}</p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-[#555279] font-medium block">Planned Budget</span>
              <span className="text-base font-extrabold text-[#16123F]">
                {config.budget ? `${config.budget}` : '₹5,000'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#555279] font-medium block">Duration</span>
              <span className="text-base font-extrabold text-[#75C9B7]">{config.duration || '2 Weeks'}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#555279] font-medium block">Generated Assets</span>
              <span className="text-xl font-black text-[#16123F]">{totalContent}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#F0F6F2] flex items-center justify-center text-[#16123F]">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#555279] font-medium block">Approved & Scheduled</span>
              <span className="text-xl font-black text-[#75C9B7]">{approved}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#75C9B7]/20 flex items-center justify-center text-[#16123F]">
              <CheckCircle2 className="w-4 h-4 text-[#75C9B7]" />
            </div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#555279] font-medium block">Pending Review</span>
              <span className="text-xl font-black text-[#16123F]">{pending}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FFE26A]/30 flex items-center justify-center text-[#16123F]">
              <AlertCircle className="w-4 h-4 text-[#16123F]" />
            </div>
          </div>
        </div>

        {/* AI Performance Projections */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#75C9B7]" />
            <h3 className="text-xs font-bold text-[#16123F] uppercase tracking-wider">AI Forecast & Projections</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/50">
              <span className="text-[11px] text-[#555279] font-medium block">Est. Reach</span>
              <span className="text-base font-extrabold text-[#16123F]">124.5K</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/50">
              <span className="text-[11px] text-[#555279] font-medium block">Engagement</span>
              <span className="text-base font-extrabold text-[#75C9B7]">4.8%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/50">
              <span className="text-[11px] text-[#555279] font-medium block">CTR</span>
              <span className="text-base font-extrabold text-[#16123F]">2.1%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/50">
              <span className="text-[11px] text-[#555279] font-medium block">Est. Orders</span>
              <span className="text-base font-extrabold text-[#75C9B7]">142</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="p-3.5 rounded-xl bg-[#F0F6F2] border border-[#C7DDCC] text-xs text-[#16123F] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#75C9B7] shrink-0 mt-0.5" />
              <span>
                <strong>Observation:</strong> Reels produce 3x higher engagement than static image posts on Instagram & TikTok.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
