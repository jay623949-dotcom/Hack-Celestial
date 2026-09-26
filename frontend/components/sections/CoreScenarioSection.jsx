'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ShieldAlert, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export default function CoreScenarioSection() {
  return (
    <section id="incident" className="py-20 md:py-28 bg-surface-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            The Core Product Moment
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How Resort 360 Resolves a Live Crisis
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            A realistic look at how Resort 360’s multi-agent reasoning evaluates operational constraints and recommends an optimal action plan.
          </p>
        </div>

        {/* Product Simulation Deck */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-surface shadow-elevated overflow-hidden">
          {/* Incident Telemetry Ribbon */}
          <div className="px-6 py-4 border-b border-border bg-surface-secondary/70 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                ACTIVE INCIDENT #8092
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground font-semibold">10:40 AM</span>
            </div>
            <div className="text-muted-foreground">
              Location: <strong>Building A / Suite 401</strong>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Incident Trigger Card */}
            <div className="p-5 rounded-2xl border border-border bg-surface-secondary/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Incident State
                </span>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 10:40 AM
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                VIP GUEST ARRIVES EARLY • Room 401 AC Failure
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                <div className="p-2.5 rounded-lg border border-border bg-surface">
                  <span className="text-muted-foreground block text-[10px]">ROOM STATUS</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">Room 401 AC failure</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-surface">
                  <span className="text-muted-foreground block text-[10px]">ALTERNATIVE</span>
                  <span className="text-foreground font-bold">Room 505 can be prepared</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-surface">
                  <span className="text-muted-foreground block text-[10px]">STAFFING</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Housekeeping capacity limited</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-surface">
                  <span className="text-muted-foreground block text-[10px]">REVENUE</span>
                  <span className="text-foreground font-bold">Group booking arriving soon</span>
                </div>
              </div>
            </div>

            {/* Analysis Phase */}
            <div className="text-center py-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>AI AGENTS ANALYZE</span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-6 rounded-2xl border border-primary/40 bg-primary-light">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                    RESORT 360 RECOMMENDS
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-primary text-primary-foreground self-start sm:self-auto">
                  CONFIDENCE: 98%
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-extrabold text-foreground">
                &ldquo;Move VIP → Room 505&rdquo;
              </h4>

              {/* Rationale Checklist */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-primary/20">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Guest experience protected</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Room 401 remains under maintenance</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Housekeeping workload optimized</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Group inventory protected</span>
                </div>
              </div>

              {/* Action Plan Button */}
              <div className="mt-6 pt-4 border-t border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground font-mono">
                  Duty Manager sign-off required for execution
                </span>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shadow-soft transition-all"
                >
                  <span>Review Action Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
