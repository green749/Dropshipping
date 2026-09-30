import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../../store/slices/customerSlice';
import { fetchBusinesses, selectBusiness } from '../../store/slices/businessSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import type { Customer } from '../../types';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import { isValidEmail, isValidPhone, sanitizePhoneInput } from '../../utils/validation';
import { UserSquare2, Plus, Edit2, Trash2, Mail, Phone, MapPin, Building2 } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customers, isLoading } = useAppSelector((state) => state.customer);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);
  const { user } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State
  const [businessId, setBusinessId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  useEffect(() => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setDeleteTarget(null);

    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchCustomers(params));
    dispatch(fetchBusinesses());
  }, [dispatch, selectedBusiness?.id]);


  const businessMap = useMemo(() => {
    const map = new Map<string, string>();
    businesses.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [businesses]);

  const filteredCustomers = useMemo(() => {
    const targetBusiness = selectedBusiness || (user?.role !== 'DROPSHIPPER' && businesses.length > 0 ? businesses[0] : null);

    return customers.filter((c) => {
      if (targetBusiness) {
        if (c.business_id && c.business_id !== targetBusiness.id) return false;
      } else if (user?.role !== 'DROPSHIPPER') {
        if (businesses.length === 0) return false;
        const assignedBizIds = new Set(businesses.map((b) => b.id));
        if (c.business_id && !assignedBizIds.has(c.business_id)) return false;
      }

      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phone && c.phone.toLowerCase().includes(term))
      );
    });
  }, [customers, selectedBusiness, debouncedSearch, user, businesses]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredCustomers, { itemsPerPage: 8 });

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setBusinessId(selectedBusiness?.id || businesses[0]?.id || '');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setBusinessId(customer.business_id);
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone || '');
    setAddress(customer.address || '');
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Customer full legal name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address (e.g. customer@example.com).';
    }

    if (phone.trim() && !isValidPhone(phone)) {
      errors.phone = 'Please enter a valid phone number (7 to 15 digits without letters).';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before submitting.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    if (editingCustomer) {
      const res = await dispatch(
        updateCustomer({
          id: editingCustomer.id,
          data: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, address: address.trim() || undefined },
        })
      );
      if (updateCustomer.fulfilled.match(res)) {
        dispatch(addToast({ type: 'success', message: 'Customer updated successfully' }));
        setIsModalOpen(false);
      } else {
        setFormError((res?.payload as unknown as string) || 'Failed to update customer');
      }
    } else {
      const res = await dispatch(
        createCustomer({
          business_id: businessId || selectedBusiness?.id || businesses[0]?.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        })
      );
      if (createCustomer.fulfilled.match(res)) {
        dispatch(addToast({ type: 'success', message: 'Customer created successfully' }));
        setIsModalOpen(false);
      } else {
        setFormError((res?.payload as unknown as string) || 'Failed to create customer');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await dispatch(deleteCustomer(deleteTarget.id));
    if (deleteCustomer.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Customer deleted' }));
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to delete customer' }));
    }
    setDeleteTarget(null);
  };

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
      key: 'business_id',
      header: 'Assigned Store',
      render: (c) => (
        <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate max-w-[160px]">
            {businessMap.get(c.business_id) || `Store #${c.business_id.slice(0, 6)}`}
          </span>
        </span>
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
        <span className="text-sm font-normal text-slate-600 flex items-center gap-1 max-w-xs truncate">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          {c.address || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <Badge variant="success" size="sm">
          Active
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(c);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Edit Customer"
            aria-label="Edit Customer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(c);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Customer"
            aria-label="Delete Customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Customer Management Directory
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by customer name, email, or phone..."
          className="max-w-md w-full"
        />
      </div>

      {/* Scannable Customers Table */}
      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(c) => c.id}
        emptyTitle="No customer profiles found"
        emptyDescription="Register a customer manually or wait for incoming storefront customer checkouts."
        emptyActionText="Add Customer"
        onEmptyAction={handleOpenCreate}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFieldErrors({});
        }}
        title={editingCustomer ? 'Edit Customer Profile' : 'Add New Customer Profile'}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormAlert message={formError} onClose={() => setFormError(null)} />

          <FormField
            label="Full Legal Name"
            htmlFor="customer-name-input"
            required
            error={fieldErrors.name}
          >
            <input
              id="customer-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Sarah Jenkins"
              className={`input-field ${fieldErrors.name ? 'border-rose-400 focus:ring-rose-200' : ''}`}
            />
          </FormField>

          <FormField
            label="Email Address"
            htmlFor="customer-email-input"
            required
            error={fieldErrors.email}
          >
            <input
              id="customer-email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="e.g. sarah@example.com"
              className={`input-field ${fieldErrors.email ? 'border-rose-400 focus:ring-rose-200' : ''}`}
            />
          </FormField>

          <FormField
            label="Phone Number"
            htmlFor="customer-phone-input"
            error={fieldErrors.phone}
          >
            <input
              id="customer-phone-input"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(sanitizePhoneInput(e.target.value));
                setFieldErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g. +91 98765 43210"
              className={`input-field font-mono ${fieldErrors.phone ? 'border-rose-400 focus:ring-rose-200' : ''}`}
            />
          </FormField>

          <FormField
            label="Default Shipping Address"
            htmlFor="customer-address-input"
          >
            <textarea
              id="customer-address-input"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Market St, Suite 400..."
              className="input-field"
            />
          </FormField>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormError(null);
                setFieldErrors({});
              }}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs"
            >
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Customer Record"
        message={`Are you sure you want to remove customer profile "${deleteTarget?.name}"? Historical orders will retain their snapshot record.`}
        confirmText="Delete Customer"
        isDestructive={true}
      />
    </div>
  );
};
