'use client';

import React from 'react';
import { Bot, Radio, AlertOctagon, Layers } from 'lucide-react';

export default function OperationalStrip() {
  const metrics = [
    {
      label: 'AI Departments',
      value: '04',
      detail: 'FD, HK, Eng, Rev',
      icon: Bot,
    },
    {
      label: 'Operational Signals',
      value: '24',
      detail: 'Real-time telemetry stream',
      icon: Radio,
    },
    {
      label: 'Active Incidents',
      value: '03',
      detail: 'Zero uncoordinated escalations',
      icon: AlertOctagon,
    },
    {
      label: 'Coordinated Action Plan',
      value: '01',
      detail: 'Unified manager review',
      icon: Layers,
    },
  ];

  return (
    <div className="border-y border-border bg-surface-secondary/40 py-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-surface shadow-soft flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider block">
                    {item.label}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono mt-0.5">
                    {item.value}
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    {item.detail}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-secondary text-primary border border-border/80">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
