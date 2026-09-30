import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchCampaigns, createPost } from '../../store/slices/marketingSlice';
import { addToast } from '../../store/slices/uiSlice';
import { marketingApi } from '../../api/marketingApi';
import type { Product } from '../../types';
import {
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Send,
  RefreshCw,
  Copy,
  Check,
  Sliders,
  Music,
  Film,
  LayoutTemplate,
  ShoppingBag,
  Radio,
  Smartphone,
  Square,
  Monitor,
  ArrowRight,
  Bot,
} from 'lucide-react';

interface StoryboardScene {
  sceneNumber: number;
  timeRange: string;
  name: string;
  visualAction: string;
  onScreenText: string;
  audioCue: string;
}

interface VideoTemplatePreset {
  id: string;
  name: string;
  source: 'Renderforest' | 'Design Shack';
  category: string;
  tagline: string;
  videoUrl: string;
  poster: string;
  duration: string;
  musicTrack: string;
  soundEffects: string;
  motionStyle: string;
  defaultHook: string;
  defaultCta: string;
  accentColor: string;
  storyboard: StoryboardScene[];
}

const VIDEO_PRESET_TEMPLATES: VideoTemplatePreset[] = [
  {
    id: 'renderforest_clothing',
    name: 'Renderforest Fashion Lookbook',
    source: 'Renderforest',
    category: 'Clothing & Apparel',
    tagline: 'Modern clothing runway with color splashes, model motion & fit specs',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
    duration: '15s',
    musicTrack: 'Upbeat Runway & Fashion House - 124 BPM',
    soundEffects: 'Camera shutter click, swoosh, low synth swell',
    motionStyle: 'Rhythmic Scene Cuts & Dynamic Color-Block Wipe',
    defaultHook: 'NEW DROP 2026 • ELEVATE YOUR FIT',
    defaultCta: 'SHOP THE LOOK',
    accentColor: '#f43f5e',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:03',
        name: 'The Runway Hook',
        visualAction: 'Fast-paced rhythmic zoom with bold season title slam and dynamic color block',
        onScreenText: 'NEW DROP 2026 • ELEVATE YOUR FIT',
        audioCue: 'Sub-bass drop into upbeat 124 BPM house tempo',
      },
      {
        sceneNumber: 2,
        timeRange: '0:03 - 0:07',
        name: 'Fabric & Fit Showcase',
        visualAction: 'Smooth macro pan highlighting premium stitching, breathable comfort, and silhouette',
        onScreenText: '100% ORGANIC COTTON • ULTRA-COMFORT FIT',
        audioCue: 'Clean percussion clap and ambient rhythm',
      },
      {
        sceneNumber: 3,
        timeRange: '0:07 - 0:11',
        name: 'Color Palette & Specs',
        visualAction: 'Split-screen multi-colorway flip with customer rating stars and social proof tag',
        onScreenText: '★★★★★ 4.9 RATING • 5 TIMELESS COLORWAYS',
        audioCue: 'Snare roll with melodic synth lead',
      },
      {
        sceneNumber: 4,
        timeRange: '0:11 - 0:15',
        name: 'Limited Drop CTA',
        visualAction: 'Pulsing discount badge and animated swipe-up button with express shipping banner',
        onScreenText: 'LIMITED RUN • TAP TO SHOP WITH 20% OFF',
        audioCue: 'Tonal chime and energetic outro beat',
      },
    ],
  },
  {
    id: 'designshack_kinetic_stomp',
    name: 'Design Shack Kinetic Stomp',
    source: 'Design Shack',
    category: 'High-Impact Commerce',
    tagline: 'After Effects style rhythmic typography, aggressive cuts & bass drops',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    duration: '12s',
    musicTrack: 'Kinetic Heavy Stomp - Bass Anthem 130 BPM',
    soundEffects: 'Heavy sub hit, whip pan whoosh, riser to drop',
    motionStyle: 'Kinetic Typography Stomp & Fast Rhythmic Cuts',
    defaultHook: 'STOP SETTLING. UPGRADE NOW.',
    defaultCta: 'COP THE DROP',
    accentColor: '#f59e0b',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:02',
        name: 'Typographic Stomp Slam',
        visualAction: 'Massive bold uppercase typography slamming onto screen with camera shake',
        onScreenText: 'STOP SETTLING. UPGRADE NOW.',
        audioCue: 'Instant heavy drum hit and riser',
      },
      {
        sceneNumber: 2,
        timeRange: '0:02 - 0:06',
        name: 'Rapid Multi-Angle Hero',
        visualAction: 'Three rapid 0.5s angle transitions synced to heavy beats, framing product details',
        onScreenText: 'BUILT DIFFERENT • NEXT-LEVEL CRAFT',
        audioCue: 'Synchronized bass kick on every cut',
      },
      {
        sceneNumber: 3,
        timeRange: '0:06 - 0:09',
        name: 'Tri-Feature Spotlight',
        visualAction: 'Three dynamic bullet points flashing in rapid sequence across the frame',
        onScreenText: 'FEATHERWEIGHT • UNBREAKABLE • WATERPROOF',
        audioCue: 'Glitch audio stutter and rhythmic tick',
      },
      {
        sceneNumber: 4,
        timeRange: '0:09 - 0:12',
        name: 'Price Drop Slam & CTA',
        visualAction: 'Original price crossed out with laser slash, big sale price stamp, and Shop Now CTA',
        onScreenText: 'SPECIAL LAUNCH PRICE • SHOP TODAY',
        audioCue: 'Massive finishing bass boom',
      },
    ],
  },
  {
    id: 'renderforest_product_carousel',
    name: 'Renderforest 3D Carousel',
    source: 'Renderforest',
    category: 'E-Commerce Social',
    tagline: 'Clean 3D turntable orbit with buyer reviews, ratings & spec pills',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    duration: '15s',
    musicTrack: 'Modern Commercial Pop & Upbeat Groove - 118 BPM',
    soundEffects: 'Notification bubble pop, soft whoosh, sparkle bell',
    motionStyle: 'Floating 3D Carousel Cards with Soft Drop Shadows',
    defaultHook: 'WHY IS EVERYONE BUYING THIS? 👀',
    defaultCta: 'EXPLORE REEL',
    accentColor: '#8b5cf6',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:03',
        name: 'Viral Question Hook',
        visualAction: 'Floating notification bubble asking why everyone is raving about this product',
        onScreenText: 'WHY IS EVERYONE BUYING THIS? 👀',
        audioCue: 'Notification pop sound & playful beat start',
      },
      {
        sceneNumber: 2,
        timeRange: '0:03 - 0:08',
        name: '3D Carousel Orbit',
        visualAction: 'Product smoothly orbits in 3D space with floating specification badges',
        onScreenText: 'ERGONOMIC • PREMIUM MATERIALS • ALL-DAY USE',
        audioCue: 'Rhythmic bassline with cheerful vocal chops',
      },
      {
        sceneNumber: 3,
        timeRange: '0:08 - 0:12',
        name: 'Social Proof & Rating',
        visualAction: 'Real verified buyer quote and 5-star animation popping in top right corner',
        onScreenText: '"BEST PURCHASE I MADE ALL YEAR!" - VERIFIED BUYER',
        audioCue: 'Sparkle sound effect and melodic chord',
      },
      {
        sceneNumber: 4,
        timeRange: '0:12 - 0:15',
        name: 'Exclusive Promo Offer',
        visualAction: 'Animated discount coupon badge sliding in from bottom with Shop Now button',
        onScreenText: 'USE CODE: VIP20 • FREE SHIPPING OVER $35',
        audioCue: 'Upbeat crescendo and celebratory ring',
      },
    ],
  },
  {
    id: 'designshack_cyber_hud',
    name: 'Design Shack Cyber HUD Scanner',
    source: 'Design Shack',
    category: 'Tech & Gadgets',
    tagline: 'Premiere Pro futuristic wireframe HUD, telemetry scan & laser grid',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    duration: '14s',
    musicTrack: 'Cyber Synthwave & Glitch FX - 128 BPM',
    soundEffects: 'HUD digital blips, laser scan sweep, electronic hum',
    motionStyle: 'Holographic Wireframe Grid & Cyan/Magenta Scanning Laser',
    defaultHook: 'SYSTEM SCAN: INITIATED • NEXT-GEN TECH',
    defaultCta: 'SECURE UNIT',
    accentColor: '#06b6d4',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:03',
        name: 'Digital Telemetry Scan',
        visualAction: 'Glowing holographic wireframe sweeps down product with real-time HUD telemetry',
        onScreenText: 'SYSTEM SCAN: INITIATED • HARDWARE IDENTIFIED',
        audioCue: 'Digital laser sweep and modem-style blips',
      },
      {
        sceneNumber: 2,
        timeRange: '0:03 - 0:07',
        name: 'Architectural Breakdown',
        visualAction: 'Product components highlight in neon cyan with floating biometric and spec meters',
        onScreenText: 'AERO-GRADE CHASSIS • ZERO-LATENCY RESPONSE',
        audioCue: 'Pulsing synthwave bassline and mechanical clicks',
      },
      {
        sceneNumber: 3,
        timeRange: '0:07 - 0:11',
        name: 'Benchmark & Stress Test',
        visualAction: 'High-speed graphic meters showing top-tier performance against standard products',
        onScreenText: '99.4% PERFORMANCE BENCHMARK EXCELLENCE',
        audioCue: 'Overdrive synth riser with cyber beat',
      },
      {
        sceneNumber: 4,
        timeRange: '0:11 - 0:14',
        name: 'Next-Gen Access Protocol',
        visualAction: 'Futuristic neon terminal border flashing Shop Link with limited inventory counter',
        onScreenText: 'SECURE YOUR UNIT • IMMEDIATE WORLDWIDE SHIP',
        audioCue: 'Laser confirmation chirp and deep electronic impact',
      },
    ],
  },
  {
    id: 'designshack_minimal_luxury',
    name: 'Design Shack 3D Luxury Demo',
    source: 'Design Shack',
    category: 'Luxury & Lifestyle',
    tagline: 'DaVinci/Final Cut champagne flares, macro slow dolly & gold specs',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    duration: '16s',
    musicTrack: 'Atmospheric Ambient Piano & Warm Bass - 95 BPM',
    soundEffects: 'Soft optical flare chime, velvet whoosh, acoustic resonance',
    motionStyle: 'Cinematic Slow Motion Dolly & Warm Champagne Optical Flares',
    defaultHook: 'PURITY IN EVERY LINE • UNCOMPROMISED CRAFT',
    defaultCta: 'ACQUIRE NOW',
    accentColor: '#e2b340',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:04',
        name: 'Atmospheric Light Leak',
        visualAction: 'Ultra-slow cinematic dolly glide across silhouette with subtle champagne bokeh',
        onScreenText: 'PURITY IN EVERY LINE • CRAFTED WITHOUT COMPROMISE',
        audioCue: 'Single resonant grand piano chord with warm tape decay',
      },
      {
        sceneNumber: 2,
        timeRange: '0:04 - 0:08',
        name: 'Material & Craftsmanship',
        visualAction: 'Gentle focal shift revealing precision brushed metal texture and subtle reflection',
        onScreenText: 'AIRCRAFT-GRADE TITANIUM • TIMELESS HERITAGE',
        audioCue: 'Deep warm sub-bass pad and soft ambient violin',
      },
      {
        sceneNumber: 3,
        timeRange: '0:08 - 0:12',
        name: 'Exclusivity Stamp',
        visualAction: 'Refined serif typography sliding in with minimalist gold certification badge',
        onScreenText: 'INDIVIDUALLY NUMBERED • LIMITED WORLDWIDE EDITION',
        audioCue: 'Gentle orchestral swell and acoustic chime',
      },
      {
        sceneNumber: 4,
        timeRange: '0:12 - 0:16',
        name: 'Invitation to Acquire',
        visualAction: 'Clean monochrome slate screen with understated luxury boutique link and gift packaging',
        onScreenText: 'ACQUIRE YOURS TODAY • COMPLIMENTARY WHITE-GLOVE DELIVERY',
        audioCue: 'Harmonic piano resolution and gentle fade',
      },
    ],
  },
  {
    id: 'renderforest_flash_sale',
    name: 'Renderforest Flash Sale Blitz',
    source: 'Renderforest',
    category: 'Flash Deals & Discounts',
    tagline: 'Explosive particle bursts, countdown clock & high-energy discount slashes',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    duration: '10s',
    musicTrack: 'High-Energy Festival EDM - 132 BPM',
    soundEffects: 'Explosive party horn, urgent countdown beeps, cash register cha-ching',
    motionStyle: 'Explosive Particle Motion, Neon Starburst Badges, Urgent Countdown',
    defaultHook: '⚡ 24-HOUR FLASH SALE • STARTS NOW',
    defaultCta: 'CLAIM 50% OFF',
    accentColor: '#ef4444',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:02',
        name: 'Urgent Red Alert',
        visualAction: 'Flashing red and amber countdown clock ticking with energetic particle bursts',
        onScreenText: '⚡ 24-HOUR FLASH SALE • STARTS NOW',
        audioCue: 'Urgent three-tone countdown beep',
      },
      {
        sceneNumber: 2,
        timeRange: '0:02 - 0:05',
        name: 'Best-Seller Highlight',
        visualAction: 'Product bounces into frame with spinning 50% OFF starburst badge',
        onScreenText: 'CUSTOMER FAVORITE • OVER 10,000 UNITS SOLD',
        audioCue: 'Energetic EDM drop with high-tempo synths',
      },
      {
        sceneNumber: 3,
        timeRange: '0:05 - 0:08',
        name: 'Massive Price Slasher',
        visualAction: 'Original price shatters into particles, revealing glowing neon discount price',
        onScreenText: 'WAS $99.99 ➔ NOW ONLY $49.99 (SAVE 50%)',
        audioCue: 'Glass shatter sound followed by cash register cha-ching',
      },
      {
        sceneNumber: 4,
        timeRange: '0:08 - 0:10',
        name: 'Shop Now Button Surge',
        visualAction: 'Pulsing glowing CTA button filling lower third with Hurry, Stock Running Out tag',
        onScreenText: 'TAP TO CLAIM YOUR DEAL BEFORE MIDNIGHT',
        audioCue: 'Celebratory festival horn and rhythmic outro',
      },
    ],
  },
];

export const ProductVideoStudioPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.product);
  const { campaigns } = useAppSelector((state) => state.marketing);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { selectedBusiness } = useAppSelector((state) => state.business);

  // Inspector Tabs
  const [activeTab, setActiveTab] = useState<'content' | 'template' | 'audio' | 'storyboard'>('content');

  // Video Configuration State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [targetCampaignId, setTargetCampaignId] = useState<string>('');
  const [activeTemplate, setActiveTemplate] = useState<VideoTemplatePreset>(VIDEO_PRESET_TEMPLATES[0]);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [provider, setProvider] = useState<'gemini' | 'chatgpt'>('gemini');

  // Video Content Customization
  const [headline, setHeadline] = useState<string>(VIDEO_PRESET_TEMPLATES[0].defaultHook);
  const [ctaText, setCtaText] = useState<string>(VIDEO_PRESET_TEMPLATES[0].defaultCta);
  const [discountBadge, setDiscountBadge] = useState<string>('50% OFF');
  const [salePrice, setSalePrice] = useState<string>('49.99');
  const [originalPrice, setOriginalPrice] = useState<string>('99.99');
  const [storeName, setStoreName] = useState<string>('DROPSHIPHUB');
  const [website, setWebsite] = useState<string>('www.dropshiphub.com');

  // Video Storyboard Scenes State (Editable)
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>(VIDEO_PRESET_TEMPLATES[0].storyboard);

  // Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSavingPost, setIsSavingPost] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync selected business
  useEffect(() => {
    if (selectedBusiness) {
      setStoreName(selectedBusiness.name.toUpperCase());
      setWebsite(`www.${selectedBusiness.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
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

  // Filter available products
  const availableProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!selectedBusiness) return list;
    return list.filter((p) => p.business_id === selectedBusiness.id || (p.dealer_id && assignedDealerIds.has(p.dealer_id)));
  }, [products, selectedBusiness, assignedDealerIds]);

  // Set default product
  useEffect(() => {
    if (availableProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(availableProducts[0].id);
      handleSelectProduct(availableProducts[0]);
    }
  }, [availableProducts, selectedProductId]);

  const activeProduct = useMemo(() => {
    return availableProducts.find((p) => p.id === selectedProductId) || availableProducts[0] || null;
  }, [availableProducts, selectedProductId]);

  const handleSelectProduct = (prod: Product) => {
    setSelectedProductId(prod.id);
    const sale = Number(prod.selling_price || prod.price || 49.99);
    setSalePrice(sale.toFixed(2));
    setOriginalPrice((sale * 1.5).toFixed(2));
  };

  // Switch template preset
  const handleSelectTemplate = (tpl: VideoTemplatePreset) => {
    setActiveTemplate(tpl);
    setHeadline(tpl.defaultHook);
    setCtaText(tpl.defaultCta);
    setStoryboard(tpl.storyboard);
    setIsPlaying(true);
    dispatch(addToast({
      type: 'info',
      message: `Switched to ${tpl.name} (${tpl.source} template)!`,
    }));
  };

  // Toggle Video Playback
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // AI Auto-Build Video Reel
  const handleAiAutoBuild = async () => {
    if (!activeProduct) return;
    setIsGeneratingAi(true);

    try {
      const res = await marketingApi.generateAiContent({
        provider,
        mediaType: 'video',
        productName: activeProduct.name,
        productImage: activeProduct.image_url || activeTemplate.poster,
        category: activeProduct.category || activeTemplate.category,
        price: salePrice,
        theme: activeTemplate.id,
        aspectRatio,
        platform: 'instagram',
        businessName: storeName,
      });

      if (res.data) {
        if (res.data.storyboard && res.data.storyboard.length > 0) {
          setStoryboard(res.data.storyboard);
        }
        if (res.data.hook) setHeadline(res.data.hook);
        dispatch(addToast({
          type: 'success',
          message: `✨ ${res.data.provider} built video storyboard & copy!`,
        }));
      }
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.message || 'AI video build failed' }));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Generated Caption Companion
  const generatedCaption = useMemo(() => {
    return `🔥 ${headline}!\n\n` +
      `✨ Featured: ${activeProduct ? activeProduct.name : 'Exclusive Drop'}\n` +
      `💰 Only $${salePrice} (Was $${originalPrice}) • ${discountBadge}\n` +
      `⚡ ${activeTemplate.motionStyle}\n` +
      `🎵 Soundtrack: ${activeTemplate.musicTrack}\n\n` +
      `👉 Tap to shop directly from link in bio: ${website}\n\n` +
      `#${storeName.replace(/\s+/g, '')} #ProductVideo #ReelMarketing #DesignShack #Renderforest #ViralDrop #TrendingNow`;
  }, [headline, activeProduct, salePrice, originalPrice, discountBadge, activeTemplate, website, storeName]);

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(generatedCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
      dispatch(addToast({ type: 'success', message: 'Video copy & hashtags copied!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to copy to clipboard' }));
    }
  };

  // Save Video to Social Posts
  const handleSaveToPosts = async () => {
    setIsSavingPost(true);
    try {
      const camp = campaigns.find((c) => c.id === targetCampaignId) || campaigns[0];
      const res = await dispatch(
        createPost({
          content: generatedCaption,
          media_url: activeTemplate.videoUrl,
          campaign_id: camp?.id,
          status: 'DRAFT',
        })
      );

      if (createPost.fulfilled.match(res)) {
        dispatch(addToast({
          type: 'success',
          message: '🎬 Video reel & storyboard saved to Scheduled Social Posts!',
        }));
      } else {
        dispatch(addToast({ type: 'error', message: 'Failed to save post' }));
      }
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.message || 'Error saving video post' }));
    } finally {
      setIsSavingPost(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Studio Header Context Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-[2rem] border border-[rgba(5,23,71,0.08)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
              <Film className="w-3 h-3 text-purple-600" />
              DESIGN SHACK & RENDERFOREST INSPIRATIONS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E7E9F0] text-[#081F62] border border-[#081F62]/10">
              Motion Graphics & Video Director
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#051747] tracking-tight">
            Product Video Studio & Motion Director
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAiAutoBuild}
            disabled={isGeneratingAi}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#081F62] to-[#0A2885] hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-200" />}
            AI Auto-Build Video
          </button>

          <a
            href={activeTemplate.videoUrl}
            target="_blank"
            rel="noreferrer"
            download={`product_video_${activeTemplate.id}.mp4`}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F4F6F9] text-[#051747] font-semibold text-xs flex items-center gap-2 border border-[rgba(5,23,71,0.08)] transition-all"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Download MP4
          </a>

          <button
            onClick={handleSaveToPosts}
            disabled={isSavingPost}
            className="px-4 py-2.5 rounded-xl bg-[#F8F9FB] hover:bg-[#E7E9F0] text-[#081F62] font-bold text-xs flex items-center gap-2 border border-[rgba(5,23,71,0.08)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSavingPost ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Save to Social Posts
          </button>

          <Link
            to="/marketing/poster-studio"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F4F6F9] text-[#081F62] font-bold text-xs flex items-center gap-1.5 border border-[rgba(5,23,71,0.08)] transition-all"
            title="Design matching static poster in Poster Studio"
          >
            <LayoutTemplate className="w-4 h-4 text-amber-500" />
            <span>Open Poster Studio</span>
          </Link>
        </div>
      </div>

      {/* Preset Video Templates Picker Bar */}
      <div className="bg-[#F8F9FB] p-5 rounded-[2rem] border border-[rgba(5,23,71,0.06)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#051747]" />
            <span className="text-xs font-bold text-[#051747] uppercase tracking-wider">
              Motion Video Templates (Design Shack & Renderforest)
            </span>
          </div>
          <span className="text-[11px] text-[#535F80]">Click any preset to load its motion pacing, video loop & storyboard</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {VIDEO_PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer group ${
                activeTemplate.id === tpl.id
                  ? 'bg-white border-[#081F62] shadow-sm'
                  : 'bg-white border-[rgba(5,23,71,0.08)] hover:bg-[#F4F6F9]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                  tpl.source === 'Renderforest' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {tpl.source}
                </span>
                <span className="text-[10px] text-[#535F80] font-mono">{tpl.duration}</span>
              </div>
              <div className="text-xs font-bold text-[#051747] group-hover:text-[#081F62] transition-colors truncate">
                {tpl.name}
              </div>
              <p className="text-[10px] text-[#535F80] line-clamp-2 mt-1 leading-relaxed">
                {tpl.tagline}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: Left Video Player & Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Interactive Video Stage & Storyboard Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Format & Dimensions Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[rgba(5,23,71,0.08)] shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#535F80] mr-1">Reel Aspect Ratio:</span>
              {[
                { id: '9:16', label: '9:16 Story/Reel', icon: Smartphone },
                { id: '1:1', label: '1:1 Square Feed', icon: Square },
                { id: '16:9', label: '16:9 Landscape', icon: Monitor },
              ].map((fmt) => {
                const Icon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setAspectRatio(fmt.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      aspectRatio === fmt.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-[#F4F6F9] text-[#535F80] hover:bg-[#E7E9F0]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {fmt.label}
                  </button>
                );
              })}
            </div>

            {/* AI Provider Switcher */}
            <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-lg border border-[rgba(5,23,71,0.08)]">
              <button
                onClick={() => setProvider('gemini')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  provider === 'gemini' ? 'bg-indigo-600 text-white' : 'text-[#535F80] hover:text-[#051747]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-blue-300" />
                Gemini
              </button>
              <button
                onClick={() => setProvider('chatgpt')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  provider === 'chatgpt' ? 'bg-emerald-600 text-white' : 'text-[#535F80] hover:text-[#051747]'
                }`}
              >
                <Bot className="w-3 h-3 text-emerald-300" />
                ChatGPT
              </button>
            </div>
          </div>

          {/* Interactive Video Player Stage */}
          <div className="bg-[#070a10] p-6 rounded-2xl border border-[rgba(5,23,71,0.08)] flex flex-col items-center justify-center min-h-[580px] overflow-hidden relative shadow-2xl">
            {/* Player Container */}
            <div
              className={`relative rounded-2xl overflow-hidden border border-[rgba(5,23,71,0.08)] shadow-2xl bg-black flex flex-col items-center justify-center transition-all ${
                aspectRatio === '9:16'
                  ? 'w-full max-w-[340px] aspect-[9/16]'
                  : aspectRatio === '1:1'
                  ? 'w-full max-w-[420px] aspect-square'
                  : 'w-full max-w-[560px] aspect-[16/9]'
              }`}
            >
              {/* Underlying HTML5 Video */}
              <video
                ref={videoRef}
                src={activeTemplate.videoUrl}
                poster={activeProduct?.image_url || activeTemplate.poster}
                loop
                muted={isMuted}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Dynamic Overlay Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

              {/* TOP HEADER OVERLAY: Branding & Template Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-[rgba(5,23,71,0.08)] flex items-center gap-1">
                  <Film className="w-3 h-3 text-purple-400" />
                  <span>{activeTemplate.name}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md text-[#535F80] border border-[rgba(5,23,71,0.08)]">
                  {activeTemplate.duration}
                </span>
              </div>

              {/* CENTER KINETIC TEXT OVERLAY (Inspired by Design Shack Stomp) */}
              <div className="relative z-10 px-5 text-center my-auto pointer-events-none space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-tight">
                  {headline}
                </h3>
                {discountBadge && (
                  <div className="inline-block px-3 py-1 rounded-full bg-rose-600/90 text-white font-black text-xs uppercase tracking-wider shadow-lg border border-[rgba(5,23,71,0.08)] animate-pulse">
                    {discountBadge}
                  </div>
                )}
              </div>

              {/* Centered Play / Pause Floating Overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-[rgba(5,23,71,0.08)] text-white flex items-center justify-center transition-all opacity-0 hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
                aria-label="Toggle playback"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>

              {/* BOTTOM STRIP: Product Pill, Equalizer & CTA */}
              <div className="absolute bottom-3 left-3 right-3 z-10 space-y-2">
                <div className="p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-[rgba(5,23,71,0.08)] flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-white truncate">
                      {activeProduct ? activeProduct.name : 'Dropship Feature Product'}
                    </h4>
                    <p className="text-[10px] text-[#535F80] truncate">
                      {activeTemplate.musicTrack}
                    </p>
                  </div>
                  {/* Equalizer Bars */}
                  <div className="flex items-end gap-0.5 h-4 shrink-0">
                    <span className="w-1 bg-purple-400 rounded-full animate-bounce h-3" />
                    <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-4 [animation-delay:150ms]" />
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce h-2 [animation-delay:300ms]" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3.5 [animation-delay:75ms]" />
                  </div>
                </div>

                {/* Player Controls & CTA */}
                <div className="flex items-center justify-between text-[#535F80] text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-indigo-600 font-bold text-white text-xs flex items-center gap-1 shadow-md">
                    <span>{ctaText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Design & Audio Profile Card */}
          <div className="p-4 rounded-xl bg-white border border-purple-500/20 shadow-lg space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[rgba(5,23,71,0.08)]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Music className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Audio & Sound Design Profile</h4>
                  <p className="text-[11px] text-[#535F80]">{activeTemplate.musicTrack}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Studio Mastered
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#535F80] bg-[#F4F6F9] p-2 rounded-lg border border-[rgba(5,23,71,0.08)]">
              <Radio className="w-3.5 h-3.5 text-[#051747] shrink-0" />
              <span>SFX Cues: <strong className="text-[#051747]">{activeTemplate.soundEffects}</strong></span>
            </div>
          </div>

          {/* Interactive 4-Scene Storyboard & Timeline Breakdown */}
          <div className="space-y-2 p-4 rounded-xl bg-white border border-[rgba(5,23,71,0.08)] shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(5,23,71,0.08)]">
              <span className="text-xs font-bold text-[#051747] uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-4 h-4 text-purple-400" />
                4-Scene Storyboard & Timeline (Design Shack & Renderforest)
              </span>
              <span className="text-[11px] text-[#535F80]">Second-by-Second Breakdown</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {storyboard.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="p-3 rounded-xl bg-[#F8F9FB] border border-[rgba(5,23,71,0.08)] hover:border-purple-500/30 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#051747] group-hover:text-[#081F62] transition-colors">
                      Scene {scene.sceneNumber}: {scene.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#E7E9F0] text-[#051747]">
                      {scene.timeRange}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#535F80] leading-relaxed">
                    {scene.visualAction}
                  </p>
                  <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-700 font-bold truncate shadow-sm">
                    🔤 &quot;{scene.onScreenText}&quot;
                  </div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono truncate font-medium">
                    <Music className="w-2.5 h-2.5 shrink-0" />
                    <span>{scene.audioCue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Caption Companion */}
          <div className="bg-white p-4 rounded-xl border border-[rgba(5,23,71,0.08)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#051747] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                AI Social Video Caption & Hashtags
              </span>
              <button
                onClick={handleCopyCaption}
                className="px-2.5 py-1 rounded bg-[#F4F6F9] hover:bg-[#E7E9F0] text-[#535F80] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCaption ? 'Copied!' : 'Copy Caption'}
              </button>
            </div>
            <pre className="text-xs font-mono text-[#535F80] bg-[#F4F6F9] p-3 rounded-lg border border-[rgba(5,23,71,0.08)] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {generatedCaption}
            </pre>
          </div>
        </div>

        {/* RIGHT COLUMN: Video Customization Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[rgba(5,23,71,0.08)] p-5 space-y-5 shadow-xl">
          {/* Inspector Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(5,23,71,0.08)]">
            <span className="text-xs font-bold text-[#535F80] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              Customize Video Production
            </span>
            <span className="text-[11px] text-[#535F80]">Live Video Director</span>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-4 gap-1 bg-[#F4F6F9] p-1 rounded-xl border border-[rgba(5,23,71,0.08)]">
            {[
              { id: 'content', label: 'Product', icon: ShoppingBag },
              { id: 'template', label: 'Template', icon: Film },
              { id: 'audio', label: 'Audio', icon: Music },
              { id: 'storyboard', label: 'Scenes', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-[#535F80] hover:text-[#051747]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: PRODUCT & COPY */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                  Select Catalog Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const prod = availableProducts.find((p) => p.id === e.target.value);
                    if (prod) handleSelectProduct(prod);
                  }}
                  className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] focus:outline-none focus:border-purple-500"
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${Number(p.selling_price || p.price || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                  Video Headline Hook (Kinetic Overlay)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-bold uppercase focus:outline-none focus:border-purple-500"
                  placeholder="e.g. STOP SETTLING. UPGRADE NOW."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                    Discount Badge Text
                  </label>
                  <input
                    type="text"
                    value={discountBadge}
                    onChange={(e) => setDiscountBadge(e.target.value)}
                    className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-bold focus:outline-none focus:border-purple-500"
                    placeholder="e.g. 50% OFF"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-bold focus:outline-none focus:border-purple-500"
                    placeholder="e.g. SHOP THE LOOK"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                    Sale Price ($)
                  </label>
                  <input
                    type="text"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                    Original Price ($)
                  </label>
                  <input
                    type="text"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#535F80] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#051747] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#535F80] mb-1.5">
                  Link with Marketing Campaign (Optional)
                </label>
                <select
                  value={targetCampaignId}
                  onChange={(e) => setTargetCampaignId(e.target.value)}
                  className="w-full bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] rounded-xl px-3 py-2 text-xs text-[#535F80] focus:outline-none focus:border-purple-500"
                >
                  <option value="">General Broadcast (No Campaign)</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATE & MOTION STYLE */}
          {activeTab === 'template' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#535F80]">
                Select Motion Graphics Archetype
              </label>

              <div className="space-y-2.5">
                {VIDEO_PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeTemplate.id === tpl.id
                        ? 'bg-purple-950/40 border-purple-500'
                        : 'bg-[#F4F6F9] border-[rgba(5,23,71,0.08)] hover:border-[rgba(5,23,71,0.08)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{tpl.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                          tpl.source === 'Renderforest' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {tpl.source}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#535F80] mt-0.5">{tpl.motionStyle}</div>
                    </div>
                    <span className="text-xs font-mono text-purple-400">{tpl.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO & SOUNDSCAPE */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-purple-400" />
                  Active Audio Soundtrack
                </span>
                <p className="text-xs text-[#535F80] font-mono">{activeTemplate.musicTrack}</p>
                <div className="text-[11px] text-[#535F80]">
                  Mastered for TikTok & Instagram Reels algorithm engagement
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#535F80]">
                  Sound Effect Cues (Included in Template)
                </label>
                <div className="p-3 rounded-xl bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] text-xs text-[#535F80] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{activeTemplate.soundEffects}</span>
                  </div>
                  <div className="text-[10px] text-[#535F80]">
                    Synced automatically with scene transitions and text slashes
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCENE STORYBOARD EDITOR */}
          {activeTab === 'storyboard' && (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              <span className="text-xs font-bold text-[#535F80] block">
                Edit Second-by-Second On-Screen Text
              </span>

              {storyboard.map((sc, idx) => (
                <div key={sc.sceneNumber} className="p-3 rounded-xl bg-[#F4F6F9] border border-[rgba(5,23,71,0.08)] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Scene {sc.sceneNumber}: {sc.name}</span>
                    <span className="text-[10px] font-mono text-purple-400">{sc.timeRange}</span>
                  </div>
                  <input
                    type="text"
                    value={sc.onScreenText}
                    onChange={(e) => {
                      const updated = [...storyboard];
                      updated[idx] = { ...updated[idx], onScreenText: e.target.value };
                      setStoryboard(updated);
                    }}
                    className="w-full bg-white border border-[rgba(5,23,71,0.08)] rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold"
                  />
                  <div className="text-[10px] text-[#535F80]">{sc.visualAction}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductVideoStudioPage;
