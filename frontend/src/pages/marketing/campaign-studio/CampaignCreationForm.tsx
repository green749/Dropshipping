import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { fetchProducts } from '../../../store/slices/productSlice';
import { fetchDealers } from '../../../store/slices/dealerSlice';
import { Sparkles, ArrowRight, Package, Check, ChevronDown, Calendar } from 'lucide-react';

const OBJECTIVES = ['Brand Awareness', 'Product Promotion', 'Sales', 'Lead Generation', 'Engagement', 'Website Traffic'];
const TONES = ['Professional', 'Friendly', 'Premium', 'Emotional', 'Educational', 'Energetic'];
const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'X (Twitter)', 'Pinterest'];
const DURATIONS = ['1 Week', '2 Weeks', '1 Month', 'Ongoing'];

export const CampaignCreationForm = ({ config, setConfig, onNext }: any) => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.product);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { selectedBusiness } = useAppSelector((state) => state.business);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const durationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchDealers());
  }, [dispatch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target as Node)) {
        setIsDurationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const businessProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!selectedBusiness) return list;
    return list.filter(
      (p) =>
        p.business_id === selectedBusiness.id ||
        (p.dealer_id && assignedDealerIds.has(p.dealer_id))
    );
  }, [products, selectedBusiness, assignedDealerIds]);

  const update = (field: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleArray = (field: string, item: string) => {
    const arr = config[field] || [];
    if (arr.includes(item)) {
      update(field, arr.filter((x: string) => x !== item));
    } else {
      update(field, [...arr, item]);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onNext();
    }, 1500);
  };

  const currentDuration = config.duration || '2 Weeks';

  return (
    <div className="w-full space-y-5 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ─── LEFT COLUMN: CAMPAIGN DETAILS ─── */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#C7DDCC] shadow-xs space-y-4">
          <div className="border-b border-[#F0F6F2] pb-3">
            <h2 className="text-sm font-extrabold text-[#16123F]">Campaign Details</h2>
          </div>

          {/* Campaign Name */}
          <div>
            <label className="text-xs font-bold text-[#16123F] block mb-1">Campaign Name</label>
            <input
              type="text"
              value={config.name || ''}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Summer Essentials Drop"
              className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl px-3.5 py-2 text-xs text-[#16123F] placeholder-[#555279]/60 focus:bg-white focus:ring-1 focus:ring-[#75C9B7] focus:border-[#75C9B7] outline-none transition-all"
            />
          </div>

          {/* Campaign Objective */}
          <div>
            <label className="text-xs font-bold text-[#16123F] block mb-1.5">Objective</label>
            <div className="flex flex-wrap gap-1.5">
              {OBJECTIVES.map((obj) => {
                const isSelected = config.objective === obj;
                return (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => update('objective', obj)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#16123F] text-white shadow-xs'
                        : 'bg-[#F0F6F2] text-[#16123F] hover:bg-[#C7DDCC]/40 border border-[#C7DDCC]/60'
                    }`}
                  >
                    {obj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Products */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#16123F]">Target Product(s)</label>
              <span className="text-[11px] text-[#555279]">{(config.products || []).length} selected</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {businessProducts.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC] text-center text-xs text-[#555279]">
                  No products found for this storefront.
                </div>
              ) : (
                businessProducts.map((p) => {
                  const isSelected = (config.products || []).includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleArray('products', p.id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#FFE26A]/20 border-[#FFE26A] text-[#16123F] font-bold'
                          : 'bg-[#FAFAFA] border-[#C7DDCC]/70 hover:bg-[#F0F6F2] text-[#16123F]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#C7DDCC]/30 flex items-center justify-center shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-3.5 h-3.5 text-[#16123F]" />
                          )}
                        </div>
                        <span className="text-xs font-semibold truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#75C9B7]">₹{p.selling_price || p.price || '0'}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#FFE26A] flex items-center justify-center text-[#16123F]">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Duration & Budget with Custom Styled Dropdown */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Custom UI Dropdown for Duration */}
            <div className="relative" ref={durationDropdownRef}>
              <label className="text-xs font-bold text-[#16123F] block mb-1">Duration</label>
              <button
                type="button"
                onClick={() => setIsDurationOpen(!isDurationOpen)}
                className={`w-full bg-[#FAFAFA] hover:bg-white border rounded-xl px-3 py-2 text-xs font-semibold text-[#16123F] flex items-center justify-between transition-all cursor-pointer ${
                  isDurationOpen
                    ? 'border-[#75C9B7] ring-1 ring-[#75C9B7] bg-white shadow-xs'
                    : 'border-[#C7DDCC]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="w-3.5 h-3.5 text-[#75C9B7] shrink-0" />
                  <span>{currentDuration}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#555279] transition-transform duration-200 ${
                    isDurationOpen ? 'rotate-180 text-[#16123F]' : ''
                  }`}
                />
              </button>

              {/* Custom Dropdown Menu */}
              {isDurationOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#C7DDCC] rounded-xl shadow-lg p-1 z-30 animate-fade-in">
                  {DURATIONS.map((dur) => {
                    const isSelected = currentDuration === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => {
                          update('duration', dur);
                          setIsDurationOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F0F6F2] text-[#16123F] font-bold'
                            : 'text-[#555279] hover:bg-[#FAFAFA] hover:text-[#16123F]'
                        }`}
                      >
                        <span>{dur}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#75C9B7]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Estimated Budget Input */}
            <div>
              <label className="text-xs font-bold text-[#16123F] block mb-1">Estimated Budget</label>
              <input
                type="text"
                value={config.budget || ''}
                onChange={(e) => update('budget', e.target.value)}
                placeholder="e.g. ₹5,000"
                className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl px-3.5 py-2 text-xs text-[#16123F] placeholder-[#555279]/60 focus:bg-white focus:ring-1 focus:ring-[#75C9B7] outline-none"
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: AUDIENCE & CHANNELS ─── */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#C7DDCC] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-[#F0F6F2] pb-3">
              <h2 className="text-sm font-extrabold text-[#16123F]">Audience & Style</h2>
            </div>

            {/* Audience Description */}
            <div>
              <label className="text-xs font-bold text-[#16123F] block mb-1">Target Audience</label>
              <textarea
                value={config.audience || ''}
                onChange={(e) => update('audience', e.target.value)}
                placeholder="e.g. Urban professionals interested in smart gadgets..."
                rows={2}
                className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl px-3.5 py-2 text-xs text-[#16123F] placeholder-[#555279]/60 focus:bg-white focus:ring-1 focus:ring-[#75C9B7] outline-none resize-none"
              />
            </div>

            {/* Location & Age */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-[#16123F] block mb-1">Location</label>
                <input
                  type="text"
                  value={config.location || ''}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="e.g. India"
                  className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl px-3 py-2 text-xs text-[#16123F] placeholder-[#555279]/60 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#16123F] block mb-1">Age Group</label>
                <input
                  type="text"
                  value={config.ageGroup || ''}
                  onChange={(e) => update('ageGroup', e.target.value)}
                  placeholder="e.g. 18-35"
                  className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl px-3 py-2 text-xs text-[#16123F] placeholder-[#555279]/60 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Brand Tone */}
            <div>
              <label className="text-xs font-bold text-[#16123F] block mb-1.5">Brand Tone</label>
              <div className="flex flex-wrap gap-1.5">
                {TONES.map((tone) => {
                  const isSelected = config.brandTone === tone;
                  return (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => update('brandTone', tone)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#16123F] text-white shadow-xs'
                          : 'bg-[#F0F6F2] text-[#16123F] hover:bg-[#C7DDCC]/40 border border-[#C7DDCC]/60'
                      }`}
                    >
                      {tone}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Publishing Channels */}
            <div>
              <label className="text-xs font-bold text-[#16123F] block mb-1.5">Channels</label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map((plat) => {
                  const isSelected = (config.platforms || []).includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => toggleArray('platforms', plat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#75C9B7] text-[#16123F] shadow-xs'
                          : 'bg-[#F0F6F2] text-[#16123F] hover:bg-[#C7DDCC]/40 border border-[#C7DDCC]/60'
                      }`}
                    >
                      {plat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-[#F0F6F2]">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !config.name || !config.objective}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating AI Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#FFE26A]" />
                  <span>Generate Campaign Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
