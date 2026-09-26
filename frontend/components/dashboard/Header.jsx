'use client';

import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function Header({ onMenuClick = () => {} }) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Title & Subtitle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-none">
            Command Center
          </h1>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            Azure Bay Resort & Spa · Today
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface-secondary/70 text-xs text-muted-foreground w-48">
          <Search className="w-3.5 h-3.5" />
          <span>Search room, guest, staff...</span>
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground relative transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-border/80">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-semibold text-foreground leading-none">Duty Manager</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Ops Desk</div>
          </div>
        </div>
      </div>
    </header>
  );
}
