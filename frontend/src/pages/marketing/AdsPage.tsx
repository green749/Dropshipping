import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAds, createAd, deleteAd, fetchCampaigns } from '../../store/slices/marketingSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import type { Ad } from '../../types';
import {
  BadgePercent,
  Plus,
  Trash2,
  DollarSign,
  Eye,
  MousePointer,
  Percent,
} from 'lucide-react';

export const AdsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { ads, campaigns, isLoading } = useAppSelector((state) => state.marketing);
  const { selectedBusiness } = useAppSelector((state) => state.business);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('GOOGLE');
  const [campaignId, setCampaignId] = useState('');
  const [spend, setSpend] = useState('250');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED' | 'ENDED'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);

  useEffect(() => {
    dispatch(fetchAds());
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const relevantCampaigns = useMemo(() => {
    if (!selectedBusiness) return campaigns;
    return campaigns.filter((c) => c.business_id === selectedBusiness.id);
  }, [campaigns, selectedBusiness]);

  const relevantAds = useMemo(() => {
    if (!selectedBusiness) return ads;
    const campaignIdSet = new Set(relevantCampaigns.map((c) => c.id));
    return ads.filter((a) => !a.campaign_id || campaignIdSet.has(a.campaign_id) || relevantCampaigns.length === 0);
  }, [ads, relevantCampaigns, selectedBusiness]);

  const campaignMap = useMemo(() => {
    const map = new Map<string, string>();
    relevantCampaigns.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [relevantCampaigns]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalSpend = relevantAds.reduce((acc, a) => acc + Number(a.spend || 0), 0);
    const totalImpressions = relevantAds.reduce((acc, a) => acc + Number(a.impressions || 0), 0);
    const totalClicks = relevantAds.reduce((acc, a) => acc + Number(a.clicks || 0), 0);
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    return { totalSpend, totalImpressions, totalClicks, avgCtr };
  }, [relevantAds]);

  const filteredAds = useMemo(() => {
    if (!debouncedSearch) return relevantAds;
    const term = debouncedSearch.toLowerCase();
    return relevantAds.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        (a.platform && a.platform.toLowerCase().includes(term))
    );
  }, [relevantAds, debouncedSearch]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredAds, { itemsPerPage: 8 });

  const handleOpenCreate = () => {
    setName('');
    setPlatform('GOOGLE');
    setCampaignId(relevantCampaigns[0]?.id || '');
    setSpend('250');
    setStatus('ACTIVE');
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!campaignId) {
      errors.campaignId = 'Please select a parent campaign.';
    }
    if (!name.trim()) {
      errors.name = 'Ad creative title is required.';
    }
    if (!spend || parseFloat(spend) < 0) {
      errors.spend = 'Valid budget allocation is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before submitting.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const res = await dispatch(
      createAd({
        name: name.trim(),
        platform,
        campaign_id: campaignId,
        spend: parseFloat(spend) || 0,
        status,
        clicks: 0,
        impressions: 0,
      })
    );

    if (createAd.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Paid ad unit created and launched successfully.' }));
      setIsModalOpen(false);
    } else {
      const errorMsg = (res.payload as any)?.message || 'Failed to create ad unit.';
      setFormError(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await dispatch(deleteAd(deleteTarget.id));
    if (deleteAd.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Ad unit removed from network.' }));
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to delete ad unit.' }));
    }
    setDeleteTarget(null);
  };

  const getPlatformBadge = (plat?: string) => {
    const p = (plat || 'GOOGLE').toUpperCase();
    if (p === 'GOOGLE') {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Google Ads
        </span>
      );
    }
    if (p === 'META') {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Meta Ads
        </span>
      );
    }
    if (p === 'TIKTOK') {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
          TikTok Ads
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
        Pinterest Ads
      </span>
    );
  };

  const columns: Column<Ad>[] = [
    {
      key: 'name',
      header: 'Creative Title & Network',
      render: (a) => (
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 block text-sm">{a.name}</span>
          <div className="flex items-center gap-2">
            {getPlatformBadge(a.platform)}
            {a.campaign_id && campaignMap.has(a.campaign_id) && (
              <span className="text-xs text-slate-500 truncate max-w-[180px] font-medium">
                {campaignMap.get(a.campaign_id)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'spend',
      header: 'Ad Spend',
      align: 'right',
      render: (a) => (
        <span className="font-semibold text-slate-900 tabular-nums text-sm">
          ₹{Number(a.spend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'impressions',
      header: 'Impressions',
      align: 'right',
      render: (a) => (
        <span className="text-sm text-slate-600 tabular-nums font-medium">
          {Number(a.impressions || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'clicks',
      header: 'Clicks',
      align: 'right',
      render: (a) => (
        <span className="text-sm font-semibold text-sky-600 tabular-nums">
          {Number(a.clicks || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'ctr',
      header: 'CTR',
      align: 'right',
      render: (a) => {
        const imp = Number(a.impressions || 0);
        const clk = Number(a.clicks || 0);
        const ctr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : '0.00';
        return (
          <span className="text-sm font-semibold text-emerald-600 tabular-nums">
            {ctr}%
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (a) => (
        <Badge
          variant={
            a.status === 'ACTIVE'
              ? 'success'
              : a.status === 'PAUSED'
              ? 'warning'
              : 'default'
          }
          size="sm"
        >
          {a.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (a) => (
        <button
          onClick={() => setDeleteTarget(a)}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Delete Ad"
          aria-label="Delete Ad"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#051747] tracking-tight">
            Paid Advertising Performance
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Ad Unit</span>
        </button>
      </div>

      {/* Aggregate Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ad Spend"
          value={`₹${metrics.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="Cumulative across active networks"
        />
        <StatCard
          title="Total Impressions"
          value={metrics.totalImpressions.toLocaleString()}
          icon={<Eye className="w-5 h-5" />}
          subtitle="Total creative impressions served"
        />
        <StatCard
          title="Total Clicks"
          value={metrics.totalClicks.toLocaleString()}
          icon={<MousePointer className="w-5 h-5" />}
          subtitle="Inbound click-through volume"
        />
        <StatCard
          title="Avg Click-Through Rate"
          value={`${metrics.avgCtr}%`}
          icon={<Percent className="w-5 h-5" />}
          subtitle="Combined campaign CTR velocity"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search ads by creative title or platform..."
          className="max-w-md w-full"
        />
        <span className="text-xs text-[#535F80] hidden sm:inline tabular-nums">
          {filteredAds.length} {filteredAds.length === 1 ? 'ad unit' : 'ad units'}
        </span>
      </div>

      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(a) => a.id}
        emptyTitle="No ad units found"
        emptyDescription="Launch a targeted ad unit to drive traffic to your dropship storefronts."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />

      {/* Create Ad Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFieldErrors({});
        }}
        title="Create Paid Ad Unit"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormAlert message={formError} onClose={() => setFormError(null)} />

          <FormField
            label="Parent Marketing Campaign"
            htmlFor="ad-campaign"
            required
            error={fieldErrors.campaignId}
          >
            <Select
              id="ad-campaign"
              value={campaignId}
              onChange={(e) => {
                setCampaignId(e.target.value);
                setFieldErrors((prev) => ({ ...prev, campaignId: '' }));
              }}
              placeholder="Select Parent Campaign"
              className={fieldErrors.campaignId ? 'border-rose-400 focus:ring-rose-200' : ''}
            >
              {campaigns.length === 0 && (
                <option value="">No campaigns available — create one first</option>
              )}
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Ad Creative Title"
            htmlFor="ad-name"
            required
            error={fieldErrors.name}
          >
            <Input
              id="ad-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Meta Reels - Dynamic Product Showcase"
              error={fieldErrors.name}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Advertising Network" htmlFor="ad-network" required>
              <Select
                id="ad-network"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="GOOGLE">Google Ads (Search & Shopping)</option>
                <option value="META">Meta (Facebook & Instagram)</option>
                <option value="TIKTOK">TikTok Ads Manager</option>
                <option value="PINTEREST">Pinterest Business</option>
              </Select>
            </FormField>

            <FormField
              label="Budget Allocation (₹)"
              htmlFor="ad-spend"
              required
              error={fieldErrors.spend}
            >
              <Input
                id="ad-spend"
                type="number"
                min="0"
                step="25"
                value={spend}
                onChange={(e) => {
                  setSpend(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, spend: '' }));
                }}
                placeholder="250"
                error={fieldErrors.spend}
              />
            </FormField>
          </div>

          <FormField label="Initial Status" htmlFor="ad-status" required>
            <Select
              id="ad-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="ACTIVE">Active (Live Dispatch)</option>
              <option value="PAUSED">Paused (Hold)</option>
              <option value="ENDED">Ended (Concluded)</option>
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormError(null);
                setFieldErrors({});
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={campaigns.length === 0}
              className="btn-primary"
            >
              Launch Ad Unit
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Ad Unit"
        message={`Are you sure you want to stop and delete ad "${deleteTarget?.name}"? Tracking data will be archived.`}
        confirmText="Delete Ad Unit"
        isDestructive={true}
      />
    </div>
  );
};
