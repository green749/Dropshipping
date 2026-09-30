import { useState, useMemo, useCallback } from 'react';

export interface PaginationOptions {
  totalItems?: number;
  initialPage?: number;
  itemsPerPage?: number;
}

export interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  pageItems: T[];
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canPrev: boolean;
  canNext: boolean;
  from: number;
  to: number;
}

/**
 * Client-side pagination hook.
 *
 * @example
 * const { paginatedItems, currentPage, totalPages, nextPage, prevPage } =
 *   usePagination(products, { itemsPerPage: 10 });
 */
export function usePagination<T>(
  items: T[],
  options: { itemsPerPage?: number; initialPage?: number } = {}
): PaginationResult<T> {
  const { itemsPerPage = 10, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / itemsPerPage)),
    [items.length, itemsPerPage]
  );

  // Clamp page if items shrink
  const safePage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, safePage, itemsPerPage]);

  const goToPage = useCallback(
    (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages)),
    [totalPages]
  );

  const nextPage = useCallback(() => goToPage(safePage + 1), [safePage, goToPage]);
  const prevPage = useCallback(() => goToPage(safePage - 1), [safePage, goToPage]);

  const from = items.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const to = Math.min(safePage * itemsPerPage, items.length);

  return {
    currentPage: safePage,
    totalPages,
    pageItems,
    paginatedItems: pageItems,
    goToPage,
    nextPage,
    prevPage,
    canPrev: safePage > 1,
    canNext: safePage < totalPages,
    from,
    to,
  };
}
