import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Link as LinkIcon, Sparkles, X, Check, Image as ImageIcon, RefreshCw } from 'lucide-react';

export interface PresetImage {
  label: string;
  url: string;
}

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onError?: (error: string) => void;
  label?: string;
  optional?: boolean;
  presets?: PresetImage[];
  maxSizeMB?: number;
  className?: string;
  hideTabs?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = '',
  onChange,
  onError,
  label = 'Business Logo',
  optional = true,
  presets = [],
  maxSizeMB = 2,
  className = '',
  hideTabs = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please upload a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`Image size must be under ${maxSizeMB}MB.`);
      return;
    }

    // For SVG images, read text directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // For raster images (PNG, JPG, WebP), resize and optimize via HTML5 Canvas
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 600;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/webp', 0.88);
          onChange(compressedDataUrl);
        } else {
          onChange(reader.result as string);
        }
      };
      img.onerror = () => {
        onChange(reader.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [maxSizeMB, onChange, onError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyUrl = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header with Label and Source Mode Segment Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#16123F]">{label}</span>
          {!hideTabs && optional && (
            <span className="text-[10px] font-semibold text-[#16123F]/50 bg-[#F0F6F2] px-2 py-0.5 rounded-full border border-[#C7DDCC]/60">
              Optional
            </span>
          )}
        </div>

        {/* Mode Selector Pills */}
        {!hideTabs && (
          <div className="inline-flex items-center p-0.5 rounded-xl bg-[#F0F6F2] border border-[#C7DDCC]/70 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-[#16123F] shadow-xs'
                  : 'text-[#16123F]/60 hover:text-[#16123F]'
              }`}
            >
              <UploadCloud className="w-3 h-3 text-[#16123F]" />
              <span>Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white text-[#16123F] shadow-xs'
                  : 'text-[#16123F]/60 hover:text-[#16123F]'
              }`}
            >
              <LinkIcon className="w-3 h-3 text-[#16123F]" />
              <span>URL</span>
            </button>
            {presets.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-white text-[#16123F] shadow-xs'
                    : 'text-[#16123F]/60 hover:text-[#16123F]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#75C9B7]" />
                <span>Presets</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Upload / Preview Area */}
      {value ? (
        /* ─── State A: Image Attached / Preview State ─── */
        <div className="relative rounded-2xl bg-white border border-[#C7DDCC] p-3 shadow-xs flex items-center justify-between gap-3 group hover:border-[#75C9B7] transition-all">
          <div className="flex items-center gap-3 min-w-0">
            {/* Framed Image Avatar */}
            <div className="relative w-14 h-14 rounded-xl border border-[#C7DDCC] overflow-hidden bg-[#F0F6F2] shrink-0 shadow-xs flex items-center justify-center">
              <img
                src={value}
                alt="Selected Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#16123F] truncate">Brand Logo Attached</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ABD699]" />
              </div>
              <p className="text-[11px] text-[#16123F]/60 truncate mt-0.5">
                Ready for storefront publication
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl bg-[#F0F6F2] hover:bg-[#C7DDCC]/50 border border-[#C7DDCC] text-[#16123F] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Replace image"
            >
              <RefreshCw className="w-3 h-3 text-[#16123F]" />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-[#C7DDCC] text-rose-600 transition-all cursor-pointer shadow-xs"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : activeTab === 'upload' ? (
        /* ─── State B: Neat Drag & Dropzone Area ─── */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-5 text-center flex flex-col items-center justify-center gap-2 select-none ${
            isDragging
              ? 'border-[#75C9B7] bg-[#75C9B7]/10 scale-[1.01]'
              : 'border-[#C7DDCC] bg-[#F8FAF8] hover:bg-[#F0F6F2] hover:border-[#75C9B7]'
          }`}
        >
          {/* Cloud Icon with Pastel Glow */}
          <div className="w-10 h-10 rounded-full bg-white border border-[#C7DDCC] flex items-center justify-center text-[#16123F] shadow-xs group-hover:scale-105 transition-transform">
            <UploadCloud className="w-5 h-5 text-[#16123F]" />
          </div>

          <div>
            <p className="text-xs font-bold text-[#16123F]">
              Drag & drop logo here, or <span className="text-[#16123F] underline decoration-[#75C9B7] decoration-2">browse files</span>
            </p>
            <p className="text-[11px] text-[#16123F]/50 mt-0.5 font-medium">
              PNG, JPG, SVG or WebP • Max {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : activeTab === 'url' ? (
        /* ─── State C: Image URL Input ─── */
        <div className="rounded-2xl bg-[#F8FAF8] border border-[#C7DDCC] p-3 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-[#16123F]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
                placeholder="https://example.com/brand-logo.png"
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#C7DDCC] rounded-xl text-xs text-[#16123F] placeholder-[#16123F]/40 focus:outline-none focus:ring-2 focus:ring-[#75C9B7]/30"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyUrl}
              disabled={!urlInput.trim()}
              className="px-3 py-2 bg-[#16123F] text-white rounded-xl text-xs font-bold hover:bg-[#16123F]/90 disabled:opacity-50 transition-all cursor-pointer"
            >
              Attach
            </button>
          </div>
          <p className="text-[10px] text-[#16123F]/50 pl-1">
            Provide a direct public HTTPS link to your logo image.
          </p>
        </div>
      ) : (
        /* ─── State D: Presets Gallery ─── */
        <div className="rounded-2xl bg-[#F8FAF8] border border-[#C7DDCC] p-3 space-y-2">
          <p className="text-[11px] font-semibold text-[#16123F]/60">
            Choose from curated sample storefront logos:
          </p>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`group relative rounded-xl p-1 bg-white border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'border-[#75C9B7] ring-2 ring-[#75C9B7]/40 shadow-xs'
                      : 'border-[#C7DDCC] hover:border-[#75C9B7]'
                  }`}
                  title={preset.label}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#F0F6F2] flex items-center justify-center">
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[9px] font-semibold text-[#16123F] truncate w-full text-center">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#16123F] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
