'use client';

import React from 'react';

export default function UseCasesGrid() {
  const cases = [
    {
      title: 'VIP Early Arrival',
      desc: 'Reassigns available inspected suites, coordinates lounge recovery, and schedules express turnover without guest wait.',
    },
    {
      title: 'Maintenance Emergency',
      desc: 'Evaluates repair duration, parts availability, and takes room offline while re-accommodating inbound guests proactively.',
    },
    {
      title: 'Housekeeping Bottleneck',
      desc: 'Dynamically shifts attendants across floors based on live guest arrival ETAs rather than static room numbers.',
    },
    {
      title: 'Large Group Arrival',
      desc: 'Protects room blocks, routes baggage logistics, and verifies block readiness ahead of peak check-in surges.',
    },
    {
      title: 'Guest Complaint',
      desc: 'Instantly surfaces service recovery actions, room relocations, and guest profile history for executive resolution.',
    },
    {
      title: 'Overbooking',
      desc: 'Recommends high-confidence complimentary upgrades from unreserved inventory with zero revenue displacement.',
    },
  ];

  return (
    <section id="operations" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block mb-3">
            Real-World Scenarios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Built for the unexpected reality <br />
            <span className="text-muted-foreground font-semibold">of daily resort operations.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            From sudden AC failures during peak season to 50-room wedding blocks, Resort 360 handles high-friction operational moments with calm coordination.
          </p>
        </div>

        {/* Editorial Grid (Not oversized cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((cs, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-border bg-surface shadow-soft hover:border-primary/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base text-foreground">
                    {cs.title}
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    0{idx + 1}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {cs.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/70 text-[11px] font-mono text-primary font-medium">
                Resolved in &lt; 90 seconds
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
