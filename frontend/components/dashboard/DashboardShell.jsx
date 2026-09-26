'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from '../common/ErrorBoundary';

export default function DashboardShell({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Compact Header */}
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Dynamic Content Area with React Error Boundary */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
