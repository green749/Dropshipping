import React from 'react';
import type { InventoryTransaction, InventoryTransactionType } from '../../../types';
import {
  History,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  SlidersHorizontal,
  Package,
} from 'lucide-react';

interface StockMovementLedgerProps {
  transactions: InventoryTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  selectedType: string;
  onTypeChange: (type: string) => void;
  onPageChange: (page: number) => void;
}

export const StockMovementLedger: React.FC<StockMovementLedgerProps> = ({
  transactions,
  pagination,
  isLoading,
  selectedType,
  onTypeChange,
  onPageChange,
}) => {
  const transactionTypes = [
    { value: '', label: 'All Transactions' },
    { value: 'STOCK_IN', label: 'Stock-In Receipts' },
    { value: 'STOCK_OUT', label: 'Order Dispatches' },
    { value: 'ORDER_RESERVED', label: 'Order Reservations' },
    { value: 'ORDER_RELEASED', label: 'Order Releases' },
    { value: 'ORDER_CANCELLED', label: 'Order Cancellations' },
    { value: 'RETURN_RECEIVED', label: 'Returns Received' },
    { value: 'ADJUSTMENT', label: 'Audit Adjustments' },
    { value: 'DAMAGED', label: 'Damaged Goods' },
    { value: 'LOST', label: 'Lost / Shrinkage' },
  ];

  const getTypeBadge = (type: InventoryTransactionType) => {
    switch (type) {
      case 'STOCK_IN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> STOCK_IN
          </span>
        );
      case 'STOCK_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowUpRight className="w-3 h-3 text-blue-600" /> STOCK_OUT
          </span>
        );
      case 'ORDER_RESERVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            ORDER_RESERVED
          </span>
        );
      case 'ORDER_RELEASED':
      case 'ORDER_CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RotateCcw className="w-3 h-3" /> {type}
          </span>
        );
      case 'RETURN_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <RotateCcw className="w-3 h-3 text-teal-600" /> RETURN_RECEIVED
          </span>
        );
      case 'DAMAGED':
      case 'LOST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {type}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <SlidersHorizontal className="w-3 h-3" /> {type}
          </span>
        );
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl border border-[#C7DDCC]/70 rounded-[28px] p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-[#16123F] flex items-center gap-2">
            <History className="w-5 h-5 text-[#16123F]" />
            Complete Stock Movement Audit Ledger
          </h3>
          <p className="text-xs text-[#16123F]/60 mt-0.5">
            Full transactional traceability for every stock reservation, fulfillment, inflow, and adjustment
          </p>
        </div>

        {/* Transaction Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#16123F]/60" />
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-3.5 py-1.5 text-xs rounded-xl border border-[#C7DDCC] bg-white text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-xs cursor-pointer"
          >
            {transactionTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#C7DDCC]/60 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAF8] border-b border-[#C7DDCC]/60 text-[11px] font-bold text-[#16123F]/70 uppercase tracking-wider">
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-3">Product Name & SKU</th>
              <th className="py-3 px-3">Transaction Type</th>
              <th className="py-3 px-3">Quantity Delta</th>
              <th className="py-3 px-3">Stock Transition</th>
              <th className="py-3 px-3">Reason & Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C7DDCC]/30">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#16123F]/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-3 border-[#16123F]/20 border-t-[#16123F] rounded-full animate-spin" />
                    <p className="font-medium">Loading ledger records...</p>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#16123F]/50 italic">
                  No stock transactions found for the selected criteria.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isPositive = tx.quantity > 0;
                return (
                  <tr key={tx.id} className="hover:bg-[#F8FAF8]/70">
                    <td className="py-3 px-4 text-[#16123F]/70 whitespace-nowrap">
                      <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-[#16123F]/40 font-mono">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#16123F] max-w-[200px] truncate">
                        {tx.product?.name || 'Catalog Product'}
                      </div>
                      <div className="font-mono text-[10px] text-[#16123F]/60 mt-0.5">
                        {tx.product?.sku || 'SKU-N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {getTypeBadge(tx.transaction_type)}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span
                        className={
                          isPositive
                            ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md'
                            : 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md'
                        }
                      >
                        {isPositive ? `+${tx.quantity}` : tx.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#16123F]">
                      {tx.previous_quantity} → {tx.new_quantity}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[#16123F]/90 font-medium">
                        {tx.reason || 'Standard transaction'}
                      </div>
                      {tx.reference && (
                        <div className="text-[10px] text-[#16123F]/50 font-mono mt-0.5">
                          Ref: {tx.reference}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && transactions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#16123F]/70 px-2">
          <div>
            Showing{' '}
            <span className="font-bold text-[#16123F]">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#16123F]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-[#16123F]">{pagination.total}</span> audit records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-[#C7DDCC] bg-white hover:bg-[#F0F6F2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
            >
              <ChevronLeft className="w-4 h-4 text-[#16123F]" />
            </button>
            <span className="px-3 py-1 font-semibold text-[#16123F]">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl border border-[#C7DDCC] bg-white hover:bg-[#F0F6F2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
            >
              <ChevronRight className="w-4 h-4 text-[#16123F]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
