'use client';

import React from 'react';
import { ArrowDown, Users, BedDouble, Wrench, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function ProblemSection() {
  const streams = [
    {
      department: 'Front Desk',
      knows: 'knows the guest',
      detail: 'Alexander Vance (Diamond VIP) checked in early at lobby. Needs fast accommodation.',
      icon: Users,
    },
    {
      department: 'Housekeeping',
      knows: 'knows the rooms',
      detail: 'Suite 505 vacated at 10:15 AM; 2 attendants can turn it in 25 mins express.',
      icon: BedDouble,
    },
    {
      department: 'Maintenance',
      knows: 'knows the equipment',
      detail: 'Room 401 HVAC compressor broken; requires 75m repair time and replacement capacitor.',
      icon: Wrench,
    },
    {
      department: 'Revenue',
      knows: 'knows the inventory',
      detail: '2:00 PM wedding group reserved rooms on 4th floor; Suite 505 is unreserved until tomorrow.',
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Headline */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block mb-3">
            The Fundamental Challenge
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Your resort already has the information. <br />
            <span className="text-muted-foreground font-semibold">
              The problem is connecting it.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Front Desk knows the guest. Housekeeping knows the rooms. Maintenance knows the equipment. Revenue knows the inventory. <br className="hidden sm:inline" />
            <strong className="text-foreground">But no single operational view connects the situation.</strong>
          </p>
        </div>

        {/* Visual Composition: Four Information Streams Converging */}
        <div className="relative">
          {/* 4 Streams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {streams.map((stream, idx) => {
              const Icon = stream.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-border bg-surface shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="p-2 rounded-lg bg-surface-secondary text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {stream.department}
                        </div>
                        <div className="text-[11px] font-mono text-primary font-semibold">
                          {stream.knows}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {stream.detail}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/70 text-[10px] font-mono text-muted-foreground">
                    Siloed stream #{idx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Converging Indicator */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
              <span>Information Streams Converge</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          {/* Unified Destination: RESORT 360 ONE OPERATIONAL PICTURE */}
          <div className="p-6 sm:p-8 rounded-2xl border border-primary/40 bg-primary-light shadow-soft text-center max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary block mb-1">
              Unified Coordination Layer
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              RESORT 360 — ONE OPERATIONAL PICTURE
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Synthesizes real-time status across all four operational silos into an aligned, coherent situational graph in under 90 seconds.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full cross-department context established</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
