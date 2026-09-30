import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { User as UserIcon, LogOut, Mail, Shield, CheckCircle2 } from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = () => {
    setIsOpen(false);
    dispatch(logout());
    dispatch(addToast({ type: 'info', message: 'Signed out successfully' }));
    navigate('/login');
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'DROPSHIPPER':
        return 'Admin / Dropshipper';
      case 'DEALER':
        return 'Dealer Partner';
      case 'MARKETING':
        return 'Digital Marketer';
      case 'SALES':
        return 'Sales Representative';
      default:
        return user?.role || 'Member';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={user?.name || 'User Profile'}
        className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#75C9B7]/50 transition-all cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden bg-gradient-to-tr from-[#75C9B7] to-[#ABD699] text-[#16123F] font-bold text-sm select-none">
          {user?.name ? (
            user.name.charAt(0).toUpperCase()
          ) : (
            <UserIcon className="w-5 h-5 text-[#16123F]" />
          )}
        </div>
      </button>

      {/* Dropdown Menu - Clean Profile Details */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-xl border border-[#C7DDCC] p-4 z-50 animate-fade-in space-y-3.5">
          {/* User Header Summary */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#16123F] text-[#75C9B7] flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#16123F] truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-xs text-[#16123F]/60 truncate font-mono">
                {user?.email || 'admin@dropshiphub.com'}
              </p>
            </div>
          </div>

          {/* User Profile Information Card */}
          <div className="space-y-2 py-2.5 px-3 bg-[#F4F5FA] rounded-xl border border-[#C7DDCC]/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#16123F]/60 font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#75C9B7]" />
                Role
              </span>
              <span className="font-bold text-[#16123F]">{getRoleLabel()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#16123F]/60 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#75C9B7]" />
                Email
              </span>
              <span className="font-medium text-[#16123F] truncate max-w-[150px] font-mono text-[11px]">
                {user?.email || 'admin@dropship.com'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#16123F]/60 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Status
              </span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active & Verified
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
