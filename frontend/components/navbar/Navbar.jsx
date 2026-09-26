'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Do not render top Navbar on dashboard routes since DashboardShell renders its own operational Header
  if (pathname && pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95 border-b border-border transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Left */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/atria_logo.jpg"
              alt="Atria Intelligence Logo"
              className="h-9 w-auto object-contain rounded-lg shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-foreground text-base sm:text-lg leading-none">
                Atria <span className="text-odoo-purple font-black">intelligence</span>
              </span>
              <span className="text-xs text-muted-foreground font-mono tracking-wider mt-0.5">
                Swarm Operations &amp; Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation Center: Public Editorial Links (No Dashboard/AI Swarm/Consensus internal tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200/80 text-sm font-semibold text-slate-600">
            <a
              href="#operations"
              className="px-3.5 py-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors"
            >
              Operations
            </a>
            <a
              href="#how-it-works"
              className="px-3.5 py-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#agents"
              className="px-3.5 py-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors"
            >
              AI Agents
            </a>
            <a
              href="#why"
              className="px-3.5 py-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-colors"
            >
              Why Resort 360
            </a>
          </nav>

          {/* Actions Right: Sign In and Register Your Resort (No Launch App) */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-odoo-teal hover:bg-odoo-teal-hover text-white font-bold text-sm transition-all shadow-xs"
            >
              <span>Register Your Resort</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl border border-border bg-white text-muted-foreground hover:text-foreground"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-border bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
            <a
              href="#operations"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Operations
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              How It Works
            </a>
            <a
              href="#agents"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              AI Agents
            </a>
            <a
              href="#why"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Why Resort 360
            </a>
          </nav>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-odoo-teal text-white text-sm font-bold shadow-xs"
            >
              Register Your Resort →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
