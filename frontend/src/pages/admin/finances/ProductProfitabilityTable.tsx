import React, { useState, useMemo } from 'react';
import type { ProductProfitability, Dealer } from '../../../types';
import { Search, AlertTriangle, ArrowUpDown, Package } from 'lucide-react';

interface ProductProfitabilityTableProps {
  products: ProductProfitability[];
  dealers: Dealer[];
  isLoading: boolean;
}

export const ProductProfitabilityTable: React.FC<ProductProfitabilityTableProps> = ({
  products,
  dealers,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealer, setSelectedDealer] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'revenue' | 'netProfit' | 'unitsSold' | 'margin'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedDealer !== 'ALL' && p.dealerName !== selectedDealer) return false;
        if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          p.productName.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          (p.dealerName && p.dealerName.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        let valA = a[sortBy] || 0;
        let valB = b[sortBy] || 0;
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [products, selectedDealer, selectedCategory, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field: 'revenue' | 'netProfit' | 'unitsSold' | 'margin') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (val: number) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white rounded-[32px] p-6 border border-[#C7DDCC] shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-[#16123F] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#F0F6F2] text-[#75C9B7]">
              <Package className="w-4 h-4" />
            </span>
            Product Unit Profitability
          </h3>
          <p className="text-xs text-[#555279] mt-0.5 font-medium">
            Breakdown of revenue, procurement cost, ad allocations, and net margins per product catalog item
          </p>
        </div>

        {/* Filters Styled with Theme */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555279]" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-full border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/40"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
              className="px-3 py-1.5 text-xs rounded-full border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Dealer Filter */}
          <select
            value={selectedDealer}
            onChange={(e) => setSelectedDealer(e.target.value)}
            aria-label="Filter by Dealer"
            className="px-3 py-1.5 text-xs rounded-full border border-[#C7DDCC] bg-[#F8FAF8] text-[#16123F] focus:outline-none"
          >
            <option value="ALL">All Dealers</option>
            {dealers.map((d) => (
              <option key={d.id} value={d.company_name}>
                {d.company_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Styled with Theme */}
      <div className="overflow-x-auto rounded-2xl border border-[#C7DDCC]/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0F6F2] text-[11px] font-black text-[#16123F] uppercase tracking-wider border-b border-[#C7DDCC]">
              <th className="py-3 px-4">Product</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-[#75C9B7] transition-colors"
                onClick={() => toggleSort('unitsSold')}
              >
                <div className="flex items-center gap-1">
                  Units Sold
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-[#75C9B7] transition-colors"
                onClick={() => toggleSort('revenue')}
              >
                <div className="flex items-center gap-1">
                  Revenue
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Product Cost (COGS)</th>
              <th className="py-3 px-4">Ads & Fees</th>
              <th className="py-3 px-4">Gross Profit</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-[#75C9B7] transition-colors"
                onClick={() => toggleSort('netProfit')}
              >
                <div className="flex items-center gap-1">
                  Net Profit
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-[#75C9B7] transition-colors"
                onClick={() => toggleSort('margin')}
              >
                <div className="flex items-center gap-1">
                  Margin %
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C7DDCC]/40 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#555279]">
                  Loading product profitability records...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#555279]">
                  No products found matching criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isLowMargin = p.margin < 15;
                const isProfitable = p.netProfit >= 0;

                return (
                  <tr
                    key={p.productId}
                    className="hover:bg-[#F2F8F4] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#16123F]">
                        {p.productName}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#555279] mt-0.5">
                        <span>SKU: {p.sku}</span>
                        {p.dealerName && <span>• {p.dealerName}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#16123F]">
                      {p.unitsSold}
                    </td>
                    <td className="py-3 px-4 font-black text-[#16123F]">
                      {formatCurrency(p.revenue)}
                    </td>
                    <td className="py-3 px-4 text-[#555279] font-medium">
                      {formatCurrency(p.productCost)}
                    </td>
                    <td className="py-3 px-4 text-[#555279] font-medium">
                      {formatCurrency(p.marketingCost)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {formatCurrency(p.grossProfit)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-black ${
                          isProfitable ? 'text-[#16123F]' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(p.netProfit)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-black text-[10px] ${
                            (p.margin || 0) >= 25
                              ? 'bg-[#FFE26A] text-[#16123F]'
                              : (p.margin || 0) >= 15
                              ? 'bg-[#ABD699] text-[#16123F]'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {Number(p.margin || 0).toFixed(1)}%
                        </span>
                        {isLowMargin && (
                          <span
                            title="Low margin warning (<15%)"
                            className="text-amber-500"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
