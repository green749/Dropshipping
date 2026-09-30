import React from 'react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display at this time.',
  emptyActionText,
  onEmptyAction,
  keyExtractor,
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <Spinner size="lg" />
        <span className="text-caption font-semibold text-slate-400 mt-3 tracking-wide uppercase">
          Loading data...
        </span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={emptyActionText}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
            {columns.map((col, idx) => {
              const alignClass =
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                  ? 'text-center'
                  : 'text-left';

              const paddingClass = idx === 0 ? 'py-4 pl-6 pr-4' : idx === columns.length - 1 ? 'py-4 pr-6 px-4' : 'py-4 px-4';

              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`${paddingClass} font-semibold ${alignClass} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/80">
          {data.map((item, index) => {
            const id = keyExtractor(item);

            return (
              <tr
                key={id}
                onClick={() => onRowClick?.(item)}
                className={`transition-all duration-150 group hover:bg-slate-50/70 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, idx) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                  const paddingClass = idx === 0 ? 'py-4 pl-6 pr-4' : idx === columns.length - 1 ? 'py-4 pr-6 px-4' : 'py-4 px-4';

                  return (
                    <td
                      key={col.key}
                      className={`${paddingClass} text-sm text-slate-700 font-normal ${alignClass} ${
                        col.className || ''
                      }`}
                    >
                      {col.render
                        ? col.render(item, index)
                        : (item as Record<string, any>)[col.key] ?? '—'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
