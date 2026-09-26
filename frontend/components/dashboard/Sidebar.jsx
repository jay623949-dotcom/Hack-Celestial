'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  BedDouble,
  Users,
  UserCheck,
  AlertTriangle,
  CheckSquare,
  Bot,
  Settings,
  HelpCircle,
  MapPin,
  X,
} from 'lucide-react';

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const pathname = usePathname();

  const primaryNav = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Operations', href: '/dashboard#operations', icon: Radio },
    { label: 'Rooms', href: '/dashboard#rooms', icon: BedDouble },
    { label: 'Guests', href: '/dashboard#guests', icon: Users },
    { label: 'Staff', href: '/dashboard#staff', icon: UserCheck },
    { label: 'Incidents', href: '/dashboard#incidents', icon: AlertTriangle },
    { label: 'Tasks', href: '/dashboard#tasks', icon: CheckSquare },
    { label: 'AI Agents', href: '/dashboard#agents', icon: Bot },
  ];

  const secondaryNav = [
    { label: 'Settings', href: '/dashboard#settings', icon: Settings },
    { label: 'Help', href: '/dashboard#help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-border bg-surface transition-transform duration-200 flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Top */}
        <div>
          <div className="h-16 px-5 border-b border-border/70 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                360
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-foreground text-sm leading-none">
                  RESORT <span className="text-primary font-black">360</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  Command Center
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Navigation */}
          <nav className="p-3 space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard');
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-5 py-2">
            <div className="h-px bg-border/70" />
          </div>

          {/* Secondary Navigation */}
          <nav className="p-3 space-y-1">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Property Context Badge */}
        <div className="p-4 border-t border-border/70 bg-surface-secondary/40">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Current Resort
          </div>
          <div className="font-bold text-xs text-foreground truncate">
            Azure Bay Resort & Spa
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3 text-primary" />
            <span>Goa, India</span>
          </div>
        </div>
      </aside>
    </>
  );
}
