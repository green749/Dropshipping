import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import type { Customer } from '../../types';
import { UserSquare2, Mail, Phone, MapPin } from 'lucide-react';

export const DealerCustomersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customers, isLoading } = useAppSelector((state) => state.customer);
  const { selectedBusiness } = useAppSelector((state) => state.business);

  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchCustomers(params));
  }, [dispatch, selectedBusiness?.id]);

  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch) return customers;
    const term = debouncedSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phone && c.phone.toLowerCase().includes(term))
    );
  }, [customers, debouncedSearch]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredCustomers, { itemsPerPage: 8 });

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 select-none">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block text-sm tracking-tight">{c.name}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      render: (c) => (
        <span className="text-sm font-medium text-slate-600 flex items-center gap-1 font-mono">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          {c.phone || '—'}
        </span>
      ),
    },
    {
      key: 'address',
      header: 'Shipping Address',
      render: (c) => (
        <span className="text-sm font-normal text-slate-600 flex items-center gap-1.5 truncate max-w-sm">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          {c.address || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: () => (
        <Badge variant="success" size="sm">
          Active
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Customer Delivery Directory
          </h1>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search shoppers by name or email..."
          className="max-w-md w-full"
        />
        <span className="text-xs text-[#535F80] hidden sm:inline">
          {filteredCustomers.length} registered shoppers
        </span>
      </div>

      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(c) => c.id}
        emptyTitle="No customers yet"
        emptyDescription="Shoppers who purchase your products will appear here."
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
