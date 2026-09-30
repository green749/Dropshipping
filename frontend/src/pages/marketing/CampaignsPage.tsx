import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchCampaigns,
  updateCampaign,
  deleteCampaign,
} from '../../store/slices/marketingSlice';
import { fetchBusinesses, selectBusiness } from '../../store/slices/businessSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import { Select } from '../../components/common/Select';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import type { Campaign } from '../../types';
import { Megaphone, Edit2, Trash2, Building2, X, Filter, Sparkles, Plus, Calendar, DollarSign } from 'lucide-react';

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { campaigns, isLoading } = useAppSelector((state) => state.marketing);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal State for Editing Campaign
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('1000');
  const [status, setStatus] = useState<'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);

  useEffect(() => {
    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchCampaigns(params));
    dispatch(fetchBusinesses());
  }, [dispatch, selectedBusiness?.id]);

  const businessMap = useMemo(() => {
    const map = new Map<string, string>();
    businesses.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [businesses]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (selectedBusiness && c.business_id !== selectedBusiness.id) return false;
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
      );
    });
  }, [campaigns, debouncedSearch, selectedBusiness]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredCampaigns, { itemsPerPage: 8 });

  const handleLaunchAiCampaign = () => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    navigate(isAdmin ? '/admin/campaign-studio' : '/marketing/campaign-studio');
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setName(c.name);
    setDescription(c.description || '');
    setBudget(c.budget.toString());
    setStatus(c.status);
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Campaign name is required.';
    }
    if (!budget || parseFloat(budget) <= 0) {
      errors.budget = 'Please enter a valid budget amount.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before submitting.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const res = await dispatch(
      updateCampaign({
        id: editingCampaign.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          budget: parseFloat(budget),
          status,
        },
      })
    );
    if (updateCampaign.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Campaign updated successfully' }));
      setIsModalOpen(false);
    } else {
      const errorMsg = (res.payload as any)?.message || 'Failed to update campaign';
      setFormError(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await dispatch(deleteCampaign(deleteTarget.id));
    if (deleteCampaign.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Campaign deleted' }));
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to delete campaign' }));
    }
    setDeleteTarget(null);
  };

  const columns: Column<Campaign>[] = [
    {
      key: 'name',
      header: 'CAMPAIGN & STRATEGY',
      render: (c) => (
        <div className="space-y-1">
          <span className="font-bold text-[#16123F] block text-sm tracking-tight">{c.name}</span>
          {c.description && (
            <span className="text-xs text-[#16123F]/60 line-clamp-1">{c.description}</span>
          )}
        </div>
      ),
    },
    {
      key: 'business_id',
      header: 'STOREFRONT',
      render: (c) => (
        <span className="text-xs text-[#16123F] flex items-center gap-1.5 font-bold">
          <Building2 className="w-3.5 h-3.5 text-[#75C9B7]" />
          <span>{businessMap.get(c.business_id) || 'General Enterprise'}</span>
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'BUDGET & SPEND',
      render: (c) => {
        const spent = Number(c.spent || 0);
        const total = Number(c.budget || 0);
        const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
        return (
          <div className="space-y-1 max-w-[140px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#16123F] font-mono">₹{spent.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-[#16123F]/60 font-mono">/ ₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-[#F0F6F2] rounded-full h-1.5 overflow-hidden border border-[#C7DDCC]">
              <div
                className="bg-[#75C9B7] h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (c) => (
        <Badge
          variant={
            c.status === 'ACTIVE'
              ? 'success'
              : c.status === 'PAUSED'
              ? 'warning'
              : 'default'
          }
          size="sm"
        >
          {c.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => handleOpenEdit(c)}
            className="p-1.5 rounded-lg text-[#16123F]/60 hover:text-[#16123F] hover:bg-[#F0F6F2] border border-transparent hover:border-[#C7DDCC] transition-all cursor-pointer"
            title="Edit Campaign"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(c)}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            title="Delete Campaign"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-[#16123F] tracking-tight">
          Campaign Management Directory
        </h1>

        <button
          onClick={handleLaunchAiCampaign}
          className="btn-primary !px-5 !py-2.5 text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#16123F]" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Search & Meta */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search campaigns by title or strategy..."
          className="max-w-md w-full"
        />
        <span className="text-xs font-bold text-[#16123F]/60 hidden sm:inline">
          {filteredCampaigns.length} total campaigns
        </span>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(c) => c.id}
        emptyTitle="No marketing campaigns found"
        emptyDescription="Create and launch a manual marketing campaign to organize promotional strategies across your sales channels."
        emptyActionText="Create Campaign"
        onEmptyAction={handleLaunchAiCampaign}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />

      {/* Edit Campaign Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFieldErrors({});
        }}
        title="Edit Campaign Strategy"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormAlert message={formError} onClose={() => setFormError(null)} />

          <FormField
            label="Campaign Name"
            htmlFor="campaign-name-input"
            required
            error={fieldErrors.name}
          >
            <input
              id="campaign-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Fall Fashion Mega Sale"
              className={`input-field ${fieldErrors.name ? 'border-rose-400 focus:ring-rose-200' : ''}`}
            />
          </FormField>

          <FormField
            label="Description & Strategy Notes"
            htmlFor="campaign-desc-input"
          >
            <textarea
              id="campaign-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Target audience, promotion angles, and key conversion hooks..."
              className="input-field"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Budget Allocation (₹)"
              htmlFor="campaign-budget-input"
              required
              error={fieldErrors.budget}
            >
              <input
                id="campaign-budget-input"
                type="number"
                min="10"
                step="50"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, budget: '' }));
                }}
                placeholder="1000"
                className={`input-field tabular-nums font-mono ${fieldErrors.budget ? 'border-rose-400 focus:ring-rose-200' : ''}`}
              />
            </FormField>

            <FormField
              label="Campaign Status"
              htmlFor="campaign-status-select"
            >
              <Select
                id="campaign-status-select"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as any)
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="PAUSED">PAUSED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormError(null);
                setFieldErrors({});
              }}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Marketing Campaign"
        message={`Are you sure you want to delete campaign "${deleteTarget?.name}"? Linked posts will remain available in your posts library.`}
        confirmText="Delete Campaign"
        isDestructive={true}
      />
    </div>
  );
};
