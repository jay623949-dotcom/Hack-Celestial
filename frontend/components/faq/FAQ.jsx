'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Does Resort 360 replace our Property Management System (PMS)?',
      a: 'No. Resort 360 is not a PMS, booking engine, or billing system. It acts as an operational intelligence and coordination layer that connects PMS data, housekeeping status boards, and maintenance work logs into unified decisions.',
    },
    {
      q: 'How does the AI make recommendations across departments?',
      a: 'Four specialized domain agents (Front Desk, Housekeeping, Maintenance, Revenue) evaluate the operational context independently. A consensus engine synthesizes these viewpoints into one explainable plan that optimizes guest satisfaction while safeguarding resort revenue.',
    },
    {
      q: 'Can managers override the AI recommendations?',
      a: 'Yes, completely. Resort 360 operates under a strict Human-in-the-Loop paradigm. Managers can APPROVE with one click, MODIFY specific parameters (assignees, priorities, room choices), or REJECT the recommendation. The system never executes critical actions without manager approval.',
    },
    {
      q: 'What happens if an AI agent encounters an API timeout or failure?',
      a: 'Resort 360 features deterministic fail-safe defaults. If any AI agent fails to respond within latency budgets, the system alerts the Duty Manager and degrades gracefully to rule-based operational routing.',
    },
    {
      q: 'Does Resort 360 require new hotel hardware or sensors?',
      a: 'No specialized hardware is required. Resort 360 operates through standard web APIs, webhooks, and modern web interfaces on desktop, tablets, or mobile devices already used by your team.',
    },
    {
      q: 'Can it work with existing hotel systems?',
      a: 'Yes. Resort 360 is architected to ingest data from PMS webhooks, maintenance ticketing software, and housekeeping schedules through standard REST endpoints and WebSockets.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-surface-secondary/40 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Practical Questions
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Straightforward answers regarding integration, control, and operational boundaries.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-surface overflow-hidden shadow-soft transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-bold text-foreground text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/60">
                    <p className="mt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
