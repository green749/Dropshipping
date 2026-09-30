import React, { useEffect, useState } from 'react';
import { auditApi } from '../../api/auditApi';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import type { AuditLog } from '../../types';
import { ScrollText, Clock, User, ShieldCheck } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setIsLoading(true);
    auditApi
      .getAll({ limit: 100 })
      .then((res) => {
        setLogs(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load audit logs:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      (log.entity && log.entity.toLowerCase().includes(term)) ||
      (log.user_id && log.user_id.toLowerCase().includes(term))
    );
  });

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredLogs, { itemsPerPage: 10 });

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      header: 'Event Action',
      render: (log) => (
        <Badge
          variant={
            log.action.includes('DELETE')
              ? 'error'
              : log.action.includes('CREATE') || log.action.includes('REGISTER')
              ? 'success'
              : log.action.includes('UPDATE')
              ? 'warning'
              : 'info'
          }
          size="sm"
        >
          {log.action}
        </Badge>
      ),
    },
    {
      key: 'entity',
      header: 'Target Entity & ID',
      render: (log) => (
        <span className="text-sm font-mono text-slate-600">
          <span className="text-indigo-600 font-semibold">{log.entity || 'SYSTEM'}</span>{' '}
          {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}
        </span>
      ),
    },
    {
      key: 'user_id',
      header: 'Actor ID',
      render: (log) => (
        <span className="text-sm text-slate-700 flex items-center gap-1.5 font-mono font-medium">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {log.user_id ? log.user_id.slice(0, 10) + '...' : 'System Agent'}
        </span>
      ),
    },
    {
      key: 'ip_address',
      header: 'Client Origin',
      render: (log) => (
        <span className="text-sm font-mono text-slate-600">
          {log.ip_address || '127.0.0.1 (Internal)'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Timestamp',
      align: 'right',
      render: (log) => (
        <span className="text-xs text-slate-500 flex items-center justify-end gap-1.5 font-mono tabular-nums font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {new Date(log.createdAt || log.created_at || Date.now()).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#051747] tracking-tight">
            Audit Trail & Governance Logs
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tamper-Resistant Log Active</span>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Filter by event action, entity, or actor ID..."
          className="max-w-md w-full"
        />
        <span className="text-xs text-[#535F80] hidden sm:inline">
          {filteredLogs.length} logged events
        </span>
      </div>

      {/* Scannable Audit Table */}
      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(l) => l.id}
        emptyTitle="No audit logs recorded"
        emptyDescription="Security and tenant changes will appear here as users perform actions."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />
    </div>
  );
};
