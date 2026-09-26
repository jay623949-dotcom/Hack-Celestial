'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardShell({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    // Dashboard Layout Container
    <div className="h-full w-full overflow-hidden bg-background text-foreground flex flex-col selection:bg-odoo-purple/20 selection:text-odoo-purple">
      <div className="flex flex-1 h-full w-full overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main App Container */}
        <div className="lg:pl-64 flex flex-col flex-1 h-full w-full overflow-hidden">
          {/* Operations Header */}
          <Header onMenuClick={() => setMobileSidebarOpen(true)} />

          {/* Dynamic Internal Content Area - Only this container scrolls independently */}
          <main className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
