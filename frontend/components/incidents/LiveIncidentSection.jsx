'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  BedDouble,
  Wrench,
  TrendingUp,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';

export default function LiveIncidentSection() {
  const [planState, setPlanState] = useState('pending'); // 'pending' | 'approved' | 'rejected'

  const handleApprove = () => {
    setPlanState('approved');
  };

  const handleReject = () => {
    setPlanState('rejected');
  };

  const handleReset = () => {
    setPlanState('pending');
  };

  return (
    <section id="command-center" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Live Product Simulation
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Operational Command Center
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              Experience the end-to-end Resort 360 loop in action. Review incoming incident telemetry, inspect agent logic, and approve the consensus action plan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scenario</span>
            </button>
            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
              Simulation Active
            </div>
          </div>
        </div>

        {/* Command Center Card */}
        <div className="rounded-3xl border border-border bg-surface shadow-elevated overflow-hidden">
          {/* Top Operational Status Ribbon */}
          <div className="px-6 py-4 border-b border-border bg-surface-secondary/70 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-semibold">INCIDENT: #8092-B</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Location: <strong className="text-foreground">Building A / Suite 401</strong></span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Guest: <strong className="text-foreground">Alexander Vance (Diamond VIP)</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Severity:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                CRITICAL
              </span>
            </div>
          </div>

          {/* Interactive Multi-Agent Stage */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* 4 Agent Output Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Live Agent Recommendations
                </h3>
                <span className="text-xs text-primary font-mono font-medium">Parallel Execution: 400ms</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Front Desk */}
                <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Front Desk</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">100% Match</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Escort VIP to Executive Lounge immediately. Offer signature welcome beverages; do not let guest wait in open lobby.
                  </p>
                </div>

                {/* Housekeeping */}
                <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Housekeeping</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">100% Match</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Suite 505 vacated at 10:15. Pull attendants Maria & Elena from floor 3 for a 2-person express clean (ETA: 25 minutes).
                  </p>
                </div>

                {/* Maintenance */}
                <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Maintenance</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">100% Match</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Suite 401 HVAC requires capacitor replacement (75m ETA). Take off live room inventory; dispatch Technician Bob.
                  </p>
                </div>

                {/* Revenue */}
                <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Revenue</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">100% Match</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Suite 505 is unreserved until tomorrow afternoon. ₹0 revenue cannibalization. Preserves 2:00 PM wedding party block on floor 4.
                  </p>
                </div>
              </div>
            </div>

            {/* Synthesized Plan & Manager Decision Panel */}
            <div className={`p-6 rounded-2xl border transition-all ${
              planState === 'approved'
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : planState === 'rejected'
                ? 'border-rose-500/40 bg-rose-500/5'
                : 'border-primary/40 bg-primary-light'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                      Synthesized Action Plan #PL-409
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      Upgrade VIP Vance to Suite 505 • Dispatch Priority Housekeeping & Maintenance
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">Human Decision:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    planState === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : planState === 'rejected'
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {planState === 'approved' ? '✓ APPROVED' : planState === 'rejected' ? '✕ REJECTED' : 'PENDING APPROVAL'}
                  </span>
                </div>
              </div>

              {/* Action Plan Tasks */}
              <div className="mt-4 pt-4 border-t border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3 font-mono">
                  Executable Work Orders Generated by Plan
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-border bg-surface flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      planState === 'approved' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      1
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-foreground">Lounge Reception</div>
                      <div className="text-muted-foreground">Sarah Jenkins (Front Desk)</div>
                      <div className="text-[11px] text-primary font-mono mt-0.5">ETA: 10 mins</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-surface flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      planState === 'approved' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      2
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-foreground">Express Clean Suite 505</div>
                      <div className="text-muted-foreground">Maria & Elena (Housekeeping)</div>
                      <div className="text-[11px] text-primary font-mono mt-0.5">ETA: 25 mins</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-surface flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      planState === 'approved' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      3
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-foreground">HVAC Capacitor Replacement</div>
                      <div className="text-muted-foreground">Bob Miller (Maintenance)</div>
                      <div className="text-[11px] text-primary font-mono mt-0.5">ETA: 75 mins</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manager Approval Controls */}
              <div className="mt-6 pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground italic">
                  *AI recommends. Work order transmission requires manager sign-off.
                </p>

                <div className="flex items-center gap-3">
                  {planState === 'pending' && (
                    <>
                      <button
                        onClick={handleReject}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={handleApprove}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition-all shadow-soft"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Dispatch Plan</span>
                      </button>
                    </>
                  )}

                  {planState === 'approved' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Action Plan Approved! Work orders transmitted in real time via WebSockets.</span>
                    </div>
                  )}

                  {planState === 'rejected' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                      <X className="w-4 h-4" />
                      <span>Plan rejected. Reverted to manual phone dispatch.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
