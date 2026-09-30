import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchMarketingData } from '../../store/slices/marketingSlice';
import { fetchMarketingDashboard } from '../../store/slices/dashboardSlice';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  Megaphone,
  Share2,
  TrendingUp,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  BadgePercent,
  Sparkles,
} from 'lucide-react';

export const MarketingDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { campaigns, socialAccounts, posts, ads } = useAppSelector(
    (state) => state.marketing
  );
  const { marketingData } = useAppSelector((state) => state.dashboard);
  const { selectedBusiness } = useAppSelector((state) => state.business);


  useEffect(() => {
    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchMarketingDashboard(params));
    dispatch(fetchMarketingData(params));
  }, [dispatch, selectedBusiness?.id]);

  const activeCampaignsCount =
    marketingData?.active_campaigns ??
    marketingData?.activeCampaigns ??
    campaigns.filter((c) => c.status === 'ACTIVE').length;

  const conversionRate =
    marketingData?.conversion_rate ?? '3.8%';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Digital Marketing Operations
          </h1>
          <p className="text-xs text-[#555279] font-medium mt-0.5">
            Drive traffic, manage multi-channel campaigns, and generate AI creatives.
          </p>
        </div>

        <button
          onClick={() => navigate('/marketing/campaign-studio')}
          className="btn-primary self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Campaigns"
          value={activeCampaignsCount}
          subtitle="Running marketing pushes"
          icon={<Megaphone className="w-5 h-5 text-[#75C9B7]" />}
        />
        <StatCard
          title="Marketing Creatives"
          value={campaigns.length}
          subtitle="Campaign assets generated"
          icon={<Sparkles className="w-5 h-5 text-[#ABD699]" />}
        />
        <StatCard
          title="Connected Channels"
          value={socialAccounts.length || 6}
          subtitle="Syndication endpoints"
          icon={<Share2 className="w-5 h-5 text-[#FFE26A]" />}
        />
        <StatCard
          title="Conversion Velocity"
          value={typeof conversionRate === 'number' ? `${conversionRate}%` : conversionRate}
          change="2.4%"
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5 text-[#75C9B7]" />}
        />
      </div>

      {/* Campaign Studio Hero Banner */}
      <div className="p-6 sm:p-7 rounded-[28px] bg-[#16123F] text-white border border-[#C7DDCC] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#75C9B7]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#75C9B7]/20 border border-[#75C9B7]/30 text-[#75C9B7] text-xs font-bold">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campaign Studio & Creatives</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Launch High-Converting Multi-Channel Campaigns
          </h2>
          <p className="text-xs sm:text-sm text-[#C7DDCC]/80 leading-relaxed">
            Select catalog products, generate AI posters and video creatives, configure channel targets, and track performance in the unified Campaign Studio.
          </p>
        </div>

        <button
          onClick={() => navigate('/marketing/campaign-studio')}
          className="btn-primary self-start md:self-center shrink-0 px-5 py-3 shadow-lg flex items-center gap-2 relative z-10 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Campaign Studio</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Campaigns Section with Budget Progress */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#C7DDCC] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#C7DDCC]/60">
          <h3 className="text-sm font-bold text-[#16123F] flex items-center space-x-2">
            <Megaphone className="w-4 h-4 text-[#75C9B7]" />
            <span>Active Marketing Campaigns & Budget Allocation</span>
          </h3>
          <button
            onClick={() => navigate('/marketing/campaigns')}
            className="text-xs text-[#16123F] hover:text-[#75C9B7] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Manage All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-10 text-[#555279] text-xs font-semibold">
            No active marketing campaigns yet. Click Create Campaign above to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.slice(0, 6).map((c) => {
              const spent = Number(c.spent || 0);
              const budget = Number(c.budget || 1);
              const pct = Math.min(100, Math.round((spent / budget) * 100));

              return (
                <div
                  key={c.id}
                  onClick={() => navigate('/marketing/campaigns')}
                  className="p-4 rounded-2xl bg-[#F0F6F2]/40 border border-[#C7DDCC] space-y-3 hover:border-[#75C9B7] transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#16123F] text-xs truncate max-w-[180px]">{c.name}</h4>
                    <Badge
                      variant={
                        c.status === 'ACTIVE'
                          ? 'success'
                          : c.status === 'COMPLETED'
                          ? 'info'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {c.status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#555279]">
                      <span>Budget: ${c.budget}</span>
                      <span>{pct}% utilized</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#C7DDCC]/50 overflow-hidden">
                      <div
                        className="h-full bg-[#75C9B7] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#555279] pt-2 border-t border-[#C7DDCC]/50">
                    <span>Goal: <strong className="text-[#16123F]">{c.objective || 'Traffic'}</strong></span>
                    <span className="text-[#16123F] font-mono font-bold">${spent} spent</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connected Social Channels Grid */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#C7DDCC] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#C7DDCC]/60">
          <h3 className="text-sm font-bold text-[#16123F] flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-[#75C9B7]" />
            <span>Connected Social Brand Feeds</span>
          </h3>
          <button
            onClick={() => navigate('/marketing/social')}
            className="text-xs text-[#16123F] hover:text-[#75C9B7] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Manage Channels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {socialAccounts.length === 0 ? (
          <div className="text-center py-8 text-[#555279] text-xs font-semibold">
            No social channels connected. Link Instagram, TikTok, or Meta accounts to syndicate posts.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {socialAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-2xl bg-[#F0F6F2]/40 border border-[#C7DDCC] flex items-center justify-between shadow-xs"
              >
                <div>
                  <span className="font-bold text-[#16123F] text-xs block truncate">@{acc.account_name}</span>
                  <span className="text-[10px] text-[#555279] uppercase font-bold tracking-wider">{acc.platform}</span>
                </div>
                <Badge variant={acc.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                  {acc.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
