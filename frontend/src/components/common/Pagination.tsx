import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canNext: boolean;
  canPrev: boolean;
}

export const Pagination: React.FC<PaginationProps> = React.memo(({
  currentPage,
  totalPages,
  onPageChange,
  canNext,
  canPrev,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t border-[rgba(5,23,71,0.08)] text-small">
      <span className="text-[#535F80] font-normal">
        Page <span className="font-semibold text-[#051747]">{currentPage}</span> of{' '}
        <span className="font-semibold text-[#051747]">{totalPages}</span>
      </span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
          className="px-3 py-1.5 rounded-lg border border-[rgba(5,23,71,0.08)] bg-white text-[#535F80] hover:bg-[#F4F6F9] hover:text-[#051747] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-caption font-semibold"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          className="px-3 py-1.5 rounded-lg border border-[rgba(5,23,71,0.08)] bg-white text-[#535F80] hover:bg-[#F4F6F9] hover:text-[#051747] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-caption font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';
