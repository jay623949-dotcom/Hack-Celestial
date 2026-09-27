'use client';

import React from 'react';
import { Radio, Brain, Bot, Users, CheckCircle2 } from 'lucide-react';

export default function ProductExplanation() {
  const steps = [
    {
      num: '01',
      title: 'Signals Ingested',
      desc: 'Telemetry, PMS room events, sensor triggers, and staff reports are captured in real time.',
      icon: Radio,
    },
    {
      num: '02',
      title: 'Context Compiled',
      desc: 'Aggregates guest VIP tier, staff capacity, repair ETAs, and upcoming reservations.',
      icon: Brain,
    },
    {
      num: '03',
      title: 'AI Reasoning',
      desc: 'Specialized Front Desk, Housekeeping, Maintenance, and Revenue agents analyze trade-offs.',
      icon: Bot,
    },
    {
      num: '04',
      title: 'Consensus Reached',
      desc: 'Reconciles conflicting departmental priorities into one transparent, explainable recommendation.',
      icon: Users,
    },
    {
      num: '05',
      title: 'Manager Execution',
      desc: 'Duty manager reviews and approves the plan; tasks dispatch automatically across departments.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-surface-secondary/40 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Intelligent Operational Loop
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            From scattered signals to one clear decision.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Resort 360 transforms disjointed alerts across hotel departments into an auditable, five-step decision loop with human oversight at its core.
          </p>
        </div>

        {/* 5-Step Linear Card Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border bg-surface shadow-soft flex flex-col justify-between"
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
                  <h3 className="font-bold text-base text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/70 text-[11px] font-mono text-muted-foreground">
                  Step {idx + 1} of 5
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
