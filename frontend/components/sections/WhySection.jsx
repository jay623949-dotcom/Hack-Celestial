'use client';

import React from 'react';
import { Layers, Bot, UserCheck, Zap } from 'lucide-react';

export default function WhySection() {
  const differentiators = [
    {
      icon: Layers,
      title: 'ONE OPERATIONAL PICTURE',
      desc: 'Connect information across departments. No more blind spots between Front Desk, Housekeeping, Maintenance, and Revenue.',
    },
    {
      icon: Bot,
      title: 'MULTI-AGENT REASONING',
      desc: 'Get multiple operational perspectives. Specialized agents weigh guest satisfaction, turnover speed, and revenue impact simultaneously.',
    },
    {
      icon: UserCheck,
      title: 'HUMAN CONTROL',
      desc: 'Managers remain in control. AI calculates and proposes; leadership reviews and authorizes every single action plan.',
    },
    {
      icon: Zap,
      title: 'REAL-TIME EXECUTION',
      desc: 'Turn decisions into coordinated tasks. Work orders dispatch automatically to field staff devices upon approval.',
    },
  ];

  return (
    <section id="why" className="py-20 md:py-28 bg-surface-secondary/40 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block mb-3">
            Core Differentiators
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Why Resort 360
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            The only platform designed from the ground up to solve the cross-departmental coordination bottleneck in hospitality.
          </p>
        </div>

        {/* 4 Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((diff, idx) => {
            const Icon = diff.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-surface shadow-soft hover:shadow-soft-lg hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xs tracking-wider uppercase font-mono text-foreground mb-2">
                    {diff.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {diff.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
