'use client';

import React from 'react';
import { CheckCircle2, Radio } from 'lucide-react';

export default function ExecutionTimeline() {
  const events = [
    {
      time: '14:02',
      title: 'Housekeeping assigned',
      desc: 'Housekeeping supervisor receives express turn-around task; Priya Sharma routed to Room 205.',
    },
    {
      time: '14:03',
      title: 'Room 205 preparation started',
      desc: 'Express cleaning protocol initiated with high-touch VIP inspection priority.',
    },
    {
      time: '14:04',
      title: 'Maintenance technician assigned',
      desc: 'Technician Rohan Mehta dispatched to Room 401 with replacement HVAC capacitor.',
    },
    {
      time: '14:05',
      title: 'Front Desk updated',
      desc: 'Guest profile tagged; VIP Arjun Mehta escorted by Amit Shah to Club Lounge with hospitality voucher.',
    },
    {
      time: '14:07',
      title: 'Room 205 ready',
      desc: 'Room 205 passes supervisor inspection checklist; digital key released to guest.',
    },
    {
      time: '14:10',
      title: 'Incident resolved',
      desc: 'Room 401 HVAC compressor repair verified; incident INC-401-AC marked resolved.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-surface-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            DECISION → EXECUTION
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Real-Time Execution
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            The moment the manager approves the action plan, Resort 360 immediately synchronizes staff teams across the property.
          </p>
        </div>

        {/* Beautiful Timeline Box */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-soft">
          {/* Header Status Bar */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                ACTION PLAN APPROVED
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Work Order Broadcast
            </span>
          </div>

          {/* Timeline Nodes */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border before:z-0">
            {events.map((evt, idx) => (
              <div key={idx} className="relative z-10 flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>

                <div className="flex-1 p-3.5 rounded-xl border border-border bg-surface-secondary/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-foreground">
                      {evt.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">
                      {evt.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {evt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
