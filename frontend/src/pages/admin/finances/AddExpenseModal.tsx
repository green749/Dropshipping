import React, { useState, useEffect } from 'react';
import type { Expense, ExpenseCategory } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { FormField } from '../../../components/common/FormField';
import { FormAlert } from '../../../components/common/FormAlert';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  businessId: string;
  initialData?: Expense | null;
  isLoading?: boolean;
}

const CATEGORIES: ExpenseCategory[] = [
  'Advertising',
  'Shipping',
  'Packaging',
  'Payment Gateway',
  'Supplier/Dealer',
  'Software',
  'Salaries',
  'Operations',
  'Refunds',
  'Returns',
  'Other',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  businessId,
  initialData,
  isLoading,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('Advertising');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setDescription(initialData.description);
      setAmount(String(initialData.amount));
      setDate(initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setReference(initialData.reference || '');
      setNotes(initialData.notes || '');
    } else {
      setCategory('Advertising');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setReference('');
      setNotes('');
    }
    setFormError(null);
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errors: Record<string, string> = {};

    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    if (!date) {
      errors.date = 'Date is required';
    }
    if (!category) {
      errors.category = 'Category is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        business_id: businessId,
        category,
        description: description.trim(),
        amount: parseFloat(amount),
        date,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense Record' : 'Record New Business Expense'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {formError && <FormAlert type="error" message={formError} />}

        {/* Category & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Expense Category" error={fieldErrors.category} required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/30"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Amount (₹)" error={fieldErrors.amount} required>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 2500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/30"
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description / Vendor" error={fieldErrors.description} required>
          <input
            type="text"
            placeholder="e.g. Meta Ads Instagram Campaign - Q3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/30"
          />
        </FormField>

        {/* Date & Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Expense Date" error={fieldErrors.date} required>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/30"
            />
          </FormField>

          <FormField label="Invoice / Reference #" error={fieldErrors.reference}>
            <input
              type="text"
              placeholder="e.g. INV-2026-0901"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/30"
            />
          </FormField>
        </div>

        {/* Notes */}
        <FormField label="Additional Notes / Remarks" error={fieldErrors.notes}>
          <textarea
            rows={2}
            placeholder="Optional additional context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/30 resize-none"
          />
        </FormField>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C7DDCC]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#555279] hover:text-[#16123F] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-5 py-2 text-xs font-extrabold text-[#16123F] bg-[#FFE26A] hover:bg-[#ebce58] rounded-full transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
