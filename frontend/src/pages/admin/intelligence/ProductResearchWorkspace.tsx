import React, { useState, useMemo } from 'react';
import type {
  ProductResearchItem,
  ProductResearchPayload,
  ProductConversionPayload,
  ResearchStatus,
} from '../../../types';
import {
  Sparkles,
  Plus,
  Search,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Package,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { FormField } from '../../../components/common/FormField';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

interface ProductResearchWorkspaceProps {
  items: ProductResearchItem[];
  dealers?: { id: string; name: string }[];
  categories?: string[];
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  dealerFilter: string;
  tagFilter: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading?: boolean;
  isMutating?: boolean;
  isConverting?: boolean;
  onSearchChange: (q: string) => void;
  onStatusChange: (s: string) => void;
  onCategoryChange: (c: string) => void;
  onDealerChange: (d: string) => void;
  onTagChange: (t: string) => void;
  onPageChange: (p: number) => void;
  onCreateItem: (payload: ProductResearchPayload) => void;
  onUpdateItem: (id: string, payload: Partial<ProductResearchPayload>) => void;
  onDeleteItem: (id: string) => void;
  onConvertItem: (id: string, conversionData: ProductConversionPayload) => void;
}

const PREDEFINED_TAGS = [
  'Trending',
  'Seasonal',
  'Gift',
  'Problem Solving',
  'Beauty',
  'Home',
  'Electronics',
  'Pet',
  'Fashion',
  'Fitness',
  'High Margin',
  'Viral Potential',
];

export const ProductResearchWorkspace: React.FC<ProductResearchWorkspaceProps> = ({
  items = [],
  dealers = [],
  categories = ['Electronics', 'Home & Living', 'Accessories', 'Fashion', 'Fitness', 'Beauty'],
  searchQuery,
  statusFilter,
  categoryFilter,
  dealerFilter,
  tagFilter,
  pagination,
  isLoading = false,
  isMutating = false,
  isConverting = false,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onDealerChange,
  onTagChange,
  onPageChange,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onConvertItem,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductResearchItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [convertingItem, setConvertingItem] = useState<ProductResearchItem | null>(null);

  // Form State
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [dealerId, setDealerId] = useState('');
  const [source, setSource] = useState('AliExpress Winner');
  const [estimatedCost, setEstimatedCost] = useState('15.00');
  const [expectedPrice, setExpectedPrice] = useState('49.99');
  const [shippingCost, setShippingCost] = useState('5.00');
  const [marketingCost, setMarketingCost] = useState('8.00');
  const [estimatedUnits, setEstimatedUnits] = useState('50');
  const [competitorPrice, setCompetitorPrice] = useState('59.99');
  const [targetAudience, setTargetAudience] = useState('');
  const [status, setStatus] = useState<ResearchStatus>('IDEA');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Trending']);

  // Conversion Form State
  const [convertSku, setConvertSku] = useState('');
  const [convertStock, setConvertStock] = useState('50');
  const [convertThreshold, setConvertThreshold] = useState('10');
  const [convertReorder, setConvertReorder] = useState('15');
  const [convertDealerId, setConvertDealerId] = useState('');

  const formatCurrency = (val?: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  // Live calculation of estimates
  const calculatedEstimates = useMemo(() => {
    const cost = parseFloat(estimatedCost) || 0;
    const price = parseFloat(expectedPrice) || 0;
    const ship = parseFloat(shippingCost) || 0;
    const mkt = parseFloat(marketingCost) || 0;
    const units = parseInt(estimatedUnits, 10) || 1;

    const estRevenue = price * units;
    const estGrossProfit = (price - cost) * units;
    const estNetProfit = estRevenue - (cost + ship + mkt) * units;
    const estMargin = estRevenue > 0 ? (estNetProfit / estRevenue) * 100 : 0;

    return {
      estRevenue,
      estGrossProfit,
      estNetProfit,
      estMargin: parseFloat(estMargin.toFixed(1)),
    };
  }, [estimatedCost, expectedPrice, shippingCost, marketingCost, estimatedUnits]);

  const handleOpenCreate = () => {
    setProductName('');
    setProductUrl('');
    setCategory('Electronics');
    setDealerId(dealers[0]?.id || '');
    setSource('AliExpress Winner');
    setEstimatedCost('15.00');
    setExpectedPrice('49.99');
    setShippingCost('5.00');
    setMarketingCost('8.00');
    setEstimatedUnits('50');
    setCompetitorPrice('59.99');
    setTargetAudience('Tech Enthusiasts & Remote Workers');
    setStatus('IDEA');
    setNotes('');
    setSelectedTags(['Trending']);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (item: ProductResearchItem) => {
    setEditingItem(item);
    setProductName(item.product_name);
    setProductUrl(item.product_url || '');
    setCategory(item.category);
    setDealerId(item.dealer_id || '');
    setSource(item.source || 'Manual Research');
    setEstimatedCost(String(item.estimated_cost));
    setExpectedPrice(String(item.expected_selling_price));
    setShippingCost(String(item.estimated_shipping_cost || 0));
    setMarketingCost(String(item.estimated_marketing_cost || 0));
    setEstimatedUnits(String(item.estimated_units || 50));
    setCompetitorPrice(item.competitor_price ? String(item.competitor_price) : '');
    setTargetAudience(item.target_audience || '');
    setStatus(item.status);
    setNotes(item.notes || '');
    setSelectedTags(Array.isArray(item.tags) ? item.tags : []);
  };

  const handleOpenConvert = (item: ProductResearchItem) => {
    setConvertingItem(item);
    setConvertSku(`SKU-${item.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`);
    setConvertStock('50');
    setConvertThreshold('10');
    setConvertReorder('15');
    setConvertDealerId(item.dealer_id || dealers[0]?.id || '');
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const resetForm = () => {
    setProductName('');
    setProductUrl('');
    setCategory('Electronics');
    setDealerId('');
    setSource('AliExpress Winner');
    setEstimatedCost('15.00');
    setExpectedPrice('49.99');
    setShippingCost('5.00');
    setMarketingCost('8.00');
    setEstimatedUnits('50');
    setCompetitorPrice('59.99');
    setTargetAudience('');
    setStatus('IDEA');
    setNotes('');
    setSelectedTags(['Trending']);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateItem({
      product_name: productName,
      product_url: productUrl || undefined,
      category,
      dealer_id: dealerId || undefined,
      source,
      estimated_cost: parseFloat(estimatedCost) || 0,
      expected_selling_price: parseFloat(expectedPrice) || 0,
      estimated_shipping_cost: parseFloat(shippingCost) || 0,
      estimated_marketing_cost: parseFloat(marketingCost) || 0,
      estimated_units: parseInt(estimatedUnits, 10) || 50,
      competitor_price: competitorPrice ? parseFloat(competitorPrice) : null,
      target_audience: targetAudience || undefined,
      status,
      notes: notes || undefined,
      tags: selectedTags,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateItem(editingItem.id, {
      product_name: productName,
      product_url: productUrl || undefined,
      category,
      dealer_id: dealerId || undefined,
      source,
      estimated_cost: parseFloat(estimatedCost) || 0,
      expected_selling_price: parseFloat(expectedPrice) || 0,
      estimated_shipping_cost: parseFloat(shippingCost) || 0,
      estimated_marketing_cost: parseFloat(marketingCost) || 0,
      estimated_units: parseInt(estimatedUnits, 10) || 50,
      competitor_price: competitorPrice ? parseFloat(competitorPrice) : null,
      target_audience: targetAudience || undefined,
      status,
      notes: notes || undefined,
      tags: selectedTags,
    });
    setEditingItem(null);
  };

  const handleConfirmConvert = () => {
    if (!convertingItem) return;
    onConvertItem(convertingItem.id, {
      sku: convertSku,
      stock_quantity: parseInt(convertStock, 10) || 50,
      low_stock_threshold: parseInt(convertThreshold, 10) || 10,
      reorder_level: parseInt(convertReorder, 10) || 15,
      dealer_id: convertDealerId || convertingItem.dealer_id || undefined,
      cost_price: Number(convertingItem.estimated_cost),
      selling_price: Number(convertingItem.expected_selling_price),
    });
    setConvertingItem(null);
  };

  const getStatusBadge = (s: ResearchStatus) => {
    switch (s) {
      case 'IDEA':
        return { label: '💡 Idea', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'RESEARCHING':
        return { label: '🔍 Researching', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'READY_TO_TEST':
        return { label: '⚡ Ready To Test', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'TESTING':
        return { label: '🧪 Live Testing', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'APPROVED':
        return { label: '✅ Converted / Approved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' };
      case 'REJECTED':
        return { label: '❌ Rejected', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      default:
        return { label: s, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-[#C7DDCC]/80 dark:border-slate-800 rounded-[28px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#16123F] dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Product Research Workspace
          </h2>
          <p className="text-xs text-[#16123F]/65 dark:text-slate-400 mt-0.5">
            Vet potential products, simulate margins and ad costs, track testing stages, and explicitly convert approved winners to live catalog
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-2xl bg-[#16123F] hover:bg-[#16123F]/90 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FFE26A]" />
          <span>Add Research Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search researched products, notes, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#16123F] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#16123F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Research Stages</option>
            <option value="IDEA">Idea</option>
            <option value="RESEARCHING">Researching</option>
            <option value="READY_TO_TEST">Ready To Test</option>
            <option value="TESTING">Testing</option>
            <option value="APPROVED">Approved / Converted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#16123F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div>
          <select
            value={tagFilter}
            onChange={(e) => onTagChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#16123F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16123F]/20 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Tags</option>
            {PREDEFINED_TAGS.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Research Items Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">Loading research items...</div>
      ) : items.length === 0 ? (
        <div className="p-16 text-center bg-white/80 dark:bg-slate-900/60 rounded-[28px] border border-dashed border-[#C7DDCC] dark:border-slate-800">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-base text-[#16123F] dark:text-white">No research products found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Add product ideas you are evaluating, simulate net profit before procurement, and convert vetted products into your catalog.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-[#16123F] text-white text-xs font-bold hover:bg-[#16123F]/90 transition-all cursor-pointer shadow-xs"
          >
            Add Your First Product Idea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const badge = getStatusBadge(item.status);
            const isApproved = item.status === 'APPROVED';

            return (
              <div
                key={item.id}
                className="bg-white/95 dark:bg-slate-900/90 rounded-[24px] p-5 border border-[#C7DDCC]/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.source || 'Manual'}</span>
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-bold text-sm text-[#16123F] dark:text-white line-clamp-2 leading-snug">
                    {item.product_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{item.category}</span>
                    {item.product_url && (
                      <a
                        href={item.product_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" /> Source
                      </a>
                    )}
                  </div>

                  {/* Price & Cost Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-[#F8FAF8] dark:bg-slate-800/40 border border-slate-200/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Selling Price</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.expected_selling_price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Cost / COGS</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.estimated_cost)}
                      </span>
                    </div>
                  </div>

                  {/* Factual Estimated Profit Card */}
                  <div className="mt-3 p-3 rounded-2xl bg-[#16123F] text-white space-y-1">
                    <div className="flex justify-between text-[11px] text-[#FFE26A] font-bold">
                      <span>Estimated Profit ({item.estimated_units} units)</span>
                      <span>{item.estimated_margin_percent}% Margin</span>
                    </div>
                    <div className="flex justify-between text-xs font-black">
                      <span>Est. Net Profit:</span>
                      <span className="text-emerald-400 font-black">
                        {formatCurrency(item.estimated_net_profit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Est. Revenue: {formatCurrency(item.estimated_revenue)}</span>
                      <span>Ship/Ads: {formatCurrency(Number(item.estimated_shipping_cost) + Number(item.estimated_marketing_cost))}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes Preview */}
                  {item.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Research Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Research Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isApproved ? (
                    <button
                      onClick={() => handleOpenConvert(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Convert to Live Product</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live in Catalog
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#16123F]/70 dark:text-slate-400 px-2">
          <div>
            Showing <span className="font-bold text-[#16123F] dark:text-white">{items.length}</span> research items
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange((pagination.page || 1) - 1)}
              disabled={(pagination.page || 1) <= 1}
              className="p-2 rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6F2] dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4 text-[#16123F] dark:text-white" />
            </button>
            <span className="px-3 py-1 font-semibold text-[#16123F] dark:text-white">
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange((pagination.page || 1) + 1)}
              disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
              className="p-2 rounded-xl border border-[#C7DDCC] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6F2] dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4 text-[#16123F] dark:text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ─── ADD/EDIT RESEARCH ITEM MODAL ─── */}
      <Modal
        isOpen={isCreateOpen || Boolean(editingItem)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingItem(null);
          resetForm();
        }}
        title={editingItem ? 'Edit Product Research Item' : 'Add New Product Idea / Research'}
      >
        <form onSubmit={editingItem ? handleSaveEdit : handleSaveCreate} className="space-y-4">
          <FormField label="Product Name" htmlFor="res-name" required>
            <Input
              id="res-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Ergonomic Memory Foam Knee Pillow"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category" htmlFor="res-category" required>
              <Select
                id="res-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Research Stage / Status" htmlFor="res-status" required>
              <Select
                id="res-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="IDEA">Idea</option>
                <option value="RESEARCHING">Researching</option>
                <option value="READY_TO_TEST">Ready To Test</option>
                <option value="TESTING">Testing</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Discovery Source" htmlFor="res-source">
              <Input
                id="res-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Indiamart, AliExpress, Competitor Ad"
              />
            </FormField>

            <FormField label="Product Reference URL" htmlFor="res-url">
              <Input
                id="res-url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://..."
              />
            </FormField>
          </div>

          {/* Pricing & Cost Inputs */}
          <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Unit Financials & Estimations</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Cost Price (COGS)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Target Selling Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Est. Shipping/Unit</label>
                <Input
                  type="number"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Est. Ad Spend/Unit</label>
                <Input
                  type="number"
                  step="0.01"
                  value={marketingCost}
                  onChange={(e) => setMarketingCost(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Test Batch Units</label>
                <Input
                  type="number"
                  value={estimatedUnits}
                  onChange={(e) => setEstimatedUnits(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Competitor Benchmark Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={competitorPrice}
                  onChange={(e) => setCompetitorPrice(e.target.value)}
                  placeholder="e.g. 59.99"
                />
              </div>
            </div>

            {/* Dynamic Estimated Calculation Banner */}
            <div className="p-3.5 rounded-xl bg-[#16123F] text-white flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#FFE26A] font-bold uppercase tracking-wider block">
                  Simulated Outcome ({estimatedUnits} units)
                </span>
                <span className="font-bold text-white text-sm">
                  Est. Net Profit: {formatCurrency(calculatedEstimates.estNetProfit)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-300 block">Est. Revenue: {formatCurrency(calculatedEstimates.estRevenue)}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-400 text-slate-900">
                  {calculatedEstimates.estMargin}% Margin
                </span>
              </div>
            </div>
          </div>

          {/* Tags Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Categorization Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {PREDEFINED_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#16123F] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>

          <FormField label="Target Audience & Market Notes" htmlFor="res-audience">
            <Input
              id="res-audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Women 25-45 interested in home wellness"
            />
          </FormField>

          <FormField label="Detailed Research Notes & Sourcing Log" htmlFor="res-notes">
            <Textarea
              id="res-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Supplier MOQ, competitor ad angles, return risk considerations..."
              rows={3}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isMutating}
              className="px-5 py-2 rounded-xl bg-[#16123F] text-white text-xs font-bold hover:bg-[#16123F]/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isMutating ? 'Saving...' : editingItem ? 'Update Research Item' : 'Create Research Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── CONVERT RESEARCH ITEM TO LIVE PRODUCT MODAL ─── */}
      <Modal
        isOpen={Boolean(convertingItem)}
        onClose={() => setConvertingItem(null)}
        title="Convert Research Item to Live Product"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#F4F9F5] border border-[#C7DDCC] flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#16123F]">{convertingItem?.product_name}</h4>
              <p className="text-[11px] text-slate-500">
                Category: {convertingItem?.category} • Est. Cost: {formatCurrency(convertingItem?.estimated_cost)} • Target Price: {formatCurrency(convertingItem?.expected_selling_price)}
              </p>
            </div>
          </div>

          <FormField label="Assigned Live SKU" htmlFor="conv-sku" required>
            <Input
              id="conv-sku"
              value={convertSku}
              onChange={(e) => setConvertSku(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Assign Dealer / Supplier" htmlFor="conv-dealer" required>
            <Select
              id="conv-dealer"
              value={convertDealerId}
              onChange={(e) => setConvertDealerId(e.target.value)}
            >
              <option value="">— Select Dealer —</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            {!convertDealerId && (
              <p className="text-[10px] text-amber-600 mt-1">⚠️ No dealer assigned — select one to link this product to a supplier</p>
            )}
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Initial Stock" htmlFor="conv-stock" required>
              <Input
                id="conv-stock"
                type="number"
                value={convertStock}
                onChange={(e) => setConvertStock(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Low Stock Alert" htmlFor="conv-thresh" required>
              <Input
                id="conv-thresh"
                type="number"
                value={convertThreshold}
                onChange={(e) => setConvertThreshold(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Reorder Level" htmlFor="conv-reorder" required>
              <Input
                id="conv-reorder"
                type="number"
                value={convertReorder}
                onChange={(e) => setConvertReorder(e.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
            <strong>Explicit Action:</strong> This will publish this product to your live product catalog with status <strong>ACTIVE</strong> and update the research status to <strong>APPROVED</strong>.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConvertingItem(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmConvert}
              disabled={isConverting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Publish Live Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            onDeleteItem(deletingId);
            setDeletingId(null);
          }
        }}
        title="Delete Research Product"
        message="Are you sure you want to remove this product idea from your research workspace? This action cannot be undone."
      />
    </div>
  );
};
