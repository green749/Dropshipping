import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchSocialAccounts,
  createSocialAccount,
  deleteSocialAccount,
} from '../../store/slices/marketingSlice';
import { fetchBusinesses } from '../../store/slices/businessSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import { Select } from '../../components/common/Select';
import type { SocialAccount } from '../../types';
import { Share2, Plus, Trash2 } from 'lucide-react';

export const SocialAccountsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { socialAccounts, isLoading } = useAppSelector((state) => state.marketing);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);
  const { user } = useAppSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platform, setPlatform] = useState<'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'TWITTER' | 'PINTEREST'>('INSTAGRAM');
  const [accountName, setAccountName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SocialAccount | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isAdmin = user?.role === 'DROPSHIPPER';
  const targetBusiness = selectedBusiness || (!isAdmin && businesses.length > 0 ? businesses[0] : null);

  useEffect(() => {
    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchSocialAccounts(params));
    dispatch(fetchBusinesses());
  }, [dispatch, selectedBusiness?.id]);

  const handleOpenAdd = () => {
    setPlatform('INSTAGRAM');
    setAccountName('');
    setBusinessId(targetBusiness?.id || businesses[0]?.id || '');
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!accountName.trim()) {
      errors.accountName = 'Social handle / username is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before submitting.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const cleanHandle = accountName.trim().replace(/^@/, '');
    const activeBizId = targetBusiness?.id || businessId || businesses[0]?.id;

    const res = await dispatch(
      createSocialAccount({
        platform,
        account_name: cleanHandle,
        business_id: activeBizId,
      })
    );

    if (createSocialAccount.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Social account connected successfully!' }));
      setIsModalOpen(false);
    } else {
      const errorMsg = (res.payload as any)?.message || 'Failed to connect account';
      setFormError(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !isAdmin) return;
    const res = await dispatch(deleteSocialAccount(deleteTarget.id));
    if (deleteSocialAccount.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Channel disconnected' }));
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to disconnect channel' }));
    }
    setDeleteTarget(null);
  };

  const displayAccounts = useMemo(() => {
    if (targetBusiness) {
      return socialAccounts.filter((a) => a.business_id === targetBusiness.id);
    }
    if (isAdmin && !selectedBusiness) {
      return socialAccounts;
    }
    return [];
  }, [socialAccounts, targetBusiness, isAdmin, selectedBusiness]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Social Brand Channels
          </h1>
          <p className="text-xs text-[#555279] font-medium mt-0.5">
            Connect and synchronize product promotion channels across social networks.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Channel</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-14 text-[#555279] text-sm">Loading connected channels...</div>
      ) : displayAccounts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[28px] border border-[#C7DDCC] shadow-xs">
          <Share2 className="w-10 h-10 text-[#16123F]/30 mx-auto mb-2" />
          <p className="text-[#16123F] text-sm font-bold">No channels connected for this storefront</p>
          <p className="text-[#555279] text-xs mt-1">Connect Instagram, TikTok, or Facebook to automate posting for {targetBusiness?.name || 'this business'}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayAccounts.map((account: SocialAccount) => (
            <div
              key={account.id}
              className="bg-white rounded-[24px] p-5 border border-[#C7DDCC] space-y-4 hover:border-[#75C9B7] transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#16123F] bg-[#75C9B7]/25 px-2.5 py-0.5 rounded-full border border-[#75C9B7]">
                    {account.platform}
                  </span>
                  <Badge variant="success" size="sm">
                    Connected
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-[#16123F] mt-3">@{account.account_name}</h3>
                <p className="text-xs text-[#555279] mt-1 leading-relaxed">
                  Feed auto-syndication enabled for connected business.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#C7DDCC]/60 text-xs text-[#555279]">
                <span className="font-mono text-[11px] text-[#555279]">ID: {account.id.slice(0, 8)}...</span>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteTarget(account)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Disconnect Channel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFieldErrors({});
        }}
        title="Connect Social Media Channel"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormAlert message={formError} onClose={() => setFormError(null)} />

          <FormField
            label="Social Platform"
            htmlFor="social-platform-select"
            required
          >
            <Select
              id="social-platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
            >
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook Page</option>
              <option value="TIKTOK">TikTok</option>
              <option value="TWITTER">X (Twitter)</option>
              <option value="PINTEREST">Pinterest</option>
            </Select>
          </FormField>

          <FormField
            label="Handle / Username"
            htmlFor="social-handle-input"
            required
            error={fieldErrors.accountName}
          >
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#535F80] text-sm">@</span>
              <input
                id="social-handle-input"
                type="text"
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, accountName: '' }));
                }}
                placeholder="dropship_official"
                className={`input-field pl-8 ${fieldErrors.accountName ? 'border-rose-400 focus:ring-rose-200' : ''}`}
              />
            </div>
          </FormField>

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
              Connect Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Disconnect Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Disconnect Social Channel"
        message={`Are you sure you want to disconnect @${deleteTarget?.account_name}? Automation to this account will stop.`}
        confirmText="Disconnect"
        isDestructive={true}
      />
    </div>
  );
};
