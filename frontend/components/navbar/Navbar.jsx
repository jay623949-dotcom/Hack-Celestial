'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Do not render top Navbar on dashboard routes since DashboardShell renders its own operational Header
  if (pathname && pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-border transition-colors shadow-sm">
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

          {/* Navigation Center */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-secondary/70 px-4 py-2 rounded-full border border-border text-sm font-semibold">
            <Link
              href="/dashboard"
              className="px-4 py-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/agents"
              className="px-4 py-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-white transition-colors"
            >
              AI Swarm
            </Link>
            <Link
              href="/dashboard/consensus"
              className="px-4 py-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-white transition-colors"
            >
              Consensus
            </Link>
          </nav>

          {/* Actions Right: Sign In, Launch App */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-bold text-odoo-purple hover:text-odoo-purple/80 border border-odoo-purple/20 bg-odoo-purple/5 hover:bg-odoo-purple/10 transition-colors px-4 py-2 rounded-xl shadow-xs"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-odoo-teal hover:bg-odoo-teal/90 text-white font-bold text-sm transition-all shadow-md"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
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
          <nav className="flex flex-col space-y-2 text-base font-semibold">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-surface-secondary text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/agents"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-surface-secondary text-foreground"
            >
              AI Swarm
            </Link>
            <Link
              href="/dashboard/consensus"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-surface-secondary text-foreground"
            >
              Consensus
            </Link>
          </nav>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-border bg-white text-foreground text-sm font-bold"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-odoo-teal text-white text-sm font-bold shadow-md"
            >
              Launch App →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
