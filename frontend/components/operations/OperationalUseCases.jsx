'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function OperationalUseCases() {
  const cases = [
    {
      title: 'VIP Early Arrival',
      situation: 'Diamond guest arrives 2 hours before standard check-in during high occupancy.',
      response: 'Front Desk flags tier; Housekeeping routes express clean on Suite 304; guest escorted to pool terrace with beverage credit.',
    },
    {
      title: 'Maintenance Emergency',
      situation: 'Water valve pressure failure on 4th floor impacting 6 guest suites at 11:30 AM.',
      response: 'Engineering issues 4h repair ETA; system locks affected suites and reallocates evening check-ins to Building B before arrival.',
    },
    {
      title: 'Housekeeping Bottleneck',
      situation: '20 simultaneous checkouts occur at 11:00 AM with limited turn-around staff.',
      response: 'Revenue AI identifies arrival timestamps; Housekeeping creates prioritized turn schedule ensuring zero guest check-in waits.',
    },
    {
      title: 'Large Group / Wedding Arrival',
      situation: 'A 50-room wedding group arrives while 4 assigned suites are pending inspection.',
      response: 'System locks surrounding inventory; Front Desk delivers bulk digital keys and routes luggage to hospitality salon.',
    },
    {
      title: 'Overbooking Mitigation',
      situation: 'High walk-in demand creates sudden category deficit in Deluxe Ocean suites.',
      response: 'Revenue AI evaluates complimentary upgrades to unreserved Premium Villas, protecting booked revenue and delighting loyalty guests.',
    },
    {
      title: 'Guest Noise / Room Complaint',
      situation: 'Guest in Suite 208 logs recurring exterior compressor noise disturbance at night.',
      response: 'Maintenance logs compressor fault; Front Desk triggers quiet-wing room swap and delivers personal apology amenity.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-surface-secondary/40 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Hospitality Scenarios
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Operational Use Cases
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Realistic scenarios demonstrating how multi-agent coordination resolves high-friction moments in resort management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-border bg-surface shadow-soft hover:shadow-soft-lg hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base text-foreground">
                    {item.title}
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Case {idx + 1}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border/80">
                    <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                      Situation
                    </span>
                    <span className="text-muted-foreground leading-relaxed">
                      {item.situation}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-primary-light border border-primary/20">
                    <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-primary block mb-1">
                      Resort 360 Coordinated Response
                    </span>
                    <span className="text-foreground leading-relaxed font-medium">
                      {item.response}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
