'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section id="overview" className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Micro-Copy Label */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>AI-Powered Resort Operations</span>
          </div>
        </div>

        {/* Hero Headline & Supporting Text */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Turn Resort Chaos <br className="hidden sm:inline" />
            Into{' '}
            <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
              Coordinated Action.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Resort 360 connects operational context across departments, lets specialized AI agents reason together, and gives managers one clear action plan to approve and execute.
          </p>

          {/* Primary CTA & Secondary Action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm shadow-soft transition-all duration-150"
            >
              <span>Open Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-foreground font-semibold text-xs sm:text-sm transition-colors"
            >
              <span>See How It Works</span>
            </a>
          </div>
        </div>

        {/* Refined Product Visualization (Subtle, balanced, supports headline) */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-surface shadow-elevated overflow-hidden transition-all">
            {/* Top Micro-Bar */}
            <div className="px-5 py-3 border-b border-border bg-surface-secondary/70 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Active Incident
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Room 401 AC Failure</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>10:40 AM</span>
              </div>
            </div>

            {/* Inner Content */}
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Guest Context
                  </div>
                  <div className="text-sm font-bold text-foreground mt-0.5">
                    VIP Early Arrival • Alexander Vance (Diamond VIP)
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0 self-start sm:self-center">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI agents are coordinating...</span>
                </div>
              </div>

              {/* 4 Agent Live Coordination Status Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl border border-border bg-surface-secondary/40 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Front Desk</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-border bg-surface-secondary/40 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Housekeeping</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1" />
                </div>
                <div className="p-2.5 rounded-xl border border-border bg-surface-secondary/40 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Maintenance</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1" />
                </div>
                <div className="p-2.5 rounded-xl border border-border bg-surface-secondary/40 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Revenue</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Bottom Subtle Recommendation Preview */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Consensus Proposal:</strong> Reassign VIP to Suite 505 (25m express clean) • 0 revenue loss
                </div>
                <span className="font-mono text-[11px] text-primary font-semibold">
                  Awaiting Manager Approval
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
