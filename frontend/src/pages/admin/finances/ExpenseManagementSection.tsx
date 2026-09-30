import React, { useState, useMemo } from 'react';
import type { Expense, ExpenseCategorySummary } from '../../../types';
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  Edit2,
} from 'lucide-react';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Pagination } from '../../../components/common/Pagination';

interface ExpenseManagementSectionProps {
  expenses: Expense[];
  categorySummary: ExpenseCategorySummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  onAddClick: () => void;
  onEditClick: (expense: Expense) => void;
  onDeleteClick: (id: string) => Promise<void>;
  onPageChange?: (page: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Advertising: 'bg-[#FFE26A]/25 text-[#16123F] border-[#FFE26A]',
  Shipping: 'bg-[#75C9B7]/20 text-[#16123F] border-[#75C9B7]',
  Packaging: 'bg-[#ABD699]/25 text-[#16123F] border-[#ABD699]',
  'Payment Gateway': 'bg-[#F0F6F2] text-[#16123F] border-[#C7DDCC]',
  'Supplier/Dealer': 'bg-[#F0F6F2] text-[#16123F] border-[#C7DDCC]',
  Software: 'bg-[#FFE26A]/30 text-[#16123F] border-[#FFE26A]',
  Salaries: 'bg-[#ABD699]/30 text-[#16123F] border-[#ABD699]',
  Operations: 'bg-[#F0F6F2] text-[#16123F] border-[#C7DDCC]',
  Refunds: 'bg-rose-100 text-rose-800 border-rose-200',
  Returns: 'bg-rose-100 text-rose-800 border-rose-200',
  Other: 'bg-[#F0F6F2] text-[#555279] border-[#C7DDCC]',
};

export const ExpenseManagementSection: React.FC<ExpenseManagementSectionProps> = ({
  expenses,
  categorySummary,
  pagination,
  isLoading,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onPageChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        e.description.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term) ||
        (e.reference && e.reference.toLowerCase().includes(term))
      );
    });
  }, [expenses, selectedCategory, searchTerm]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await onDeleteClick(deleteTargetId);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white rounded-[32px] p-6 border border-[#C7DDCC] shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-[#16123F] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#F0F6F2] text-[#75C9B7]">
              <Receipt className="w-4 h-4" />
            </span>
            Operating Expenses & Overhead
          </h3>
          <p className="text-xs text-[#555279] mt-0.5 font-medium">
            Log marketing campaigns, logistics bills, SaaS tools, and business overheads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555279]" />
            <input
              type="text"
              placeholder="Search description / ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-full border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/40"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by Expense Category"
            className="px-3 py-1.5 text-xs rounded-full border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Add Expense Button with Theme Gold */}
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-[#16123F] bg-[#FFE26A] hover:bg-[#ebce58] rounded-full transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 font-black" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Category Pills Breakdown Styled with Theme */}
      {categorySummary.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-[#C7DDCC]/50">
          <span className="text-xs font-bold text-[#555279] mr-2">Top Categories:</span>
          {categorySummary.map((c) => (
            <button
              key={c.category}
              onClick={() => setSelectedCategory(selectedCategory === c.category ? 'ALL' : c.category)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                selectedCategory === c.category
                  ? 'ring-2 ring-[#16123F] shadow-xs'
                  : ''
              } ${CATEGORY_COLORS[c.category] || CATEGORY_COLORS['Other']}`}
            >
              <span>{c.category}:</span>
              <span className="font-black">{formatCurrency(c.total_amount)}</span>
              <span className="text-[10px] opacity-75">({c.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#C7DDCC]/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0F6F2] text-[11px] font-black text-[#16123F] uppercase tracking-wider border-b border-[#C7DDCC]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C7DDCC]/40 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#555279]">
                  Loading expenses...
                </td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#555279]">
                  No expense records found. Click "Add Expense" to log your first bill.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-[#F2F8F4] transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-[#555279]">
                    {exp.date ? exp.date.split('T')[0] : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        CATEGORY_COLORS[exp.category] || CATEGORY_COLORS['Other']
                      }`}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#16123F]">
                    <div>{exp.description}</div>
                    {exp.notes && (
                      <div className="text-[11px] text-[#555279] font-normal mt-0.5">
                        {exp.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#555279] font-medium">
                    {exp.reference || '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#16123F]">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onEditClick(exp)}
                        aria-label="Edit Expense"
                        className="p-1.5 rounded-full text-[#555279] hover:text-[#16123F] hover:bg-[#F0F6F2] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(exp.id)}
                        aria-label="Delete Expense"
                        className="p-1.5 rounded-full text-[#555279] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="mt-4 pt-4 border-t border-[#C7DDCC]/50 flex justify-end">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            canPrev={pagination.page > 1}
            canNext={pagination.page < pagination.totalPages}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense record? This will adjust your overall net profit calculations immediately."
        confirmText="Delete Record"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
