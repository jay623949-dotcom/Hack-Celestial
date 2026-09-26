'use client';

import React from 'react';
import { ArrowDown, CheckCircle2, SplitSquareVertical } from 'lucide-react';

export default function CoreProblem() {
  return (
    <section id="operations" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            The Fundamental Challenge
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Your resort already has the information. <br className="hidden sm:inline" />
            <span className="text-muted-foreground font-semibold">
              The problem is connecting it.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Existing PMS, work order, and housekeeping systems track their own data. But when multiple unexpected events happen simultaneously, each department sees only a fraction of the situation.
          </p>
        </div>

        {/* Visual Fragmentation vs Resort 360 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Siloed Departmental Blind Spots */}
          <div className="p-7 sm:p-8 rounded-2xl border border-border bg-surface shadow-soft flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4">
                <span>The Fragmentation Problem</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Four Siloed Departments, Four Incomplete Views
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                When a high-value guest arrives while an assigned suite breaks down, no single staff member holds all the cards. Decisions are made through radio calls, frantic PMS searches, and guesswork.
              </p>

              {/* Departmental Fragmentation Map */}
              <div className="my-7 p-5 rounded-xl border border-border bg-surface-secondary/70 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
                  <span className="font-bold text-foreground">Front Desk</span>
                  <span className="text-rose-600 dark:text-rose-400">&ldquo;VIP Vance arrived 20m early in lobby&rdquo;</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
                  <span className="font-bold text-foreground">Housekeeping</span>
                  <span className="text-amber-600 dark:text-amber-400">&ldquo;Room 505 needs 25 min express clean&rdquo;</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
                  <span className="font-bold text-foreground">Maintenance</span>
                  <span className="text-rose-600 dark:text-rose-400">&ldquo;Room 401 AC failed (75m repair)&rdquo;</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
                  <span className="font-bold text-foreground">Revenue</span>
                  <span className="text-primary">&ldquo;Group wedding arrives at 2:00 PM on floor 4&rdquo;</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/80 text-xs text-rose-600 dark:text-rose-400 font-medium">
              Outcome: 45+ minute guest delays, uncoordinated staff scrambling, and revenue-critical room displacement.
            </div>
          </div>

          {/* Resort 360 Unified Coordination */}
          <div className="p-7 sm:p-8 rounded-2xl border border-primary/40 bg-surface shadow-soft flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                <span>The Resort 360 Architecture</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                One Operational Picture, One Coordinated Plan
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Resort 360 does not replace your PMS or staff tools. It sits above operational data as an intelligent coordination layer, synthesizing competing priorities into explainable action.
              </p>

              {/* Synthesized System Diagram */}
              <div className="my-7 p-5 rounded-xl border border-primary/30 bg-primary-light flex flex-col items-center justify-center space-y-3 font-mono text-xs text-center">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="p-2 rounded bg-surface border border-border text-foreground font-medium">
                    Guest & Arrival Context
                  </div>
                  <div className="p-2 rounded bg-surface border border-border text-foreground font-medium">
                    Room Readiness & Staff Load
                  </div>
                  <div className="p-2 rounded bg-surface border border-border text-foreground font-medium">
                    Equipment Health & Parts
                  </div>
                  <div className="p-2 rounded bg-surface border border-border text-foreground font-medium">
                    Yield & Group Reservations
                  </div>
                </div>

                <div className="flex flex-col items-center py-1">
                  <span className="text-primary text-xs font-bold">▼</span>
                  <div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold tracking-wide shadow-soft">
                    RESORT 360 CONSENSUS ENGINE
                  </div>
                  <span className="text-primary text-xs font-bold">▼</span>
                </div>

                <div className="w-full p-2.5 rounded-lg bg-surface border border-primary/40 font-bold text-primary">
                  Unified Action Plan Generated in &lt; 90 Seconds
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/80 text-xs text-primary font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Outcome: Zero staff confusion, protected VIP experience, and automated work orders.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
