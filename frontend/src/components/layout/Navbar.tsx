import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { BusinessSwitcher } from './BusinessSwitcher';
import { UserProfileMenu } from './UserProfileMenu';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 bg-transparent px-3 sm:px-6 flex items-center justify-between">
      {/* Left Spacer / Context */}
      <div className="flex items-center">
        {/* Intentionally left clean so the page's own h1 is the single source of truth */}
      </div>

      {/* Right: Store Switcher, Search & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Business Storefront Switcher */}
        <BusinessSwitcher />

        {/* Search Bar */}
        <div className="hidden md:flex relative w-48 lg:w-60">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-[#8C9F92]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 bg-[#F0F6F2] border border-[#C7DDCC] rounded-full text-small font-medium placeholder-[#8C9F92] text-[#16123F] focus:bg-white focus:border-[#75C9B7] focus:ring-2 focus:ring-[#75C9B7]/20 transition-all outline-none"
            placeholder="Search products, orders..."
          />
        </div>

        {/* Interactive User Profile Dropdown & Modal */}
        <UserProfileMenu />
      </div>
    </header>
  );
};
