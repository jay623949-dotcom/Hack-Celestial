'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from '../ui/ThemeToggle';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                360
              </div>
              <span className="font-bold text-foreground text-base tracking-tight">
                RESORT <span className="text-primary font-black">360</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              AI-Powered Resort Operations & Decision Intelligence. Bridging Front Desk, Housekeeping, Maintenance, and Revenue Management into coordinated operational action.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              <span className="text-xs text-muted-foreground font-mono">
                Theme Toggle
              </span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#overview" className="hover:text-primary transition-colors">Overview</a></li>
              <li><a href="#operations" className="hover:text-primary transition-colors">Operations</a></li>
              <li><a href="#agents" className="hover:text-primary transition-colors">AI Agents</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#command-center" className="hover:text-primary transition-colors">Live Simulation</a></li>
              <li><span className="opacity-60 cursor-not-allowed">Documentation</span></li>
              <li><span className="opacity-60 cursor-not-allowed">Architecture</span></li>
            </ul>
          </div>

          {/* Column 3: System Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              System Telemetry
            </h4>
            <div className="p-3.5 rounded-xl border border-border bg-surface text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API Gateway</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">AI Consensus</span>
                <span className="text-primary font-mono font-bold">4/4 READY</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">WebSocket</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RESORT 360 Platform. Production-style hackathon foundation.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Next.js 14 App Router</span>
            <span>JavaScript (ES6+)</span>
            <span>Human-in-the-Loop AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
