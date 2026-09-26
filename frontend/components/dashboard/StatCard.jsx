'use client';

import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, badge, alert = false, loading = false }) {
  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface shadow-soft animate-pulse">
        <div className="h-2.5 w-16 bg-muted rounded mb-2" />
        <div className="h-6 w-12 bg-muted rounded mb-1.5" />
        <div className="h-2.5 w-24 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      alert
        ? 'border-rose-300 bg-rose-50/40 shadow-soft'
        : 'border-border bg-surface shadow-soft hover:border-slate-300'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <div className={`p-1 rounded-md ${alert ? 'text-rose-600 bg-rose-100' : 'text-primary bg-primary/10'}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
          {value}
        </span>
        {badge && (
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
            alert
              ? 'bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-[11px] text-muted-foreground mt-1">
          {subtext}
        </div>
      )}
    </div>
  );
}
