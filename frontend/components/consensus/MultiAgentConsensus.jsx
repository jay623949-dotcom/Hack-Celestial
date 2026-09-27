'use client';

import React from 'react';
import { ArrowDown, Sparkles, ArrowRight } from 'lucide-react';

export default function MultiAgentConsensus() {
  return (
    <section className="py-20 md:py-28 bg-surface-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Multi-Agent Synthesis
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How Four Perspectives Become <br />
            <span className="text-primary">One Coordinated Decision</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Multi-agent consensus eliminates inter-departmental conflict. The engine reconciles competing priorities and delivers a transparently justified operational plan.
          </p>
        </div>

        {/* Multi-Agent Convergence Container */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-soft-lg">
          {/* 4 Contributing Agent Perspectives */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-xl border border-border bg-surface-secondary">
              <span className="text-[11px] font-bold uppercase text-primary font-mono block">Front Desk</span>
              <span className="text-xs text-foreground font-medium mt-1 block">&ldquo;VIP requires immediate accommodation.&rdquo;</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-surface-secondary">
              <span className="text-[11px] font-bold uppercase text-primary font-mono block">Housekeeping</span>
              <span className="text-xs text-foreground font-medium mt-1 block">&ldquo;Room 505 can be prepared in 8 minutes.&rdquo;</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-surface-secondary">
              <span className="text-[11px] font-bold uppercase text-primary font-mono block">Maintenance</span>
              <span className="text-xs text-foreground font-medium mt-1 block">&ldquo;Room 401 repair ETA: 25 minutes.&rdquo;</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-surface-secondary">
              <span className="text-[11px] font-bold uppercase text-primary font-mono block">Revenue</span>
              <span className="text-xs text-foreground font-medium mt-1 block">&ldquo;Moving VIP to 505 protects group inventory.&rdquo;</span>
            </div>
          </div>

          {/* Central Convergence Node */}
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Consensus Reconciliation Engine
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          {/* Resulting Action Plan Card */}
          <div className="mt-6 p-6 rounded-2xl border border-primary/40 bg-primary-light">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Resort 360 Consensus
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                Optimal Operational Plan
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Move VIP → Room 505
            </h3>

            {/* Explainable Reasoning */}
            <div className="mt-4 space-y-2 text-xs sm:text-sm">
              <span className="font-semibold text-foreground block">
                Explainable Rationale:
              </span>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Maintenance:</strong> Room 401 remains under active maintenance for HVAC capacitor repair.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Housekeeping:</strong> Room 505 can be express prepared immediately with 2 dedicated attendants.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Guest Experience:</strong> VIP experience is protected; guest enjoys lounge hospitality during clean.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Revenue:</strong> Upcoming group inventory arriving at 2:00 PM on floor 4 remains untouched.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground font-mono">
                Requires Manager Approval before execution
              </span>
              <a
                href="#command-center"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-colors shadow-soft"
              >
                <span>Simulate in Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
