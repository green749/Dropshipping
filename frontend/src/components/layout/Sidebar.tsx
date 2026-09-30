import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Megaphone,
  UserSquare2,
  LogOut,
  Zap,
  UserCheck,
  RotateCcw,
  Share2,
  Headphones,
  CircleDollarSign,
  Boxes,
  Sparkles,
} from 'lucide-react';

interface SidebarLink {
  to?: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
}

export const Sidebar: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);

  const role = user?.role || 'DROPSHIPPER';

  const roleTitle = useMemo(() => {
    if (role === 'DEALER') return 'Wholesale Dealer';
    if (role === 'MARKETING') return 'Digital Marketer';
    if (role === 'SALES') return 'Sales Team';
    return 'Dropshipper Admin';
  }, [role]);

  const links = useMemo<SidebarLink[]>(() => {
    // ─── SALES TEAM MODULE ───
    if (role === 'SALES') {
      return [
        { to: '/sales/customers', label: 'Customers', icon: UserSquare2 },
        { to: '/sales/orders', label: 'Orders', icon: ShoppingCart },
        { to: '/sales/returns', label: 'Returns', icon: RotateCcw },
        { to: '/sales/dealers', label: 'Dealers', icon: Users },
      ];
    }

    // ─── DEALER MODULE ───
    if (role === 'DEALER') {
      return [
        { to: '/dealer', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/dealer/products', label: 'Products', icon: Package },
        { to: '/dealer/inventory', label: 'Inventory & Stock', icon: Boxes },
        { to: '/dealer/orders', label: 'Orders', icon: ShoppingCart },
        { to: '/dealer/returns', label: 'Returns', icon: RotateCcw },
      ];
    }

    // ─── DIGITAL MARKETER MODULE ───
    if (role === 'MARKETING') {
      return [
        { to: '/marketing', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/marketing/products', label: 'Products', icon: Package },
        { to: '/marketing/campaigns', label: 'Campaign Studio', icon: Megaphone },
        { to: '/marketing/social', label: 'Social Accounts', icon: Share2 },
      ];
    }

    // ─── DROPSHIPPER ADMIN MODULE ───
    return [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/finances', label: 'Profits & Expenses', icon: CircleDollarSign },
      { to: '/admin/inventory', label: 'Inventory Intelligence', icon: Boxes },
      { to: '/admin/product-intelligence', label: 'Product Intelligence', icon: Sparkles },
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/customers', label: 'Customers', icon: UserSquare2 },
      { to: '/admin/returns', label: 'Returns', icon: RotateCcw },
      { to: '/admin/dealers', label: 'Dealers', icon: Users },
      { to: '/admin/sales-team', label: 'Sales Team', icon: Headphones },
      { to: '/admin/digital-marketers', label: 'Digital Marketers', icon: UserCheck },
      { to: '/admin/campaigns', label: 'Campaign Studio', icon: Megaphone },
    ];
  }, [role]);

  const isExpanded = isHovered || (typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen);

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'DROPSHIPPER':
        return 'Admin / Dropshipper';
      case 'DEALER':
        return 'Dealer Partner';
      case 'MARKETING':
        return 'Digital Marketer';
      case 'SALES':
        return 'Sales Team';
      default:
        return user?.role || 'Member';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
      
      {/* Smooth expanding pill sidebar */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group/sidebar fixed md:static inset-y-0 left-0 z-40 bg-[#16123F] flex flex-col shrink-0 h-full rounded-none md:rounded-[36px] shadow-2xl shadow-[#16123F]/30 select-none overflow-hidden transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width] ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${
          isHovered ? 'md:w-64' : 'md:w-16'
        }`}
      >
        <div className={`flex flex-col justify-between h-full py-5 px-3 overflow-y-auto custom-scrollbar ${isExpanded ? 'w-64' : 'w-16'} transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
          
          <div className="flex flex-col space-y-4 w-full">
            {/* Top Brand / Header */}
            <div 
              onClick={() => navigate(role === 'DEALER' ? '/dealer' : role === 'MARKETING' ? '/marketing' : role === 'SALES' ? '/sales/orders' : '/admin')}
              className={`flex items-center h-10 cursor-pointer ${isExpanded ? 'w-full' : 'w-10 mx-auto justify-center'}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#75C9B7] flex items-center justify-center shrink-0 shadow-md shadow-[#75C9B7]/30">
                <Zap className="w-5 h-5 text-[#16123F] fill-[#16123F]" />
              </div>

              <div 
                className={`flex flex-col justify-center whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isExpanded ? 'ml-3 opacity-100 max-w-[160px] translate-x-0' : 'ml-0 opacity-0 max-w-0 w-0 pointer-events-none'
                }`}
              >
                <span className="font-bold text-white text-small tracking-tight leading-tight">DropShipHub</span>
                <span className="text-caption text-[#75C9B7] font-semibold tracking-wider uppercase">{roleTitle}</span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="flex flex-col space-y-1.5 w-full">
              {links.map((link) => {
                const Icon = link.icon;

                if (link.onClick || !link.to) {
                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => {
                        link.onClick?.();
                        if (window.innerWidth < 768) dispatch(toggleSidebar());
                      }}
                      className={`group/link relative flex items-center h-10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
                        isExpanded ? 'w-full' : 'w-10 mx-auto justify-center'
                      }`}
                      title={link.label}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" strokeWidth={2.2} />
                      </div>
                      <span 
                        className={`text-small font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                          isExpanded ? 'ml-3 opacity-100 max-w-[150px] translate-x-0' : 'ml-0 opacity-0 max-w-0 w-0 pointer-events-none'
                        }`}
                      >
                        {link.label}
                      </span>
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/admin' || link.to === '/dealer' || link.to === '/marketing'}
                    onClick={() => {
                      if (window.innerWidth < 768) dispatch(toggleSidebar());
                    }}
                    className={({ isActive }) =>
                      `group/link relative flex items-center h-10 rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isExpanded ? 'w-full' : 'w-10 mx-auto justify-center'
                      } ${
                        isActive
                          ? 'bg-[#75C9B7] text-[#16123F] font-bold shadow-lg shadow-[#75C9B7]/30'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`
                    }
                    title={link.label}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    
                    <span 
                      className={`text-small font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isExpanded ? 'ml-3 opacity-100 max-w-[150px] translate-x-0' : 'ml-0 opacity-0 max-w-0 w-0 pointer-events-none'
                      }`}
                    >
                      {link.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Logout */}
          <div className="mt-auto pt-4 flex flex-col w-full border-t border-white/10">
            <button
              onClick={() => dispatch(logout())}
              className={`group/logout relative flex items-center h-10 rounded-full text-white/60 hover:text-rose-300 hover:bg-white/10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
                isExpanded ? 'w-full' : 'w-10 mx-auto justify-center'
              }`}
              title="Log Out"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" strokeWidth={2.2} />
              </div>
              
              <span 
                className={`text-small font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isExpanded ? 'ml-3 opacity-100 max-w-[150px] translate-x-0' : 'ml-0 opacity-0 max-w-0 w-0 pointer-events-none'
                }`}
              >
                Log Out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
