import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchCampaigns, createPost } from '../../store/slices/marketingSlice';
import { fetchDealers } from '../../store/slices/dealerSlice';
import { addToast } from '../../store/slices/uiSlice';
import { marketingApi } from '../../api/marketingApi';
import type { Product } from '../../types';
import {
  Sparkles, Bot, Video, Image as ImageIcon,
  Send, RefreshCw, LayoutTemplate, MessageSquare, History, Play,
  Search, ChevronDown, Save, Check, Fullscreen, Copy, Download,
  Wand2, Maximize, UserPlus, Lightbulb, Diamond, Eraser, Package, Clock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  mediaUrl?: string;
  type?: 'image' | 'video';
  status?: 'generating' | 'done';
}

interface CreativeVersion {
  id: string;
  prompt: string;
  mediaUrl: string;
  type: 'image' | 'video';
  timestamp: string;
}

export const AiCreativeStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, isLoading: loadingProducts } = useAppSelector((state) => state.product);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { campaigns } = useAppSelector((state) => state.marketing);
  const { selectedBusiness } = useAppSelector((state) => state.business);

  // Core State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [generationType, setGenerationType] = useState<'image' | 'video'>('image');
  const [aiModel, setAiModel] = useState<string>('gemini-3.1-flash-image');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1 (Square)');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Version History State
  const [versions, setVersions] = useState<CreativeVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCampaigns());
    dispatch(fetchDealers());
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

  const businessProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!selectedBusiness) return list;
    return list.filter(
      (p) =>
        p.business_id === selectedBusiness.id ||
        (p.dealer_id && assignedDealerIds.has(p.dealer_id))
    );
  }, [products, selectedBusiness, assignedDealerIds]);

  const activeProduct = businessProducts.find(p => p.id === selectedProductId);
  const currentVersion = versions.find(v => v.id === currentVersionId);

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      const activeCamp = selectedBusiness
        ? campaigns.find(c => c.business_id === selectedBusiness.id)
        : campaigns[0];
      if (activeCamp) setSelectedCampaignId(activeCamp.id);
    }
  }, [campaigns, selectedBusiness, selectedCampaignId]);

  useEffect(() => {
    if (businessProducts.length > 0) {
      if (!selectedProductId || !businessProducts.some(p => p.id === selectedProductId)) {
        setSelectedProductId(businessProducts[0].id);
      }
    } else {
      setSelectedProductId('');
    }
  }, [businessProducts, selectedProductId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  useEffect(() => {
    if (selectedProductId && activeProduct) {
      setMessages([{
        id: Date.now().toString(),
        role: 'ai',
        content: `I've loaded ${activeProduct.name}.\nWhat style or creative atmosphere would you like to generate?`
      }]);
    }
  }, [selectedProductId, activeProduct?.name]);

  const handleSendMessage = async (customMsg?: string) => {
    const msgToSend = customMsg || inputMessage;
    if (!msgToSend.trim() || !selectedProductId) return;

    if (!customMsg) setInputMessage('');

    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, content: msgToSend }];
    setMessages(newMessages);
    setIsGenerating(true);

    const loadingId = Date.now().toString() + '-loading';
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'ai',
      content: 'Generating your creative...\n✓ Analyzing product\n✓ Applying your instructions\n◯ Generating visual assets\n◯ Finalizing creative',
      status: 'generating'
    }]);

    try {
      const previousMediaUrl = currentVersion?.mediaUrl || null;
      let response;

      if (generationType === 'image') {
        response = await marketingApi.generateAiImage({
          productId: selectedProductId,
          productName: activeProduct?.name || 'Product',
          productImage: activeProduct?.images?.[0] || activeProduct?.image_url,
          prompt: msgToSend,
          previousImageUrl: previousMediaUrl,
          aiModel
        });
      } else {
        response = await marketingApi.generateAiVideo({
          productId: selectedProductId,
          productName: activeProduct?.name || 'Product',
          productImage: activeProduct?.images?.[0] || activeProduct?.image_url,
          prompt: msgToSend,
          previousVideoUrl: previousMediaUrl,
          aiModel
        });
      }

      if (response && (response.success || response.data)) {
        const genData = response.data || response;
        const generatedUrl = genData.mediaUrl || genData.imageUrl || genData.videoUrl || genData.generated_media_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
        
        const newVersionId = Date.now().toString();
        const newVersion: CreativeVersion = {
          id: newVersionId,
          prompt: msgToSend,
          mediaUrl: generatedUrl,
          type: generationType,
          timestamp: new Date().toISOString()
        };

        setVersions(prev => [...prev, newVersion]);
        setCurrentVersionId(newVersionId);

        setMessages(prev => prev.filter(m => m.id !== loadingId).concat({
          id: Date.now().toString(),
          role: 'ai',
          content: 'Here is your newly generated creative! What would you like to refine next?',
          status: 'done'
        }));
      } else {
        throw new Error(response?.message || 'Failed to generate');
      }

    } catch (error: any) {
      setMessages(prev => prev.filter(m => m.id !== loadingId).concat({
        id: Date.now().toString(),
        role: 'ai',
        content: `Error: ${error.message || 'Generation failed. Please try again.'}`,
        status: 'done'
      }));
      dispatch(addToast({ type: 'error', message: error.message || 'Failed to generate creative' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCreative = async (actionType: 'DRAFT' | 'APPROVED') => {
    if (!currentVersion && !activeProduct) {
      dispatch(addToast({ type: 'warning', message: 'Please generate or select a creative first' }));
      return;
    }

    const mediaToSave = currentVersion?.mediaUrl || activeProduct?.images?.[0] || activeProduct?.image_url || '';
    const postCaption = currentVersion?.prompt
      ? `${activeProduct?.name || 'Featured Product'} - ${currentVersion.prompt}. Discover our latest drop now! #Trending #Style #ShopNow`
      : `Check out our ${activeProduct?.name || 'exclusive item'}! Available now in our catalog. #MustHave #Dropship`;

    setIsSaving(true);
    try {
      const targetCampId = selectedCampaignId || campaigns[0]?.id || undefined;
      const targetStatus: 'DRAFT' | 'SCHEDULED' = actionType === 'APPROVED' ? 'SCHEDULED' : 'DRAFT';
      const res = await dispatch(
        createPost({
          campaign_id: targetCampId,
          content: postCaption,
          media_url: mediaToSave,
          status: targetStatus,
        })
      );

      if (createPost.fulfilled.match(res)) {
        dispatch(
          addToast({
            type: 'success',
            message: actionType === 'APPROVED'
              ? 'Creative approved and scheduled in Posts & Approval flow!'
              : 'Creative saved as draft in Posts flow!',
          })
        );
        if (actionType === 'APPROVED') {
          navigate('/marketing/posts');
        }
      } else {
        dispatch(addToast({ type: 'error', message: 'Failed to save creative to posts' }));
      }
    } catch {
      dispatch(addToast({ type: 'error', message: 'An error occurred while saving creative' }));
    } finally {
      setIsSaving(false);
    }
  };

  const platformIcons = [
    { name: 'Instagram', color: 'text-pink-600' },
    { name: 'Facebook', color: 'text-[#16123F]' },
    { name: 'TikTok', color: 'text-[#16123F]' },
    { name: 'X', color: 'text-[#16123F]' },
    { name: 'YouTube', color: 'text-red-600' },
  ];

  const quickActions = [
    { icon: <ImageIcon className="w-3.5 h-3.5" />, label: 'Change Background' },
    { icon: <UserPlus className="w-3.5 h-3.5" />, label: 'Add Model / Person' },
    { icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Studio Lighting' },
    { icon: <Diamond className="w-3.5 h-3.5" />, label: 'Luxury Premium' },
    { icon: <Eraser className="w-3.5 h-3.5" />, label: 'Clean Minimalist' },
  ];

  const handleDownloadMedia = () => {
    if (!currentVersion?.mediaUrl) return;
    const a = document.createElement('a');
    a.href = currentVersion.mediaUrl;
    a.download = `creative-${activeProduct?.name || 'asset'}-${Date.now()}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    dispatch(addToast({ type: 'success', message: 'Creative asset download initiated' }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-h-full overflow-hidden p-4 sm:p-6 gap-5 animate-fade-in">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#75C9B7] to-[#ABD699] flex items-center justify-center text-[#16123F] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#16123F] tracking-tight">AI Creative Studio</h1>
            <p className="text-xs text-[#555279] font-medium">Generate viral social creatives & video reels from catalog products</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Campaign Selector */}
          <div className="flex items-center gap-2 bg-white border border-[#C7DDCC] rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#555279] uppercase">Campaign:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              aria-label="Select Campaign"
              className="text-xs font-bold text-[#16123F] bg-transparent outline-none cursor-pointer"
            >
              {campaigns.length === 0 ? (
                <option value="">General Marketing</option>
              ) : (
                campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={() => handleSaveCreative('DRAFT')}
            disabled={isSaving || (!currentVersion && !activeProduct)}
            className="px-3.5 py-2 bg-white hover:bg-[#F0F6F2] border border-[#C7DDCC] rounded-xl text-xs font-bold text-[#16123F] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-[#16123F]/70" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSaveCreative('APPROVED')}
            disabled={isSaving || (!currentVersion && !activeProduct)}
            className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Approving...' : 'Approve Creative'}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Reference & Parameters */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Product Reference Card */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#C7DDCC] shadow-xs space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#16123F] flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-[#75C9B7]" />
              <span>Product Reference</span>
            </h2>

            <div>
              <label htmlFor="ai-studio-product-select" className="sr-only">Select Catalog Product</label>
              <select
                id="ai-studio-product-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-[#F0F6F2] border border-[#C7DDCC] rounded-xl px-3 py-2 text-xs font-semibold text-[#16123F] outline-none cursor-pointer"
              >
                {businessProducts.length === 0 ? (
                  <option value="">No products available for this business</option>
                ) : (
                  businessProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {activeProduct ? (
              <div className="space-y-3 pt-1">
                <div className="aspect-square rounded-xl overflow-hidden border border-[#C7DDCC] bg-[#F8FAF8] flex items-center justify-center relative shadow-inner">
                  {activeProduct.images?.[0] || activeProduct.image_url ? (
                    <img
                      src={activeProduct.images?.[0] || activeProduct.image_url}
                      alt={activeProduct.name}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Package className="w-8 h-8 text-[#16123F]/30 mx-auto mb-1" />
                      <span className="text-[11px] text-[#555279]">No preview image</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-[#16123F] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    REFERENCE
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#16123F] truncate">{activeProduct.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-extrabold text-[#16123F]">
                      ${Number(activeProduct.selling_price || activeProduct.price || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ABD699]/30 text-[#16123F] rounded-full border border-[#ABD699]">
                      {activeProduct.stock_quantity ?? 0} In Stock
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555279] mt-1 truncate">Category: {activeProduct.category || 'General'}</p>
                </div>
              </div>
            ) : (
              <div className="aspect-square rounded-xl border border-dashed border-[#C7DDCC] bg-[#F8FAF8] flex items-center justify-center p-4 text-center">
                <p className="text-xs text-[#555279] font-medium">Select a product from the list to begin generating creatives</p>
              </div>
            )}
          </div>

          {/* Generation Settings Card */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#C7DDCC] shadow-xs space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#16123F] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#75C9B7]" />
              <span>Studio Parameters</span>
            </h2>

            {/* Format Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#555279] uppercase">Asset Type</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0F6F2] rounded-xl border border-[#C7DDCC]">
                <button
                  type="button"
                  onClick={() => setGenerationType('image')}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    generationType === 'image'
                      ? 'bg-[#16123F] text-white shadow-xs'
                      : 'text-[#16123F]/70 hover:text-[#16123F]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationType('video')}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    generationType === 'video'
                      ? 'bg-[#16123F] text-white shadow-xs'
                      : 'text-[#16123F]/70 hover:text-[#16123F]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Reel</span>
                </button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label htmlFor="ai-studio-aspect-ratio" className="text-[11px] font-bold text-[#555279] uppercase">Aspect Ratio</label>
              <select
                id="ai-studio-aspect-ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-[#F0F6F2] border border-[#C7DDCC] rounded-xl px-3 py-2 text-xs font-semibold text-[#16123F] outline-none cursor-pointer"
              >
                <option value="1:1 (Square)">1:1 (Feed Square)</option>
                <option value="9:16 (Stories/Reels)">9:16 (Stories & Reels)</option>
                <option value="16:9 (Landscape)">16:9 (Banner Landscape)</option>
                <option value="4:5 (Portrait)">4:5 (Instagram Portrait)</option>
              </select>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Creative Canvas & Version History */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
          {/* Main Visual Canvas Area */}
          <div className="flex-1 bg-white rounded-[24px] border border-[#C7DDCC] shadow-xs flex flex-col overflow-hidden relative min-h-[300px]">
            
            {/* Canvas Header Tag */}
            <div className="p-3.5 border-b border-[#C7DDCC]/60 flex items-center justify-between bg-[#FAFCFA]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#16123F] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#75C9B7]" />
                  <span>Generated Creative Canvas</span>
                </span>
                {currentVersion && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ABD699]/30 text-[#16123F] rounded-full border border-[#ABD699]">
                    {currentVersion.type.toUpperCase()} READY
                  </span>
                )}
              </div>

              {currentVersion && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#555279]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Version {versions.findIndex((v) => v.id === currentVersion.id) + 1} of {versions.length}</span>
                </div>
              )}
            </div>

            {/* Display Screen */}
            <div className="flex-1 bg-[#16123F]/5 relative flex items-center justify-center p-4 overflow-hidden">
              {currentVersion ? (
                currentVersion.type === 'video' ? (
                  <video
                    src={currentVersion.mediaUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-full max-w-full rounded-2xl object-contain shadow-lg border border-[#C7DDCC]"
                  />
                ) : (
                  <img
                    src={currentVersion.mediaUrl}
                    alt="Generated Creative"
                    className="max-h-full max-w-full rounded-2xl object-contain shadow-lg border border-[#C7DDCC]"
                  />
                )
              ) : activeProduct?.images?.[0] || activeProduct?.image_url ? (
                <div className="text-center space-y-3">
                  <img
                    src={activeProduct.images?.[0] || activeProduct.image_url}
                    alt={activeProduct.name}
                    className="w-48 h-48 rounded-2xl object-contain mx-auto bg-white p-3 border border-[#C7DDCC] shadow-sm"
                  />
                  <p className="text-xs text-[#555279] font-semibold">
                    Product loaded. Use the AI Assistant on the right or click Quick Actions to generate custom scenes.
                  </p>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ImageIcon className="w-12 h-12 text-[#16123F]/20 mx-auto" />
                  <p className="text-xs text-[#555279] font-semibold">
                    Select a product and use the AI prompt assistant to generate your first creative asset.
                  </p>
                </div>
              )}
            </div>

            {/* Floating Action Controls */}
            {currentVersion && (
              <div className="p-3 bg-white border-t border-[#C7DDCC]/60 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadMedia}
                    className="px-3 py-1.5 bg-[#F0F6F2] hover:bg-[#C7DDCC]/40 border border-[#C7DDCC] text-xs font-bold text-[#16123F] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('Generate an alternative vibrant composition')}
                    className="px-3 py-1.5 bg-[#F0F6F2] hover:bg-[#C7DDCC]/40 border border-[#C7DDCC] text-xs font-bold text-[#16123F] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <button
                  onClick={() => handleSaveCreative('APPROVED')}
                  className="btn-primary !py-1.5 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve for Campaign</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Version History */}
          <div className="h-32 shrink-0 bg-white rounded-[24px] p-3.5 border border-[#C7DDCC] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#16123F] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#75C9B7]" />
                <span>Version History ({versions.length})</span>
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
              {versions.length === 0 ? (
                <p className="text-[11px] text-[#555279] italic">No iterations created in this session yet.</p>
              ) : (
                versions.map((v, idx) => {
                  const isCurrent = currentVersionId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setCurrentVersionId(v.id)}
                      className={`relative shrink-0 w-28 h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#FFE26A] shadow-md ring-2 ring-[#FFE26A]/30 scale-102'
                          : 'border-[#C7DDCC] hover:border-[#75C9B7]'
                      }`}
                    >
                      {v.type === 'video' ? (
                        <div className="w-full h-full bg-[#16123F] flex items-center justify-center text-white">
                          <Play className="w-5 h-5 opacity-80" />
                        </div>
                      ) : (
                        <img src={v.mediaUrl} alt={`Version ${idx + 1}`} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-1 left-1 bg-[#16123F]/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                        V{idx + 1}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Chat & Quick Prompt Actions */}
        <div className="w-full lg:w-[340px] shrink-0 bg-white rounded-[24px] border border-[#C7DDCC] shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#C7DDCC]/60 bg-[#FAFCFA]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#16123F] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#75C9B7]" />
              <span>AI Creative Assistant</span>
            </h2>
            <p className="text-[11px] text-[#555279] mt-0.5">Describe what scene, background or mood you need</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#F8FAF8]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="shrink-0 w-7 h-7 rounded-xl bg-[#75C9B7]/20 border border-[#75C9B7] flex items-center justify-center text-[#16123F]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-[#16123F] text-white rounded-tr-xs font-medium'
                      : 'bg-white border border-[#C7DDCC] text-[#16123F] rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions & Input Form */}
          <div className="p-3.5 border-t border-[#C7DDCC]/60 bg-white space-y-3">
            <div>
              <span className="text-[10px] font-bold text-[#555279] uppercase block mb-1.5">Quick Actions</span>
              <div className="flex flex-wrap gap-1.5">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(action.label)}
                    disabled={isGenerating || !selectedProductId}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#F0F6F2] hover:bg-[#FFE26A]/30 hover:border-[#FFE26A] text-[#16123F] text-[11px] font-semibold rounded-lg transition-colors border border-[#C7DDCC] disabled:opacity-50 cursor-pointer"
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Box */}
            <div className="relative flex items-center gap-1.5 bg-[#F0F6F2] rounded-xl border border-[#C7DDCC] p-1 focus-within:border-[#16123F] focus-within:ring-2 focus-within:ring-[#FFE26A]/40 transition-all">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="e.g. Place product on minimalist marble desk..."
                disabled={!selectedProductId || isGenerating}
                className="w-full bg-transparent px-2.5 py-1.5 text-xs text-[#16123F] placeholder-[#555279]/60 outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!selectedProductId || !inputMessage.trim() || isGenerating}
                className="btn-primary !p-2 !rounded-lg shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
                title="Send Prompt"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
