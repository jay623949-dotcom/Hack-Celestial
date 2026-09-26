'use client';

import React from 'react';
import { Eye, Brain, Cpu, Share2, CheckSquare, Zap } from 'lucide-react';

export default function ProcessFlow() {
  const steps = [
    {
      num: '01',
      title: 'Detect',
      desc: 'Ingests telemetry from PMS, IoT hardware, and staff reports immediately.',
      icon: Eye,
    },
    {
      num: '02',
      title: 'Understand',
      desc: 'Builds comprehensive context: guest status, room readiness, technician load.',
      icon: Brain,
    },
    {
      num: '03',
      title: 'Reason',
      desc: 'Domain AI agents evaluate operational trade-offs and constraints in parallel.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Coordinate',
      desc: 'Synthesizes conflicting departmental needs into a single unified proposal.',
      icon: Share2,
    },
    {
      num: '05',
      title: 'Approve',
      desc: 'Duty Manager reviews explainable reasoning and authorizes the action plan.',
      icon: CheckSquare,
    },
    {
      num: '06',
      title: 'Execute',
      desc: 'Dispatches synchronized work orders directly to staff mobile devices in real time.',
      icon: Zap,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-surface-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            How Resort 360 Works
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            From scattered signals to one clear decision.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            A linear, transparent decision loop that transforms operational surprises into coordinated staff execution.
          </p>
        </div>

        {/* 6-Step Horizontal Product Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border bg-surface shadow-soft hover:border-primary/40 transition-colors flex flex-col justify-between relative group"
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

                <div className="mt-6 pt-3 border-t border-border/70 text-[10px] font-mono text-muted-foreground">
                  Stage {step.num} / 06
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
