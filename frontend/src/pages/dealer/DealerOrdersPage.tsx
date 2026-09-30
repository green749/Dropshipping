import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import type { Order } from '../../types';
import { Eye, Truck, Package, MapPin } from 'lucide-react';

export const DealerOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((state) => state.order);
  const { selectedBusiness } = useAppSelector((state) => state.business);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setSelectedOrder(null);
    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchOrders(params));
  }, [dispatch, selectedBusiness?.id]);


  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return orders;
    const term = debouncedSearch.toLowerCase();
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(term) ||
        (o.shipping_address && o.shipping_address.toLowerCase().includes(term))
    );
  }, [orders, debouncedSearch]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredOrders, { itemsPerPage: 8 });

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await dispatch(updateOrderStatus({ id, status: newStatus }));
    if (updateOrderStatus.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: `Order status updated to ${newStatus}` }));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to update order status' }));
    }
  };

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      header: 'Order Number',
      render: (o) => (
        <span className="font-mono font-semibold text-slate-900 text-sm">{o.order_number}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (o) => (
        <span className="text-sm text-slate-500 font-normal">
          {new Date(o.createdAt || o.created_at || Date.now()).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'shipping_address',
      header: 'Destination',
      render: (o) => (
        <span className="text-sm text-slate-700 max-w-xs truncate block font-normal">
          {o.shipping_address || 'Direct Dispatch'}
        </span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Order Total',
      align: 'right',
      render: (o) => (
        <span className="font-semibold text-slate-900 tabular-nums text-sm">
          ${Number(o.total_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Fulfillment Status',
      render: (o) => (
        <select
          value={o.status}
          onChange={(e) => handleStatusChange(o.id, e.target.value)}
          className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
        </select>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (o) => (
        <button
          onClick={() => setSelectedOrder(o)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="View Details"
          aria-label="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Supplier Fulfillment Queue
          </h1>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by order # or delivery city..."
          className="max-w-md w-full"
        />
        <span className="text-xs text-[#535F80] hidden sm:inline">
          {filteredOrders.length} fulfillment tasks
        </span>
      </div>

      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(o) => o.id}
        emptyTitle="No fulfillment orders"
        emptyDescription="Orders containing your assigned products will show up here for packaging and dispatch."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />

      {/* Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Fulfillment Dispatch — ${selectedOrder?.order_number}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-xl border border-[rgba(5,23,71,0.08)] text-xs text-[#535F80] space-y-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Destination Address:</span>
              </span>
              <p className="text-[#535F80] pl-5">
                {selectedOrder.shipping_address || 'Direct Delivery to Customer'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#535F80] flex items-center gap-1.5 uppercase tracking-wider">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <span>Package Items ({selectedOrder.items?.length || 0}):</span>
              </span>
              <div className="divide-y divide-white/[0.04] border border-[rgba(5,23,71,0.08)] rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-white flex items-center justify-between text-xs">
                    <span className="text-white font-medium">SKU #{item.product_id.slice(0, 8)}</span>
                    <span className="text-[#535F80] font-mono">&times; {item.quantity} units</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
