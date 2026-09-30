import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrders, createOrder, updateOrderStatus } from '../../store/slices/orderSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchDealers } from '../../store/slices/dealerSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { FormAlert } from '../../components/common/FormAlert';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import type { BadgeVariant } from '../../components/common/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import type { Order } from '../../types';
import {
  ShoppingCart,
  RefreshCw,
  Eye,
  Package,
  MapPin,
  X,
  Filter,
  Plus,
  Building2,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((state) => state.order);
  const { customers } = useAppSelector((state) => state.customer);
  const { products } = useAppSelector((state) => state.product);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { selectedBusiness, businesses } = useAppSelector((state) => state.business);
  const { user } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create Order Form State
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sellingPrice, setSellingPrice] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [formError, setFormError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setSelectedOrder(null);
    setIsCreateModalOpen(false);
    setProductId('');
    setCustomerId('');

    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchOrders(params));
    dispatch(fetchCustomers(params));
    dispatch(fetchProducts(params));
    dispatch(fetchDealers(params));
  }, [dispatch, selectedBusiness?.id]);


  const activeCustomers = useMemo(() => {
    if (!selectedBusiness) return customers;
    return customers.filter((c) => c.business_id === selectedBusiness.id);
  }, [customers, selectedBusiness]);

  // Set of dealer IDs assigned to the currently selected business
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

  // Derived Supplying Dealer for the selected product
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [products, productId]);

  const supplyingDealer = useMemo(() => {
    if (!selectedProduct) return null;
    return dealers.find(
      (d) => d.id === selectedProduct.dealer_id || d.user_id === selectedProduct.dealer_id
    );
  }, [selectedProduct, dealers]);

  // When product changes, pre-fill selling price
  const handleProductSelect = (pId: string) => {
    setProductId(pId);
    setFormError(null);
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      const price = prod.selling_price ?? prod.price ?? 0;
      setSellingPrice(price.toString());
    }
  };

  // When customer changes, pre-fill shipping address
  const handleCustomerSelect = (cId: string) => {
    setCustomerId(cId);
    setFormError(null);
    const cust = customers.find((c) => c.id === cId);
    if (cust && cust.address) {
      setShippingAddress(cust.address);
    }
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerId) {
      setFormError('Please select a registered customer for this order.');
      return;
    }
    if (!productId) {
      setFormError('Please select a product SKU.');
      return;
    }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      setFormError('Please enter a valid selling price.');
      return;
    }
    if (!shippingAddress.trim()) {
      setFormError('Please enter a delivery shipping address.');
      return;
    }

    const unitPrice = parseFloat(sellingPrice) || 100;
    const qty = parseInt(quantity, 10) || 1;
    const totalAmount = unitPrice * qty;
    const targetBusinessId = selectedBusiness?.id || businesses[0]?.id || '';

    const orderPayload = {
      business_id: targetBusinessId,
      customer_id: customerId,
      shipping_address: shippingAddress.trim(),
      total_amount: totalAmount,
      subtotal: totalAmount,
      payment_status: paymentStatus,
      status: 'PENDING' as const,
      items: [
        {
          product_id: productId,
          dealer_id: selectedProduct?.dealer_id || supplyingDealer?.id || '00000000-0000-0000-0000-000000000000',
          product_name: selectedProduct?.name || 'Product Item',
          sku: selectedProduct?.sku || `SKU-${Date.now()}`,
          quantity: qty,
          unit_price: unitPrice,
          total_price: totalAmount,
        },
      ],
    };

    const res = await dispatch(createOrder(orderPayload as any));
    if (createOrder.fulfilled.match(res)) {
      const dealerName = supplyingDealer?.company_name || 'Wholesale Supplier Node';
      dispatch(
        addToast({
          type: 'success',
          message: `Order created! 🔔 In-App & WhatsApp notification dispatched to Dealer (${dealerName}).`,
        })
      );
      setIsCreateModalOpen(false);
      setCustomerId('');
      setProductId('');
      setQuantity('1');
      setSellingPrice('');
      setShippingAddress('');
      setFormError(null);
    } else {
      const errorMsg = (res as any)?.error?.message || 'Failed to create order. Please check input details.';
      setFormError(errorMsg);
    }
  };

  const filteredOrders = useMemo(() => {
    const targetBusiness = selectedBusiness || (user?.role !== 'DROPSHIPPER' && businesses.length > 0 ? businesses[0] : null);

    return orders.filter((o) => {
      if (targetBusiness) {
        if (o.business_id && o.business_id !== targetBusiness.id) return false;
      } else if (user?.role !== 'DROPSHIPPER') {
        if (businesses.length === 0) return false;
        const assignedBizIds = new Set(businesses.map((b) => b.id));
        if (o.business_id && !assignedBizIds.has(o.business_id)) return false;
      }
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      if (!matchesStatus) return false;
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(term) ||
        (o.shipping_address && o.shipping_address.toLowerCase().includes(term))
      );
    });
  }, [orders, statusFilter, debouncedSearch, selectedBusiness, user, businesses]);

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

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
        return 'info';
      case 'PROCESSING':
        return 'primary';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Orders
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
          <button
            onClick={() => dispatch(fetchOrders())}
            className="btn-secondary text-xs"
            title="Refresh Orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by order # or shipping city..."
          className="max-w-md w-full"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#16123F] text-white shadow-xs'
                  : 'bg-white text-[#555279] hover:text-[#16123F] border border-[#C7DDCC]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Scannable Orders Table */}
      {isLoading ? (
        <div className="text-center py-14 text-[#535F80] text-sm">
          Loading fulfillment records...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 surface-panel bg-white rounded-xl border border-[rgba(5,23,71,0.08)]">
          <ShoppingCart className="w-10 h-10 text-[#535F80] mx-auto mb-2" />
          <p className="text-[#051747] text-sm font-bold">No orders found</p>
          <p className="text-[#535F80] text-xs mt-1">
            Adjust your status filter or wait for customer store checkouts.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
                  <th className="py-4 pl-6 pr-4 font-semibold">Order #</th>
                  <th className="py-4 px-4 font-semibold">Date</th>
                  <th className="py-4 px-4 font-semibold">Shipping Destination</th>
                  <th className="py-4 px-4 font-semibold">Payment</th>
                  <th className="py-4 px-4 font-semibold">Fulfillment Status</th>
                  <th className="py-4 px-4 font-semibold text-right">Total Amount</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {paginatedItems.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors duration-150 group">
                    <td className="py-4 pl-6 pr-4 font-semibold text-[#0F172A] text-sm">
                      {o.order_number}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500 font-normal">
                      {new Date(o.created_at || o.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 font-normal max-w-xs truncate">
                      {o.shipping_address || 'Direct Delivery'}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="success" size="sm">
                        {o.payment_status || 'PAID'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-[#0F172A] text-sm tabular-nums">
                      ${Number(o.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="View Order Details"
                        aria-label="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />

      {/* Order Details Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details — ${selectedOrder?.order_number}`}
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-[#F4F6F9] border border-[rgba(5,23,71,0.04)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#535F80] block">
                  Status
                </span>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)} size="sm" className="mt-1">
                  {selectedOrder.status}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#535F80] block">
                  Payment
                </span>
                <span className="text-xs font-bold text-emerald-600 mt-1 block">
                  {selectedOrder.payment_status || 'PAID'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#535F80] block">
                  Date
                </span>
                <span className="text-xs font-medium text-[#051747] mt-1 block">
                  {new Date(
                    selectedOrder.created_at || selectedOrder.createdAt || Date.now()
                  ).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#535F80] block">
                  Total
                </span>
                <span className="text-xs font-black text-[#051747] tabular-nums mt-1 block">
                  ₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
 
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#535F80] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#081F62]" />
                <span>Shipping Destination</span>
              </h4>
              <p className="text-xs text-[#051747] bg-white p-3 rounded-lg border border-[rgba(5,23,71,0.06)] leading-relaxed font-medium">
                {selectedOrder.shipping_address || 'Standard dispatch address registered with order.'}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#535F80] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#081F62]" />
                <span>Line Items ({selectedOrder.items?.length || 0})</span>
              </h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="divide-y divide-[rgba(5,23,71,0.04)] border border-[rgba(5,23,71,0.06)] rounded-lg overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-[#F4F6F9] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-[#051747]">
                          SKU #{item.product_id.slice(0, 8)}
                        </span>
                        <span className="text-[#535F80] font-semibold">&times; {item.quantity}</span>
                      </div>
                      <span className="font-black text-[#051747] tabular-nums">
                        ₹{Number(item.total_price || item.unit_price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#535F80] italic">No line items in this order record.</p>
              )}
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

      {/* ─── Create Order Modal (Section 27, 28, 41) ─── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormError(null);
        }}
        title="Create Order"
      >
        <form onSubmit={handleCreateOrderSubmit} noValidate className="space-y-4">
          {/* Inline Form Error Display */}
          <FormAlert message={formError} onClose={() => setFormError(null)} />

          <div>
            <label className="form-label">Customer *</label>
            <Select
              value={customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              icon={User}
              placeholder="Select Customer"
              hasError={!customerId && Boolean(formError)}
            >
              {activeCustomers.length === 0 ? (
                <option value="" disabled>No customers found</option>
              ) : (
                activeCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.email ? `(${c.email})` : ''}
                  </option>
                ))
              )}
            </Select>
          </div>

          <div>
            <label className="form-label">Product *</label>
            <Select
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              icon={Package}
              placeholder="Select Product"
              hasError={!productId && Boolean(formError)}
            >
              {activeProducts.length === 0 ? (
                <option value="" disabled>No products available</option>
              ) : (
                activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{Number(p.selling_price ?? p.price ?? 0).toFixed(2)}
                  </option>
                ))
              )}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="input-field font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Shipping Address *</label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter full shipping address..."
              rows={2}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="form-label">Payment Status</label>
            <Select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              icon={CreditCard}
            >
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
