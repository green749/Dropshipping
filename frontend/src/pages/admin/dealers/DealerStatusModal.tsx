import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { FormField } from '../../../components/common/FormField';
import { FormAlert } from '../../../components/common/FormAlert';
import { Select } from '../../../components/common/Select';
import { useAppDispatch } from '../../../store';
import { dealerPerformanceApi } from '../../../api/dealerPerformanceApi';
import { addToast } from '../../../store/slices/uiSlice';
import type { DealerPerformance } from '../../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldOff } from 'lucide-react';

interface DealerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealer: DealerPerformance | null;
  onSuccess?: () => void;
}

export const DealerStatusModal: React.FC<DealerStatusModalProps> = ({
  isOpen,
  onClose,
  dealer,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (dealer) {
      setStatus(dealer.status);
      setReason('');
      setErrorMessage(null);
    }
  }, [dealer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await dealerPerformanceApi.updateStatus(dealer.id, status);
      dispatch(addToast({ type: 'success', message: `Supplier status updated to ${status}` }));
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update dealer status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!dealer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Supplier Operational Status"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormAlert message={errorMessage} onClose={() => setErrorMessage(null)} />

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">{dealer.company_name}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              Current Status:{' '}
              <span className="font-bold text-slate-700">{dealer.status}</span>
            </p>
          </div>
          {dealer.status === 'ACTIVE' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : dealer.status === 'SUSPENDED' ? (
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          ) : (
            <ShieldOff className="w-5 h-5 text-slate-400" />
          )}
        </div>

        <FormField
          label="Target Operational Status"
          htmlFor="dealer-status-select"
          required
          helperText="Inactive or Suspended suppliers will NOT receive new order dispatches"
        >
          <Select
            id="dealer-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
          >
            <option value="ACTIVE">ACTIVE — Operating normally, accepts order assignments</option>
            <option value="INACTIVE">INACTIVE — Temporarily paused, no automatic routing</option>
            <option value="SUSPENDED">SUSPENDED — Blocked due to SLA violations or policy breach</option>
          </Select>
        </FormField>

        {status !== 'ACTIVE' && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              Setting this supplier to <strong>{status}</strong> will prevent new automatic order routings. Existing pending dispatches will remain in the supplier's active queue.
            </p>
          </div>
        )}

        <FormField
          label="Reason for Status Change (Audit Log)"
          htmlFor="dealer-status-reason"
          helperText="Required for recordkeeping and team transparency"
        >
          <textarea
            id="dealer-status-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Temporary stock audit underway / Supplier requested 2-week downtime..."
            className="input-field resize-none py-2"
          />
        </FormField>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary text-xs flex items-center gap-1.5"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
