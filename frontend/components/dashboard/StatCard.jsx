'use client';

import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, badge, alert = false, loading = false }) {
  if (loading) {
    return (
      <div className="p-5 rounded-2xl border border-border bg-surface shadow-soft animate-pulse">
        <div className="h-3 w-20 bg-muted rounded mb-3" />
        <div className="h-8 w-16 bg-muted rounded mb-2" />
        <div className="h-3 w-28 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      alert
        ? 'border-rose-500/40 bg-rose-500/5 shadow-soft'
        : 'border-border bg-surface shadow-soft hover:border-primary/40'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${alert ? 'text-rose-500 bg-rose-500/10' : 'text-primary bg-primary/10'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
          {value}
        </span>
        {badge && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            alert
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
              : 'bg-primary/10 text-primary'
          }`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
