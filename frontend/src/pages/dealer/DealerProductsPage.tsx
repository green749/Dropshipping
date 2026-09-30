import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../store/slices/productSlice';
import { fetchBusinesses } from '../../store/slices/businessSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import { FormField } from '../../components/common/FormField';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { FormAlert } from '../../components/common/FormAlert';
import { ImageUpload } from '../../components/common/ImageUpload';
import { extractFormErrors } from '../../utils/errorParser';
import type { Product } from '../../types';
import { Package, Box, Plus, Edit2, Trash2, Building2, Filter } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Apparel & Fashion',
  'Travel',
  'Wearables',
  'Lighting',
  'Furniture',
  'Electronics',
  'Accessories',
];

export const DealerProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.product);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State (Dealer only enters product details, inventory, image, and wholesale price)
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [costPrice, setCostPrice] = useState(''); // Dealer Wholesale Price
  const [stockQuantity, setStockQuantity] = useState('50');
  const [category, setCategory] = useState('Electronics');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-level inline errors & general modal error
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setDeleteTarget(null);
    const params =
      selectedBusiness?.id && selectedBusiness.id !== 'all'
        ? { business_id: selectedBusiness.id }
        : undefined;

    dispatch(fetchProducts(params));
    dispatch(fetchBusinesses());
  }, [dispatch, selectedBusiness?.id]);


  const activeBusiness = useMemo(() => {
    if (!businesses.length) return null;
    return businesses.find((b) => b.id === selectedBusinessId) || businesses[0];
  }, [businesses, selectedBusinessId]);

  // Business margin configured by the dropshipper (used internally to compute retail catalog price)
  const businessMarginPercent = useMemo(() => {
    if (!activeBusiness) return 20;
    const margin = activeBusiness.profit_margin ?? activeBusiness.settings?.profit_margin;
    return margin ? Number(margin) : 20;
  }, [activeBusiness]);

  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    (Array.isArray(products) ? products : []).forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter((p) => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
      );
    });
  }, [products, selectedCategory, debouncedSearch]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredProducts, { itemsPerPage: 8 });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-DLR-${Math.floor(1000 + Math.random() * 9000)}`);
    setSelectedBusinessId(businesses[0]?.id || '');
    setCostPrice('');
    setStockQuantity('50');
    setCategory('Electronics');
    setImageUrl('');
    setDescription('');
    setFieldErrors({});
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setSku(product.sku || '');
    const currentCost = product.cost_price ? Number(product.cost_price) : 0;
    setSelectedBusinessId(product.dealer_id || product.business_id || businesses[0]?.id || '');
    setCostPrice(currentCost > 0 ? currentCost.toFixed(2) : '');
    setStockQuantity((product.stock_quantity ?? 0).toString());
    setCategory(product.category || 'Electronics');
    setImageUrl(product.images?.[0] || product.image_url || (product as any)?.imageUrl || '');
    setDescription(product.description || '');
    setFieldErrors({});
    setModalError(null);
    setIsModalOpen(true);
  };

  const validateInputs = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Product title is required.';
    }

    if (!sku.trim()) {
      errors.sku = 'SKU code is required.';
    }

    const numericCost = parseFloat(costPrice);
    if (isNaN(numericCost) || numericCost <= 0) {
      errors.costPrice = 'Wholesale price must be a valid amount greater than $0.00.';
    }

    const numericStock = parseInt(stockQuantity, 10);
    if (isNaN(numericStock) || numericStock < 0) {
      errors.stockQuantity = 'Stock units must be 0 or greater.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!validateInputs()) return;

    const numericCost = parseFloat(costPrice) || 0;
    const marginMultiplier = 1 + businessMarginPercent / 100;
    const computedRetailPrice = Math.round(numericCost * marginMultiplier * 100) / 100;
    const numericStock = parseInt(stockQuantity, 10) || 0;

    setIsSubmitting(true);
    if (editingProduct) {
      const res = await dispatch(
        updateProduct({
          id: editingProduct.id,
          data: {
            name: name.trim(),
            sku: sku.trim(),
            price: computedRetailPrice,
            selling_price: computedRetailPrice,
            cost_price: numericCost,
            stock_quantity: numericStock,
            category,
            images: imageUrl ? [imageUrl] : [],
            image_url: imageUrl || undefined,
            description: description.trim() || undefined,
          },
        })
      );
      if (updateProduct.fulfilled.match(res)) {
        dispatch(addToast({ type: 'success', message: `Product '${name}' updated successfully!` }));
        setIsModalOpen(false);
      } else {
        const parsed = extractFormErrors(res.payload);
        if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...(parsed.fieldErrors as Record<string, string>) }));
        }
        setModalError(parsed.generalError || (res?.payload as unknown as string) || 'Failed to update product');
      }
    } else {
      const res = await dispatch(
        createProduct({
          name: name.trim(),
          sku: sku.trim(),
          price: computedRetailPrice,
          selling_price: computedRetailPrice,
          cost_price: numericCost,
          stock_quantity: numericStock,
          category,
          images: imageUrl ? [imageUrl] : [],
          image_url: imageUrl || undefined,
          dealer_id: selectedBusinessId || undefined,
          business_id: selectedBusinessId || undefined,
          description: description.trim() || undefined,
        })
      );
      if (createProduct.fulfilled.match(res)) {
        dispatch(addToast({ type: 'success', message: `Product '${name}' added to inventory!` }));
        setIsModalOpen(false);
      } else {
        const parsed = extractFormErrors(res.payload);
        if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...(parsed.fieldErrors as Record<string, string>) }));
        }
        setModalError(parsed.generalError || (res.payload as string) || 'Failed to create product');
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await dispatch(deleteProduct(deleteTarget.id));
    if (deleteProduct.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Product deleted from inventory' }));
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to delete product' }));
    }
    setDeleteTarget(null);
  };

  // Dealer table columns: strictly shows Wholesale Price, Stock, Category, Name, and Status.
  // Profit margin and retail catalog pricing are completely hidden from the dealer.
  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      render: (p) => {
        const img = p.images?.[0] || p.image_url || (p as any)?.imageUrl;
        return (
          <div className="flex items-center space-x-3">
            {img ? (
              <img
                src={img}
                alt={p.name}
                className="w-10 h-10 rounded-xl object-cover border border-[#C7DDCC] bg-white shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#75C9B7]/15 border border-[#75C9B7]/30 flex items-center justify-center text-[#16123F] shrink-0">
                <Package className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 block text-sm truncate">{p.name}</span>
              <span className="text-xs font-mono text-slate-500 font-medium">SKU: {p.sku}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => (
        <span className="text-sm font-medium text-slate-700">
          {p.category || 'General'}
        </span>
      ),
    },
    {
      key: 'cost_price',
      header: 'Wholesale Price',
      render: (p) => {
        const costVal = p.cost_price ? Number(p.cost_price) : 0;
        return (
          <span className="text-sm font-semibold text-slate-900 font-mono">
            {costVal > 0 ? `$${costVal.toFixed(2)}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'stock_quantity',
      header: 'Live Stock',
      render: (p) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
          <Box className="w-4 h-4 text-slate-400" />
          <span>{p.stock_quantity ?? 0} units</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => {
        const inStock = (p.stock_quantity ?? 0) > 0;
        return (
          <Badge variant={inStock ? 'success' : 'error'} size="sm">
            {inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center space-x-1 justify-end">
          <button
            onClick={() => handleOpenEdit(p)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(p)}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            My Assigned Inventory
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by title or SKU..."
          className="max-w-md w-full"
        />

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-full sm:w-56">
            <Select
              icon={Filter}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="Filter by Category"
              variant="borderless"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="px-2.5 py-1.5 rounded-xl text-caption font-bold text-[#16123F]/60 hover:text-[#16123F] bg-[#F0F6F2] hover:bg-[#C7DDCC]/50 border border-[#C7DDCC] transition-colors whitespace-nowrap cursor-pointer"
              title="Reset Category Filter"
            >
              Reset
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="btn-primary shrink-0 self-start sm:self-auto flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table with Unified Empty State */}
      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
        emptyTitle="No inventory items found"
        emptyDescription="There are no products currently assigned to your dealership."
        emptyActionText="Add Your First Product"
        onEmptyAction={handleOpenCreate}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />

      {/* Add / Edit Product Modal — Dealer only specifies their product details and wholesale supply cost */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Add New Product to Inventory'}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {modalError && (
            <FormAlert message={modalError} onClose={() => setModalError(null)} />
          )}

          {/* Target Business Selection (store profit margins are strictly hidden) */}
          {businesses.length > 1 && (
            <FormField label="Target Store / Business" required>
              <Select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                icon={Building2}
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField
            label="Product Title"
            htmlFor="dealer-product-name"
            required
            error={fieldErrors.name}
          >
            <Input
              id="dealer-product-name"
              type="text"
              required
              value={name}
              hasError={Boolean(fieldErrors.name)}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Wireless Gaming Mouse"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="SKU Code"
              htmlFor="dealer-product-sku"
              required
              error={fieldErrors.sku}
            >
              <Input
                id="dealer-product-sku"
                type="text"
                required
                value={sku}
                hasError={Boolean(fieldErrors.sku)}
                onChange={(e) => {
                  setSku(e.target.value);
                  if (fieldErrors.sku) setFieldErrors((prev) => ({ ...prev, sku: '' }));
                }}
                placeholder="SKU-DLR-1001"
                className="font-mono"
              />
            </FormField>

            <FormField label="Category" required>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {!DEFAULT_CATEGORIES.includes(category) && category && (
                  <option value={category}>{category}</option>
                )}
                <option value="Other">Other</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Wholesale Price (₹)"
              htmlFor="dealer-cost-price"
              required
              labelRight={<span className="text-[10px] text-indigo-400">Your supply cost</span>}
              error={fieldErrors.costPrice || fieldErrors.cost_price}
            >
              <Input
                id="dealer-cost-price"
                type="number"
                step="0.01"
                min="0.01"
                required
                prefixText="₹"
                value={costPrice}
                hasError={Boolean(fieldErrors.costPrice || fieldErrors.cost_price)}
                onChange={(e) => {
                  setCostPrice(e.target.value);
                  if (fieldErrors.costPrice || fieldErrors.cost_price) {
                    setFieldErrors((prev) => ({ ...prev, costPrice: '', cost_price: '' }));
                  }
                }}
                placeholder="40.00"
                className="font-mono font-bold"
              />
            </FormField>

            <FormField
              label="Available Stock Units"
              htmlFor="dealer-stock-qty"
              required
              error={fieldErrors.stockQuantity || fieldErrors.stock_quantity}
            >
              <Input
                id="dealer-stock-qty"
                type="number"
                min="0"
                required
                value={stockQuantity}
                hasError={Boolean(fieldErrors.stockQuantity || fieldErrors.stock_quantity)}
                onChange={(e) => {
                  setStockQuantity(e.target.value);
                  if (fieldErrors.stockQuantity || fieldErrors.stock_quantity) {
                    setFieldErrors((prev) => ({ ...prev, stockQuantity: '', stock_quantity: '' }));
                  }
                }}
                placeholder="50"
                className="font-mono"
              />
            </FormField>
          </div>

          <div>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Product Image"
              hideTabs={true}
            />
          </div>

          <FormField label="Description (Optional)">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the product specification..."
            />
          </FormField>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs"
            >
              {isSubmitting
                ? 'Saving...'
                : editingProduct
                ? 'Save Changes'
                : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Product from Inventory"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? It will no longer be available in the catalog.`}
        confirmText="Delete Product"
        isDestructive={true}
      />
    </div>
  );
};
