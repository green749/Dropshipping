import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPosts,
  createPost,
  publishPost,
  deletePost,
  fetchCampaigns,
  fetchSocialAccounts,
} from '../../store/slices/marketingSlice';
import { fetchProducts } from '../../store/slices/productSlice';
import { addToast } from '../../store/slices/uiSlice';
import { marketingApi } from '../../api/marketingApi';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import { FormField } from '../../components/common/FormField';
import { FormAlert } from '../../components/common/FormAlert';
import type { Post, Product } from '../../types';
import {
  Plus,
  Send,
  Trash2,
  Clock,
  Megaphone,
  Sparkles,
  Video,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  LayoutTemplate,
  Download,
  Share2,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Play,
  UploadCloud,
  Package,
  Globe,
} from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

type DestinationPlatform = 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'TWITTER' | 'PINTEREST' | 'YOUTUBE';

export const PostsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts, campaigns, socialAccounts, isLoading } = useAppSelector((state) => state.marketing);
  const { products } = useAppSelector((state) => state.product);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { selectedBusiness } = useAppSelector((state) => state.business);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'>('ALL');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignId, setCampaignId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<DestinationPlatform>('INSTAGRAM');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [postMode, setPostMode] = useState<'DRAFT' | 'SCHEDULED' | 'PUBLISH_NOW'>('SCHEDULED');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // In-Modal AI Generation State
  const [aiModel, setAiModel] = useState<'gemini' | 'chatgpt'>('gemini');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchCampaigns());
    dispatch(fetchProducts());
    dispatch(fetchSocialAccounts());
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

  const relevantCampaigns = useMemo(() => {
    if (!selectedBusiness) return campaigns;
    return campaigns.filter((c) => c.business_id === selectedBusiness.id);
  }, [campaigns, selectedBusiness]);

  const relevantProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!selectedBusiness) return list;
    return list.filter((p) => p.business_id === selectedBusiness.id || (p.dealer_id && assignedDealerIds.has(p.dealer_id)));
  }, [products, selectedBusiness, assignedDealerIds]);

  const relevantPosts = useMemo(() => {
    if (!selectedBusiness) return posts;
    const campaignIdSet = new Set(relevantCampaigns.map((c) => c.id));
    return posts.filter((p) => !p.campaign_id || campaignIdSet.has(p.campaign_id) || relevantCampaigns.length === 0);
  }, [posts, relevantCampaigns, selectedBusiness]);

  const campaignMap = useMemo(() => {
    const map = new Map<string, string>();
    relevantCampaigns.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [relevantCampaigns]);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  // Handle incoming productId or campaignId query parameters
  useEffect(() => {
    const queryProductId = searchParams.get('productId');
    const queryCampaignId = searchParams.get('campaignId');

    if (queryProductId && products.length > 0) {
      const prod = products.find((p) => p.id === queryProductId);
      if (prod) {
        setSelectedProductId(prod.id);
        const prodImg = prod.images?.[0] || prod.image_url || (prod as any).imageUrl || '';
        setMediaUrl(prodImg);
        const price = Number(prod.selling_price || prod.price || 0).toFixed(2);
        setContent(
          `✨ Discover the all-new ${prod.name}! Elevate your experience today for only $${price}.\n\nLimited stock available. Tap the link in bio to shop now! 🛍️\n\n#${(prod.category || 'lifestyle').toLowerCase().replace(/\s+/g, '')} #bestseller #newdrop #deals #shopping`
        );
        if (queryCampaignId) {
          setCampaignId(queryCampaignId);
        } else if (relevantCampaigns.length > 0) {
          setCampaignId(relevantCampaigns[0].id);
        }
        // Set default schedule to tomorrow 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        setScheduledAt(tomorrow.toISOString().slice(0, 16));
        setPostMode('SCHEDULED');
        setIsModalOpen(true);
      }
    }
  }, [searchParams, products, relevantCampaigns]);

  const filteredPosts = useMemo(() => {
    return relevantPosts.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      const matchContent = p.content?.toLowerCase().includes(term);
      const campName = p.campaign_id ? campaignMap.get(p.campaign_id)?.toLowerCase() : '';
      const matchCamp = campName ? campName.includes(term) : false;
      return matchContent || matchCamp;
    });
  }, [relevantPosts, statusFilter, debouncedSearch, campaignMap]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canNext,
    canPrev,
  } = usePagination(filteredPosts, { itemsPerPage: 8 });

  const handleOpenCreate = () => {
    const defaultProduct = relevantProducts[0];
    if (defaultProduct) {
      setSelectedProductId(defaultProduct.id);
      const prodImg = defaultProduct.images?.[0] || defaultProduct.image_url || (defaultProduct as any).imageUrl || '';
      setMediaUrl(prodImg);
      const price = Number(defaultProduct.selling_price || defaultProduct.price || 0).toFixed(2);
      setContent(
        `🔥 Check out our featured product: ${defaultProduct.name} at just $${price}!\n\nOrder today for fast delivery! 🚀\n\n#newarrival #trending #deals`
      );
    } else {
      setSelectedProductId('');
      setMediaUrl('');
      setContent('');
    }

    setCampaignId(relevantCampaigns[0]?.id || '');
    setSelectedPlatform('INSTAGRAM');
    setMediaType('image');
    setPostMode('SCHEDULED');

    // Default scheduled time: 24h from now at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setScheduledAt(tomorrow.toISOString().slice(0, 16));

    setIsModalOpen(true);
  };

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const prodImg = prod.images?.[0] || prod.image_url || (prod as any).imageUrl || '';
      setMediaUrl(prodImg);
      const price = Number(prod.selling_price || prod.price || 0).toFixed(2);
      setContent(
        `✨ Introducing ${prod.name}!\n\nUpgrade your collection for only $${price}.\nAvailable now at our store! 🛍️\n\n#${(prod.category || 'dropship').toLowerCase().replace(/\s+/g, '')} #musthave #trending`
      );
    }
  };

  const handleDownloadAsset = (urlToDownload?: string, filename?: string) => {
    const targetUrl = urlToDownload || mediaUrl;
    if (!targetUrl) {
      dispatch(addToast({ type: 'warning', message: 'No media asset URL available to download' }));
      return;
    }
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = filename || `social-creative-${Date.now()}.${mediaType === 'video' ? 'mp4' : 'png'}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    dispatch(addToast({ type: 'success', message: 'Creative asset download initiated!' }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video');
    setMediaType(isVid ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaUrl(reader.result);
        dispatch(addToast({ type: 'success', message: `Attached ${file.name} to post draft` }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiContent = async () => {
    const list = Array.isArray(products) ? products : [];
    const prod = list.find((p) => p.id === selectedProductId) || list[0];
    if (!prod) {
      dispatch(addToast({ type: 'warning', message: 'Please select a catalog product to draft from' }));
      return;
    }

    let prodImg = prod.images?.[0] || prod.image_url || (prod as any).imageUrl;
    if (!prodImg && prod.images) {
      if (Array.isArray(prod.images) && prod.images.length > 0) prodImg = prod.images[0];
      else if (typeof prod.images === 'string') {
        try {
          const parsed = JSON.parse(prod.images);
          if (Array.isArray(parsed) && parsed.length > 0) prodImg = parsed[0];
        } catch {
          const str = String(prod.images);
          if (str.startsWith('http')) prodImg = str;
        }
      }
    }

    setIsGeneratingAi(true);
    try {
      const res = await marketingApi.generateAiContent({
        provider: aiModel,
        mediaType,
        productName: prod.name,
        productImage: prodImg || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        category: prod.category || 'General',
        price: prod.selling_price || prod.price || 49.99,
        theme: 'cinematic_studio',
        aspectRatio: mediaType === 'video' ? '9:16' : '1:1',
        platform: selectedPlatform.toLowerCase(),
      });

      if (res.data) {
        setContent(`${res.data.caption}\n\n${res.data.hashtags.join(' ')}`);
        const generatedUrl = mediaType === 'video' ? (res.data.videoUrl || res.data.mediaUrl) : res.data.mediaUrl;
        if (generatedUrl) {
          setMediaUrl(generatedUrl);
        }
        dispatch(addToast({
          type: 'success',
          message: `✨ ${res.data.provider} generated ${mediaType} creative & copy for ${selectedPlatform}!`,
        }));
      }
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.message || 'AI generation failed' }));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!content.trim()) {
      errors.content = 'Please provide post copy or caption text.';
    }

    if (postMode === 'SCHEDULED' && !scheduledAt) {
      errors.scheduledAt = 'Please select a future date & time for release.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted issues before submitting.');
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const calculatedStatus: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' =
      postMode === 'PUBLISH_NOW' ? 'PUBLISHED' : postMode === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT';

    const res = await dispatch(
      createPost({
        content: content.trim(),
        media_url: mediaUrl || undefined,
        campaign_id: campaignId || undefined,
        product_id: selectedProductId || undefined,
        platform: selectedPlatform,
        status: calculatedStatus,
        scheduled_at: calculatedStatus === 'SCHEDULED' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        published_at: calculatedStatus === 'PUBLISHED' ? new Date().toISOString() : undefined,
      })
    );

    if (createPost.fulfilled.match(res)) {
      if (calculatedStatus === 'PUBLISHED') {
        dispatch(addToast({ type: 'success', message: `🚀 Post syndicated and published to ${selectedPlatform}!` }));
      } else if (calculatedStatus === 'SCHEDULED') {
        dispatch(addToast({ type: 'success', message: `📅 Post scheduled for ${new Date(scheduledAt || Date.now()).toLocaleString()} on ${selectedPlatform}!` }));
      } else {
        dispatch(addToast({ type: 'success', message: '📝 Post saved to drafts!' }));
      }
      setIsModalOpen(false);
      // Remove query params if present
      if (searchParams.get('productId') || searchParams.get('campaignId')) {
        setSearchParams({});
      }
    } else {
      const errorMsg = (res.payload as any)?.message || 'Failed to create post';
      setFormError(errorMsg);
    }
  };

  const handlePublish = async (id: string) => {
    const res = await dispatch(publishPost(id));
    if (publishPost.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: '🚀 Post broadcasted and syndicated to destination platform!' }));
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to publish post' }));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await dispatch(deletePost(deleteTarget.id));
    if (deletePost.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: 'Post removed' }));
    } else {
      dispatch(addToast({ type: 'error', message: 'Failed to delete post' }));
    }
    setDeleteTarget(null);
  };

  const platformIcons: Record<DestinationPlatform, React.ReactNode> = {
    INSTAGRAM: <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />,
    FACEBOOK: <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />,
    TIKTOK: <Smartphone className="w-3.5 h-3.5 text-[#16123F]" />,
    TWITTER: <TwitterIcon className="w-3.5 h-3.5 text-sky-500" />,
    PINTEREST: <Share2 className="w-3.5 h-3.5 text-red-600" />,
    YOUTUBE: <Play className="w-3.5 h-3.5 text-red-600" />,
  };

  const columns: Column<Post>[] = [
    {
      key: 'content',
      header: 'CREATIVE COPY & MEDIA',
      render: (p) => {
        const isVid = p.media_url?.includes('.mp4') || p.media_url?.includes('video');
        const prod = p.product_id ? productMap.get(p.product_id) : undefined;
        return (
          <div className="flex items-start gap-3 max-w-lg">
            {p.media_url ? (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#C7DDCC] bg-[#F0F6F2] shrink-0 group">
                {isVid ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#16123F] text-white">
                    <Video className="w-6 h-6 text-[#FFE26A]" />
                  </div>
                ) : (
                  <img
                    src={p.media_url}
                    alt="Creative"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-bold bg-[#16123F]/80 text-white">
                  {isVid ? 'REEL' : 'IMG'}
                </span>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl border border-[#C7DDCC] bg-[#F0F6F2] shrink-0 flex items-center justify-center text-[#16123F]/40">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
            <div className="space-y-1 min-w-0">
              {prod && (
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#FFE26A]/30 border border-[#FFE26A] text-[10px] font-bold text-[#16123F] flex items-center gap-1">
                    <Package className="w-3 h-3 text-[#16123F]" />
                    <span className="truncate max-w-[150px]">{prod.name}</span>
                  </span>
                </div>
              )}
              <p className="text-xs text-[#16123F] line-clamp-2 leading-relaxed font-medium">
                {p.content}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'platform',
      header: 'TARGET PLATFORM',
      render: (p) => {
        const plat = (p.platform || 'INSTAGRAM').toUpperCase() as DestinationPlatform;
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F0F6F2] border border-[#C7DDCC] text-xs font-bold text-[#16123F]">
            {platformIcons[plat] || <Share2 className="w-3.5 h-3.5 text-[#16123F]" />}
            <span>{plat}</span>
          </span>
        );
      },
    },
    {
      key: 'campaign_id',
      header: 'CAMPAIGN',
      render: (p) => (
        <span className="text-xs text-[#16123F] flex items-center gap-1.5 font-bold">
          <Megaphone className="w-3.5 h-3.5 text-[#75C9B7] shrink-0" />
          <span className="truncate max-w-[150px]">
            {p.campaign_id ? campaignMap.get(p.campaign_id) || `Campaign #${p.campaign_id.slice(0, 6)}` : 'Direct Broadcast'}
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'SCHEDULE & STATUS',
      render: (p) => {
        if (p.status === 'PUBLISHED') {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#75C9B7]/25 text-[#16123F] border border-[#75C9B7] text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#75C9B7]" />
                <span>Published</span>
              </span>
              {p.published_at && (
                <span className="text-[10px] text-[#16123F]/60 block font-mono">
                  {new Date(p.published_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        }

        if (p.status === 'SCHEDULED') {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFE26A]/40 text-[#16123F] border border-[#FFE26A] text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-[#16123F]" />
                <span>Scheduled</span>
              </span>
              {p.scheduled_at && (
                <span className="text-[10px] text-[#16123F]/70 block font-bold">
                  {new Date(p.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        }

        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#F0F6F2] text-[#16123F]/70 border border-[#C7DDCC] text-xs font-semibold">
            Draft
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'MARKETER ACTIONS',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end space-x-1.5">
          {p.media_url && (
            <button
              onClick={() => handleDownloadAsset(p.media_url, `asset-${p.id.slice(0, 6)}.png`)}
              className="p-1.5 rounded-lg bg-[#F0F6F2] text-[#16123F]/80 hover:text-[#16123F] hover:bg-[#C7DDCC]/50 border border-[#C7DDCC] transition-all cursor-pointer shadow-xs"
              title="Download Creative Asset Image/Video"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {p.status !== 'PUBLISHED' && (
            <button
              onClick={() => handlePublish(p.id)}
              className="p-1.5 rounded-lg bg-[#75C9B7]/20 text-[#16123F] hover:bg-[#75C9B7] border border-[#75C9B7] transition-all cursor-pointer shadow-xs font-bold"
              title="Syndicate & Publish Now"
            >
              <Send className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setDeleteTarget(p)}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            title="Delete Post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const selectedProductObj = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-[#16123F] tracking-tight">
          Social Posts & Campaign Scheduler
        </h1>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            to="/marketing/products"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#F0F6F2] hover:bg-[#C7DDCC]/50 text-[#16123F] border border-[#C7DDCC] flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Package className="w-3.5 h-3.5 text-[#16123F]" />
            <span>Product Catalog</span>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="btn-primary !px-4 !py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Draft New Post</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#C7DDCC] shadow-xs">
          {(['ALL', 'SCHEDULED', 'DRAFT', 'PUBLISHED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#16123F] text-[#FFE26A] shadow-xs'
                  : 'text-[#16123F]/70 hover:text-[#16123F] hover:bg-[#F0F6F2]'
              }`}
            >
              {tab === 'ALL' ? 'All Posts' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search post copy, campaigns..."
            className="max-w-md w-full"
          />
          <span className="text-xs font-bold text-[#16123F]/60 hidden sm:inline whitespace-nowrap">
            {filteredPosts.length} posts
          </span>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
        emptyTitle="No posts drafted or scheduled"
        emptyDescription="Select a product from the catalog or draft your first promotional image/video post to broadcast across social platforms."
        emptyActionText="Draft Post"
        onEmptyAction={handleOpenCreate}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        canNext={canNext}
        canPrev={canPrev}
      />

      {/* Draft & Schedule Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (searchParams.get('productId') || searchParams.get('campaignId')) {
            setSearchParams({});
          }
        }}
        maxWidth="4xl"
        title="Draft & Schedule Campaign Post"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormAlert message={formError} onClose={() => setFormError(null)} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-4">
              {/* Product Selector with Download Action */}
              <div className="p-3.5 rounded-xl bg-[#F0F6F2] border border-[#C7DDCC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#16123F] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#16123F]" />
                    <span>Target Catalog Product</span>
                  </label>
                  {selectedProductObj && (
                    <button
                      type="button"
                      onClick={() => handleDownloadAsset(selectedProductObj.images?.[0] || selectedProductObj.image_url, `${selectedProductObj.sku || 'product'}-asset.png`)}
                      className="text-[11px] font-bold text-[#16123F] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Product Asset</span>
                    </button>
                  )}
                </div>

                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="input-field !text-xs !py-2 bg-white"
                >
                  <option value="">-- Choose Product from Catalog --</option>
                  {relevantProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{Number(p.selling_price || p.price || 0).toLocaleString('en-IN')}) - {p.category || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Platform Picker */}
              <div>
                <label className="form-label !mb-2 text-xs font-bold text-[#16123F]">Target Destination Platform *</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'TWITTER', 'PINTEREST', 'YOUTUBE'] as const).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedPlatform === plat
                          ? 'bg-[#16123F] text-[#FFE26A] border-[#16123F] shadow-sm scale-[1.02]'
                          : 'bg-white text-[#16123F]/70 border-[#C7DDCC] hover:bg-[#F0F6F2] hover:text-[#16123F]'
                      }`}
                    >
                      <span className="shrink-0">{platformIcons[plat]}</span>
                      <span className="text-[10px] font-bold tracking-tight">
                        {plat === 'TWITTER' ? 'X / Twitter' : plat === 'TIKTOK' ? 'TikTok' : plat === 'YOUTUBE' ? 'YouTube' : plat.charAt(0) + plat.slice(1).toLowerCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Format & Creative Studio Assistant */}
              <div className="p-3.5 rounded-xl bg-white border border-[#C7DDCC] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#16123F] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#75C9B7]" />
                    <span>Creative Format & AI Assistant</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAiModel('gemini')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        aiModel === 'gemini'
                          ? 'bg-[#16123F] text-[#FFE26A]'
                          : 'text-[#16123F]/60 bg-[#F0F6F2]'
                      }`}
                    >
                      Gemini Pro
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiModel('chatgpt')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        aiModel === 'chatgpt'
                          ? 'bg-[#16123F] text-[#FFE26A]'
                          : 'text-[#16123F]/60 bg-[#F0F6F2]'
                      }`}
                    >
                      ChatGPT-4o
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      mediaType === 'image'
                        ? 'bg-[#FFE26A] text-[#16123F] border-[#16123F]'
                        : 'bg-[#F0F6F2] text-[#16123F]/70 border-[#C7DDCC]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Square / Feed Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      mediaType === 'video'
                        ? 'bg-[#FFE26A] text-[#16123F] border-[#16123F]'
                        : 'bg-[#F0F6F2] text-[#16123F]/70 border-[#C7DDCC]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>9:16 Video Reel / Short</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAiContent}
                    disabled={isGeneratingAi || !selectedProductId}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#16123F] hover:bg-[#16123F]/90 text-[#FFE26A] text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Copy & Media...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 text-[#FFE26A]" />
                        <span>AI Auto-Draft Creative & Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Media URL / Upload Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label !mb-0">Media Asset URL or Upload</label>
                  <label className="text-[11px] font-bold text-[#16123F] hover:underline flex items-center gap-1 cursor-pointer">
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload Local File</span>
                    <input
                      type="file"
                      accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={mediaType === 'video' ? 'https://.../video.mp4' : 'https://.../image.jpg'}
                  className="input-field !text-xs font-mono"
                />
              </div>

              {/* Post Caption Copy */}
              <FormField
                label="Post Creative Caption & Hashtags"
                htmlFor="post-content-textarea"
                required
                error={fieldErrors.content}
              >
                <textarea
                  id="post-content-textarea"
                  rows={4}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, content: '' }));
                  }}
                  placeholder="Announce your product drop, highlight key features, and add trending hashtags..."
                  className={`input-field !text-xs ${fieldErrors.content ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
              </FormField>

              {/* Linked Campaign */}
              <div>
                <label className="form-label">Associated Campaign</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="input-field !text-xs"
                >
                  <option value="">-- Direct Broadcast (No Campaign) --</option>
                  {relevantCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Budget: ₹{Number(c.budget || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Release Scheduling Mode */}
              <div className="p-3.5 rounded-xl bg-white border border-[#C7DDCC] space-y-3">
                <label className="form-label !mb-0">Campaign Schedule & Release Timing</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostMode('SCHEDULED')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      postMode === 'SCHEDULED'
                        ? 'bg-[#FFE26A] text-[#16123F] border-[#16123F]'
                        : 'bg-[#F0F6F2] text-[#16123F]/70 border-[#C7DDCC]'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Date</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostMode('DRAFT')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      postMode === 'DRAFT'
                        ? 'bg-[#FFE26A] text-[#16123F] border-[#16123F]'
                        : 'bg-[#F0F6F2] text-[#16123F]/70 border-[#C7DDCC]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostMode('PUBLISH_NOW')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      postMode === 'PUBLISH_NOW'
                        ? 'bg-[#75C9B7] text-[#16123F] border-[#16123F]'
                        : 'bg-[#F0F6F2] text-[#16123F]/70 border-[#C7DDCC]'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Now</span>
                  </button>
                </div>

                {postMode === 'SCHEDULED' && (
                  <FormField
                    label="Release Date & Time (Campaign Window)"
                    htmlFor="post-scheduled-at"
                    required
                    error={fieldErrors.scheduledAt}
                  >
                    <input
                      id="post-scheduled-at"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => {
                        setScheduledAt(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, scheduledAt: '' }));
                      }}
                      className={`input-field !text-xs font-semibold ${fieldErrors.scheduledAt ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                    />
                  </FormField>
                )}
              </div>
            </div>

            {/* Right Column: Live Social Post Mockup Card */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16123F] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#75C9B7]" />
                  <span>Live {selectedPlatform} Post Preview</span>
                </span>
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadAsset()}
                    className="p-1 rounded-md bg-[#F0F6F2] text-[#16123F] hover:bg-[#C7DDCC] text-[11px] font-bold flex items-center gap-1"
                    title="Download attached media"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Media</span>
                  </button>
                )}
              </div>

              {/* Realistic Mockup Shell */}
              <div className="rounded-2xl border border-[#C7DDCC] bg-white overflow-hidden shadow-md">
                {/* Header */}
                <div className="p-3 border-b border-[#C7DDCC] flex items-center justify-between bg-[#F0F6F2]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#16123F] text-[#FFE26A] flex items-center justify-center font-bold text-xs">
                      {selectedBusiness?.name ? selectedBusiness.name.slice(0, 2).toUpperCase() : 'DS'}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#16123F] block leading-tight">
                        {selectedBusiness?.name || 'Your Brand Store'}
                      </span>
                      <span className="text-[10px] text-[#16123F]/60 flex items-center gap-1">
                        {platformIcons[selectedPlatform]}
                        <span>@{selectedBusiness?.name?.toLowerCase().replace(/\s+/g, '') || 'brand'}</span>
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#16123F] text-[#FFE26A] text-[9px] font-black uppercase">
                    {postMode === 'PUBLISH_NOW' ? 'Instant' : postMode === 'SCHEDULED' ? 'Scheduled' : 'Draft'}
                  </span>
                </div>

                {/* Media Container */}
                <div className="relative bg-[#16123F]/5 flex items-center justify-center min-h-[220px] max-h-[300px] overflow-hidden">
                  {mediaUrl ? (
                    mediaType === 'video' ? (
                      <div className="relative w-full h-[260px] bg-[#16123F] flex items-center justify-center text-white">
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover opacity-80"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-[#FFE26A] text-[#16123F] flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-white">
                          Reel 9:16
                        </span>
                      </div>
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="w-full h-[240px] object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )
                  ) : (
                    <div className="p-8 text-center space-y-2 text-[#16123F]/40">
                      <ImageIcon className="w-10 h-10 mx-auto" />
                      <p className="text-xs font-bold">No visual creative media attached</p>
                      <p className="text-[10px]">Select a product or use AI Auto-Draft above</p>
                    </div>
                  )}
                </div>

                {/* Caption Body */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-[#16123F]">
                    <span className="font-bold">❤️ 1.4k</span>
                    <span className="font-bold">💬 86</span>
                    <span className="font-bold">✈️ 240</span>
                  </div>

                  <p className="text-xs text-[#16123F] whitespace-pre-line line-clamp-4 leading-relaxed font-normal">
                    <span className="font-bold mr-1.5">{selectedBusiness?.name?.toLowerCase().replace(/\s+/g, '') || 'brand'}</span>
                    {content || 'Your promotional creative caption will appear here with hashtags...'}
                  </p>

                  {postMode === 'SCHEDULED' && scheduledAt && (
                    <div className="pt-2 border-t border-[#C7DDCC] flex items-center gap-1.5 text-[11px] font-bold text-[#16123F]">
                      <Clock className="w-3.5 h-3.5 text-[#16123F]" />
                      <span>Posting on: {new Date(scheduledAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                if (searchParams.get('productId') || searchParams.get('campaignId')) {
                  setSearchParams({});
                }
              }}
              className="btn-secondary !px-4 !py-2 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary !px-5 !py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {postMode === 'PUBLISH_NOW' ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Immediately</span>
                </>
              ) : postMode === 'SCHEDULED' ? (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Post</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Save Draft</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Content Post"
        message="Are you sure you want to remove this post? Any scheduled platform syndication will be cancelled."
        confirmText="Delete Post"
        isDestructive={true}
      />
    </div>
  );
};
