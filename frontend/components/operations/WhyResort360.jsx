'use client';

import React from 'react';
import { Layers, Bot, UserCheck, Zap } from 'lucide-react';

export default function WhyResort360() {
  const principles = [
    {
      icon: Layers,
      title: 'ONE OPERATIONAL CONTEXT',
      desc: 'Bring fragmented information together. Connects guest profiles, room cleanliness, repair work orders, and revenue constraints into a single operational graph.',
    },
    {
      icon: Bot,
      title: 'MULTI-AGENT REASONING',
      desc: 'Understand the situation from multiple departments simultaneously. Domain agents debate trade-offs before formulating recommendations.',
    },
    {
      icon: UserCheck,
      title: 'HUMAN CONTROL',
      desc: 'Managers remain fully responsible for important decisions. AI provides decision intelligence; humans authorize and execute.',
    },
    {
      icon: Zap,
      title: 'REAL-TIME EXECUTION',
      desc: 'Turn decisions into coordinated tasks instantly. Work orders dispatch to mobile staff with bi-directional status synchronization.',
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Core Principles
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Why Resort 360?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Four foundational pillars built to eliminate departmental friction in resort operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-surface shadow-soft hover:shadow-soft-lg hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm tracking-wider text-foreground mb-2 font-mono uppercase">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
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
