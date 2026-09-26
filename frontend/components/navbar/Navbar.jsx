'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Menu, X, ArrowUpRight } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/90 border-b border-border/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Left */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-150">
              <span className="font-bold text-xs tracking-wider">360</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground text-sm sm:text-base leading-none">
                RESORT <span className="text-primary font-black">360</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-wider mt-0.5">
                AI-Powered Resort Operations
              </span>
            </div>
          </Link>

          {/* Navigation Middle */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-secondary/70 px-3 py-1.5 rounded-full border border-border/80 text-xs font-medium">
            <a
              href="#overview"
              className="px-3 py-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors"
            >
              Overview
            </a>
            <a
              href="#operations"
              className="px-3 py-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors"
            >
              Operations
            </a>
            <a
              href="#agents"
              className="px-3 py-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors"
            >
              AI Agents
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors"
            >
              How It Works
            </a>
          </nav>

          {/* Actions Right */}
          <div className="hidden sm:flex items-center gap-2.5">
            <ThemeToggle />
            <a
              href="#command-center"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-soft"
            >
              <span>Open Command Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1.5 text-sm font-medium">
            <a
              href="#overview"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-surface-secondary text-foreground"
            >
              Overview
            </a>
            <a
              href="#operations"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-surface-secondary text-foreground"
            >
              Operations
            </a>
            <a
              href="#agents"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-surface-secondary text-foreground"
            >
              AI Agents
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-surface-secondary text-foreground"
            >
              How It Works
            </a>
          </nav>
          <div className="pt-2 border-t border-border">
            <a
              href="#command-center"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center block py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
            >
              Open Command Center
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
