import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchCampaigns, createPost } from '../../store/slices/marketingSlice';
import { addToast } from '../../store/slices/uiSlice';
import {
  renderPosterToCanvas,
  ASPECT_RATIO_DIMENSIONS,
  type PosterDesignConfig,
} from '../../utils/posterCanvasRenderer';
import {
  Sparkles,
  Download,
  Send,
  RefreshCw,
  Copy,
  Check,
  Type,
  Star,
  ShieldCheck,
  Zap,
  Smartphone,
  Square,
  Monitor,
  LayoutTemplate,
  ShoppingBag,
  Video,
} from 'lucide-react';
import type { Product } from '../../types';

// ─── Preset Templates ─────────────────────────────────────────────────────────
interface PosterPreset {
  id: string;
  name: string;
  tagline: string;
  category: 'SALE' | 'LUXURY' | 'STREETWEAR' | 'CLEARANCE' | 'SEASONAL';
  config: Partial<PosterDesignConfig>;
}

const PRESET_TEMPLATES: PosterPreset[] = [
  {
    id: 'flash_sale',
    name: '🔥 Mega Flash Sale',
    tagline: 'High-converting discount splash',
    category: 'SALE',
    config: {
      theme: 'crimson_flame',
      bgColor1: '#dc2626',
      bgColor2: '#7f1d1d',
      accentColor: '#f59e0b',
      headline: 'FLASH SALE',
      headlineFont: 'display',
      headlineSize: 64,
      headlineColor: '#ffffff',
      subhead: 'Limited 24H Drop • Up To 50% Off Everything',
      subheadColor: '#fef08a',
      badgeText: '50% OFF',
      badgeStyle: 'starburst',
      badgeBgColor: '#e11d48',
      badgeTextColor: '#ffffff',
      ctaText: 'SHOP NOW',
      ctaStyle: 'gradient',
      ctaColor: '#f59e0b',
      ctaTextColor: '#000000',
      showUrgencyBadge: true,
      urgencyText: 'Ends Tonight at Midnight',
      showRating: true,
      showGuarantee: true,
    },
  },
  {
    id: 'luxury_boutique',
    name: '✨ Luxury Boutique',
    tagline: 'Refined serif with champagne gold',
    category: 'LUXURY',
    config: {
      theme: 'midnight_luxury',
      bgColor1: '#090d16',
      bgColor2: '#1e1b4b',
      accentColor: '#fbbf24',
      headline: 'EXCLUSIVE DROP',
      headlineFont: 'serif',
      headlineSize: 56,
      headlineColor: '#fef3c7',
      subhead: 'Handcrafted Heritage • Limited Edition Pieces',
      subheadColor: '#cbd5e1',
      badgeText: 'VIP ACCESS',
      badgeStyle: 'pill',
      badgeBgColor: '#d97706',
      badgeTextColor: '#ffffff',
      ctaText: 'EXPLORE SUITE',
      ctaStyle: 'pill',
      ctaColor: '#fbbf24',
      ctaTextColor: '#0f172a',
      showUrgencyBadge: false,
      showRating: true,
      showGuarantee: true,
    },
  },
  {
    id: 'cyber_streetwear',
    name: '⚡ Neo Cyber Drop',
    tagline: 'Acid yellow industrial dark streetwear',
    category: 'STREETWEAR',
    config: {
      theme: 'cyber_neon',
      bgColor1: '#050505',
      bgColor2: '#18181b',
      accentColor: '#eab308',
      headline: 'SEASON 04 DROP',
      headlineFont: 'mono',
      headlineSize: 58,
      headlineColor: '#facc15',
      subhead: 'Futuristic Utility Wear • Limited Quantities Only',
      subheadColor: '#e2e8f0',
      badgeText: 'LIMITED RUN',
      badgeStyle: 'stamp',
      badgeBgColor: '#eab308',
      badgeTextColor: '#000000',
      ctaText: 'COP THE DROP',
      ctaStyle: 'rect',
      ctaColor: '#facc15',
      ctaTextColor: '#000000',
      showUrgencyBadge: true,
      urgencyText: 'Only 50 Units Stocked',
      showRating: false,
      showGuarantee: true,
    },
  },
  {
    id: 'clearance_blowout',
    name: '🛍️ Super Clearance',
    tagline: 'Vibrant punchy retail blowout',
    category: 'CLEARANCE',
    config: {
      theme: 'royal_amethyst',
      bgColor1: '#4c1d95',
      bgColor2: '#1e1b4b',
      accentColor: '#38bdf8',
      headline: 'FINAL CLEARANCE',
      headlineFont: 'display',
      headlineSize: 60,
      headlineColor: '#ffffff',
      subhead: 'Massive Warehouse Liquidation • Everything Must Go',
      subheadColor: '#bae6fd',
      badgeText: 'SAVE 70%',
      badgeStyle: 'starburst',
      badgeBgColor: '#0284c7',
      badgeTextColor: '#ffffff',
      ctaText: 'CLAIM SAVINGS',
      ctaStyle: 'gradient',
      ctaColor: '#38bdf8',
      ctaTextColor: '#082f49',
      showUrgencyBadge: true,
      urgencyText: 'Final Stock Remaining',
      showRating: true,
      showGuarantee: true,
    },
  },
  {
    id: 'emerald_lifestyle',
    name: '🌿 Eco & Wellness',
    tagline: 'Clean emerald organic contemporary',
    category: 'SEASONAL',
    config: {
      theme: 'emerald_glow',
      bgColor1: '#064e3b',
      bgColor2: '#022c22',
      accentColor: '#34d399',
      headline: 'SUMMER ESSENTIALS',
      headlineFont: 'sans',
      headlineSize: 54,
      headlineColor: '#ecfdf5',
      subhead: 'Pure Everyday Craftsmanship • Sustainable Materials',
      subheadColor: '#a7f3d0',
      badgeText: 'BEST SELLER',
      badgeStyle: 'pill',
      badgeBgColor: '#059669',
      badgeTextColor: '#ffffff',
      ctaText: 'DISCOVER MORE',
      ctaStyle: 'pill',
      ctaColor: '#34d399',
      ctaTextColor: '#064e3b',
      showUrgencyBadge: false,
      showRating: true,
      showGuarantee: true,
    },
  },
];

const COLOR_THEMES = [
  { id: 'crimson_flame', name: 'Crimson Flame', bg1: '#dc2626', bg2: '#7f1d1d', accent: '#f59e0b' },
  { id: 'midnight_luxury', name: 'Midnight Obsidian', bg1: '#090d16', bg2: '#1e1b4b', accent: '#fbbf24' },
  { id: 'cyber_neon', name: 'Cyber Neon', bg1: '#09090b', bg2: '#18181b', accent: '#eab308' },
  { id: 'royal_amethyst', name: 'Royal Amethyst', bg1: '#4c1d95', bg2: '#1e1b4b', accent: '#38bdf8' },
  { id: 'emerald_glow', name: 'Emerald Forest', bg1: '#064e3b', bg2: '#022c22', accent: '#34d399' },
  { id: 'sunset_blaze', name: 'Sunset Blaze', bg1: '#ea580c', bg2: '#831843', accent: '#facc15' },
  { id: 'rose_gold', name: 'Rose & Champagne', bg1: '#881337', bg2: '#3b0764', accent: '#f472b6' },
  { id: 'slate_minimal', name: 'Monochrome Slate', bg1: '#1e293b', bg2: '#0f172a', accent: '#38bdf8' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const RetailPosterStudioPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.product);
  const { campaigns } = useAppSelector((state) => state.marketing);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { selectedBusiness } = useAppSelector((state) => state.business);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [targetCampaignId, setTargetCampaignId] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [previewScale, setPreviewScale] = useState<number>(0.48);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [poster, setPoster] = useState<PosterDesignConfig>({
    aspectRatio: '1:1',
    theme: 'crimson_flame',
    accentColor: '#f59e0b',
    bgColor1: '#dc2626',
    bgColor2: '#7f1d1d',
    bgOverlayDarkness: 0.15,
    headline: 'MEGA FLASH SALE',
    headlineFont: 'display',
    headlineSize: 62,
    headlineColor: '#ffffff',
    subhead: 'Special 24H Deal • Premium Gear & Free Shipping',
    subheadColor: '#fef08a',
    badgeText: '50% OFF',
    badgeStyle: 'starburst',
    badgeBgColor: '#e11d48',
    badgeTextColor: '#ffffff',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    productScale: 1.0,
    productOffsetY: 0,
    productShadow: true,
    showPrice: true,
    salePrice: '49.99',
    originalPrice: '99.99',
    currency: '$',
    ctaText: 'SHOP NOW',
    ctaStyle: 'gradient',
    ctaColor: '#f59e0b',
    ctaTextColor: '#000000',
    storeName: 'DROPSHIPHUB STORE',
    website: 'www.dropshiphub.com',
    showRating: true,
    ratingValue: '4.9/5',
    showGuarantee: true,
    showUrgencyBadge: true,
    urgencyText: 'Ends Tonight at Midnight',
  });

  // Sync selected business name
  useEffect(() => {
    if (selectedBusiness) {
      setPoster((prev) => ({
        ...prev,
        storeName: selectedBusiness.name.toUpperCase(),
        website: `www.${selectedBusiness.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      }));
    }
  }, [selectedBusiness]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCampaigns());
  }, [dispatch]);

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

  const availableProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!selectedBusiness) return list;
    return list.filter((p) => p.business_id === selectedBusiness.id || (p.dealer_id && assignedDealerIds.has(p.dealer_id)));
  }, [products, selectedBusiness, assignedDealerIds]);

  useEffect(() => {
    if (availableProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(availableProducts[0].id);
      handleSelectProduct(availableProducts[0]);
    }
  }, [availableProducts, selectedProductId]);

  const getProductImage = (prod: Product): string => {
    if (prod.image_url) return prod.image_url;
    if (prod.images) {
      if (Array.isArray(prod.images) && prod.images.length > 0) return prod.images[0];
      if (typeof prod.images === 'string') {
        try {
          const parsed = JSON.parse(prod.images);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch {
          const str = String(prod.images);
          if (str.startsWith('http')) return str;
        }
      }
    }
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProductId(prod.id);
    const img = getProductImage(prod);
    const sale = Number(prod.selling_price || prod.price || 49.99);
    const orig = (sale * 1.5).toFixed(2);
    setPoster((prev) => ({
      ...prev,
      productImage: img,
      salePrice: sale.toFixed(2),
      originalPrice: orig,
      subhead: `Get the all-new ${prod.name} • Limited Units Available`,
    }));
  };

  const handleApplyPreset = (preset: PosterPreset) => {
    setPoster((prev) => ({ ...prev, ...preset.config }));
    dispatch(addToast({ type: 'info', message: `Applied "${preset.name}" template!` }));
  };

  // AI Auto-Generate: picks random preset + social post copy
  const handleAiAutoDesign = () => {
    const list = availableProducts;
    const currentProd = list.find((p) => p.id === selectedProductId) || list[0];
    if (!currentProd) return;

    const discountPercent =
      Math.round(
        ((Number(poster.originalPrice) - Number(poster.salePrice)) / Number(poster.originalPrice)) * 100
      ) || 40;

    const headlines = ['FLASH SALE', 'MEGA DEAL', 'LIMITED DROP', 'NEW ARRIVAL', 'SPECIAL OFFER', 'CLEARANCE SALE'];
    const pickedHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    const pickedPreset = PRESET_TEMPLATES[Math.floor(Math.random() * PRESET_TEMPLATES.length)];

    setPoster((prev) => ({
      ...prev,
      ...pickedPreset.config,
      headline: pickedHeadline,
      badgeText: `${discountPercent}% OFF`,
      subhead: `Save big on ${currentProd.name} • Express Shipping Included`,
    }));

    dispatch(addToast({ type: 'success', message: '✨ AI generated a social media post design!' }));
  };

  const generatedCaption = useMemo(() => {
    const brand = poster.storeName || 'DropShipHub';
    return (
      `🔥 ${poster.headline}! ${poster.badgeText} on our featured best-seller!\n\n` +
      `✨ ${poster.subhead}\n` +
      `💰 Only ${poster.currency}${poster.salePrice} (Was ${poster.currency}${poster.originalPrice})\n` +
      `⚡ ${poster.urgencyText || 'Limited time special'}\n\n` +
      `👉 Tap link in bio or visit ${poster.website} to claim yours today!\n\n` +
      `#${brand.replace(/\s+/g, '')} #RetailSale #DealOfTheDay #LimitedDrop #MegaSale #OnlineShopping #SaveBig`
    );
  }, [poster]);

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(generatedCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
      dispatch(addToast({ type: 'success', message: 'Caption & hashtags copied!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to copy to clipboard' }));
    }
  };

  const handleDownloadPng = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await renderPosterToCanvas(canvasRef.current, poster);
      const link = document.createElement('a');
      link.download = `social_post_${poster.aspectRatio.replace(':', '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      dispatch(addToast({ type: 'success', message: 'High-resolution post downloaded!' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: 'Export failed: ' + err.message }));
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToPosts = async () => {
    if (!canvasRef.current) return;
    setIsSavingPost(true);
    try {
      const dataUrl = await renderPosterToCanvas(canvasRef.current, poster);
      const campaign = campaigns.find((c) => c.id === targetCampaignId) || campaigns[0];
      const res = await dispatch(
        createPost({
          content: generatedCaption,
          media_url: dataUrl,
          campaign_id: campaign?.id,
          status: 'DRAFT',
        })
      );
      if (createPost.fulfilled.match(res)) {
        dispatch(addToast({ type: 'success', message: '🎉 Post saved to Social Posts!' }));
      } else {
        dispatch(addToast({ type: 'error', message: 'Failed to save post' }));
      }
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.message || 'Error saving post' }));
    } finally {
      setIsSavingPost(false);
    }
  };

  const currentDim = ASPECT_RATIO_DIMENSIONS[poster.aspectRatio];
  const frameWidth = Math.round(currentDim.width * previewScale);
  const frameHeight = Math.round(currentDim.height * previewScale);

  // ─── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 w-full pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[2rem] border border-[rgba(5,23,71,0.08)] shadow-sm">
        <div>
          <h1 className="text-xl font-black text-[#051747] tracking-tight flex items-center gap-2">
            Social Post Studio
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#081F62] border border-indigo-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAiAutoDesign}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#081F62] to-[#0A2885] hover:opacity-90 text-white font-black text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate Post
          </button>
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F4F6F9] text-[#051747] font-semibold text-xs flex items-center gap-2 border border-[rgba(5,23,71,0.08)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin text-[#081F62]" /> : <Download className="w-4 h-4 text-emerald-500" />}
            Download PNG
          </button>
          <button
            onClick={handleSaveToPosts}
            disabled={isSavingPost}
            className="px-4 py-2.5 rounded-xl bg-[#081F62] hover:bg-[#051747] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSavingPost ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Save to Posts
          </button>
          <Link
            to="/marketing/video-studio"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F4F6F9] text-[#081F62] font-bold text-xs flex items-center gap-1.5 border border-[rgba(5,23,71,0.08)] transition-all"
          >
            <Video className="w-4 h-4 text-[#081F62]" />
            Video Studio
          </Link>
        </div>
      </div>

      {/* Main Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Canvas Preview — 8 cols */}
        <div className="lg:col-span-8 space-y-4">

          {/* Aspect Ratio + Zoom */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-[rgba(5,23,71,0.08)] shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#535F80] mr-1">Format:</span>
              {(['1:1', '9:16', '4:5', '16:9'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setPoster((p) => ({ ...p, aspectRatio: ratio }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    poster.aspectRatio === ratio
                      ? 'bg-[#E7E9F0] text-[#081F62] shadow-sm'
                      : 'bg-white text-[#535F80] hover:bg-[#F4F6F9]'
                  }`}
                >
                  {ratio === '1:1' && <Square className="w-3 h-3" />}
                  {ratio === '9:16' && <Smartphone className="w-3 h-3" />}
                  {ratio === '4:5' && <Smartphone className="w-3 h-3" />}
                  {ratio === '16:9' && <Monitor className="w-3 h-3" />}
                  {ratio}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#535F80]">Zoom:</span>
              <button onClick={() => setPreviewScale((s) => Math.max(0.3, s - 0.05))} className="w-6 h-6 rounded bg-[#F4F6F9] hover:bg-[#E7E9F0] text-[#051747] text-xs flex items-center justify-center cursor-pointer">-</button>
              <span className="text-xs font-mono text-[#051747] w-10 text-center">{Math.round(previewScale * 100)}%</span>
              <button onClick={() => setPreviewScale((s) => Math.min(0.75, s + 0.05))} className="w-6 h-6 rounded bg-[#F4F6F9] hover:bg-[#E7E9F0] text-[#051747] text-xs flex items-center justify-center cursor-pointer">+</button>
            </div>
          </div>

          {/* Canvas Stage */}
          <div className="bg-[#F8F9FB] p-6 rounded-[2rem] border border-[rgba(5,23,71,0.06)] flex flex-col items-center justify-center min-h-[580px] overflow-hidden relative shadow-inner">
            <div
              style={{
                width: `${frameWidth}px`,
                height: `${frameHeight}px`,
                background: `linear-gradient(135deg, ${poster.bgColor1}, ${poster.bgColor2})`,
              }}
              className="relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-[rgba(5,23,71,0.08)] select-none flex flex-col justify-between p-6"
            >
              <div style={{ background: `radial-gradient(circle at 80% 20%, ${poster.accentColor}44, transparent 65%)` }} className="absolute inset-0 pointer-events-none" />
              <div style={{ background: `radial-gradient(circle at 20% 80%, ${poster.bgColor1}88, transparent 60%)` }} className="absolute inset-0 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              {poster.bgOverlayDarkness > 0 && (
                <div style={{ backgroundColor: `rgba(0,0,0,${poster.bgOverlayDarkness})` }} className="absolute inset-0 pointer-events-none" />
              )}

              {/* TOP */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(5,23,71,0.08)]">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span className="text-xs font-black tracking-widest text-white uppercase">{poster.storeName}</span>
                  </div>
                  {poster.showRating && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                      <Star className="w-3.5 h-3.5 fill-amber-300" />
                      <span>{poster.ratingValue}</span>
                    </div>
                  )}
                </div>
                {poster.showUrgencyBadge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-[10px] font-bold text-red-200">
                    <Zap className="w-3 h-3 text-red-400" />
                    <span>{poster.urgencyText.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* MIDDLE */}
              <div className="relative z-10 my-auto py-2">
                <div className="text-left mb-3">
                  <h2
                    style={{
                      color: poster.headlineColor,
                      fontSize: `${Math.round(poster.headlineSize * previewScale * 0.9)}px`,
                      fontFamily:
                        poster.headlineFont === 'display'
                          ? 'Impact, Arial Black, sans-serif'
                          : poster.headlineFont === 'serif'
                          ? 'Playfair Display, Georgia, serif'
                          : poster.headlineFont === 'mono'
                          ? 'JetBrains Mono, monospace'
                          : 'Montserrat, Inter, sans-serif',
                    }}
                    className="font-black tracking-tight leading-none drop-shadow-lg uppercase"
                  >
                    {poster.headline}
                  </h2>
                  <p style={{ color: poster.subheadColor }} className="text-xs font-semibold mt-1 drop-shadow leading-relaxed">
                    {poster.subhead}
                  </p>
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div style={{ background: `radial-gradient(circle, ${poster.accentColor}66 0%, transparent 70%)` }} className="absolute w-48 h-48 rounded-full blur-xl pointer-events-none" />
                  <div style={{ transform: `scale(${poster.productScale}) translateY(${poster.productOffsetY * 0.3}px)` }} className="relative transition-transform duration-150">
                    <img
                      src={poster.productImage}
                      alt="Product"
                      className={`max-h-44 object-contain rounded-xl ${poster.productShadow ? 'drop-shadow-[0_20px_25px_rgba(0,0,0,0.85)]' : ''}`}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="absolute -top-3 -right-2">
                    {poster.badgeStyle === 'starburst' && (
                      <div style={{ backgroundColor: poster.badgeBgColor, color: poster.badgeTextColor }} className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xs text-center border-2 border-white shadow-xl rotate-12 animate-pulse">
                        {poster.badgeText}
                      </div>
                    )}
                    {poster.badgeStyle === 'pill' && (
                      <div style={{ backgroundColor: poster.badgeBgColor, color: poster.badgeTextColor }} className="px-3 py-1.5 rounded-full font-black text-xs border border-[rgba(5,23,71,0.08)] shadow-xl">
                        {poster.badgeText}
                      </div>
                    )}
                    {poster.badgeStyle === 'stamp' && (
                      <div style={{ borderColor: poster.badgeBgColor, color: poster.badgeTextColor }} className="px-3 py-1 border-2 font-mono font-black text-xs uppercase bg-black/60 shadow-xl -rotate-6">
                        {poster.badgeText}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  {poster.showPrice && (
                    <div>
                      {poster.originalPrice && (
                        <span className="text-xs text-[#535F80] line-through mr-2 font-mono">
                          {poster.currency}{poster.originalPrice}
                        </span>
                      )}
                      <span className="text-xl font-black text-white font-mono drop-shadow">
                        {poster.currency}{poster.salePrice}
                      </span>
                    </div>
                  )}
                  <div
                    style={{ backgroundColor: poster.ctaColor, color: poster.ctaTextColor }}
                    className={`px-4 py-2 font-black text-xs shadow-lg uppercase tracking-wider flex items-center gap-1.5 ${
                      poster.ctaStyle === 'pill' ? 'rounded-full' : poster.ctaStyle === 'rect' ? 'rounded-md' : 'rounded-xl'
                    }`}
                  >
                    <span>{poster.ctaText}</span>
                    <span>&#8594;</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[rgba(5,23,71,0.08)] flex items-center justify-between text-[10px] text-[#535F80]">
                  <span className="font-mono opacity-80">&#127760; {poster.website}</span>
                  {poster.showGuarantee && (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      100% Guaranteed
                    </span>
                  )}
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Caption */}
          <div className="bg-white p-4 rounded-xl border border-[rgba(5,23,71,0.08)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#051747] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Generated Caption &amp; Hashtags
              </span>
              <button
                onClick={handleCopyCaption}
                className="px-2.5 py-1 rounded bg-[#F4F6F9] hover:bg-slate-700 text-[#535F80] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCaption ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono text-[#535F80] bg-[#F4F6F9] p-3 rounded-lg border border-[rgba(5,23,71,0.08)] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
              {generatedCaption}
            </pre>
          </div>
        </div>

        {/* Controls Panel — 4 cols */}
        <div className="lg:col-span-4 space-y-4">

          {/* Product & Style */}
          <div className="bg-white rounded-2xl border border-[rgba(5,23,71,0.08)] p-4 space-y-4">
            <span className="text-xs font-bold text-[#535F80] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              Product &amp; Style
            </span>

            <div>
              <label className="block text-xs font-semibold text-[#535F80] mb-1.5">Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const prod = availableProducts.find((p) => p.id === e.target.value);
                  if (prod) handleSelectProduct(prod);
                }}
                className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] focus:outline-none focus:border-indigo-500"
              >
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${Number(p.selling_price || p.price || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#535F80] mb-2">Style Template</label>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_TEMPLATES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="text-left px-3 py-2 rounded-xl bg-[#F4F6F9] hover:bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{preset.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#535F80] font-mono">{preset.category}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#535F80] mb-2">Color Theme</label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() =>
                      setPoster((p) => ({
                        ...p,
                        theme: th.id,
                        bgColor1: th.bg1,
                        bgColor2: th.bg2,
                        accentColor: th.accent,
                        ctaColor: th.accent,
                      }))
                    }
                    title={th.name}
                    className={`h-8 w-full rounded-lg border-2 transition-all cursor-pointer ${
                      poster.theme === th.id
                        ? 'border-indigo-400 scale-110 shadow-lg'
                        : 'border-[rgba(5,23,71,0.08)] hover:border-[rgba(5,23,71,0.08)]'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${th.bg1}, ${th.bg2})` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Text & Pricing */}
          <div className="bg-white rounded-2xl border border-[rgba(5,23,71,0.08)] p-4 space-y-3">
            <span className="text-xs font-bold text-[#535F80] uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-4 h-4 text-indigo-400" />
              Text &amp; Pricing
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-[#535F80] mb-1">Headline</label>
              <input
                type="text"
                value={poster.headline}
                onChange={(e) => setPoster((p) => ({ ...p, headline: e.target.value }))}
                className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-bold uppercase focus:outline-none focus:border-indigo-500"
                placeholder="FLASH SALE"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#535F80] mb-1">Subhead</label>
              <input
                type="text"
                value={poster.subhead}
                onChange={(e) => setPoster((p) => ({ ...p, subhead: e.target.value }))}
                className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#535F80] mb-1">Badge Text</label>
                <input
                  type="text"
                  value={poster.badgeText}
                  onChange={(e) => setPoster((p) => ({ ...p, badgeText: e.target.value }))}
                  className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#535F80] mb-1">CTA Button</label>
                <input
                  type="text"
                  value={poster.ctaText}
                  onChange={(e) => setPoster((p) => ({ ...p, ctaText: e.target.value }))}
                  className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-[#535F80] mb-1">Currency</label>
                <input
                  type="text"
                  value={poster.currency}
                  onChange={(e) => setPoster((p) => ({ ...p, currency: e.target.value }))}
                  className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-lg px-2 py-1.5 text-xs text-[#051747] text-center font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#535F80] mb-1">Sale Price</label>
                <input
                  type="text"
                  value={poster.salePrice}
                  onChange={(e) => setPoster((p) => ({ ...p, salePrice: e.target.value }))}
                  className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-lg px-2 py-1.5 text-xs text-[#051747] font-bold font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#535F80] mb-1">Original</label>
                <input
                  type="text"
                  value={poster.originalPrice}
                  onChange={(e) => setPoster((p) => ({ ...p, originalPrice: e.target.value }))}
                  className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-lg px-2 py-1.5 text-xs text-[#535F80] font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Publish */}
          <div className="bg-white rounded-2xl border border-[rgba(5,23,71,0.08)] p-4 space-y-3">
            <span className="text-xs font-bold text-[#535F80] uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-4 h-4 text-indigo-400" />
              Publish
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-[#535F80] mb-1">Link to Campaign (optional)</label>
              <select
                value={targetCampaignId}
                onChange={(e) => setTargetCampaignId(e.target.value)}
                className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#535F80] focus:outline-none focus:border-indigo-500"
              >
                <option value="">General Broadcast</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveToPosts}
              disabled={isSavingPost}
              className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSavingPost ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Save to Social Posts
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F9] hover:bg-slate-700 text-[#051747] font-semibold text-sm flex items-center justify-center gap-2 border border-[rgba(5,23,71,0.08)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> : <Download className="w-4 h-4 text-emerald-400" />}
              Download High-Res PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailPosterStudioPage;
