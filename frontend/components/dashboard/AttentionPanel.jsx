'use client';

import React from 'react';
import { AlertCircle, BedDouble, Users, Flame } from 'lucide-react';

export default function AttentionPanel() {
  const pressureItems = [
    {
      level: 'HIGH ATTENTION',
      title: 'Room 401 AC Failure',
      desc: 'Capacitor burnt; 75-min engineering repair underway. VIP guest in lobby.',
      dept: 'Maintenance',
      levelBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      icon: Flame,
    },
    {
      level: 'MEDIUM ATTENTION',
      title: 'Room 105 Express Clean',
      desc: '2 attendants allocated for prioritized 25-minute room turnaround.',
      dept: 'Housekeeping',
      levelBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: BedDouble,
    },
    {
      level: 'GROUP ARRIVAL',
      title: 'Wedding Party (14 Guests)',
      desc: 'Expected arrival at 11:00 AM on floor 4. Penthouse block verified.',
      dept: 'Front Desk',
      levelBg: 'bg-primary/10 text-primary border-primary/20',
      icon: Users,
    },
  ];

  return (
    <div className="p-6 rounded-3xl border border-border bg-surface shadow-soft">
      <div className="flex items-center gap-2 pb-5 mb-5 border-b border-border/70">
        <AlertCircle className="w-4 h-4 text-primary" />
        <h2 className="text-base font-bold text-foreground tracking-tight">
          Operational Pressure
        </h2>
      </div>

      <div className="space-y-3">
        {pressureItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-border bg-surface-secondary/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${item.levelBg}`}>
                  {item.level}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {item.dept}
                </span>
              </div>

              <div className="text-xs font-bold text-foreground flex items-center gap-1.5 pt-1">
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{item.title}</span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* AI Swarm Entrypoint */}
      <div className="mt-5 pt-4 border-t border-border/70">
        <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Operations Panel
            </span>
            <span className="text-[10px] font-mono text-primary font-semibold">
              4 Agents Ready
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Multi-departmental reasoning engine ready to evaluate operational friction across Front Desk, Housekeeping, Maintenance, and Revenue.
          </p>
          <a
            href="/dashboard/agents"
            className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity gap-1.5"
          >
            <span>Open Agent Swarm</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
