import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store';
import {
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../../../store/slices/marketingSlice';
import { fetchProducts } from '../../../store/slices/productSlice';
import { fetchDealers } from '../../../store/slices/dealerSlice';
import { addToast } from '../../../store/slices/uiSlice';
import { apiClient } from '../../../api/client';
import { DateRangePicker } from '../../../components/common/DateRangePicker';
import {
  Megaphone,
  Plus,
  Search,
  Package,
  Check,
  Calendar,
  DollarSign,
  ArrowLeft,
  Trash2,
  ArrowRight,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  Image as ImageIcon,
  Bell,
  Eye,
  X,
  Sparkles,
  AlertTriangle,
  Upload,
  RefreshCw,
  Maximize2,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Edit3,
  MessageSquare,
  Mail,
} from 'lucide-react';
import type { Campaign } from '../../../types';

// Safe inline SVG icons for social channels
const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export interface DailyCreative {
  dayNumber: number;
  date: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  title: string;
  channel: string;
  caption: string;
  scheduledTime: string;
  status: 'PUBLISHED' | 'SCHEDULED' | 'MISSING';
}

const OBJECTIVES = [
  'Brand Awareness',
  'Product Promotion',
  'Direct Sales',
  'Lead Generation',
  'Customer Retention',
];

const CHANNELS = [
  'Instagram',
  'Facebook',
  'TikTok',
  'WhatsApp Broadcast',
  'Google Ads',
  'Email Newsletter',
];

const CHANNEL_CONFIG: Record<string, { label: string; tag: string; bg: string; text: string; Icon: React.ElementType }> = {
  'Instagram': { label: 'Instagram', tag: 'Feed & Reels', bg: 'bg-pink-100 text-pink-600', text: 'text-pink-600', Icon: InstagramIcon },
  'Facebook': { label: 'Facebook', tag: 'Post & Story', bg: 'bg-blue-100 text-blue-600', text: 'text-blue-600', Icon: FacebookIcon },
  'TikTok': { label: 'TikTok', tag: 'Short Video', bg: 'bg-slate-200 text-slate-900', text: 'text-slate-900', Icon: Video },
  'WhatsApp Broadcast': { label: 'WhatsApp Broadcast', tag: 'Direct Chat', bg: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600', Icon: MessageSquare },
  'Google Ads': { label: 'Google Ads', tag: 'Search & Ads', bg: 'bg-amber-100 text-amber-700', text: 'text-amber-700', Icon: Search },
  'Email Newsletter': { label: 'Email Newsletter', tag: 'Subscribers', bg: 'bg-purple-100 text-purple-600', text: 'text-purple-600', Icon: Mail },
};

interface ChannelDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

const ChannelDropdown: React.FC<ChannelDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const active = CHANNEL_CONFIG[value] || CHANNEL_CONFIG['Instagram'];
  const ActiveIcon = active.Icon;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-white border ${
          isOpen ? 'border-[#75C9B7] ring-2 ring-[#75C9B7]/25 shadow-xs' : 'border-[#C7DDCC] hover:border-[#75C9B7]'
        } rounded-xl px-3 py-2 text-xs font-semibold text-[#16123F] flex items-center justify-between transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-5 h-5 rounded-lg ${active.bg} flex items-center justify-center shrink-0`}>
            <ActiveIcon className="w-3 h-3" />
          </div>
          <span className="truncate">{active.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#555279] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#16123F]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#C7DDCC] rounded-2xl shadow-xl p-1 z-40 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {Object.entries(CHANNEL_CONFIG).map(([key, item]) => {
            const isSelected = value === key;
            const ItemIcon = item.Icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isSelected ? 'bg-[#F0F6F2] font-bold text-[#16123F]' : 'text-[#555279] hover:bg-[#FAFAFA] hover:text-[#16123F]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-5 h-5 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    <ItemIcon className="w-3 h-3" />
                  </div>
                  <span className="truncate font-semibold">{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#75C9B7] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── CUSTOM HIGH-END STATUS DROPDOWN (REPLACES NATIVE SELECT) ───
const CreativeStatusDropdown: React.FC<{
  status: 'MISSING' | 'SCHEDULED' | 'PUBLISHED';
  onChange: (newStatus: 'MISSING' | 'SCHEDULED' | 'PUBLISHED') => void;
}> = ({ status, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const STATUS_CONFIG = {
    MISSING: {
      label: 'Missing',
      btnCls: 'bg-amber-100/90 hover:bg-amber-200/80 text-amber-950 border-amber-300 ring-1 ring-amber-300/40',
      dotCls: 'bg-amber-500',
    },
    SCHEDULED: {
      label: 'Scheduled',
      btnCls: 'bg-[#16123F] hover:bg-[#25205F] text-white border-[#16123F] shadow-xs',
      dotCls: 'bg-[#FFE26A]',
    },
    PUBLISHED: {
      label: 'Published',
      btnCls: 'bg-[#75C9B7]/25 hover:bg-[#75C9B7]/40 text-emerald-950 border-[#75C9B7] ring-1 ring-[#75C9B7]/40',
      dotCls: 'bg-[#75C9B7]',
    },
  };

  const current = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer shadow-xs ${current.btnCls}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dotCls}`} />
        <span>{current.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-40 min-w-[135px] bg-white rounded-2xl border border-[#C7DDCC] shadow-2xl p-1.5 space-y-1 animate-scale-up text-[#16123F]">
          {(['SCHEDULED', 'MISSING', 'PUBLISHED'] as const).map((key) => {
            const item = STATUS_CONFIG[key];
            const isSelected = status === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#F0F6F2] text-[#16123F] font-extrabold'
                    : 'text-[#555279] hover:bg-[#FAFAFA] hover:text-[#16123F]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.dotCls}`} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#75C9B7]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── HIGH-RES MEDIA THUMBNAIL BOX WITH PREVIEW, DRAG-DROP & ERROR FALLBACK ───
const CreativeMediaThumbnailBox: React.FC<{
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  title: string;
  channel: string;
  onUploadFile: (file: File) => void;
  onOpenCatalog: () => void;
  onOpenLightbox: () => void;
  onRemove: () => void;
}> = ({
  mediaUrl,
  mediaType,
  title,
  channel,
  onUploadFile,
  onOpenCatalog,
  onOpenLightbox,
  onRemove,
}) => {
  const [loadError, setLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset error state if URL is updated
  useEffect(() => {
    setLoadError(false);
  }, [mediaUrl]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          onUploadFile(e.dataTransfer.files[0]);
        }
      }}
      className="relative h-44 rounded-2xl bg-[#FAFAFA] border border-[#C7DDCC]/80 overflow-hidden group flex flex-col items-center justify-center transition-all"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onUploadFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {mediaUrl && !loadError ? (
        <>
          {mediaType === 'VIDEO' ? (
            <video
              src={mediaUrl}
              className="w-full h-full object-cover"
              onError={() => setLoadError(true)}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={title || 'Creative Preview'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setLoadError(true)}
            />
          )}

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onOpenLightbox}
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-[#16123F] text-xs font-bold cursor-pointer shadow-xs"
              title="View full preview"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-[#16123F] text-xs font-bold cursor-pointer shadow-xs"
              title="Upload from Device"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenCatalog}
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-[#16123F] text-xs font-bold cursor-pointer shadow-xs"
              title="Replace from Catalog"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              title="Remove Media"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : loadError && mediaUrl ? (
        // Clean Error & Fallback View when URL is an HTML webpage or unreachable
        <div className="text-center p-3 w-full space-y-1.5 bg-rose-50/80">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-rose-800 block">Unable to Load Image Preview</span>
            <p className="text-[10px] text-rose-600 max-w-[220px] mx-auto leading-tight">
              Please upload a media file directly from your device.
            </p>
          </div>
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-[#16123F] text-white text-xs font-bold cursor-pointer shadow-xs hover:bg-[#25205F] transition-colors"
            >
              Upload Local File
            </button>
          </div>
        </div>
      ) : (
        // Empty State with Drag & Drop / Upload
        <div className="text-center p-3 w-full">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-1.5 cursor-pointer transition-colors"
            title="Click to Upload Media"
          >
            <Upload className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-amber-900 block">No Creative Attached</span>
          <div className="flex items-center justify-center mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      )}

      {/* Channel & Format Tag Overlay */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 z-10 pointer-events-none">
        {mediaType === 'VIDEO' ? <Video className="w-3 h-3 text-[#FFE26A]" /> : <ImageIcon className="w-3 h-3 text-[#75C9B7]" />}
        <span>{channel}</span>
      </div>
    </div>
  );
};

export const CampaignStudioPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: routeCampaignId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const { campaigns, isLoading: isCampaignsLoading } = useAppSelector((state) => state.marketing);
  const { products } = useAppSelector((state) => state.product);
  const { dealers } = useAppSelector((state) => state.dealer);
  const { selectedBusiness } = useAppSelector((state) => state.business);
  const { user } = useAppSelector((state) => state.auth);

  // Active view: 'OVERVIEW' | 'CREATE' | 'INSPECT' | 'EDIT'
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CREATE' | 'INSPECT' | 'EDIT'>('OVERVIEW');
  const routerLocation = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected Campaign for Dedicated Daily Creatives Inspection View
  const [inspectingCampaign, setInspectingCampaign] = useState<Campaign | null>(null);
  const [modalCreatives, setModalCreatives] = useState<DailyCreative[]>([]);
  const [modalFilter, setModalFilter] = useState<'ALL' | 'MISSING' | 'READY' | 'IMAGE' | 'VIDEO'>('ALL');
  const [modalSearch, setModalSearch] = useState<string>('');
  const [isSavingCreatives, setIsSavingCreatives] = useState<boolean>(false);
  const [activeProductPickerDayIdx, setActiveProductPickerDayIdx] = useState<number | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'IMAGE' | 'VIDEO'; title: string } | null>(null);

  // Form State for Manual Campaign Creation
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('Brand Awareness');
  const [status, setStatus] = useState<'ACTIVE' | 'SCHEDULED' | 'DRAFT'>('ACTIVE');
  const [budget, setBudget] = useState('5000');
  
  // Date Range (From -> To Date)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]
  );
  
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['Instagram', 'Facebook']);
  const [location, setLocation] = useState('India (Pan-India)');
  const [ageRange, setAgeRange] = useState('18-35');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daily Creatives State for the Date Range in Builder
  const [dailyCreatives, setDailyCreatives] = useState<DailyCreative[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  const builderFileInputRef = useRef<HTMLInputElement>(null);

  const handleBuilderFileUpload = (file: File) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setDailyCreatives((prev) =>
          prev.map((c, idx) => {
            if (idx !== selectedDayIdx) return c;
            return {
              ...c,
              mediaUrl: dataUrl,
              mediaType: isVideo ? 'VIDEO' : 'IMAGE',
              status: 'SCHEDULED',
            };
          })
        );
        dispatch(addToast({ type: 'success', message: `Media uploaded successfully for Day ${dailyCreatives[selectedDayIdx]?.dayNumber || selectedDayIdx + 1}!` }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit Campaign Modal State
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editName, setEditName] = useState('');
  const [editObjective, setEditObjective] = useState('Brand Awareness');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SCHEDULED' | 'PAUSED' | 'COMPLETED'>('ACTIVE');
  const [editBudget, setEditBudget] = useState('5000');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editProductIds, setEditProductIds] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Campaign Confirmation Modal State
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false);

  const openEditModal = (c: Campaign) => {
    setEditingCampaign(c);
    setEditName(c.name || '');
    setEditObjective(c.objective || 'Brand Awareness');
    setEditStatus((c.status as any) || 'ACTIVE');
    setEditBudget(c.budget ? String(c.budget) : '5000');
    setEditStartDate(c.start_date ? new Date(c.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setEditEndDate(c.end_date ? new Date(c.end_date).toISOString().split('T')[0] : new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]);
    setEditDescription(c.description ? c.description.split('__CREATIVES_JSON__')[0].trim() : '');
    const prods = (c as any).target_audience?.product_ids || [];
    setEditProductIds(Array.isArray(prods) ? prods : []);
    setActiveTab('EDIT');

    const basePath = user?.role === 'MARKETING' ? '/marketing/campaigns' : '/admin/campaigns';
    navigate(`${basePath}/${c.id}/edit`);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign || !editName.trim()) return;

    if (editEndDate < editStartDate) {
      dispatch(addToast({ type: 'error', message: 'To Date must be on or after From Date.' }));
      return;
    }

    const [sy, sm, sd] = editStartDate.split('-').map(Number);
    const maxEnd = new Date(sy, sm - 1 + 12, sd);
    const maxEndStr = `${maxEnd.getFullYear()}-${String(maxEnd.getMonth() + 1).padStart(2, '0')}-${String(maxEnd.getDate()).padStart(2, '0')}`;
    if (editEndDate > maxEndStr) {
      dispatch(addToast({ type: 'error', message: 'Campaign duration cannot exceed 12 months from start date.' }));
      return;
    }

    setIsSavingEdit(true);
    try {
      const existingCreatives = getCampaignCreatives(editingCampaign);
      const updatedDescription = `${editDescription.trim()}\n\n__CREATIVES_JSON__\n${JSON.stringify(existingCreatives)}`;

      const payload: Partial<Campaign> = {
        name: editName.trim(),
        objective: editObjective,
        status: editStatus,
        budget: Number(editBudget) || 0,
        start_date: editStartDate,
        end_date: editEndDate,
        description: updatedDescription,
        target_audience: {
          ...editingCampaign.target_audience,
          product_ids: editProductIds,
        },
      };

      const res = await apiClient.patch(`/campaigns/${editingCampaign.id}`, payload);
      const updated = res.data?.data || { ...editingCampaign, ...payload };
      dispatch(updateCampaign({ id: editingCampaign.id, data: updated }));
      dispatch(addToast({ type: 'success', message: `Campaign "${editName}" updated successfully!` }));
      setEditingCampaign(null);
      setActiveTab('OVERVIEW');
      const basePath = user?.role === 'MARKETING' ? '/marketing/campaigns' : '/admin/campaigns';
      navigate(basePath);
      dispatch(fetchCampaigns());
    } catch (err: any) {
      console.error('Failed to update campaign:', err);
      dispatch(addToast({ type: 'error', message: err?.response?.data?.message || 'Failed to update campaign details.' }));
    } finally {
      setIsSavingEdit(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCampaigns());
    dispatch(fetchProducts());
    dispatch(fetchDealers());
  }, [dispatch]);

  // Filter products by selected storefront
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

  // Helper: Generate dates between From Date and To Date
  const dateRangeList = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return [startDate];
    }

    const current = new Date(start);
    while (current <= end && dates.length < 366) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate]);

  // Initialize / Sync daily creatives when date range changes in Creator
  useEffect(() => {
    setDailyCreatives((prev) => {
      return dateRangeList.map((dateStr, idx) => {
        const existing = prev.find((p) => p.date === dateStr);
        if (existing) {
          return { ...existing, dayNumber: idx + 1 };
        }

        const matchedProduct = businessProducts[idx % (businessProducts.length || 1)];

        return {
          dayNumber: idx + 1,
          date: dateStr,
          mediaType: idx % 2 === 0 ? 'IMAGE' : 'VIDEO',
          mediaUrl: matchedProduct?.image_url || '',
          title: matchedProduct ? `${matchedProduct.name} Spotlight` : `Day ${idx + 1} Creative`,
          channel: selectedChannels[idx % (selectedChannels.length || 1)] || 'Instagram',
          caption: matchedProduct
            ? `Discover the ${matchedProduct.name}. Exclusive pricing ₹${matchedProduct.selling_price || matchedProduct.price || 0}! Link in bio to order.`
            : `Exclusive daily drop. Order yours today!`,
          scheduledTime: idx % 2 === 0 ? '09:00 AM' : '06:00 PM',
          status: matchedProduct?.image_url ? 'SCHEDULED' : 'MISSING',
        };
      });
    });
    if (selectedDayIdx >= dateRangeList.length) {
      setSelectedDayIdx(0);
    }
  }, [dateRangeList, businessProducts]);

  // Check how many days in current builder are missing creatives
  const builderMissingCount = useMemo(() => {
    return dailyCreatives.filter((c) => !c.mediaUrl || c.status === 'MISSING').length;
  }, [dailyCreatives]);

  // Update a single day creative in builder
  const updateCreativeField = (field: keyof DailyCreative, value: any) => {
    setDailyCreatives((prev) =>
      prev.map((c, idx) => {
        if (idx !== selectedDayIdx) return c;
        const updated = { ...c, [field]: value };
        if (field === 'mediaUrl') {
          updated.status = value ? 'SCHEDULED' : 'MISSING';
        }
        return updated;
      })
    );
  };

  // Helper to parse daily creatives embedded in campaign description or metadata
  const getCampaignCreatives = (campaign: Campaign): DailyCreative[] => {
    try {
      if (campaign.description && campaign.description.includes('__CREATIVES_JSON__:')) {
        const rawJson = campaign.description.split('__CREATIVES_JSON__:')[1];
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    const start = new Date(campaign.start_date || campaign.createdAt || Date.now());
    const end = new Date(campaign.end_date || new Date(start.getTime() + 6 * 86400000));
    const dates: string[] = [];
    const cur = new Date(start);
    while (cur <= end && dates.length < 31) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    return dates.map((d, i) => {
      const prod = businessProducts[i % (businessProducts.length || 1)];
      return {
        dayNumber: i + 1,
        date: d,
        mediaType: i % 2 === 0 ? 'IMAGE' : 'VIDEO',
        mediaUrl: prod?.image_url || '',
        title: prod ? `${prod.name} Promo` : `Day ${i + 1} Asset`,
        channel: 'Instagram',
        caption: prod ? `Get special discount on ${prod.name} today!` : `Promotional asset for ${campaign.name}`,
        scheduledTime: '10:00 AM',
        status: prod?.image_url ? 'SCHEDULED' : 'MISSING',
      };
    });
  };

  // Open Full-Page Inspector
  const handleOpenInspector = (campaign: Campaign) => {
    const creatives = getCampaignCreatives(campaign);
    setInspectingCampaign(campaign);
    setModalCreatives(creatives);
    setModalFilter('ALL');
    setModalSearch('');
    setActiveProductPickerDayIdx(null);
    setActiveTab('INSPECT');
    
    // Update URL without full reload
    const basePath = user?.role === 'MARKETING' ? '/marketing/campaigns' : '/admin/campaigns';
    navigate(`${basePath}/${campaign.id}`, { replace: false });
  };

  // Return from Full-Page Views to Campaigns Overview
  const handleBackToOverview = () => {
    setInspectingCampaign(null);
    setEditingCampaign(null);
    setActiveTab('OVERVIEW');
    const basePath = user?.role === 'MARKETING' ? '/marketing/campaigns' : '/admin/campaigns';
    navigate(basePath, { replace: false });
  };

  // Watch URL params for deep link navigation (e.g. /admin/campaigns/:id or /admin/campaigns/:id/edit)
  useEffect(() => {
    const targetId = routeCampaignId || searchParams.get('inspect');
    const isEdit = routerLocation.pathname.endsWith('/edit') || searchParams.get('mode') === 'edit';

    if (targetId && campaigns.length > 0) {
      const found = campaigns.find((c) => c.id === targetId);
      if (found) {
        if (isEdit) {
          if (!editingCampaign || editingCampaign.id !== found.id) {
            setEditingCampaign(found);
            setEditName(found.name || '');
            setEditObjective(found.objective || 'Brand Awareness');
            setEditStatus((found.status as any) || 'ACTIVE');
            setEditBudget(found.budget ? String(found.budget) : '5000');
            setEditStartDate(found.start_date ? new Date(found.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setEditEndDate(found.end_date ? new Date(found.end_date).toISOString().split('T')[0] : new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]);
            setEditDescription(found.description ? found.description.split('__CREATIVES_JSON__')[0].trim() : '');
            const prods = (found as any).target_audience?.product_ids || [];
            setEditProductIds(Array.isArray(prods) ? prods : []);
            setActiveTab('EDIT');
          }
        } else {
          if (!inspectingCampaign || inspectingCampaign.id !== found.id) {
            const creatives = getCampaignCreatives(found);
            setInspectingCampaign(found);
            setModalCreatives(creatives);
            setActiveTab('INSPECT');
          }
        }
      }
    } else if (!targetId && (activeTab === 'INSPECT' || activeTab === 'EDIT')) {
      setActiveTab('OVERVIEW');
      setInspectingCampaign(null);
      setEditingCampaign(null);
    }
  }, [routeCampaignId, searchParams, campaigns, routerLocation.pathname]);

  // Modal Creatives filtering & statistics
  const modalStats = useMemo(() => {
    const total = modalCreatives.length;
    const missing = modalCreatives.filter((c) => !c.mediaUrl || c.status === 'MISSING').length;
    const published = modalCreatives.filter((c) => c.status === 'PUBLISHED').length;
    const scheduled = modalCreatives.filter((c) => c.status === 'SCHEDULED' && !!c.mediaUrl).length;
    const covered = total - missing;
    const compliancePercent = total > 0 ? Math.round((covered / total) * 100) : 100;
    return { total, missing, published, scheduled, covered, compliancePercent };
  }, [modalCreatives]);

  const filteredModalCreatives = useMemo(() => {
    return modalCreatives.filter((cr) => {
      const isMissing = !cr.mediaUrl || cr.status === 'MISSING';
      if (modalFilter === 'MISSING' && !isMissing) return false;
      if (modalFilter === 'READY' && isMissing) return false;
      if (modalFilter === 'IMAGE' && cr.mediaType !== 'IMAGE') return false;
      if (modalFilter === 'VIDEO' && cr.mediaType !== 'VIDEO') return false;

      if (modalSearch.trim()) {
        const query = modalSearch.toLowerCase();
        return (
          cr.date.toLowerCase().includes(query) ||
          cr.title.toLowerCase().includes(query) ||
          cr.caption.toLowerCase().includes(query) ||
          cr.channel.toLowerCase().includes(query) ||
          `day ${cr.dayNumber}`.includes(query)
        );
      }
      return true;
    });
  }, [modalCreatives, modalFilter, modalSearch]);

  // Update creative item inside Full Page Inspector
  const handleUpdateModalCreative = (index: number, patch: Partial<DailyCreative>) => {
    setModalCreatives((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], ...patch };
        if (patch.mediaUrl !== undefined) {
          next[index].status = patch.mediaUrl ? 'SCHEDULED' : 'MISSING';
        }
      }
      return next;
    });
  };

  // Upload local media file directly to Inspector Creative card
  const handleModalFileUpload = (index: number, file: File) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleUpdateModalCreative(index, {
          mediaUrl: dataUrl,
          mediaType: isVideo ? 'VIDEO' : 'IMAGE',
          status: 'SCHEDULED',
        });
        dispatch(
          addToast({
            type: 'success',
            message: `Media uploaded successfully for Day ${modalCreatives[index]?.dayNumber || index + 1}!`,
          })
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Auto-Fill Missing from Storefront Products
  const handleAutoFillMissingCreatives = () => {
    if (businessProducts.length === 0) {
      dispatch(addToast({ type: 'info', message: 'No catalog products available to auto-fill.' }));
      return;
    }

    setModalCreatives((prev) =>
      prev.map((cr, idx) => {
        if (!cr.mediaUrl || cr.status === 'MISSING') {
          const prod = businessProducts[idx % businessProducts.length];
          return {
            ...cr,
            mediaUrl: prod.image_url || cr.mediaUrl,
            title: `${prod.name} Spotlight`,
            caption: `Special offer on ${prod.name} at ₹${prod.selling_price || prod.price || 0}! Shop before stock runs out.`,
            status: prod.image_url ? 'SCHEDULED' : 'MISSING',
          };
        }
        return cr;
      })
    );

    dispatch(addToast({ type: 'success', message: 'Missing days auto-filled with catalog products!' }));
  };

  // Save updated creatives back to the Campaign backend
  const handleSaveModalCreatives = async () => {
    if (!inspectingCampaign) return;
    setIsSavingCreatives(true);
    try {
      const cleanDesc = (inspectingCampaign.description || '').split('__CREATIVES_JSON__:')[0].trim();
      const updatedDescription = `${cleanDesc}\n__CREATIVES_JSON__:${JSON.stringify(modalCreatives)}`;

      await dispatch(
        updateCampaign({
          id: inspectingCampaign.id,
          data: {
            description: updatedDescription,
          },
        })
      );

      setInspectingCampaign((prev) => (prev ? { ...prev, description: updatedDescription } : null));

      dispatch(
        addToast({
          type: 'success',
          message: 'Campaign daily schedule & creatives synced successfully!',
        })
      );
    } catch (e: any) {
      dispatch(addToast({ type: 'error', message: 'Failed to save changes' }));
    } finally {
      setIsSavingCreatives(false);
    }
  };

  // Filter campaigns overview
  const filteredCampaigns = useMemo(() => {
    const list = Array.isArray(campaigns) ? campaigns : [];
    return list.filter((c) => {
      if (selectedBusiness && c.business_id !== selectedBusiness.id) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(term) ||
          (c.objective && c.objective.toLowerCase().includes(term)) ||
          (c.description && c.description.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [campaigns, selectedBusiness, statusFilter, searchTerm]);

  // Metrics Summary
  const metrics = useMemo(() => {
    const total = filteredCampaigns.length;
    const active = filteredCampaigns.filter((c) => c.status === 'ACTIVE').length;
    const scheduled = filteredCampaigns.filter((c) => c.status === 'SCHEDULED').length;
    const totalBudget = filteredCampaigns.reduce(
      (sum, c) => sum + (parseFloat(String(c.budget || 0)) || 0),
      0
    );
    return { total, active, scheduled, totalBudget };
  }, [filteredCampaigns]);

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((x) => x !== ch) : [...prev, ch]
    );
  };

  // Dispatch Notification to Dropshipper if missing creatives detected
  const notifyDropshipperOfMissing = async (campaignName: string, missingDates: string[]) => {
    try {
      const message = `⚠️ Campaign Alert: Creatives were NOT published on ${missingDates.length} scheduled day(s) (${missingDates.join(', ')}) during campaign "${campaignName}". Please review assets with your marketing team.`;
      
      await apiClient.post('/notifications', {
        title: `Missing Creatives in "${campaignName}"`,
        message,
        type: 'WARNING',
      });

      dispatch(
        addToast({
          type: 'warning',
          message: `Dropshipper alert dispatched: ${missingDates.length} day(s) missed creative publishing!`,
        })
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'info',
          message: `Notice logged: Missing creative assets on ${missingDates.length} day(s).`,
        })
      );
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter a campaign name' }));
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (startDate < todayStr) {
      dispatch(addToast({ type: 'error', message: 'From Date cannot be in the past (must be today or later).' }));
      return;
    }

    if (endDate < startDate) {
      dispatch(addToast({ type: 'error', message: 'To Date must be on or after From Date.' }));
      return;
    }

    const maxEnd = new Date(startDate);
    maxEnd.setFullYear(maxEnd.getFullYear() + 1);
    const maxEndStr = maxEnd.toISOString().split('T')[0];
    if (endDate > maxEndStr) {
      dispatch(addToast({ type: 'error', message: 'Campaign duration cannot exceed 12 months from start date.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const missingDays = dailyCreatives.filter((c) => !c.mediaUrl || c.status === 'MISSING');
      
      const fullDescription = `${description.trim() || `Manual marketing campaign for ${objective}`}\n__CREATIVES_JSON__:${JSON.stringify(
        dailyCreatives
      )}`;

      const payload: Partial<Campaign> = {
        name: name.trim(),
        business_id: selectedBusiness?.id || 'default',
        objective,
        budget: parseFloat(budget) || 0,
        status,
        description: fullDescription,
        start_date: startDate,
        end_date: endDate,
      };

      await dispatch(createCampaign(payload));

      if (missingDays.length > 0) {
        await notifyDropshipperOfMissing(
          name.trim(),
          missingDays.map((d) => `Day ${d.dayNumber} (${d.date})`)
        );
      } else {
        dispatch(
          addToast({
            type: 'success',
            message: `Campaign "${name}" scheduled with all ${dailyCreatives.length} daily creatives covered!`,
          })
        );
      }

      setName('');
      setSelectedProductIds([]);
      setDescription('');
      setActiveTab('OVERVIEW');
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.message || 'Failed to create campaign',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (c: Campaign) => {
    const newStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    dispatch(updateCampaign({ id: c.id, data: { status: newStatus } }));
    dispatch(
      addToast({
        type: 'info',
        message: `Campaign "${c.name}" status updated to ${newStatus}`,
      })
    );
  };

  const handleDelete = (c: Campaign) => {
    setCampaignToDelete(c);
  };

  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    setIsDeletingCampaign(true);
    try {
      await dispatch(deleteCampaign(campaignToDelete.id));
      dispatch(
        addToast({
          type: 'success',
          message: `Campaign "${campaignToDelete.name}" deleted successfully.`,
        })
      );
      setCampaignToDelete(null);
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.message || 'Failed to delete campaign.',
        })
      );
    } finally {
      setIsDeletingCampaign(false);
    }
  };

  const currentDay = dailyCreatives[selectedDayIdx] || dailyCreatives[0];

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12 font-sans text-[#16123F]">
      {/* ═══════════════════════════════════════════════════════════════
          PAGE VIEW 1: DEDICATED FULL-PAGE EDIT CAMPAIGN STUDIO
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'EDIT' && editingCampaign ? (
        <form onSubmit={handleSaveEdit} className="space-y-6 animate-fade-in">
          {/* Top Breadcrumbs & Back Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleBackToOverview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0F6F2] border border-[#C7DDCC] font-bold text-[#16123F] transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#75C9B7]" />
                <span>Back to Campaigns</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#555279]" />
              <span className="text-[#555279] font-medium">{editingCampaign.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#555279]" />
              <span className="font-bold text-[#16123F]">Edit Campaign</span>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleBackToOverview}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#F0F6F2] border border-[#C7DDCC] text-xs font-bold text-[#16123F] cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit || !editName.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#FFE26A]" />
                    <span>Save Campaign Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Content: 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Core Campaign Settings (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#C7DDCC] shadow-xs space-y-5">
              <div className="border-b border-[#F0F6F2] pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#16123F] text-[#FFE26A] flex items-center justify-center font-black">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-extrabold text-[#16123F]">Campaign Details</h2>
                </div>
                <span className="text-[11px] font-bold text-[#75C9B7]">Settings & Schedule</span>
              </div>

              {/* Title & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[#16123F] block">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. 7-Day Festive Mega Sale"
                    className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl px-3 py-2 text-xs font-semibold text-[#16123F] focus:bg-white focus:ring-2 focus:ring-[#75C9B7]/40 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#16123F] block">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl px-3 py-2 text-xs font-semibold text-[#16123F] outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {/* Objective Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#16123F] block">Marketing Objective *</label>
                <div className="flex flex-wrap gap-1.5">
                  {OBJECTIVES.map((obj) => {
                    const isSelected = editObjective === obj;
                    return (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => setEditObjective(obj)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#16123F] text-white shadow-xs'
                            : 'bg-[#FAFAFA] text-[#555279] hover:bg-[#F0F6F2] hover:text-[#16123F] border border-[#C7DDCC]/70'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FFE26A]" />}
                        <span>{obj}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Date Range */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#16123F] block">Campaign Duration & Dates *</label>
                <DateRangePicker
                  startDate={editStartDate}
                  endDate={editEndDate}
                  onChange={(start, end) => {
                    setEditStartDate(start);
                    setEditEndDate(end);
                  }}
                  maxMonthsFromStart={12}
                />
              </div>

              {/* Total Budget */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#16123F] block">Total Campaign Budget (₹) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#75C9B7] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="100"
                    required
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-[#16123F] focus:bg-white focus:ring-2 focus:ring-[#75C9B7]/40 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  {['2000', '5000', '10000', '25000', '50000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEditBudget(amt)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        editBudget === amt
                          ? 'bg-[#16123F] text-white'
                          : 'bg-[#F0F6F2] text-[#555279] hover:text-[#16123F]'
                      }`}
                    >
                      ₹{Number(amt).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Strategy notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#16123F] block">Description & Strategy</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Campaign strategic notes, key hashtags, and promotional goals..."
                  className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl p-3 text-xs text-[#16123F] outline-none focus:bg-white focus:ring-2 focus:ring-[#75C9B7]/40"
                />
              </div>
            </div>

            {/* Right Column: Attached Storefront Products & Quick Creatives (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#C7DDCC] shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="border-b border-[#F0F6F2] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#75C9B7] text-[#16123F] flex items-center justify-center font-black">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-sm font-extrabold text-[#16123F]">Attached Products</h2>
                  </div>
                  <span className="text-[11px] font-bold text-[#75C9B7]">{editProductIds.length} Selected</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                  {businessProducts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#555279] bg-[#FAFAFA] rounded-2xl border border-[#C7DDCC]">
                      No catalog products available.
                    </div>
                  ) : (
                    businessProducts.map((p) => {
                      const isSelected = editProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setEditProductIds((prev) =>
                              prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FFE26A]/20 border-[#FFE26A] shadow-xs'
                              : 'bg-[#FAFAFA] border-[#C7DDCC]/60 hover:bg-[#F0F6F2] hover:border-[#75C9B7]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-[#C7DDCC]/50">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-[#555279]" />
                              )}
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold text-[#16123F] block truncate">{p.name}</span>
                              <span className="text-[10px] text-[#555279]">{p.category || 'Product'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-[#16123F]">₹{p.selling_price || p.price || 0}</span>
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                isSelected ? 'bg-[#16123F] text-[#FFE26A]' : 'border border-[#C7DDCC] bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Direct Daily Creatives Link Card */}
                <div className="p-4 rounded-2xl bg-[#F0F6F2] border border-[#C7DDCC] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#16123F]">Daily Creatives Studio</span>
                    <span className="text-[10px] font-bold text-[#75C9B7]">Calendar & Media</span>
                  </div>
                  <p className="text-[11px] text-[#555279]">
                    Want to inspect and customize daily image/video creatives for this campaign?
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenInspector(editingCampaign)}
                    className="w-full py-2 px-3 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FFE26A]" />
                    <span>Open Daily Creatives Studio</span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#F0F6F2] flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToOverview}
                  className="w-1/3 py-2.5 px-4 rounded-xl bg-[#FAFAFA] hover:bg-[#F0F6F2] text-[#16123F] text-xs font-bold border border-[#C7DDCC] transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editName.trim()}
                  className="w-2/3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#FFE26A]" />
                      <span>Save Campaign</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : activeTab === 'INSPECT' && inspectingCampaign ? (
        <div className="space-y-6 animate-fade-in">
          {/* Top Breadcrumbs & Back Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleBackToOverview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0F6F2] border border-[#C7DDCC] font-bold text-[#16123F] transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#75C9B7]" />
                <span>Back to Campaigns</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#555279]" />
              <span className="text-[#555279] font-medium">{inspectingCampaign.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#555279]" />
              <span className="font-bold text-[#16123F]">Daily Creatives & Timeline</span>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoFillMissingCreatives}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFE26A] hover:bg-[#ffd93d] text-[#16123F] text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#16123F]" />
                <span>Quick Auto-Fill with Products</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const missing = modalCreatives.filter((c) => !c.mediaUrl || c.status === 'MISSING');
                  if (missing.length > 0) {
                    notifyDropshipperOfMissing(
                      inspectingCampaign.name,
                      missing.map((d) => `Day ${d.dayNumber} (${d.date})`)
                    );
                  } else {
                    dispatch(
                      addToast({
                        type: 'success',
                        message: 'All daily creatives verified! 100% campaign compliance.',
                      })
                    );
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F6F2] text-[#16123F] text-xs font-bold border border-[#C7DDCC] transition-all cursor-pointer shadow-xs"
              >
                <Bell className="w-3.5 h-3.5 text-[#75C9B7]" />
                <span>Notify Dropshipper</span>
              </button>

              <button
                type="button"
                disabled={isSavingCreatives}
                onClick={handleSaveModalCreatives}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingCreatives ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#FFE26A]" />
                    <span>Save & Sync Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hero Banner: Premium Executive Campaign Summary */}
          <div className="bg-[#16123F] text-white p-6 rounded-3xl relative overflow-hidden shadow-md border border-[#16123F]">
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#75C9B7]/15 to-transparent pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#75C9B7] text-[#16123F] text-[10px] font-black uppercase tracking-wider">
                    {inspectingCampaign.status}
                  </span>
                  <span className="text-xs font-bold text-[#75C9B7] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                    {inspectingCampaign.objective}
                  </span>
                  <span className="text-xs text-white/70">
                    Total Budget: <strong className="text-white font-bold">₹{Number(inspectingCampaign.budget || 0).toLocaleString('en-IN')}</strong>
                  </span>
                </div>

                <h1 className="text-2xl font-black text-white tracking-tight">
                  {inspectingCampaign.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                  <span className="flex items-center gap-1 text-[#FFE26A]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {inspectingCampaign.start_date ? new Date(inspectingCampaign.start_date).toLocaleDateString() : 'Start'} →{' '}
                      {inspectingCampaign.end_date ? new Date(inspectingCampaign.end_date).toLocaleDateString() : 'End'}
                    </span>
                  </span>
                  <span>•</span>
                  <span>{modalStats.total} Scheduled Daily Posts</span>
                </div>
              </div>

              {/* Compliance Progress Bar & Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:w-auto">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center sm:text-left">
                  <span className="text-[10px] text-white/70 block uppercase font-bold">Compliance Rate</span>
                  <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                    <span className="text-lg font-black text-[#75C9B7]">{modalStats.compliancePercent}%</span>
                    <span className="text-[10px] text-white/60">({modalStats.covered}/{modalStats.total})</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center sm:text-left">
                  <span className="text-[10px] text-white/70 block uppercase font-bold">Published</span>
                  <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                    <span className="text-lg font-black text-white">{modalStats.published}</span>
                    <span className="text-[10px] text-emerald-300">Live</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center sm:text-left">
                  <span className="text-[10px] text-white/70 block uppercase font-bold">Scheduled</span>
                  <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                    <span className="text-lg font-black text-white">{modalStats.scheduled}</span>
                    <span className="text-[10px] text-sky-300">Ready</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center sm:text-left">
                  <span className="text-[10px] text-white/70 block uppercase font-bold">Missing Media</span>
                  <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                    <span className={`text-lg font-black ${modalStats.missing > 0 ? 'text-[#FFE26A]' : 'text-emerald-400'}`}>
                      {modalStats.missing}
                    </span>
                    <span className="text-[10px] text-white/60">
                      {modalStats.missing > 0 ? 'Action needed' : 'All clear'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#C7DDCC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              <button
                type="button"
                onClick={() => setModalFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  modalFilter === 'ALL'
                    ? 'bg-[#16123F] text-white shadow-xs'
                    : 'bg-[#FAFAFA] text-[#555279] hover:bg-[#F0F6F2] hover:text-[#16123F] border border-[#C7DDCC]/70'
                }`}
              >
                All Days ({modalStats.total})
              </button>
              <button
                type="button"
                onClick={() => setModalFilter('MISSING')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  modalFilter === 'MISSING'
                    ? 'bg-amber-500 text-[#16123F] shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Missing ({modalStats.missing})</span>
              </button>
              <button
                type="button"
                onClick={() => setModalFilter('READY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  modalFilter === 'READY'
                    ? 'bg-[#75C9B7] text-[#16123F] shadow-xs'
                    : 'bg-[#F0F6F2] text-[#16123F] hover:bg-[#C7DDCC]/40 border border-[#C7DDCC]/70'
                }`}
              >
                Covered ({modalStats.covered})
              </button>
              <button
                type="button"
                onClick={() => setModalFilter('IMAGE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  modalFilter === 'IMAGE'
                    ? 'bg-[#16123F] text-white shadow-xs'
                    : 'bg-[#FAFAFA] text-[#555279] hover:bg-[#F0F6F2] border border-[#C7DDCC]/70'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Images</span>
              </button>
              <button
                type="button"
                onClick={() => setModalFilter('VIDEO')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  modalFilter === 'VIDEO'
                    ? 'bg-[#16123F] text-white shadow-xs'
                    : 'bg-[#FAFAFA] text-[#555279] hover:bg-[#F0F6F2] border border-[#C7DDCC]/70'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Videos</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#555279] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Filter day, headline, caption..."
                className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#16123F] placeholder-[#555279]/60 focus:bg-white focus:ring-1 focus:ring-[#75C9B7] outline-none"
              />
            </div>
          </div>

          {/* Daily Creatives Grid: Full-Page Width & Natural Flow */}
          {filteredModalCreatives.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-[#C7DDCC] space-y-3">
              <AlertCircle className="w-10 h-10 text-[#555279] mx-auto" />
              <h3 className="text-sm font-extrabold text-[#16123F]">No daily creatives match active filter</h3>
              <p className="text-xs text-[#555279]">Try clearing search or switching filter tabs.</p>
              <button
                type="button"
                onClick={() => {
                  setModalFilter('ALL');
                  setModalSearch('');
                }}
                className="px-4 py-2 rounded-xl bg-[#16123F] text-white text-xs font-bold cursor-pointer"
              >
                View All Days
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredModalCreatives.map((cr) => {
                const realIndex = modalCreatives.findIndex((item) => item.date === cr.date);
                const isMissing = !cr.mediaUrl || cr.status === 'MISSING';

                return (
                  <div
                    key={cr.date}
                    className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                      isMissing
                        ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200/60'
                        : 'bg-white border-[#C7DDCC] hover:border-[#75C9B7]'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 pb-3 border-b border-[#F0F6F2] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-[#FFE26A] text-[#16123F] border border-[#FFE26A] text-xs font-black flex items-center justify-center shadow-xs">
                          {cr.dayNumber}
                        </span>
                        <div>
                          <span className="text-xs font-extrabold text-[#16123F] block">
                            Day {cr.dayNumber}
                          </span>
                          <span className="text-[10px] text-[#555279] block -mt-0.5">
                            {new Date(cr.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Status Switcher */}
                      <CreativeStatusDropdown
                        status={(cr.status as any) || 'MISSING'}
                        onChange={(newStatus) =>
                          handleUpdateModalCreative(realIndex, {
                            status: newStatus,
                          })
                        }
                      />
                    </div>

                    {/* Media Preview & Dropzone Box */}
                    <div className="p-4 space-y-3">
                      <CreativeMediaThumbnailBox
                        mediaUrl={cr.mediaUrl}
                        mediaType={cr.mediaType}
                        title={cr.title}
                        channel={cr.channel}
                        onUploadFile={(file) => handleModalFileUpload(realIndex, file)}
                        onOpenCatalog={() => setActiveProductPickerDayIdx(realIndex)}
                        onOpenLightbox={() =>
                          setLightboxMedia({
                            url: cr.mediaUrl,
                            type: cr.mediaType,
                            title: cr.title,
                          })
                        }
                        onRemove={() =>
                          handleUpdateModalCreative(realIndex, {
                            mediaUrl: '',
                            status: 'MISSING',
                          })
                        }
                      />
                    </div>

                    {/* Card Footer: Scheduled Time & Actions */}
                    <div className="p-3.5 bg-[#FAFAFA] border-t border-[#F0F6F2] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#555279]" />
                        <input
                          type="text"
                          value={cr.scheduledTime || '10:00 AM'}
                          onChange={(e) =>
                            handleUpdateModalCreative(realIndex, { scheduledTime: e.target.value })
                          }
                          className="w-20 bg-white border border-[#C7DDCC]/60 rounded-lg px-2 py-0.5 text-xs text-[#16123F] outline-none font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${cr.title}\n\n${cr.caption}`);
                            dispatch(addToast({ type: 'info', message: `Day ${cr.dayNumber} copy copied to clipboard!` }));
                          }}
                          className="p-1 text-[#555279] hover:text-[#16123F] cursor-pointer"
                          title="Copy caption"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateModalCreative(realIndex, {
                              mediaType: cr.mediaType === 'IMAGE' ? 'VIDEO' : 'IMAGE',
                            })
                          }
                          className="text-[10px] font-bold text-[#75C9B7] hover:underline cursor-pointer"
                        >
                          {cr.mediaType === 'IMAGE' ? 'Make Video' : 'Make Image'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Save Bar (Static Flow) */}
          <div className="mt-8 p-4 rounded-2xl bg-white border border-[#C7DDCC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#555279]">
              <Check className="w-4 h-4 text-[#75C9B7]" />
              <span>
                <strong>{modalStats.covered} / {modalStats.total}</strong> days scheduled. Save anytime to sync to the campaign database.
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleBackToOverview}
                className="px-4 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F0F6F2] border border-[#C7DDCC] text-xs font-bold text-[#16123F] cursor-pointer"
              >
                Done / Back
              </button>
              <button
                type="button"
                disabled={isSavingCreatives}
                onClick={handleSaveModalCreatives}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingCreatives ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#FFE26A]" />
                    <span>Save & Sync Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════
              PAGE VIEW 2: TOP HEADER & VIEW TOGGLE (OVERVIEW & CREATE)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <div>
              <h1 className="text-xl font-extrabold text-[#16123F] tracking-tight">Campaign Studio</h1>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#C7DDCC] shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-[#16123F] text-white shadow-xs'
                    : 'text-[#555279] hover:text-[#16123F]'
                }`}
              >
                Campaigns Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CREATE')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'CREATE'
                    ? 'bg-[#16123F] text-white shadow-xs'
                    : 'text-[#555279] hover:text-[#16123F]'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-[#75C9B7]" />
                <span>Create Campaign</span>
              </button>
            </div>
          </div>

          {/* ─── TAB: CAMPAIGNS OVERVIEW & LIST ─── */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-5">
              {/* Summary Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#C7DDCC] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#555279] block">Total Campaigns</span>
                    <span className="text-xl font-extrabold text-[#16123F]">{metrics.total}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#F0F6F2] flex items-center justify-center text-[#16123F]">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#C7DDCC] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#555279] block">Active Campaigns</span>
                    <span className="text-xl font-extrabold text-[#75C9B7]">{metrics.active}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#75C9B7]/20 flex items-center justify-center text-[#16123F]">
                    <CheckCircle2 className="w-5 h-5 text-[#75C9B7]" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#C7DDCC] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#555279] block">Scheduled</span>
                    <span className="text-xl font-extrabold text-amber-500">{metrics.scheduled}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFE26A]/30 flex items-center justify-center text-[#16123F]">
                    <Clock className="w-5 h-5 text-[#16123F]" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#C7DDCC] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#555279] block">Total Budget</span>
                    <span className="text-xl font-extrabold text-[#16123F]">
                      ₹{metrics.totalBudget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#C7DDCC]/30 flex items-center justify-center text-[#16123F]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white rounded-2xl p-4 border border-[#C7DDCC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['ALL', 'ACTIVE', 'SCHEDULED', 'PAUSED', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        statusFilter === st
                          ? 'bg-[#16123F] text-white shadow-xs'
                          : 'bg-[#FAFAFA] text-[#555279] hover:bg-[#F0F6F2] hover:text-[#16123F]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#555279] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#16123F] placeholder-[#555279]/60 focus:bg-white focus:ring-1 focus:ring-[#75C9B7] outline-none"
                  />
                </div>
              </div>

              {/* Campaigns Grid */}
              {filteredCampaigns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#C7DDCC] p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0F6F2] flex items-center justify-center mx-auto text-[#16123F]">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#16123F]">No Campaigns Found</h3>
                  <p className="text-xs text-[#555279] max-w-sm mx-auto">
                    {searchTerm
                      ? 'No campaigns match your search criteria.'
                      : 'You have not created any marketing campaigns yet. Click below to launch your first campaign.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('CREATE')}
                    className="px-4 py-2 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FFE26A]" />
                    <span>Create Campaign</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCampaigns.map((c) => {
                    const creatives = getCampaignCreatives(c);
                    const missingCount = creatives.filter((cr) => !cr.mediaUrl || cr.status === 'MISSING').length;
                    const totalDays = creatives.length;
                    const coveragePercent = totalDays > 0 ? Math.round(((totalDays - missingCount) / totalDays) * 100) : 100;

                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl p-5 border border-[#C7DDCC] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#75C9B7]/80 transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                c.status === 'ACTIVE'
                                  ? 'bg-[#75C9B7] text-[#16123F]'
                                  : c.status === 'SCHEDULED'
                                  ? 'bg-[#FFE26A] text-[#16123F]'
                                  : c.status === 'PAUSED'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-[#F0F6F2] text-[#16123F]'
                              }`}
                            >
                              {c.status}
                            </span>
                            <span className="text-[11px] font-bold text-[#75C9B7]">{c.objective}</span>
                          </div>

                          <div>
                            <h3 className="text-sm font-extrabold text-[#16123F] group-hover:text-[#75C9B7] transition-colors truncate">
                              {c.name}
                            </h3>
                            <p className="text-xs text-[#555279] line-clamp-2 mt-1">
                              {c.description ? c.description.split('__CREATIVES_JSON__')[0] : 'No description provided.'}
                            </p>
                          </div>

                          {/* Daily Creatives Compliance Card */}
                          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#C7DDCC]/60 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#555279] font-medium flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#75C9B7]" />
                                <span>Timeline</span>
                              </span>
                              <span className="font-bold text-[#16123F]">
                                {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'Today'} →{' '}
                                {c.end_date ? new Date(c.end_date).toLocaleDateString() : '7 Days'}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-[#555279]">Asset Coverage</span>
                                <span className={missingCount > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                                  {coveragePercent}% ({totalDays - missingCount}/{totalDays} Days)
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-[#E2ECE5] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    missingCount > 0 ? 'bg-amber-400' : 'bg-[#75C9B7]'
                                  }`}
                                  style={{ width: `${coveragePercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#F0F6F2] space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-[#FAFAFA] p-2 rounded-xl border border-[#C7DDCC]/40">
                              <span className="text-[10px] text-[#555279] block">Budget</span>
                              <span className="font-bold text-[#16123F]">₹{Number(c.budget || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="bg-[#FAFAFA] p-2 rounded-xl border border-[#C7DDCC]/40">
                              <span className="text-[10px] text-[#555279] block">Schedule</span>
                              <span className="font-bold text-[#75C9B7]">{creatives.length} Days Plan</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenInspector(c)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#FFE26A]" />
                              <span>Inspect Creatives</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(c)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F6F2] border border-[#C7DDCC] text-xs font-bold text-[#16123F] transition-all cursor-pointer shadow-xs"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#75C9B7]" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(c)}
                                className="text-xs font-bold text-[#555279] hover:text-[#16123F] cursor-pointer"
                              >
                                {c.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(c)}
                                className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: MANUAL CAMPAIGN BUILDER ─── */}
          {activeTab === 'CREATE' && (
            <form onSubmit={handleCreateCampaign} className="w-full space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Campaign Setup, Date Range & Catalog (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#C7DDCC] shadow-xs space-y-5">
                  <div className="border-b border-[#F0F6F2] pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-xl bg-[#16123F] text-[#FFE26A] text-xs font-black flex items-center justify-center">
                        1
                      </span>
                      <h3 className="text-sm font-extrabold text-[#16123F]">Campaign Setup</h3>
                    </div>
                    <span className="text-[11px] font-bold text-[#75C9B7]">Step 1 of 2</span>
                  </div>

                  {/* Campaign Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#16123F] flex items-center justify-between">
                      <span>Campaign Title *</span>
                      <span className="text-[10px] text-[#555279] font-normal">e.g. Flash Sale, Seasonal Drop</span>
                    </label>
                    <div className="relative">
                      <Megaphone className="w-4 h-4 text-[#75C9B7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. 7-Day Festive Flash Sale 2026"
                        className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-[#16123F] placeholder-[#555279]/50 focus:bg-white focus:ring-2 focus:ring-[#75C9B7]/40 focus:border-[#75C9B7] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Date Range: Custom Range Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#16123F] block">
                      Campaign Duration & Dates *
                    </label>
                    <DateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(newStart, newEnd) => {
                        setStartDate(newStart);
                        setEndDate(newEnd);
                      }}
                      maxMonthsFromStart={12}
                    />
                  </div>

                  {/* Objective Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#16123F] block">Marketing Objective *</label>
                    <div className="flex flex-wrap gap-1.5">
                      {OBJECTIVES.map((obj) => {
                        const isSelected = objective === obj;
                        return (
                          <button
                            key={obj}
                            type="button"
                            onClick={() => setObjective(obj)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#16123F] text-white shadow-xs scale-102 ring-1 ring-[#16123F]'
                                : 'bg-[#FAFAFA] text-[#555279] hover:bg-[#F0F6F2] hover:text-[#16123F] border border-[#C7DDCC]/70'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FFE26A]" />}
                            <span>{obj}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Products Multi-Select */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#16123F]">Target Storefront Products</label>
                      <span className="text-[11px] font-bold text-[#75C9B7]">
                        {selectedProductIds.length} Selected
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {businessProducts.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#C7DDCC] text-center text-xs text-[#555279]">
                          No catalog products found for this storefront.
                        </div>
                      ) : (
                        businessProducts.map((p) => {
                          const isSelected = selectedProductIds.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => toggleProduct(p.id)}
                              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-[#FFE26A]/20 border-[#FFE26A] shadow-xs'
                                  : 'bg-white border-[#C7DDCC]/60 hover:bg-[#F0F6F2] hover:border-[#75C9B7]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] overflow-hidden flex items-center justify-center shrink-0 border border-[#C7DDCC]/50">
                                  {p.image_url ? (
                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-4 h-4 text-[#555279]" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <span className="text-xs font-bold text-[#16123F] block truncate">{p.name}</span>
                                  <span className="text-[10px] text-[#555279]">{p.category || 'Product'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-bold text-[#16123F]">₹{p.selling_price || p.price || '0'}</span>
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-[#16123F] text-[#FFE26A]'
                                      : 'border border-[#C7DDCC] bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Total Budget with Quick Chips */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#16123F] block">Total Campaign Budget (₹) *</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-[#75C9B7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min="100"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full bg-[#FAFAFA] border border-[#C7DDCC] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-[#16123F] focus:bg-white focus:ring-2 focus:ring-[#75C9B7]/40 focus:border-[#75C9B7] outline-none transition-all"
                      />
                    </div>
                    {/* Budget Quick Presets */}
                    <div className="flex items-center gap-1.5">
                      {['2000', '5000', '10000', '25000', '50000'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setBudget(amt)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            budget === amt
                              ? 'bg-[#16123F] text-white'
                              : 'bg-[#F0F6F2] text-[#555279] hover:text-[#16123F]'
                          }`}
                        >
                          ₹{Number(amt).toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Daily Creatives Scheduler & Media Master (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#C7DDCC] shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="border-b border-[#F0F6F2] pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-xl bg-[#75C9B7] text-[#16123F] text-xs font-black flex items-center justify-center">
                          2
                        </span>
                        <div>
                          <h3 className="text-sm font-extrabold text-[#16123F]">Daily Creatives & Media</h3>
                        </div>
                      </div>

                      {builderMissingCount > 0 ? (
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-900 border border-amber-300 text-[10px] font-black inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{builderMissingCount} Day(s) Need Media</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#75C9B7]/20 text-[#16123F] border border-[#75C9B7] text-[10px] font-black inline-flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#75C9B7]" />
                          <span>All {dailyCreatives.length} Days Covered</span>
                        </span>
                      )}
                    </div>

                    {/* Horizontal Day Selector Carousel Strip */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#555279] block">
                        Select Day to Configure ({dateRangeList.length} Days)
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {dailyCreatives.map((c, idx) => {
                          const isSelected = selectedDayIdx === idx;
                          const hasMedia = !!c.mediaUrl;
                          return (
                            <button
                              key={c.date}
                              type="button"
                              onClick={() => setSelectedDayIdx(idx)}
                              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer text-left border ${
                                isSelected
                                  ? 'bg-[#FFE26A] text-[#16123F] border-[#FFE26A] shadow-md scale-102 ring-2 ring-[#FFE26A]/60 font-extrabold'
                                  : hasMedia
                                  ? 'bg-[#FFF9DB] text-[#16123F] border-[#FFE26A]/70 hover:bg-[#FFE26A]/40'
                                  : 'bg-[#FFFDF0] text-[#6B5300] border-[#FFE26A]/50 hover:bg-[#FFF9DB]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-[#16123F]">Day {c.dayNumber}</span>
                                {hasMedia ? (
                                  <span className="w-2 h-2 rounded-full bg-[#16123F]" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                                )}
                              </div>
                              <span className={`text-[10px] font-semibold block mt-0.5 ${isSelected ? 'text-[#16123F]/80' : 'text-[#555279]'}`}>
                                {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Day Creative Editor Panel */}
                    {currentDay && (
                      <div className="bg-[#FAFAFA] rounded-3xl p-5 border border-[#C7DDCC] space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#C7DDCC]/50">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-xl bg-[#FFE26A] text-[#16123F] border border-[#FFE26A] text-xs font-black flex items-center justify-center shadow-xs">
                              {currentDay.dayNumber}
                            </span>
                            <div>
                              <span className="text-xs font-extrabold text-[#16123F] block">
                                Day {currentDay.dayNumber} Creative
                              </span>
                              <span className="text-[10px] text-[#555279]">
                                {new Date(currentDay.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Media Type Switcher: Image vs Video */}
                          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#C7DDCC]">
                            <button
                              type="button"
                              onClick={() => updateCreativeField('mediaType', 'IMAGE')}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                currentDay.mediaType === 'IMAGE'
                                  ? 'bg-[#16123F] text-white shadow-xs'
                                  : 'text-[#555279] hover:text-[#16123F]'
                              }`}
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Image</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCreativeField('mediaType', 'VIDEO')}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                currentDay.mediaType === 'VIDEO'
                                  ? 'bg-[#16123F] text-white shadow-xs'
                                  : 'text-[#555279] hover:text-[#16123F]'
                              }`}
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Video</span>
                            </button>
                          </div>
                        </div>

                        {/* Media Preview & Input Dropzone */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          {/* Left Interactive Dropzone & Media Thumbnail */}
                          <div
                            onClick={() => builderFileInputRef.current?.click()}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleBuilderFileUpload(e.dataTransfer.files[0]);
                              }
                            }}
                            className={`sm:col-span-4 h-32 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center cursor-pointer group shadow-xs overflow-hidden ${
                              currentDay.mediaUrl
                                ? 'border-solid border-[#C7DDCC] bg-black'
                                : 'border-dashed border-[#FFE26A] bg-[#FFFDF0] hover:bg-[#FFF9DB] hover:border-[#FFE26A]'
                            }`}
                          >
                            <input
                              ref={builderFileInputRef}
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleBuilderFileUpload(e.target.files[0]);
                                  e.target.value = '';
                                }
                              }}
                            />

                            {currentDay.mediaUrl ? (
                              <>
                                {currentDay.mediaType === 'VIDEO' ? (
                                  <video src={currentDay.mediaUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <img
                                    src={currentDay.mediaUrl}
                                    alt={currentDay.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                )}
                                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold">
                                  {currentDay.channel}
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                                  <span className="text-[10px] font-bold text-white bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                                    Click to Replace
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCreativeField('mediaUrl', '');
                                      updateCreativeField('status', 'MISSING');
                                    }}
                                    className="text-[10px] font-bold text-red-200 hover:text-white flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-3 flex flex-col items-center">
                                <div className="w-9 h-9 rounded-2xl bg-[#FFE26A] flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                                  <Upload className="w-4 h-4 text-[#16123F]" />
                                </div>
                                <span className="text-xs font-black text-[#16123F] block">Upload Media</span>
                                <span className="text-[10px] text-[#555279] block mt-0.5 font-medium">Click or Drag & Drop</span>
                              </div>
                            )}
                          </div>

                          {/* Right Media Input & Quick Catalog Pick */}
                          <div className="sm:col-span-8 space-y-2">
                            <label className="text-[11px] font-bold text-[#16123F] block">
                              {currentDay.mediaType === 'VIDEO' ? 'Video Creative URL / Path *' : 'Image Creative URL / Path *'}
                            </label>
                            <input
                              type="text"
                              value={currentDay.mediaUrl}
                              onChange={(e) => updateCreativeField('mediaUrl', e.target.value)}
                              placeholder="Paste high-res image or video link..."
                              className="w-full bg-white border border-[#C7DDCC] rounded-xl px-3 py-2 text-xs text-[#16123F] placeholder-[#555279]/50 focus:ring-2 focus:ring-[#75C9B7]/40 focus:border-[#75C9B7] outline-none"
                            />

                            {/* Quick Product Fill Chip Selector */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 custom-scrollbar">
                              <span className="text-[10px] text-[#555279] font-bold shrink-0">Quick Fill:</span>
                              {businessProducts.slice(0, 4).map((prod) => (
                                <button
                                  key={prod.id}
                                  type="button"
                                  onClick={() => {
                                    setDailyCreatives((prev) =>
                                      prev.map((c, idx) => {
                                        if (idx !== selectedDayIdx) return c;
                                        return {
                                          ...c,
                                          mediaUrl: prod.image_url || c.mediaUrl,
                                          title: `${prod.name} Promo`,
                                          caption: `Get special deal on ${prod.name}! Starting at ₹${prod.selling_price || prod.price || 0}. Order now.`,
                                          status: prod.image_url ? 'SCHEDULED' : 'MISSING',
                                        };
                                      })
                                    );
                                    dispatch(addToast({ type: 'info', message: `Day ${currentDay.dayNumber} assigned to ${prod.name}` }));
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-[#75C9B7]/20 border border-[#C7DDCC] text-[10px] font-semibold text-[#16123F] transition-colors cursor-pointer shrink-0 truncate max-w-[120px]"
                                >
                                  {prod.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Channel & Scheduled Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-[#16123F] block mb-1">Target Sales Channel</label>
                            <ChannelDropdown
                              value={currentDay.channel}
                              onChange={(ch) => updateCreativeField('channel', ch)}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#16123F] block mb-1">Broadcast / Post Time</label>
                            <div className="relative">
                              <Clock className="w-3.5 h-3.5 text-[#75C9B7] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                value={currentDay.scheduledTime}
                                onChange={(e) => updateCreativeField('scheduledTime', e.target.value)}
                                placeholder="e.g. 09:00 AM"
                                className="w-full bg-white border border-[#C7DDCC] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-[#16123F] outline-none focus:ring-2 focus:ring-[#75C9B7]/40 focus:border-[#75C9B7] transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Caption / Ad Copy */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-[#16123F]">Post Headline & Ad Copy</label>
                            <span className="text-[10px] text-[#555279]">{currentDay.caption.length} chars</span>
                          </div>
                          <textarea
                            rows={2}
                            value={currentDay.caption}
                            onChange={(e) => updateCreativeField('caption', e.target.value)}
                            placeholder="Write high-converting headline, discount offer, and call to action..."
                            className="w-full bg-white border border-[#C7DDCC] rounded-xl p-3 text-xs text-[#16123F] placeholder-[#555279]/50 outline-none resize-none focus:ring-2 focus:ring-[#75C9B7]/40 focus:border-[#75C9B7]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="pt-4 border-t border-[#F0F6F2] flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('OVERVIEW')}
                      className="w-1/3 py-3 px-4 rounded-2xl bg-[#FAFAFA] hover:bg-[#F0F6F2] text-[#16123F] text-xs font-bold border border-[#C7DDCC] transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !name.trim()}
                      className="w-2/3 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#16123F] hover:bg-[#25205F] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50 group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Publishing Campaign...</span>
                        </>
                      ) : (
                        <>
                          <span>Launch Campaign ({dailyCreatives.length} Days)</span>
                          <ArrowRight className="w-4 h-4 text-[#FFE26A] group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* ─── MODAL OVERLAYS (PICK PRODUCT / LIGHTBOX ZOOM) ─── */}
      {/* Product Quick-Picker Overlay */}
      {/* ─── MODAL OVERLAYS (RENDERED AT ROOT DOCUMENT.BODY VIA PORTAL) ─── */}
      {/* 1. Pick Product Modal */}
      {activeProductPickerDayIdx !== null &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-fade-in">
            <div className="bg-white rounded-3xl border border-[#C7DDCC] p-5 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F6F2] pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#16123F]">
                    Select Product for Day {modalCreatives[activeProductPickerDayIdx]?.dayNumber}
                  </h3>
                  <p className="text-[11px] text-[#555279]">Click any catalog item to auto-populate image and copy</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProductPickerDayIdx(null)}
                  className="w-7 h-7 rounded-full bg-[#FAFAFA] hover:bg-[#F0F6F2] border border-[#C7DDCC] flex items-center justify-center text-[#555279] hover:text-[#16123F] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {businessProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#555279]">No catalog products available.</div>
                ) : (
                  businessProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        handleUpdateModalCreative(activeProductPickerDayIdx, {
                          mediaUrl: p.image_url || '',
                          title: `${p.name} Promo`,
                          caption: `Check out ${p.name}! High quality, exclusive deal for ₹${p.selling_price || p.price || 0}. Order now!`,
                          status: p.image_url ? 'SCHEDULED' : 'MISSING',
                        });
                        setActiveProductPickerDayIdx(null);
                        dispatch(
                          addToast({
                            type: 'success',
                            message: `Day ${modalCreatives[activeProductPickerDayIdx]?.dayNumber} populated with ${p.name}`,
                          })
                        );
                      }}
                      className="flex items-center justify-between p-2.5 rounded-2xl border border-[#C7DDCC]/70 hover:border-[#75C9B7] hover:bg-[#F0F6F2] cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#C7DDCC]/30 overflow-hidden flex items-center justify-center shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-[#16123F]" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#16123F] group-hover:text-[#75C9B7] transition-colors block">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-[#555279]">{p.category || 'General'}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#75C9B7]">₹{p.selling_price || p.price || 0}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 2. Lightbox Media Zoom */}
      {lightboxMedia &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fade-in"
            onClick={() => setLightboxMedia(null)}
          >
            <div className="relative max-w-3xl max-h-[85vh] bg-[#16123F] rounded-3xl overflow-hidden border border-white/20 p-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-3 text-white border-b border-white/10">
                <span className="text-xs font-bold">{lightboxMedia.title || 'Creative Preview'}</span>
                <button
                  type="button"
                  onClick={() => setLightboxMedia(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-hidden">
                <img src={lightboxMedia.url} alt="Preview" className="max-h-[65vh] w-auto object-contain rounded-2xl" />
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 3. Custom UI Confirmation Dialog (Full-Screen Root Backdrop) */}
      {campaignToDelete &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setCampaignToDelete(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#C7DDCC] shadow-2xl space-y-5 animate-scale-up text-[#16123F]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-[#16123F]">Delete Campaign</h3>
                  <p className="text-xs text-[#555279] leading-relaxed">
                    Are you sure you want to permanently delete{' '}
                    <strong className="text-[#16123F]">"{campaignToDelete.name}"</strong>? This will remove all scheduled creatives and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F0F6F2]">
                <button
                  type="button"
                  disabled={isDeletingCampaign}
                  onClick={() => setCampaignToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#C7DDCC] bg-[#FAFAFA] hover:bg-[#F0F6F2] text-xs font-bold text-[#16123F] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingCampaign}
                  onClick={confirmDeleteCampaign}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeletingCampaign ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Campaign</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>
  );
};
