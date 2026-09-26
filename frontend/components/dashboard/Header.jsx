'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Bell, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useRole, DEMO_ROLES } from '../../lib/roleContext';

export default function Header({ onMenuClick = () => {} }) {
  const { role, roleData, setRole } = useRole();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const switchRole = () => {
    setMenuOpen(false);
    router.push('/login');
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
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm">
      {/* Left Branding & Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/atria_logo.jpg"
            alt="Atria Intelligence Logo"
            className="h-9 w-auto object-contain rounded-lg shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-foreground text-base sm:text-lg leading-none flex items-center gap-1.5">
              Atria <span className="text-odoo-purple font-black">intelligence</span>
            </span>
            <span className="text-xs text-muted-foreground font-mono mt-0.5">
              Enterprise Resort Operations Console
            </span>
          </div>
        </Link>
      </div>

      {/* Right User & Role Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="p-2 rounded-xl border border-border bg-white text-muted-foreground hover:text-foreground relative transition-colors shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>

        {/* Role Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-3 pl-3 border-l border-border hover:bg-surface-secondary rounded-r-xl pr-2 py-1.5 transition-colors"
          >
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs shadow-sm ${roleData?.color || 'bg-odoo-purple/10 text-odoo-purple border-odoo-purple/20'}`}>
              {roleData?.avatar || 'A'}
            </div>
            <div className="hidden sm:block text-left text-sm">
              <div className="font-bold text-foreground leading-none">{roleData?.label || 'Operations Manager'}</div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">{roleData?.dept || 'Atria OS'}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                {/* Current role header */}
                <div className="px-5 py-4 border-b border-border bg-surface-secondary/60">
                  <div className="text-xs font-mono text-muted-foreground uppercase font-bold tracking-wider">Active Atria Role</div>
                  <div className="text-base font-bold text-foreground mt-0.5">{roleData?.label || 'Operations'}</div>
                  <div className="text-xs text-muted-foreground font-mono">{roleData?.email || 'manager@atria.ai'}</div>
                </div>

                {/* Switch to other roles */}
                <div className="p-3 space-y-1">
                  <div className="text-xs font-mono text-muted-foreground px-2 py-1 uppercase font-bold tracking-wider">Switch Persona</div>
                  {Object.values(DEMO_ROLES).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectRole(r.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors text-left ${
                        role === r.id ? 'bg-odoo-purple/10 text-odoo-purple font-bold border border-odoo-purple/20' : 'hover:bg-surface-secondary text-foreground'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${r.color}`}>
                        {r.avatar}
                      </div>
                      <div>
                        <div className="font-semibold leading-tight">{r.label}</div>
                        <div className="text-xs text-muted-foreground font-mono">{r.dept}</div>
                      </div>
                      {role === r.id && <span className="ml-auto text-xs bg-odoo-purple text-white px-2 py-0.5 rounded-full font-mono font-bold">ACTIVE</span>}
                    </button>
                  ))}
                </div>

                <div className="p-3 border-t border-border">
                  <button onClick={switchRole} className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors font-medium">
                    <LogOut className="w-4 h-4" />
                    Sign Out to Login Page
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