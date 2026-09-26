'use client';

import React from 'react';
import Link from 'next/link';
import {
  BedDouble, Sparkles, Wrench, Radio, AlertTriangle, Users,
  ClipboardList, Layers, Zap, TrendingUp, ShieldCheck, MapPin
} from 'lucide-react';

const MODULES = [
  {
    title: 'Front Desk',
    subtitle: 'Check-in & VIPs',
    href: '/dashboard/frontdesk',
    iconColor: '#FF5722',
    bgColor: 'bg-orange-50 text-orange-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V19" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 7H15M9 11H15M9 15H12" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/>
        <path d="M2 19H22" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Housekeeping',
    subtitle: 'Room Turndown',
    href: '/dashboard/housekeeping',
    iconColor: '#017E84',
    bgColor: 'bg-teal-50 text-teal-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10H21M5 10V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10" stroke="#017E84" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 10V6C7 4.34315 8.34315 3 10 3H14C15.6569 3 17 4.34315 17 6V10" stroke="#017E84" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="15" r="2" fill="#017E84"/>
      </svg>
    ),
  },
  {
    title: 'Maintenance',
    subtitle: 'HVAC & Repairs',
    href: '/dashboard/maintenance',
    iconColor: '#F59E0B',
    bgColor: 'bg-amber-50 text-amber-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.7 6.3A1 1 0 0013 5H11A1 1 0 009.3 6.3L8.7 8.3C8.2 8.5 7.7 8.8 7.3 9.1L5.4 8.4A1 1 0 004.2 9.1L3.2 10.9A1 1 0 003.5 12.2L5.1 13.4C5.1 13.7 5.1 14 5.1 14.3C5.1 14.6 5.1 14.9 5.1 15.2L3.5 16.4A1 1 0 003.2 17.7L4.2 19.5A1 1 0 005.4 20.2L7.3 19.5C7.7 19.8 8.2 20.1 8.7 20.3L9.3 22.3A1 1 0 0010.3 23H12.3A1 1 0 0013.3 22.3L13.9 20.3C14.4 20.1 14.9 19.8 15.3 19.5L17.2 20.2A1 1 0 0018.4 19.5L19.4 17.7A1 1 0 0019.1 16.4L17.5 15.2C17.5 14.9 17.5 14.6 17.5 14.3C17.5 14 17.5 13.7 17.5 13.4L19.1 12.2A1 1 0 0019.4 10.9L18.4 9.1A1 1 0 0017.2 8.4L15.3 9.1C14.9 8.8 14.4 8.5 13.9 8.3L14.7 6.3Z" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="11.3" cy="14.3" r="3" stroke="#F59E0B" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: 'Revenue AI',
    subtitle: 'Yield & Pricing',
    href: '/dashboard/revenue-mgr',
    iconColor: '#714B67',
    bgColor: 'bg-purple-50 text-purple-700',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22M17 5H9.5C8.5 5 7.5 5.8 7.5 7C7.5 8.2 8.5 9 9.5 9H14.5C15.5 9 16.5 9.8 16.5 11C16.5 12.2 15.5 13 14.5 13H7M16.5 17H7" stroke="#714B67" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'AI Swarm',
    subtitle: 'Consensus Engine',
    href: '/dashboard/agents',
    iconColor: '#6366F1',
    bgColor: 'bg-indigo-50 text-indigo-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'VIP Guest CRM',
    subtitle: 'Preferences & Tiers',
    href: '/dashboard#guests',
    iconColor: '#EC4899',
    bgColor: 'bg-pink-50 text-pink-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#EC4899" strokeWidth="2"/>
        <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="#EC4899" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Staff Roster',
    subtitle: 'Shift Scheduling',
    href: '/dashboard#staff',
    iconColor: '#3B82F6',
    bgColor: 'bg-blue-50 text-blue-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3B82F6" strokeWidth="2"/>
        <path d="M16 2V6M8 2V6M3 10H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="8" cy="14" r="1.5" fill="#3B82F6"/>
        <circle cx="12" cy="14" r="1.5" fill="#3B82F6"/>
        <circle cx="16" cy="14" r="1.5" fill="#3B82F6"/>
      </svg>
    ),
  },
  {
    title: 'Room Grid',
    subtitle: 'Live Inventory',
    href: '/dashboard#rooms',
    iconColor: '#10B981',
    bgColor: 'bg-emerald-50 text-emerald-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4E1 4 0 0 1 5 3H19A1 1 0 0 1 20 4V20A1 1 0 0 1 19 21H5A1 1 0 0 1 4 20V4Z" stroke="#10B981" strokeWidth="2"/>
        <path d="M9 3V21M15 3V21M4 9H20M4 15H20" stroke="#10B981" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: 'Live Dispatch',
    subtitle: 'Real-time Execution',
    href: '/dashboard/execution',
    iconColor: '#EF4444',
    bgColor: 'bg-rose-50 text-rose-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#EF4444" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Consensus OS',
    subtitle: 'Action Plans',
    href: '/dashboard/consensus',
    iconColor: '#8B5CF6',
    bgColor: 'bg-violet-50 text-violet-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Duty Manager',
    subtitle: 'Human Governance',
    href: '/dashboard',
    iconColor: '#0F766E',
    bgColor: 'bg-cyan-50 text-cyan-700',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0F766E" strokeWidth="2"/>
        <path d="M9 12L11 14L15 10" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'RevPAR Analytics',
    subtitle: 'Operational Insights',
    href: '/dashboard/revenue-mgr#occupancy',
    iconColor: '#0284C7',
    bgColor: 'bg-sky-50 text-sky-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 20V10M12 20V4M6 20V14" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function ModuleGrid() {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            All your resort apps. <span className="font-caveat font-accent text-3xl font-normal bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 inline-block">One intelligent platform.</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Click any module to launch into the operational workspace
          </p>
        </div>

        {/* 6 Columns Desktop, 3 Columns Tablet, 2 Columns Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {MODULES.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group bg-white rounded-2xl p-5 shadow-odoo hover:shadow-odoo-hover border border-border hover:border-odoo-purple/30 transition-all duration-200 hover:-translate-y-1 flex flex-col items-center justify-center text-center cursor-pointer aspect-square"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${mod.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-sm`}
              >
                {mod.icon}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-odoo-purple transition-colors line-clamp-1">
                {mod.title}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 font-accent line-clamp-1">
                {mod.subtitle}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
