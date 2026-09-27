'use client';

import React from 'react';
import { Eye, Brain, Bot, Users, CheckCircle, Zap } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Detect',
      desc: 'Capture operational incidents instantly from sensor telemetry, PMS triggers, or staff reports.',
      icon: Eye,
    },
    {
      num: '02',
      title: 'Understand',
      desc: 'Build the full operational context including VIP guest tiers, room statuses, staff loads, and booking blocks.',
      icon: Brain,
    },
    {
      num: '03',
      title: 'Reason',
      desc: 'Specialized Front Desk, Housekeeping, Maintenance, and Revenue AI agents evaluate trade-offs in parallel.',
      icon: Bot,
    },
    {
      num: '04',
      title: 'Coordinate',
      desc: 'Consensus engine weighs competing priorities to generate one clear, explainable action plan.',
      icon: Users,
    },
    {
      num: '05',
      title: 'Approve',
      desc: 'Duty Manager reviews transparent reasoning and approves, tweaks, or rejects the recommendation.',
      icon: CheckCircle,
    },
    {
      num: '06',
      title: 'Execute',
      desc: 'Executable work orders are dispatched across departments and tracked live via real-time WebSockets.',
      icon: Zap,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Six-Stage Operational Pipeline
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How Resort 360 Works
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            A structured, auditable operations loop turning fragmented resort incidents into coordinated, verified execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-surface shadow-soft hover:shadow-soft-lg hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-primary">
                      {step.num}
                    </span>
                    <div className="p-2 rounded-lg bg-surface-secondary text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
                  Phase {step.num} of 06
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
