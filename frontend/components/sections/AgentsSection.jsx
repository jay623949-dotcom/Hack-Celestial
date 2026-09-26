'use client';

import React from 'react';
import { Users, BedDouble, Wrench, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AgentsSection() {
  const agents = [
    {
      name: 'FRONT DESK',
      domain: 'Guest Relations',
      icon: Users,
      items: [
        'Guest experience',
        'VIP priority',
        'Room allocation',
      ],
      perspective: 'Advocates for zero lobby wait times and VIP status recovery.',
    },
    {
      name: 'HOUSEKEEPING',
      domain: 'Turnover & Cleanliness',
      icon: BedDouble,
      items: [
        'Room readiness',
        'Staff availability',
        'Preparation ETA',
      ],
      perspective: 'Calculates real turnaround time and attendant routing.',
    },
    {
      name: 'MAINTENANCE',
      domain: 'Engineering & Assets',
      icon: Wrench,
      items: [
        'Equipment health',
        'Technician availability',
        'Repair ETA',
      ],
      perspective: 'Evaluates component repair criticality and technician safety.',
    },
    {
      name: 'REVENUE',
      domain: 'Yield & Inventory',
      icon: TrendingUp,
      items: [
        'Occupancy',
        'Room value',
        'Upcoming demand',
      ],
      perspective: 'Protects rate integrity and upcoming group reservation blocks.',
    },
  ];

  return (
    <section id="agents" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Specialized Departmental Intelligence
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Multi-Agent Intelligence
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Four specialized AI agents represent their department’s real-world operational perspective, debating trade-offs to arrive at consensus.
          </p>
        </div>

        {/* Connected Composition Leading to Consensus */}
        <div className="space-y-6">
          {/* 4 Perspectives Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((ag, idx) => {
              const Icon = ag.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-surface shadow-soft hover:shadow-soft-lg hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                        Agent 0{idx + 1}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm tracking-wider uppercase font-mono text-foreground">
                      {ag.name}
                    </h3>
                    <span className="text-xs text-muted-foreground block mb-4">
                      {ag.domain}
                    </span>

                    <ul className="space-y-2 text-xs text-foreground/90 mb-5">
                      {ag.items.map((it, iIdx) => (
                        <li key={iIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border text-[11px] text-muted-foreground italic leading-relaxed">
                    &ldquo;{ag.perspective}&rdquo;
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consensus Convergence Banner */}
          <div className="p-6 rounded-2xl border border-primary/40 bg-primary-light flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Converged Output
                </span>
                <div className="text-base font-bold text-foreground">
                  RESORT 360 CONSENSUS ENGINE
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Weighs guest goodwill, staff labor, maintenance time, and financial displacement into one verified plan.
                </div>
              </div>
            </div>

            <a
              href="#incident"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-colors shrink-0 self-start md:self-center"
            >
              <span>View Core Incident Demonstration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
