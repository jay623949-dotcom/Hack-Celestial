'use client';

import React from 'react';
import { CheckCircle2, Radio } from 'lucide-react';

export default function LiveExecution() {
  const events = [
    {
      time: '10:42 AM',
      title: 'Room 505 preparation started',
      desc: 'Housekeeping supervisor receives express turn-around work order with 2 attendants.',
    },
    {
      time: '10:43 AM',
      title: 'Housekeeping assigned',
      desc: 'Attendants Maria Santos and Elena Gomez accept priority cleaning route.',
    },
    {
      time: '10:44 AM',
      title: 'Maintenance technician assigned to Room 401',
      desc: 'Technician Bob Miller dispatched with replacement HVAC capacitor.',
    },
    {
      time: '10:45 AM',
      title: 'Front Desk updated',
      desc: 'Guest folio updated; VIP Vance escorted to Executive Lounge with beverage voucher.',
    },
    {
      time: '10:46 AM',
      title: 'Guest notification triggered',
      desc: 'Automated greeting message delivered to guest device with lounge access pass.',
    },
    {
      time: '10:48 AM',
      title: 'Room 505 ready',
      desc: 'Supervisory inspection verified; key packets released to Front Desk for check-in.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-surface-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Operational Execution
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Decision → Real-Time Execution
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Upon manager approval, Resort 360 immediately turns strategic consensus into discrete work orders, synchronizing staff devices and telemetry boards in real time.
          </p>
        </div>

        {/* Clean Timeline Card */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-soft">
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Action Plan Approved: Telemetry Feed
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Sync Latency: 12ms</span>
          </div>

          <div className="space-y-5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border before:z-0">
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
                    <span className="text-xs font-mono text-muted-foreground">
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
