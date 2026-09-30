import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { InviteModal } from '../invitations/InviteModal';
import { FloatingChatWidget } from '../chat/FloatingChatWidget';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F5FA] flex p-3 md:p-5 overflow-hidden text-[#051747] h-screen w-full">
      <div className="w-full h-full flex gap-4 lg:gap-6">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 px-2 py-2 md:px-4 md:py-3 overflow-y-auto w-full min-w-0 custom-scrollbar">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <ToastContainer />
      <InviteModal />
      <FloatingChatWidget />
    </div>
  );
};
