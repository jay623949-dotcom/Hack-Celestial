'use client';

import React from 'react';
import { Sparkles, UserCheck, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export default function HumanControlSection() {
  const steps = [
    {
      num: '01',
      title: 'AI Recommendation',
      desc: 'Specialized agents synthesize cross-department context and present a single proposal with explainable trade-offs.',
      icon: Sparkles,
    },
    {
      num: '02',
      title: 'Manager Review',
      desc: 'The Duty Manager inspects the recommendation, verifying guest profile, staff work loads, and maintenance timeframes.',
      icon: UserCheck,
    },
    {
      num: '03',
      title: 'Approve / Modify / Reject',
      desc: 'Managers have absolute authority. Approve in one click, alter staff assignments, or reject for manual handling.',
      icon: CheckCircle2,
    },
    {
      num: '04',
      title: 'Execution',
      desc: 'Only upon manager sign-off are discrete work orders automatically dispatched to field personnel devices.',
      icon: Zap,
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Human-in-the-Loop Governance
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            AI recommends. <br />
            <span className="text-primary">Managers decide.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Resort 360 is not replacing the manager. It gives the manager a better operational picture and a clear recommendation.
          </p>
        </div>

        {/* Minimal Trustworthy Decision Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-surface shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-primary">
                      {st.num}
                    </span>
                    <div className="p-2 rounded-lg bg-surface-secondary text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Step {idx + 1} of 4</span>
                  {idx < 3 && <ArrowRight className="w-3.5 h-3.5 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
