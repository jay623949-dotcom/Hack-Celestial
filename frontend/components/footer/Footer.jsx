'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BedDouble, Users, Wrench, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 xl:gap-12">
          {/* Brand Info & Mission Statement */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <img
                src="/atria_logo.jpg"
                alt="Atria Intelligence Logo"
                className="h-9 w-auto object-contain rounded-lg shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-slate-900 text-base sm:text-lg leading-none">
                  Atria <span className="text-odoo-purple font-black">intelligence</span>
                </span>
                <span className="text-xs text-muted-foreground font-mono tracking-wider mt-0.5">
                  Resort 360 Swarm Operations
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              AI-Powered Resort Operations Platform. Unifying cross-department operational context, multi-agent domain reasoning, and human-in-the-loop decision governance.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time Operations Ready</span>
              </div>
            </div>
          </div>

          {/* Column 1: Product Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#overview" className="hover:text-odoo-teal transition-colors">
                  Product Overview
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-odoo-teal transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#agents" className="hover:text-odoo-teal transition-colors">
                  AI Agents Swarm
                </a>
              </li>
              <li>
                <a href="#operations" className="hover:text-odoo-teal transition-colors">
                  Incident Resolution
                </a>
              </li>
              <li>
                <Link href="/dashboard/consensus" className="hover:text-odoo-teal transition-colors">
                  Consensus Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Dedicated Platform Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/dashboard/rooms" className="hover:text-odoo-teal transition-colors flex items-center justify-between">
                  <span>Rooms Hub</span>
                  <span className="text-[10px] font-mono text-slate-400">45 Rooms</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/guests" className="hover:text-odoo-teal transition-colors flex items-center justify-between">
                  <span>Guest Directory</span>
                  <span className="text-[10px] font-mono text-slate-400">VIP Priority</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/staff" className="hover:text-odoo-teal transition-colors flex items-center justify-between">
                  <span>Staff Rostering</span>
                  <span className="text-[10px] font-mono text-slate-400">On Duty</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/revenue" className="hover:text-odoo-teal transition-colors flex items-center justify-between">
                  <span>Revenue Analytics</span>
                  <span className="text-[10px] font-mono text-slate-400">82% Yield</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/execution" className="hover:text-odoo-teal transition-colors">
                  Live Execution
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Demo */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/dashboard" className="hover:text-odoo-teal transition-colors">
                  Operations Console
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-odoo-teal transition-colors">
                  Architecture Overview
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Azure Bay Demo
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Contact Team
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Governance
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <span className="text-slate-500 cursor-default">
                  Human-in-the-Loop
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Audit Trail Logging
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Copyright & Architectural Tech Badge */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 RESORT 360. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-[11px] text-slate-500">
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Socket.IO Real-Time</span>
            <span>•</span>
            <span>Ajv Schema Draft 2020-12</span>
            <span>•</span>
            <span>Universal AI Adapter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
