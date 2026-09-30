import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { FormField } from '../../../components/common/FormField';
import { FormAlert } from '../../../components/common/FormAlert';
import { Select } from '../../../components/common/Select';
import { useAppDispatch } from '../../../store';
import { dealerPerformanceApi } from '../../../api/dealerPerformanceApi';
import { addToast } from '../../../store/slices/uiSlice';
import type { DealerPerformance, DealerSlaUpdatePayload } from '../../../types';
import { ShieldCheck, Clock, Calendar, DollarSign, Percent, FileText } from 'lucide-react';

interface DealerSlaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealer: DealerPerformance | null;
  onSuccess?: () => void;
}

export const DealerSlaConfigModal: React.FC<DealerSlaConfigModalProps> = ({
  isOpen,
  onClose,
  dealer,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [dispatchSlaHours, setDispatchSlaHours] = useState<number>(48);
  const [fulfillmentSlaHours, setFulfillmentSlaHours] = useState<number>(72);
  const [averageLeadTimeDays, setAverageLeadTimeDays] = useState<number>(2);
  const [paymentTerms, setPaymentTerms] = useState<string>('NET30');
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(10000);
  const [ratingNotes, setRatingNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (dealer) {
      setDispatchSlaHours(dealer.dispatch_sla_hours ?? 48);
      setFulfillmentSlaHours(dealer.fulfillment_sla_hours ?? 72);
      setAverageLeadTimeDays(dealer.average_lead_time_days ?? 2);
      setPaymentTerms(dealer.payment_terms || 'NET30');
      setCommissionRate(dealer.commission_rate ?? 0);
      setCreditLimit(dealer.credit_limit ?? 10000);
      setRatingNotes(dealer.rating_notes || '');
      setErrorMessage(null);
    }
  }, [dealer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: DealerSlaUpdatePayload = {
      dispatch_sla_hours: Number(dispatchSlaHours),
      fulfillment_sla_hours: Number(fulfillmentSlaHours),
      average_lead_time_days: Number(averageLeadTimeDays),
      payment_terms: paymentTerms,
      commission_rate: Number(commissionRate),
      credit_limit: Number(creditLimit),
      rating_notes: ratingNotes.trim(),
    };

    try {
      await dealerPerformanceApi.updateSla(dealer.id, payload);
      dispatch(addToast({ type: 'success', message: 'SLA and commercial parameters updated successfully' }));
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update dealer SLA settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!dealer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Supplier SLA & Terms"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormAlert message={errorMessage} onClose={() => setErrorMessage(null)} />

        {/* Dealer Info Header Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">{dealer.company_name}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              Rep: {dealer.contact_name} ({dealer.email})
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            SLA Policy
          </span>
        </div>

        {/* SLA Timers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Dispatch SLA Target (Hours)"
            htmlFor="dispatch-sla-hours"
            required
            helperText="Maximum hours allowed from order assignment to dispatch"
          >
            <div className="relative">
              <input
                id="dispatch-sla-hours"
                type="number"
                min="1"
                max="720"
                value={dispatchSlaHours}
                onChange={(e) => setDispatchSlaHours(Number(e.target.value))}
                className="input-field tabular-nums pl-9"
                required
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </FormField>

          <FormField
            label="Fulfillment SLA Target (Hours)"
            htmlFor="fulfillment-sla-hours"
            required
            helperText="Total hours from order assignment to customer delivery"
          >
            <div className="relative">
              <input
                id="fulfillment-sla-hours"
                type="number"
                min="1"
                max="1440"
                value={fulfillmentSlaHours}
                onChange={(e) => setFulfillmentSlaHours(Number(e.target.value))}
                className="input-field tabular-nums pl-9"
                required
              />
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </FormField>
        </div>

        {/* Lead Time & Payment Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Avg. Production / Restock Lead Time (Days)"
            htmlFor="lead-time-days"
            required
            helperText="Days required for procurement & stock turnaround"
          >
            <div className="relative">
              <input
                id="lead-time-days"
                type="number"
                min="0"
                max="60"
                value={averageLeadTimeDays}
                onChange={(e) => setAverageLeadTimeDays(Number(e.target.value))}
                className="input-field tabular-nums pl-9"
                required
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </FormField>

          <FormField
            label="Wholesale Payment Terms"
            htmlFor="payment-terms-select"
            required
          >
            <Select
              id="payment-terms-select"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            >
              <option value="PREPAID">PREPAID (Advance)</option>
              <option value="COD">COD (Cash on Dispatch)</option>
              <option value="NET7">NET 7 Days</option>
              <option value="NET15">NET 15 Days</option>
              <option value="NET30">NET 30 Days</option>
              <option value="NET60">NET 60 Days</option>
            </Select>
          </FormField>
        </div>

        {/* Credit Limit & Commission */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Credit Line Limit (₹)"
            htmlFor="dealer-credit-line"
            required
          >
            <div className="relative">
              <input
                id="dealer-credit-line"
                type="number"
                min="0"
                step="1000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="input-field tabular-nums pl-9"
                required
              />
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </FormField>

          <FormField
            label="Commission / Referral Rate (%)"
            htmlFor="dealer-commission-rate"
          >
            <div className="relative">
              <input
                id="dealer-commission-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="input-field tabular-nums pl-9"
              />
              <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </FormField>
        </div>

        {/* Internal Audit / Operational Notes */}
        <FormField
          label="Operational & Evaluation Notes"
          htmlFor="dealer-rating-notes"
          helperText="Internal remarks regarding performance, supplier compliance, and logistics history"
        >
          <div className="relative">
            <textarea
              id="dealer-rating-notes"
              rows={2}
              value={ratingNotes}
              onChange={(e) => setRatingNotes(e.target.value)}
              placeholder="e.g. Reliable dispatches during Q3 festive seasons; requires packaging QA audit..."
              className="input-field resize-none pl-9 py-2"
            />
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </FormField>

        {/* Actions */}
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
            {isSubmitting ? 'Saving...' : 'Save SLA Settings'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
