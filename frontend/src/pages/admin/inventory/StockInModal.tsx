import React, { useState, useEffect } from 'react';
import type { IntelligentProduct, Dealer, StockInPayload } from '../../../types';
import { X, PlusCircle, Package, Building2, Hash, FileText } from 'lucide-react';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IntelligentProduct | null;
  allProducts: IntelligentProduct[];
  dealers: Dealer[];
  onSubmit: (payload: StockInPayload) => Promise<void>;
  isSubmitting: boolean;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  product,
  allProducts,
  dealers,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(product?.id || '');
  const [selectedDealerId, setSelectedDealerId] = useState(product?.dealerId || '');
  const [quantity, setQuantity] = useState<string>('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setQuantity('');
    setReference('');
    setNotes('');
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (product) {
        setSelectedProductId(product.id);
        setSelectedDealerId(product.dealerId || '');
      } else if (allProducts.length > 0) {
        setSelectedProductId(allProducts[0].id);
        setSelectedDealerId(allProducts[0].dealerId || '');
      }
    }
  }, [isOpen, product, allProducts]);

  if (!isOpen) return null;

  const activeProd = allProducts.find((p) => p.id === selectedProductId) || product;
  const currentStock = activeProd?.stockQuantity || 0;
  const qtyNum = parseInt(quantity, 10) || 0;
  const resultingStock = currentStock + qtyNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }
    if (!qtyNum || qtyNum <= 0) {
      setError('Please enter a valid quantity greater than zero');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        product_id: selectedProductId,
        dealer_id: selectedDealerId || undefined,
        quantity: qtyNum,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit stock-in');
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16123F]">
                Stock-In Procurement Intake
              </h2>
              <p className="text-xs text-[#16123F]/60">
                Record verified supplier stock shipments into inventory
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
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const found = allProducts.find((p) => p.id === e.target.value);
                if (found?.dealerId) setSelectedDealerId(found.dealerId);
              }}
              disabled={!!product}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 disabled:bg-slate-100 shadow-xs cursor-pointer"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current Stock: {p.stockQuantity}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier / Dealer Select */}
          <div>
            <label className="block text-xs font-bold text-[#16123F] mb-1">
              Supplier / Dealer Partner
            </label>
            <select
              value={selectedDealerId}
              onChange={(e) => setSelectedDealerId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs cursor-pointer"
            >
              <option value="">Direct / Primary Supplier</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Live Stock Preview */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-bold text-[#16123F] mb-1">
                Units to Stock In (+) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="Enter units to add e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] font-bold focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs"
              />
            </div>

            {/* Clear Step-by-Step Transition Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F0F6F2] border border-[#C7DDCC]/70 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#16123F]/60 uppercase">
                  Current Stock
                </span>
                <span className="font-extrabold text-[#16123F] text-sm">
                  {currentStock} units
                </span>
              </div>
              <span className="text-slate-400 font-bold text-base">+</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#16123F]/60 uppercase">
                  Inflow
                </span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  +{qtyNum} units
                </span>
              </div>
              <span className="text-slate-400 font-bold text-base">=</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#16123F]/60 uppercase">
                  Projected Stock
                </span>
                <span className="font-black text-emerald-700 text-sm">
                  {resultingStock} units
                </span>
              </div>
            </div>
          </div>

          {/* Reference PO */}
          <div>
            <label className="block text-xs font-bold text-[#16123F] mb-1">
              Purchase Order / Reference #
            </label>
            <input
              type="text"
              placeholder="e.g. PO-2026-0928, BL-9941"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] placeholder-[#16123F]/40 focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#16123F] mb-1">
              Internal Receiving Notes
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes regarding carrier, batch inspection, or shipment conditions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] placeholder-[#16123F]/40 focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs resize-none"
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
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Recording Inflow...' : 'Confirm Stock-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
