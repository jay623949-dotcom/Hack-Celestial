'use client';

import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function Header({ onMenuClick = () => {} }) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Title & Subtitle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight leading-none">
            Resort Operations
          </h1>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            Azure Bay Resort & Spa · Live Console
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-surface-secondary text-xs text-muted-foreground w-56">
          <Search className="w-3.5 h-3.5" />
          <span>Search rooms, guests, staff...</span>
        </div>

        {/* Notifications */}
        <button
          className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground relative transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        {/* Theme Toggle (Hidden in light theme reset) */}
        <ThemeToggle />

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-semibold text-foreground leading-none">Duty Manager</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Operations Desk</div>
          </div>
        </div>
      </div>
    </header>
  );
}
