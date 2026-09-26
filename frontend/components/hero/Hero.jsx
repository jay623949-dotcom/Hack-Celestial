'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Users, BedDouble, Wrench, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section id="overview" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle Category Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Hospitality Decision & Coordination Intelligence</span>
          </div>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Turn Resort Chaos Into{' '}
            <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
              Coordinated Action
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Resort 360 connects operational context across departments, lets specialized AI agents reason together, and gives managers one clear action plan to approve and execute.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#command-center"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm shadow-soft transition-all duration-150"
            >
              <span>Open Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-foreground font-semibold text-xs sm:text-sm transition-colors"
            >
              <span>See How It Works</span>
            </a>
          </div>
        </div>

        {/* Integrated Product Command Center Mockup */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border bg-surface shadow-elevated overflow-hidden">
            {/* Window Chrome */}
            <div className="px-5 py-3 border-b border-border bg-surface-secondary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                <span className="text-xs font-mono text-muted-foreground ml-2 font-medium">
                  resort360-ops-telemetry // session: #8092
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>10:40 AM Peak Turnaround</span>
              </div>
            </div>

            {/* Inner Dashboard Body */}
            <div className="p-5 sm:p-7 space-y-6">
              {/* Incident Alert Banner */}
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
                        Active Incident Detected
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border text-foreground font-semibold">
                        INC-8092
                      </span>
                    </div>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      VIP Early Arrival + Suite 401 AC Failure
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Guest Alexander Vance (Diamond VIP) • 75m repair required • 2:00 PM Wedding Block restriction on floor 4
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Consensus Ready
                  </span>
                </div>
              </div>

              {/* 4 Agent Status Cards */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Departmental AI Evaluations
                  </span>
                  <span className="text-xs text-primary font-mono font-medium">
                    4 of 4 Agents Synthesized
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Front Desk */}
                  <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">Front Desk</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> READY
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Escort VIP to Executive Lounge immediately; deliver signature beverage while room prepares.
                    </p>
                  </div>

                  {/* Housekeeping */}
                  <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">Housekeeping</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> READY
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Suite 505 vacated at 10:15. Pull 2 attendants from floor 3 for 25m priority express turnover.
                    </p>
                  </div>

                  {/* Maintenance */}
                  <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">Maintenance</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> READY
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Room 401 HVAC requires capacitor replacement (75m ETA). Take offline; dispatch Tech Bob.
                    </p>
                  </div>

                  {/* Revenue */}
                  <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">Revenue</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> READY
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Suite 505 unreserved until tomorrow. Free upgrade incurs $0 revenue displacement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consensus Recommendation Bar */}
              <div className="p-4 rounded-xl border border-primary/40 bg-primary-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
                      Recommended Action Plan
                    </span>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      Move VIP → Room 505 & Dispatch 3 Parallel Work Orders
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Avoids 75m repair wait • Preserves 2:00 PM wedding party room block • $0 revenue cannibalization
                    </div>
                  </div>
                </div>

                <a
                  href="#command-center"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shrink-0 self-start sm:self-center transition-colors shadow-soft"
                >
                  Review Action Plan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
