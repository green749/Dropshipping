import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectBusiness, fetchBusinesses } from '../../store/slices/businessSlice';
import { addToast } from '../../store/slices/uiSlice';
import type { Business } from '../../types';
import { Layers, Plus, Check } from 'lucide-react';

export const BusinessSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { businesses, selectedBusiness } = useAppSelector((state) => state.business);
  const { user } = useAppSelector((state) => state.auth);

  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load user assigned businesses whenever authenticated user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchBusinesses());
    }
  }, [dispatch, user?.id]);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsHovered(false);
    }, 250);
    setHoverTimeout(timeout);
  };

  const handleSelect = (business: Business | null, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectBusiness(business));
    setIsHovered(false);

    if (business) {
      dispatch(
        addToast({
          type: 'info',
          message: `Switched active storefront to: ${business.name}`,
        })
      );
    } else {
      dispatch(
        addToast({
          type: 'info',
          message: 'Viewing consolidated multi-storefront overview',
        })
      );
    }
  };

  // Build the list of alternate options (All Storefronts + all businesses)
  const isMasterAdmin = user?.role === 'DROPSHIPPER';

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-end"
    >
      {/* ─── Expanding Horizontal Dock to the Left ─── */}
      <div
        className={`flex items-center gap-2 transition-all duration-300 ease-out ${
          isHovered
            ? 'opacity-100 translate-x-0 pointer-events-auto pr-2'
            : 'opacity-0 translate-x-4 pointer-events-none w-0 overflow-hidden'
        }`}
      >
        {/* Quick Action: Add Business (Admin only) */}
        {isMasterAdmin && (
          <div className="relative group/item shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsHovered(false);
                navigate('/admin/businesses?create=true');
              }}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#75C9B7]/20 border border-dashed border-[#75C9B7] text-[#16123F] flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="Add New Business"
            >
              <Plus className="w-4 h-4 text-[#16123F]" />
            </button>

            {/* Tooltip */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#16123F] text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none shadow-lg z-50">
              + Add Business
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#16123F]" />
            </div>
          </div>
        )}

        {/* Option: All Storefronts (Admin only) */}
        {isMasterAdmin && (
          <div className="relative group/item shrink-0">
            <button
              type="button"
              onClick={(e) => handleSelect(null, e)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95 cursor-pointer ${
                selectedBusiness === null
                  ? 'bg-gradient-to-tr from-[#75C9B7] to-[#16123F] text-white ring-2 ring-[#75C9B7] ring-offset-2 scale-105'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
              }`}
              aria-label="All Storefronts"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Tooltip */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#16123F] text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none shadow-lg z-50">
              All Storefronts
              {selectedBusiness === null && ' (Active)'}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#16123F]" />
            </div>
          </div>
        )}

        {/* Individual Business Storefront Circles */}
        {businesses.map((b, idx) => {
          const isSelected = selectedBusiness?.id === b.id;

          return (
            <div
              key={b.id}
              className="relative group/item shrink-0"
              style={{
                transitionDelay: isHovered ? `${idx * 30}ms` : '0ms',
              }}
            >
              <button
                type="button"
                onClick={(e) => handleSelect(b, e)}
                className={`relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#75C9B7] ring-offset-2 scale-105 bg-white'
                    : 'border border-slate-200 bg-white hover:border-[#75C9B7]'
                }`}
                aria-label={`Select ${b.name}`}
              >
                {b.logo ? (
                  <img
                    src={b.logo}
                    alt={b.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#75C9B7] to-[#16123F] flex items-center justify-center text-white font-bold text-xs uppercase">
                    {b.name.charAt(0)}
                  </div>
                )}

                {/* Active check icon badge */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#16123F]/30 backdrop-blur-[1px] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#16123F] text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none shadow-lg z-50">
                {b.name}
                {isSelected && ' (Active)'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#16123F]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Anchor / Primary Business Avatar Button ─── */}
      <div className="relative group/anchor shrink-0">
        <button
          type="button"
          onClick={() => setIsHovered((prev) => !prev)}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer select-none ${
            isHovered
              ? 'ring-2 ring-[#75C9B7] ring-offset-2 scale-105 bg-white'
              : 'border border-[#C7DDCC] bg-white hover:border-[#75C9B7]'
          }`}
          aria-label="Active Storefront Profile"
        >
          {/* Logo Content */}
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#F0F6F2]">
            {selectedBusiness?.logo ? (
              <img
                src={selectedBusiness.logo}
                alt={selectedBusiness.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : selectedBusiness ? (
              <div className="w-full h-full bg-gradient-to-tr from-[#75C9B7] to-[#16123F] flex items-center justify-center text-white font-bold text-xs uppercase">
                {selectedBusiness.name.charAt(0)}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#75C9B7] to-[#16123F] flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Glowing pulse indicator dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#75C9B7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#75C9B7] border-2 border-white"></span>
          </span>
        </button>

        {/* Anchor Tooltip (shown when not hovered/expanded) */}
        {!isHovered && (
          <div className="absolute -bottom-8 right-0 px-2 py-0.5 rounded-md bg-[#16123F] text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/anchor:opacity-100 transition-opacity duration-150 pointer-events-none shadow-md z-50">
            {selectedBusiness ? selectedBusiness.name : 'All Storefronts'}
          </div>
        )}
      </div>
    </div>
  );
};
