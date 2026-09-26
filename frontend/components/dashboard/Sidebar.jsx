'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Radio, BedDouble, Users, UserCheck, AlertTriangle,
  CheckSquare, Bot, Sparkles, Layers, MapPin, X, TrendingUp, Wrench,
  ClipboardList, CalendarCheck, Zap, CloudSun
} from 'lucide-react';
import { useRole } from '../../lib/roleContext';

const NAV_CONFIG = {
  admin: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard', icon: LayoutDashboard }] },
      { title: 'Operations', items: [
        { label: 'Rooms', href: '/dashboard/rooms', icon: BedDouble },
        { label: 'Guests', href: '/dashboard/guests', icon: Users },
        { label: 'Revenue', href: '/dashboard/revenue', icon: TrendingUp },
        { label: 'Staff', href: '/dashboard/staff', icon: UserCheck },
        { label: 'Incidents', href: '/dashboard#incidents', icon: AlertTriangle },
        { label: 'Tasks', href: '/dashboard#tasks', icon: CheckSquare },
        { label: 'Live Execution', href: '/dashboard/execution', icon: Zap },
      ]},
      { title: 'Intelligence', items: [
        { label: 'Autonomous 360 OS', href: '/dashboard/agents?tab=autonomous', icon: Sparkles },
        { label: 'Weather Digital Twin', href: '/dashboard/weather-digital-twin', icon: CloudSun },
        { label: 'Swarm Consensus', href: '/dashboard/agents?tab=consensus', icon: Bot },
        { label: 'Consensus Report', href: '/dashboard/consensus', icon: Layers },
      ]},
    ],
  },
  front_desk: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard/frontdesk', icon: LayoutDashboard }] },
      { title: 'Guest Operations', items: [
        { label: 'Guests', href: '/dashboard/guests', icon: Users },
        { label: 'Rooms Hub', href: '/dashboard/rooms', icon: BedDouble },
        { label: 'Arrivals Today', href: '/dashboard/frontdesk#arrivals', icon: CalendarCheck },
        { label: 'Incidents', href: '/dashboard/frontdesk#incidents', icon: AlertTriangle },
      ]},
    ],
  },
  housekeeping: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard/housekeeping', icon: LayoutDashboard }] },
      { title: 'Housekeeping', items: [
        { label: 'Room Inventory', href: '/dashboard/rooms', icon: BedDouble },
        { label: 'Staff Roster', href: '/dashboard/staff', icon: UserCheck },
        { label: 'Tasks', href: '/dashboard/housekeeping#tasks', icon: ClipboardList },
      ]},
    ],
  },
  maintenance: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard/maintenance', icon: LayoutDashboard }] },
      { title: 'Maintenance', items: [
        { label: 'Rooms Hub', href: '/dashboard/rooms', icon: BedDouble },
        { label: 'Staff Roster', href: '/dashboard/staff', icon: Wrench },
        { label: 'Incidents', href: '/dashboard/maintenance#incidents', icon: AlertTriangle },
        { label: 'Tasks', href: '/dashboard/maintenance#tasks', icon: ClipboardList },
      ]},
    ],
  },
  revenue: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard/revenue-mgr', icon: LayoutDashboard }] },
      { title: 'Revenue', items: [
        { label: 'Revenue Hub', href: '/dashboard/revenue', icon: TrendingUp },
        { label: 'Room Inventory', href: '/dashboard/rooms', icon: BedDouble },
        { label: 'Bookings', href: '/dashboard/revenue-mgr#bookings', icon: Radio },
      ]},
      { title: 'Intelligence', items: [
        { label: 'Consensus Report', href: '/dashboard/consensus', icon: Layers },
      ]},
    ],
  },
};

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { role, roleData } = useRole();

  const config = NAV_CONFIG[role] || NAV_CONFIG.admin;

  const renderGroup = (group, idx) => (
    <div key={idx} className="space-y-1">
      {group.title && (
        <div className="px-3 pt-3 pb-1 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
          {group.title}
        </div>
      )}
      {group.items.map((item) => {
        const Icon = item.icon;
        const hrefBase = item.href.split('?')[0].split('#')[0];
        const isActive = pathname === hrefBase || (hrefBase !== '/dashboard' && pathname?.startsWith(hrefBase));
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-odoo-purple/10 text-odoo-purple border border-odoo-purple/20 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-secondary'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-border bg-white transition-transform duration-200 flex flex-col justify-between shadow-sm ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand */}
        <div>
          <div className="h-16 px-4 border-b border-border flex items-center justify-between">
            <Link href="/login" className="flex items-center gap-3">
              <img
                src="/atria_logo.jpg"
                alt="Atria Intelligence Logo"
                className="h-9 w-auto object-contain rounded-lg"
              />
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-foreground text-base leading-none">
                  Atria <span className="text-odoo-purple font-bold">intelligence</span>
                </span>
                <span className="text-xs text-muted-foreground font-mono mt-0.5">
                  {roleData?.shortLabel || 'Operations OS'}
                </span>
              </div>
            </Link>

            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground" aria-label="Close sidebar">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role badge */}
          {roleData && (
            <div className={`mx-3 mt-3 px-3 py-2 rounded-xl border text-xs font-bold font-mono uppercase tracking-wider ${roleData.color}`}>
              {roleData.shortLabel}
            </div>
          )}

          <nav className="p-3 space-y-2">
            {config.groups.map((g, i) => renderGroup(g, i))}
          </nav>
        </div>

        {/* Bottom Resort badge */}
        <div className="p-4 border-t border-border bg-surface-secondary/50">
          <div className="text-xs font-mono uppercase font-bold tracking-wider text-muted-foreground mb-1">Active Operations Property</div>
          <div className="font-bold text-sm text-foreground truncate">Azure Bay Resort &amp; Spa</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-odoo-teal" />
            <span>Goa, India</span>
          </div>
        </div>
      </aside>
    </>
  );
}