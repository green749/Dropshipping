import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../store/slices/productSlice';
import { fetchBusinesses } from '../../store/slices/businessSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import { fetchDealers } from '../../store/slices/dealerSlice';
import { addToast } from '../../store/slices/uiSlice';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import { ImageUpload } from '../../components/common/ImageUpload';
import { Select } from '../../components/common/Select';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import { usePermissions } from '../../hooks/usePermissions';
import type { Product } from '../../types';
import { Plus, Edit2, Trash2, TrendingUp, Package, Filter, Download, Share2, Sparkles } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Apparel & Fashion',
  'Travel',
  'Wearables',
  'Lighting',
  'Furniture',
  'Electronics',
  'Accessories',
];

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { canManageProducts } = usePermissions();
  const { products, isLoading } = useAppSelector((state) => state.product);
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { orders } = useAppSelector((state) => state.order);

  const { user } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [dealerId, setDealerId] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [category, setCategory] = useState('Electronics');
  const [imageUrl, setImageUrl] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    dispatch(fetchDealers(params));
    dispatch(fetchOrders(params));
  }, [dispatch, selectedBusiness?.id]);


  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    (Array.isArray(products) ? products : []).forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [products]);

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

  // Active dealers associated with the current business
  const activeDealers = useMemo(() => {
    if (!selectedBusiness) return dealers;
    return dealers.filter(
      (d) =>
        d.business_id === selectedBusiness.id ||
        d.businesses?.some((b: any) => b.id === selectedBusiness.id)
    );
  }, [dealers, selectedBusiness]);

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];

    return list.filter((p) => {
      if (selectedBusiness) {
        const matchesDirectBiz = p.business_id === selectedBusiness.id;
        const matchesDealer = p.dealer_id ? assignedDealerIds.has(p.dealer_id) : false;

        // Show products belonging to this active business or its assigned supplier dealers
        if (!matchesDirectBiz && !matchesDealer) return false;
      }

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
  }, [products, selectedCategory, debouncedSearch, selectedBusiness, assignedDealerIds]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredProducts, { itemsPerPage: 10 });

  const handleOpenCreate = () => {
    if (!canManageProducts) return;
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription('');
    setDealerId(activeDealers[0]?.user_id || activeDealers[0]?.id || '');
    setPrice('');
    setCostPrice('');
    setStockQuantity('100');
    setCategory('Electronics');
    setImageUrl('');
    setBusinessId(selectedBusiness?.id || businesses[0]?.id || '');
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    if (!canManageProducts) return;
    setEditingProduct(product);
    setName(product.name || '');
    setSku(product.sku || '');
    setDescription(product.description || '');
    setDealerId(product.dealer_id || activeDealers[0]?.user_id || activeDealers[0]?.id || '');
    const currentPrice = product.selling_price ?? product.price ?? 0;
    setPrice(currentPrice.toString());
    setCostPrice(product.cost_price ? product.cost_price.toString() : '');
    setStockQuantity((product.stock_quantity ?? 0).toString());
    setCategory(product.category || 'General');
    setImageUrl(product.images?.[0] || product.image_url || (product as any).imageUrl || '');
    setBusinessId(product.dealer_id || product.business_id || '');
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageProducts) return;

    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Product title is required.';
    }
    if (!sku.trim()) {
      errors.sku = 'SKU code is required.';
    }
    if (!price || parseFloat(price) <= 0) {
      errors.price = 'Please enter a valid retail price.';
    }
    if (!dealerId) {
      if (activeDealers.length === 0) {
        errors.dealerId = `No dealers are assigned to ${selectedBusiness?.name || 'this business'}. Please assign a dealer in the Dealers tab first.`;
      } else {
        errors.dealerId = 'Please select an assigned dealer for this business.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before submitting.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const numericSelling = parseFloat(price) || 0;
    const numericCost = costPrice ? parseFloat(costPrice) : Math.round(numericSelling * 0.6 * 100) / 100;
    const numericStock = parseInt(stockQuantity, 10) || 0;

    setIsSubmitting(true);
    if (editingProduct) {
      const res = await dispatch(
        updateProduct({
          id: editingProduct.id,
          data: {
            name: name.trim(),
            sku: sku.trim(),
            description: description.trim() || undefined,
            dealer_id: dealerId || undefined,
            price: numericSelling,
            selling_price: numericSelling,
            cost_price: numericCost,
            stock_quantity: numericStock,
            category,
            images: imageUrl ? [imageUrl] : [],
            image_url: imageUrl || undefined,
          },
        })
      );
      if (updateProduct.fulfilled.match(res)) {
        dispatch(addToast({ type: 'success', message: 'Product updated successfully' }));
        setIsModalOpen(false);
      } else {
        const errorMsg = (res.payload as any)?.message || 'Failed to update product';
        setFormError(errorMsg);
      }
    } else {
      const res = await dispatch(
        createProduct({
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim() || undefined,
          dealer_id: dealerId || undefined,
          price: numericSelling,
          selling_price: numericSelling,
          cost_price: numericCost,
          stock_quantity: numericStock,
          category,
          images: imageUrl ? [imageUrl] : [],
          image_url: imageUrl || undefined,
          business_id: selectedBusiness?.id || businessId || businesses[0]?.id || undefined,
        })
      );
      if (createProduct.fulfilled.match(res)) {
        dispatch(addToast({ type: 'success', message: 'Product created successfully' }));
        setIsModalOpen(false);
      } else {
        const errorMsg = (res.payload as any)?.message || 'Failed to create product';
        setFormError(errorMsg);
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!canManageProducts || !deleteTarget) return;
    const res = await dispatch(deleteProduct(deleteTarget.id));
    if (deleteProduct.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Product removed from catalog' }));
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to delete product' }));
    }
    setDeleteTarget(null);
  };

  const handleDownloadProductAsset = (p: Product) => {
    const img = p.images?.[0] || p.image_url || (p as any).imageUrl;
    if (!img) {
      dispatch(addToast({ type: 'warning', message: 'No product asset image available for download' }));
      return;
    }
    const a = document.createElement('a');
    a.href = img;
    a.download = `${p.sku || 'product'}-asset.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    dispatch(addToast({ type: 'success', message: `Downloaded asset for ${p.name}` }));
  };

  // Table Columns Specification
  const columns: Column<Product>[] = useMemo(() => {
    const cols: Column<Product>[] = [
      {
        key: 'name',
        header: 'PRODUCT',
        render: (p) => {
          const img = p.images?.[0] || p.image_url || (p as any).imageUrl;
          return (
            <div className="flex items-center gap-3">
              {img ? (
                <img
                  src={img}
                  alt={p.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#C7DDCC] bg-white flex-shrink-0 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#F0F6F2] border border-[#C7DDCC] flex items-center justify-center flex-shrink-0 text-[#16123F]/50">
                  <Package className="w-5 h-5 text-[#16123F]/40" />
                </div>
              )}
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-[#16123F] block truncate max-w-xs">{p.name}</span>
                <span className="text-[11px] font-mono font-semibold text-[#16123F]/50 block">
                  {p.sku || 'SKU-GEN'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: 'category',
        header: 'CATEGORY',
        render: (p) => (
          <span className="text-body font-medium text-[#16123F]">
            {p.category || 'General'}
          </span>
        ),
      },
      {
        key: 'price',
        header: 'RETAIL PRICE',
        render: (p) => {
          const retailPrice = Number(p.selling_price ?? p.price ?? 0);
          return <span className="font-bold text-[#16123F] tabular-nums">${retailPrice.toFixed(2)}</span>;
        },
      },
    ];

    // Wholesale cost and Profit Margin are only visible to Dropshipper / Admin
    if (user?.role === 'DROPSHIPPER') {
      cols.push(
        {
          key: 'cost_price',
          header: 'WHOLESALE COST',
          render: (p) => {
            const cost = p.cost_price ? Number(p.cost_price) : 0;
            return <span className="font-medium text-[#16123F]/70 tabular-nums">${cost.toFixed(2)}</span>;
          },
        },
        {
          key: 'margin',
          header: 'PROFIT MARGIN',
          render: (p) => {
            const retailPrice = Number(p.selling_price ?? p.price ?? 0);
            const cost = p.cost_price ? Number(p.cost_price) : 0;
            const margin =
              cost > 0 && retailPrice > cost
                ? Math.round(((retailPrice - cost) / retailPrice) * 100)
                : null;
            return margin !== null ? (
              <span className="text-caption font-bold text-[#16123F] bg-[#ABD699]/40 border border-[#ABD699] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#16123F]" />
                <span>{margin}% Margin</span>
              </span>
            ) : (
              <span className="text-caption text-[#16123F]/40">—</span>
            );
          },
        }
      );
    }

    cols.push({
      key: 'stock_quantity',
      header: 'STOCK',
      render: (p) => {
        const stock = p.stock_quantity ?? 0;
        const isLow = stock <= 10;
        return (
          <div className="flex items-center space-x-1.5 text-caption font-semibold">
            <span className={`w-2 h-2 rounded-full ${isLow ? 'bg-[#FF8A65]' : 'bg-[#75C9B7]'}`} />
            <span className={isLow ? 'text-[#FF8A65] font-bold' : 'text-[#16123F]'}>
              {stock} units {isLow && stock > 0 ? '(Low)' : stock === 0 ? '(Out of Stock)' : ''}
            </span>
          </div>
        );
      },
    });

    if (canManageProducts) {
      cols.push({
        key: 'actions',
        header: 'ACTIONS',
        align: 'right',
        render: (p) => (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(p);
              }}
              className="p-1.5 rounded-lg text-[#16123F]/60 hover:text-[#16123F] hover:bg-[#F4F5FA] border border-transparent hover:border-[#C7DDCC] transition-all cursor-pointer"
              title="Edit Product"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(p);
              }}
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      });
    } else {
      cols.push({
        key: 'actions',
        header: 'MARKETER ACTIONS',
        align: 'right',
        render: (p) => {
          const imgUrl = p.images?.[0] || p.image_url || (p as any).imageUrl;
          return (
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadProductAsset(p);
                }}
                disabled={!imgUrl}
                className="px-3 py-1.5 rounded-xl bg-[#F0F6F2] hover:bg-[#C7DDCC]/50 border border-[#C7DDCC] text-xs font-bold text-[#16123F] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                title={imgUrl ? 'Download Product Media Asset' : 'No image available to download'}
              >
                <Download className="w-3.5 h-3.5 text-[#16123F]" />
                <span>Download Media</span>
              </button>
            </div>
          );
        },
      });
    }

    return cols;
  }, [canManageProducts, user?.role]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#16123F] tracking-tight">
            Product Catalog
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search products by name, SKU or category..."
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

          {canManageProducts && (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/product-intelligence"
                className="px-3.5 py-2 rounded-xl bg-[#75C9B7]/15 hover:bg-[#75C9B7]/25 text-[#16123F] font-bold text-xs border border-[#75C9B7]/40 flex items-center gap-1.5 transition-all shadow-xs shrink-0"
              >
                <Sparkles className="w-4 h-4 text-[#16123F]" />
                <span>Intelligence & Research</span>
              </Link>
              <button
                onClick={handleOpenCreate}
                className="btn-primary shrink-0 self-start sm:self-auto flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Data Table */}
      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
        emptyTitle="No products found"
        emptyDescription={
          canManageProducts
            ? "Adjust your search filter or click Add Product to populate your catalog."
            : "No products match your search or filter."
        }
        emptyActionText={canManageProducts ? "Add New Product" : undefined}
        onEmptyAction={canManageProducts ? handleOpenCreate : undefined}
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
        title={editingProduct ? 'Edit Product Item' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormAlert message={formError} onClose={() => setFormError(null)} />

          <FormField
            label="Product Title"
            htmlFor="product-name-input"
            required
            error={fieldErrors.name}
          >
            <input
              id="product-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className={`input-field ${fieldErrors.name ? 'border-rose-400 focus:ring-rose-200' : ''}`}
            />
          </FormField>

          <FormField
            label="Dealer / Supplier"
            htmlFor="product-dealer-select"
            required
            error={fieldErrors.dealerId}
          >
            {activeDealers.length > 0 ? (
              <Select
                id="product-dealer-select"
                value={dealerId}
                onChange={(e) => {
                  setDealerId(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, dealerId: '' }));
                }}
                placeholder="Select Supplying Dealer"
                className={fieldErrors.dealerId ? 'border-rose-400 focus:ring-rose-200' : ''}
              >
                {activeDealers.map((d) => (
                  <option key={d.id} value={d.user_id || d.id}>
                    {d.company_name || d.user?.name || 'Authorized Dealer'}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 flex items-center justify-between">
                <span>
                  No dealers are currently assigned to <strong>{selectedBusiness?.name || 'this business'}</strong>.
                </span>
                <Link
                  to="/admin/dealers"
                  className="font-semibold text-emerald-700 underline hover:text-emerald-800 ml-2 whitespace-nowrap"
                >
                  Assign Dealer &rarr;
                </Link>
              </div>
            )}
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="SKU Code"
              htmlFor="product-sku-input"
              required
              error={fieldErrors.sku}
            >
              <input
                id="product-sku-input"
                type="text"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, sku: '' }));
                }}
                placeholder="SKU-1001"
                className={`input-field font-mono ${fieldErrors.sku ? 'border-rose-400 focus:ring-rose-200' : ''}`}
              />
            </FormField>

            <FormField label="Category" htmlFor="product-category-select">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select Category"
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

          <div className="grid grid-cols-3 gap-3">
            <FormField
              label="Retail Price (₹)"
              htmlFor="product-price-input"
              required
              error={fieldErrors.price}
            >
              <input
                id="product-price-input"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, price: '' }));
                }}
                placeholder="89.99"
                className={`input-field tabular-nums ${fieldErrors.price ? 'border-rose-400 focus:ring-rose-200' : ''}`}
              />
            </FormField>

            <FormField label="Cost (₹)" htmlFor="product-cost-input">
              <input
                id="product-cost-input"
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="45.00"
                className="input-field tabular-nums"
              />
            </FormField>

            <FormField label="Stock Units" htmlFor="product-stock-input">
              <input
                id="product-stock-input"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="100"
                className="input-field tabular-nums"
              />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="product-description-input">
            <textarea
              id="product-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description, specifications, or key selling points..."
              rows={3}
              className="input-field"
            />
          </FormField>

          <div>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Product Image"
              hideTabs={true}
            />
          </div>

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
              disabled={isSubmitting}
              className="btn-primary text-xs"
            >
              {isSubmitting
                ? 'Saving...'
                : editingProduct
                ? 'Save Changes'
                : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Dealers and stores will no longer be able to fulfill orders for this SKU.`}
        confirmText="Delete Product"
        isDestructive={true}
      />
    </div>
  );
};
