'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BedDouble, Users, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AttentionPanel() {
  const router = useRouter();
  const [actionNotice, setActionNotice] = useState(null);

  const pressureItems = [
    {
      level: 'HIGH ATTENTION',
      title: 'Room 401 AC Failure',
      desc: 'Capacitor burnt; 75-min engineering repair underway. VIP guest in lobby.',
      dept: 'Maintenance',
      levelBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      icon: Flame,
      action: () => router.push('/dashboard/agents?tab=consensus'),
      actionLabel: 'Triage with Swarm →',
    },
    {
      level: 'MEDIUM ATTENTION',
      title: 'Room 105 Express Clean',
      desc: '2 attendants allocated for prioritized 25-minute room turnaround.',
      dept: 'Housekeeping',
      levelBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: BedDouble,
      action: () => {
        setActionNotice('Express clean prioritized for Room 105 attendants.');
        setTimeout(() => setActionNotice(null), 3000);
      },
      actionLabel: 'Dispatch Attendants →',
    },
    {
      level: 'GROUP ARRIVAL',
      title: 'Wedding Party (14 Guests)',
      desc: 'Expected arrival at 11:00 AM on floor 4. Penthouse block verified.',
      dept: 'Front Desk',
      levelBg: 'bg-primary/10 text-primary border-primary/20',
      icon: Users,
      action: () => router.push('/dashboard/guests'),
      actionLabel: 'View Group Roster →',
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface shadow-soft p-4">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border">
        <AlertCircle className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground tracking-tight">
          Operational Watchlist
        </h2>
      </div>

      {actionNotice && (
        <div className="mb-3 p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-lg flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="space-y-2">
        {pressureItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={item.action}
              className="p-3 rounded-lg border border-border bg-surface-secondary/40 hover:bg-slate-50 space-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${item.levelBg}`}>
                  {item.level}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  <span>{item.actionLabel}</span>
                </span>
              </div>

              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 pt-0.5 group-hover:text-primary transition-colors">
                <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{item.title}</span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Operational Intelligence Link */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="p-3 rounded-lg bg-surface-secondary/60 border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Operational Intelligence
            </span>
            <span className="text-[10px] font-mono text-primary font-bold">
              4 Agents
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Multi-departmental reasoning across Front Desk, Housekeeping, Maintenance, and Revenue.
          </p>
          <button
            onClick={() => router.push('/dashboard/agents')}
            className="inline-flex items-center justify-center w-full py-2 px-3 rounded-lg bg-primary hover:bg-teal-700 text-white font-semibold text-xs transition-colors gap-1.5"
          >
            <span>Open Departmental Agents</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
