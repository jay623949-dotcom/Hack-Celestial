'use client';

import React from 'react';
import { RefreshCw, UserCheck, Sliders, Shield } from 'lucide-react';

export default function HumanControl() {
  const steps = [
    {
      icon: RefreshCw,
      title: 'AI Recommendation',
      desc: 'Four specialized agents analyze real-time context and generate a balanced, explainable recommendation.',
    },
    {
      icon: UserCheck,
      title: 'Manager Review',
      desc: 'The Duty Manager reviews the rationale, time constraints, guest priority, and assigned staff members.',
    },
    {
      icon: Sliders,
      title: 'APPROVE / MODIFY / REJECT',
      desc: 'Approve with one click, modify specific assignees or priorities, or reject to handle manually.',
    },
    {
      icon: Shield,
      title: 'Controlled Execution',
      desc: 'Zero autonomous room changes or work order dispatch without deliberate human authorization.',
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Safety & Supervisory Oversight
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            AI recommends. <br />
            <span className="text-primary">Managers decide.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Resort operations cannot afford unverified automated changes. Resort 360 acts as a decision intelligence assistant, keeping authority strictly with human leadership.
          </p>
        </div>

        {/* 4 Governance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-surface shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/80 text-[11px] font-mono text-primary font-semibold">
                  Guaranteed Human Control
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
