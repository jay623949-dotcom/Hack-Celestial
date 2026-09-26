'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Radio, BedDouble, Users, UserCheck, AlertTriangle,
  CheckSquare, Bot, Sparkles, Layers, Settings, HelpCircle, MapPin,
  X, TrendingUp, Wrench, ClipboardList, CalendarCheck, Zap
} from 'lucide-react';
import { useRole } from '../../lib/roleContext';

const NAV_CONFIG = {
  admin: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard', icon: LayoutDashboard }] },
      { title: 'Operations', items: [
        { label: 'Rooms', href: '/dashboard#rooms', icon: BedDouble },
        { label: 'Guests', href: '/dashboard#guests', icon: Users },
        { label: 'Revenue', href: '/dashboard#revenue', icon: Radio },
        { label: 'Staff', href: '/dashboard#staff', icon: UserCheck },
        { label: 'Incidents', href: '/dashboard#incidents', icon: AlertTriangle },
        { label: 'Tasks', href: '/dashboard#tasks', icon: CheckSquare },
        { label: 'Live Execution', href: '/dashboard/execution', icon: Zap },
      ]},
      { title: 'Intelligence', items: [
        { label: 'Autonomous 360 OS', href: '/dashboard/agents?tab=autonomous', icon: Sparkles },
        { label: 'Swarm Consensus', href: '/dashboard/agents?tab=consensus', icon: Bot },
        { label: 'Consensus Report', href: '/dashboard/consensus', icon: Layers },
      ]},
    ],
  },

  front_desk: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard/frontdesk', icon: LayoutDashboard }] },
      { title: 'Guest Operations', items: [
        { label: 'Guests', href: '/dashboard/frontdesk#guests', icon: Users },
        { label: 'Arrivals Today', href: '/dashboard/frontdesk#arrivals', icon: CalendarCheck },
        { label: 'Rooms', href: '/dashboard/frontdesk#rooms', icon: BedDouble },
        { label: 'Incidents', href: '/dashboard/frontdesk#incidents', icon: AlertTriangle },
      ]},
    ],
  },
  housekeeping: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard/housekeeping', icon: LayoutDashboard }] },
      { title: 'Housekeeping', items: [
        { label: 'Room Readiness', href: '/dashboard/housekeeping#readiness', icon: BedDouble },
        { label: 'Tasks', href: '/dashboard/housekeeping#tasks', icon: ClipboardList },
        { label: 'Staff', href: '/dashboard/housekeeping#staff', icon: UserCheck },
      ]},
    ],
  },
  maintenance: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard/maintenance', icon: LayoutDashboard }] },
      { title: 'Maintenance', items: [
        { label: 'Incidents', href: '/dashboard/maintenance#incidents', icon: AlertTriangle },
        { label: 'Tasks', href: '/dashboard/maintenance#tasks', icon: ClipboardList },
        { label: 'Rooms', href: '/dashboard/maintenance#rooms', icon: BedDouble },
        { label: 'Staff', href: '/dashboard/maintenance#staff', icon: Wrench },
      ]},
    ],
  },
  revenue: {
    groups: [
      { title: null, items: [{ label: 'Overview', href: '/dashboard/revenue-mgr', icon: LayoutDashboard }] },
      { title: 'Revenue', items: [
        { label: 'Occupancy', href: '/dashboard/revenue-mgr#occupancy', icon: TrendingUp },
        { label: 'Room Inventory', href: '/dashboard/revenue-mgr#inventory', icon: BedDouble },
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
        <div className="px-3 pt-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
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
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
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
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-60 border-r border-border bg-surface transition-transform duration-200 flex flex-col justify-between ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand */}
        <div>
          <div className="h-14 px-4 border-b border-border flex items-center justify-between">
            <Link href="/sign-in" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                360
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-foreground text-sm leading-none">
                  RESORT <span className="text-primary font-bold">360</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {roleData?.shortLabel || 'Operations'}
                </span>
              </div>
            </Link>

            <button onClick={onClose} className="lg:hidden p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground" aria-label="Close sidebar">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role badge */}
          {roleData && (
            <div className={`mx-3 mt-3 px-3 py-2 rounded-lg border text-[10px] font-bold font-mono uppercase tracking-wider ${roleData.color}`}>
              {roleData.shortLabel}
            </div>
          )}

          <nav className="p-3 space-y-2">
            {config.groups.map((g, i) => renderGroup(g, i))}
          </nav>
        </div>

        {/* Bottom Resort badge */}
        <div className="p-4 border-t border-border/70 bg-surface-secondary/40">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Current Resort</div>
          <div className="font-bold text-xs text-foreground truncate">Azure Bay Resort &amp; Spa</div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3 text-primary" />
            <span>Goa, India</span>
          </div>
        </div>
      </aside>
    </>
  );
}