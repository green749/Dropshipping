import React, { useState, useEffect } from 'react';
import type { IntelligentProduct, StockAdjustmentPayload } from '../../../types';
import { X, SlidersHorizontal, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IntelligentProduct | null;
  allProducts: IntelligentProduct[];
  onSubmit: (payload: StockAdjustmentPayload) => Promise<void>;
  isSubmitting: boolean;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  allProducts,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(product?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'ADJUSTMENT' | 'DAMAGED' | 'LOST'>('ADJUSTMENT');
  const [deltaQuantity, setDeltaQuantity] = useState<number>(-1);
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setAdjustmentType('ADJUSTMENT');
    setDeltaQuantity(-1);
    setReason('');
    setReference('');
    setNotes('');
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (product) {
        setSelectedProductId(product.id);
      } else if (allProducts.length > 0) {
        setSelectedProductId(allProducts[0].id);
      }
    }
  }, [isOpen, product, allProducts]);

  if (!isOpen) return null;

  const activeProd = allProducts.find((p) => p.id === selectedProductId) || product;
  const currentStock = activeProd?.stockQuantity || 0;
  const resultingStock = currentStock + Number(deltaQuantity || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }
    if (deltaQuantity === 0) {
      setError('Adjustment quantity cannot be zero');
      return;
    }
    if (resultingStock < 0) {
      setError(`Adjustment would cause negative inventory (${resultingStock}). Minimum allowed is 0.`);
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a mandatory reason for stock adjustment');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        product_id: selectedProductId,
        transaction_type: adjustmentType,
        quantity: Number(deltaQuantity),
        reason: reason.trim(),
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit stock adjustment');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-2xl border border-[#C7DDCC]/80 rounded-[30px] w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#C7DDCC]/60 flex items-center justify-between bg-[#F8FAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16123F]">
                Manual Inventory Adjustment
              </h2>
              <p className="text-xs text-[#16123F]/60">
                Record audited changes for damages, loss, or count corrections
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-[#16123F]/50 hover:text-[#16123F] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="block text-xs font-bold text-[#16123F] mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={!!product}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 disabled:bg-slate-100 shadow-xs cursor-pointer"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available: {p.availableStock} / Total: {p.stockQuantity}
                </option>
              ))}
            </select>
          </div>

          {/* Adjustment Type Radio/Pills */}
          <div>
            <label className="block text-xs font-bold text-[#16123F] mb-1.5">
              Adjustment Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ADJUSTMENT', label: 'Correction', desc: 'Audit count fix' },
                { id: 'DAMAGED', label: 'Damaged', desc: 'Warehouse write-off' },
                { id: 'LOST', label: 'Lost / Theft', desc: 'Transit shrinkage' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAdjustmentType(t.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    adjustmentType === t.id
                      ? 'border-[#16123F] bg-[#16123F] text-white shadow-xs'
                      : 'border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F]/70 hover:bg-white'
                  }`}
                >
                  <p className="font-bold text-xs">{t.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Delta (+/-) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#16123F] mb-1">
                Adjustment Delta (+ / -) *
              </label>
              <input
                type="number"
                value={deltaQuantity}
                onChange={(e) => setDeltaQuantity(parseInt(e.target.value, 10) || 0)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] font-bold focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs"
              />
              <p className="text-[10px] text-[#16123F]/50 mt-1">
                Use negative for deductions (e.g. -3)
              </p>
            </div>
            <div
              className={`p-3 rounded-xl border flex flex-col justify-center ${
                resultingStock < 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-[#F0F6F2] border-[#C7DDCC]/60'
              }`}
            >
              <span className="text-[10px] font-bold text-[#16123F]/60 uppercase">
                Stock Transition
              </span>
              <span className="text-sm font-bold mt-0.5">
                {currentStock} → {resultingStock} units
              </span>
            </div>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-bold text-[#16123F] mb-1">
              Reason for Adjustment *
            </label>
            <input
              type="text"
              placeholder="e.g. Broken packaging in rack 4B, physical count variance"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] placeholder-[#16123F]/40 focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs"
            />
          </div>

          {/* Reference # */}
          <div>
            <label className="block text-xs font-bold text-[#16123F] mb-1">
              Audit Ticket / Reference ID
            </label>
            <input
              type="text"
              placeholder="e.g. AUD-2026-0928, TICKET-552"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] placeholder-[#16123F]/40 focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#C7DDCC]/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-[#16123F]/70 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || resultingStock < 0}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Applying Adjustment...' : 'Apply Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
