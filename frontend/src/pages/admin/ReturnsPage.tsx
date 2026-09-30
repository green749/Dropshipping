import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchReturns, createReturn, updateReturnStatus } from '../../store/slices/returnSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchDealers } from '../../store/slices/dealerSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import type { BadgeVariant } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import type { ReturnRecord, ReturnStatus } from '../../types';
import { Plus, Edit2, Package, Building2 } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { returns, isLoading } = useAppSelector((state) => state.return);
  const { orders } = useAppSelector((state) => state.order);
  const { products } = useAppSelector((state) => state.product);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { selectedBusiness } = useAppSelector((state) => state.business);
  const { user } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRecord | null>(null);

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Status Update State
  const [newStatus, setNewStatus] = useState<ReturnStatus>('APPROVED');
  const [statusResolution, setStatusResolution] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchReturns(params));
    dispatch(fetchOrders(params));
    dispatch(fetchProducts(params));
    dispatch(fetchDealers(params));
  }, [dispatch, selectedBusiness?.id]);

  const activeOrders = useMemo(() => {
    if (!selectedBusiness) return orders;
    return orders.filter((o) => o.business_id === selectedBusiness.id);
  }, [orders, selectedBusiness]);

  const assignedDealerIds = useMemo(() => {
    if (!selectedBusiness) return new Set<string>();
    const set = new Set<string>();
    (Array.isArray(dealers) ? dealers : []).forEach((d) => {
      const isAssigned =
        d.business_id === selectedBusiness.id ||
        d.businesses?.some((b: any) => b.id === selectedBusiness.id);
      if (isAssigned) {
        if (d.id) set.add(d.id);
        if (d.user_id) set.add(d.user_id);
      }
    });
    return set;
  }, [dealers, selectedBusiness]);

  const activeProducts = useMemo(() => {
    if (!selectedBusiness) return products;
    return products.filter(
      (p) => p.business_id === selectedBusiness.id || (p.dealer_id && assignedDealerIds.has(p.dealer_id))
    );
  }, [products, selectedBusiness, assignedDealerIds]);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (selectedBusiness && r.business_id && r.business_id !== selectedBusiness.id) return false;
      if (user?.role === 'DEALER' && r.dealer_id && r.dealer_id !== user.id) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        r.order_number?.toLowerCase().includes(term) ||
        r.customer_name?.toLowerCase().includes(term) ||
        r.product_name?.toLowerCase().includes(term) ||
        r.reason.toLowerCase().includes(term)
      );
    });
  }, [returns, selectedBusiness, user, statusFilter, debouncedSearch]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredReturns, { itemsPerPage: 10 });

  // Handle Order Selection in Create Return Form
  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    setFieldErrors((prev) => ({ ...prev, orderId: '' }));
    const ord = orders.find((o) => o.id === orderId);
    if (ord && ord.items && ord.items.length > 0) {
      setSelectedProductId(ord.items[0].product_id);
      setFieldErrors((prev) => ({ ...prev, productId: '' }));
      setRefundAmount(ord.total_amount.toString());
    }
  };

  const handleCreateReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!selectedOrderId) {
      errors.orderId = 'Please select an active order for this return.';
    }
    if (!selectedProductId) {
      errors.productId = 'Please select a product item from the list.';
    }
    if (!returnReason.trim()) {
      errors.reason = 'Please provide a reason for the return request.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before submitting.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const ord = orders.find((o) => o.id === selectedOrderId);
    const prod = products.find((p) => p.id === selectedProductId);
    const dealer = dealers.find((d) => d.id === prod?.dealer_id || d.user_id === prod?.dealer_id);

    const payload: Partial<ReturnRecord> = {
      order_id: selectedOrderId,
      order_number: ord?.order_number || `#ORD-${Date.now().toString().slice(-4)}`,
      business_id: selectedBusiness?.id || ord?.business_id || '',
      customer_id: ord?.customer_id,
      customer_name: ord?.customer?.name || 'Valued Customer',
      dealer_id: prod?.dealer_id || dealer?.id,
      dealer_name: dealer?.company_name || 'Authorized Supplier Node',
      product_id: selectedProductId,
      product_name: prod?.name || 'Product Item',
      reason: returnReason,
      status: 'REQUESTED',
      refund_amount: parseFloat(refundAmount) || (ord ? Number(ord.total_amount) : 0),
      resolution: resolutionText || 'Under review by wholesale dealer and support team',
    };

    const res = await dispatch(createReturn(payload));
    if (createReturn.fulfilled.match(res)) {
      dispatch(
        addToast({
          type: 'success',
          message: `Return request initiated for ${payload.order_number}!`,
        })
      );
      setIsCreateModalOpen(false);
      setSelectedOrderId('');
      setSelectedProductId('');
      setReturnReason('');
      setRefundAmount('');
      setResolutionText('');
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    const res = await dispatch(
      updateReturnStatus({
        id: selectedReturn.id,
        status: newStatus,
        resolution: statusResolution,
      })
    );

    if (updateReturnStatus.fulfilled.match(res)) {
      dispatch(
        addToast({
          type: 'success',
          message: `Return ${selectedReturn.order_number} status updated to ${newStatus}!`,
        })
      );
      setSelectedReturn(null);
    }
  };

  const getStatusBadge = (status: ReturnStatus): BadgeVariant => {
    switch (status) {
      case 'REFUNDED':
      case 'REPLACED':
      case 'CLOSED':
        return 'success';
      case 'APPROVED':
      case 'PICKUP_SCHEDULED':
      case 'RECEIVED':
        return 'primary';
      case 'REQUESTED':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: Column<ReturnRecord>[] = useMemo(() => {
    return [
      {
        key: 'order_number',
        header: 'ORDER #',
        render: (r) => (
          <span className="font-mono font-bold text-[#16123F] text-xs">
            {r.order_number}
          </span>
        ),
      },
      {
        key: 'customer',
        header: 'CUSTOMER',
        render: (r) => (
          <span className="font-semibold text-[#16123F] text-xs">
            {r.customer_name || 'Customer'}
          </span>
        ),
      },
      {
        key: 'product',
        header: 'PRODUCT',
        render: (r) => (
          <div className="flex items-center gap-1.5 font-medium text-[#16123F] text-xs">
            <Package className="w-3.5 h-3.5 text-[#16123F]/40" />
            <span>{r.product_name || 'Product'}</span>
          </div>
        ),
      },
      {
        key: 'dealer',
        header: 'SUPPLIER',
        render: (r) => (
          <div className="flex items-center gap-1.5 text-[#555279] text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#16123F]/40" />
            <span>{r.dealer_name || 'Wholesale Supplier'}</span>
          </div>
        ),
      },
      {
        key: 'reason',
        header: 'REASON',
        render: (r) => (
          <span className="text-[#555279] text-xs truncate max-w-xs block">
            {r.reason}
          </span>
        ),
      },
      {
        key: 'refund_amount',
        header: 'REFUND AMOUNT',
        render: (r) => (
          <span className="font-bold text-xs text-emerald-700">
            ₹{Number(r.refund_amount || 0).toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'STATUS',
        render: (r) => (
          <Badge variant={getStatusBadge(r.status)} size="sm">
            {r.status.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'ACTIONS',
        align: 'right',
        render: (r) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReturn(r);
              setNewStatus(r.status);
              setStatusResolution(r.resolution || '');
            }}
            className="p-1.5 rounded-lg text-[#16123F]/60 hover:text-[#16123F] hover:bg-[#F4F5FA] border border-transparent hover:border-[#C7DDCC] transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
            title="Manage Return"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>
        ),
      },
    ];
  }, []);

  const canCreateReturn = user?.role !== 'DEALER';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Customer Returns
          </h1>
          {user?.role === 'DEALER' && (
            <p className="text-xs text-[#555279] mt-1">
              Review received return shipments, inspect product conditions, and update resolution statuses.
            </p>
          )}
        </div>

        {canCreateReturn && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Request Return</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search returns by order #, customer, product or reason..."
          className="max-w-md w-full"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'REQUESTED', label: 'Requested' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
                { value: 'RECEIVED', label: 'Received' },
                { value: 'REFUNDED', label: 'Refunded' },
                { value: 'REPLACED', label: 'Replaced' },
                { value: 'CLOSED', label: 'Closed' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Standard Table with Consistent Empty State */}
      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        emptyTitle="No return requests found"
        emptyDescription={
          canCreateReturn
            ? selectedBusiness
              ? `Adjust your search filters or click Request Return to create a new return for ${selectedBusiness.name}.`
              : 'Adjust your search filters or click Request Return to create a new return.'
            : 'No return requests have been assigned to your dealer account.'
        }
        emptyActionText={canCreateReturn ? 'Request Return' : undefined}
        onEmptyAction={canCreateReturn ? () => setIsCreateModalOpen(true) : undefined}
        keyExtractor={(r) => r.id}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />

      {/* ─── Create Return Modal ─── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormError(null);
          setFieldErrors({});
        }}
        title="Initiate Customer Return Request"
        maxWidth="md"
      >
        <form onSubmit={handleCreateReturnSubmit} noValidate className="space-y-4 text-xs">
          <FormAlert message={formError} onClose={() => setFormError(null)} />

          <FormField
            label="Select Active Order"
            htmlFor="return-order-select"
            required
            error={fieldErrors.orderId}
          >
            <Select
              id="return-order-select"
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              placeholder="-- Choose Order --"
              className={fieldErrors.orderId ? 'border-rose-400 focus:ring-rose-200' : ''}
            >
              <option value="">-- Choose Order --</option>
              {activeOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_number} — ₹{Number(o.total_amount).toLocaleString('en-IN')} ({o.customer?.name || 'Customer'})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Returned Product SKU"
            htmlFor="return-product-select"
            required
            error={fieldErrors.productId}
          >
            <Select
              id="return-product-select"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setFieldErrors((prev) => ({ ...prev, productId: '' }));
              }}
              placeholder="-- Choose Product --"
              className={fieldErrors.productId ? 'border-rose-400 focus:ring-rose-200' : ''}
            >
              <option value="">-- Choose Product --</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Reason for Return"
            htmlFor="return-reason-input"
            required
            error={fieldErrors.reason}
          >
            <textarea
              id="return-reason-input"
              value={returnReason}
              onChange={(e) => {
                setReturnReason(e.target.value);
                setFieldErrors((prev) => ({ ...prev, reason: '' }));
              }}
              placeholder="e.g. Size mismatch, defective zip, or customer requested replacement..."
              rows={2}
              className={`input-field ${fieldErrors.reason ? 'border-rose-400 focus:ring-rose-200' : ''}`}
            />
          </FormField>

          <FormField label="Refund / Credit Amount (₹)" htmlFor="return-refund-input">
            <input
              id="return-refund-input"
              type="number"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormError(null);
                setFieldErrors({});
              }}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Submit Return Request
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Manage Return Status Modal ─── */}
      {selectedReturn && (
        <Modal
          isOpen={Boolean(selectedReturn)}
          onClose={() => setSelectedReturn(null)}
          title={`Process Return: ${selectedReturn.order_number}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStatusSubmit} noValidate className="space-y-4 text-xs">
            <div className="p-3 bg-[#F4F5FA] rounded-2xl border border-[#C7DDCC] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#555279] tracking-wider block">Customer Reason</span>
              <p className="text-xs font-semibold text-[#16123F]">{selectedReturn.reason}</p>
            </div>

            <div>
              <label className="form-label">Update Return Status *</label>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReturnStatus)}
              >
                <option value="REQUESTED">REQUESTED (Pending Dealer Review)</option>
                <option value="APPROVED">APPROVED (Authorized for Pickup)</option>
                <option value="PICKUP_SCHEDULED">PICKUP_SCHEDULED (Courier Dispatched)</option>
                <option value="RECEIVED">RECEIVED (Inspecting at Warehouse)</option>
                <option value="REFUNDED">REFUNDED (Payment Returned)</option>
                <option value="REPLACED">REPLACED (New Item Dispatched)</option>
                <option value="REJECTED">REJECTED (Declined)</option>
                <option value="CLOSED">CLOSED (Completed)</option>
              </Select>
            </div>

            <div>
              <label className="form-label">Dealer / Support Resolution Note</label>
              <textarea
                value={statusResolution}
                onChange={(e) => setStatusResolution(e.target.value)}
                placeholder="e.g. Inspected condition at hub, replacement order #ORD-1099 dispatched via BlueDart."
                rows={2}
                className="input-field"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs">
                Save & Dispatch Notifications
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
