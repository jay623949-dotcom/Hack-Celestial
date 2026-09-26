'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, ChevronDown, LogOut, RefreshCw } from 'lucide-react';
import { useRole, DEMO_ROLES } from '../../lib/roleContext';

export default function Header({ onMenuClick = () => {} }) {
  const { role, roleData, setRole, clearRole } = useRole();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const switchRole = () => {
    setMenuOpen(false);
    router.push('/sign-in');
  };

  const selectRole = (roleId) => {
    const routes = {
      admin: '/dashboard',
      front_desk: '/dashboard/frontdesk',
      housekeeping: '/dashboard/housekeeping',
      maintenance: '/dashboard/maintenance',
      revenue: '/dashboard/revenue-mgr',
    };
    setRole(roleId);
    setMenuOpen(false);
    router.push(routes[roleId] || '/dashboard');
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground" aria-label="Open sidebar">
          <Menu className="w-4 h-4" />
        </button>
        <div>
          <div className="text-sm font-bold text-foreground tracking-tight leading-none">Resort Operations</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Azure Bay Resort &amp; Spa · Live Console</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground relative transition-colors" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        {/* Role Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 pl-2 border-l border-border hover:bg-surface-secondary rounded-r-lg pr-2 py-1 transition-colors"
          >
            <div className={`w-7 h-7 rounded-md border flex items-center justify-center font-bold text-[10px] ${roleData?.color || 'bg-primary/10 text-primary border-primary/20'}`}>
              {roleData?.avatar || 'R'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-foreground leading-none">{roleData?.label || 'Operations'}</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{roleData?.dept || 'Resort 360'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1 w-72 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {/* Current role header */}
                <div className="px-4 py-3 border-b border-border bg-surface-secondary/50">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Current Demo Role</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{roleData?.label || 'Not selected'}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{roleData?.email || ''}</div>
                </div>

                {/* Switch to other roles */}
                <div className="p-2">
                  <div className="text-[10px] font-mono text-muted-foreground px-2 py-1 uppercase tracking-wider">Switch Demo Role</div>
                  {Object.values(DEMO_ROLES).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectRole(r.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                        role === r.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-surface-secondary text-foreground'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-[9px] shrink-0 ${r.color}`}>
                        {r.avatar}
                      </div>
                      <div>
                        <div className="font-medium leading-tight">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{r.dept}</div>
                      </div>
                      {role === r.id && <span className="ml-auto text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">ACTIVE</span>}
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-border">
                  <button onClick={switchRole} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                    Return to Role Selector
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}