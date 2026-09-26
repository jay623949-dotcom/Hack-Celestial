'use client';

import React from 'react';
import { Users, BedDouble, Wrench, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function AgentSection() {
  const agents = [
    {
      num: '01',
      title: 'Front Desk AI Agent',
      domain: 'Guest Relations & CSAT',
      icon: Users,
      scope: [
        'Guest profile & VIP loyalty tier',
        'Early arrival & delay tolerance',
        'Room allocation & key coordination',
        'Service recovery & lounge hospitality',
      ],
      preview: 'Escort Diamond VIP Vance to Executive Lounge immediately; serve welcome drinks while room is prepared.',
    },
    {
      num: '02',
      title: 'Housekeeping AI Agent',
      domain: 'Turnover & Room Hygiene',
      icon: BedDouble,
      scope: [
        'Live room status (Clean, Dirty, Inspected)',
        'Attendant workload & floor assignment',
        'Accurate preparation ETAs',
        'Priority turn-around dispatch',
      ],
      preview: 'Reassign 2 attendants from 3rd floor to Suite 505 for a 25-minute priority express clean.',
    },
    {
      num: '03',
      title: 'Maintenance AI Agent',
      domain: 'Engineering & Equipment',
      icon: Wrench,
      scope: [
        'HVAC, plumbing & electrical breakdown',
        'Technician availability & parts stock',
        'Safety compliance & habitability',
        'Accurate repair duration estimation',
      ],
      preview: 'Suite 401 AC requires capacitor replacement (75m ETA). Take offline; dispatch Tech Bob.',
    },
    {
      num: '04',
      title: 'Revenue AI Agent',
      domain: 'Yield & Inventory Protection',
      icon: TrendingUp,
      scope: [
        'Room category rate differential',
        'Upcoming group & wedding block locks',
        'Inventory displacement calculations',
        'Cost of upgrade vs compensation',
      ],
      preview: 'Suite 505 is unreserved until tomorrow afternoon. $0 revenue cannibalization. Protects floor 4 wedding block.',
    },
  ];

  return (
    <section id="agents" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
            Specialized Departmental Intelligence
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Four AI Agents. <br />
            <span className="text-primary">One Coordinated Mindset.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Not generic conversational chatbots. These are dedicated domain modules that advocate for their department’s real-world operational constraints.
          </p>
        </div>

        {/* 4 Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-surface shadow-soft hover:shadow-soft-lg hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {agent.num}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-tight">
                        {agent.title}
                      </h3>
                      <span className="text-xs text-muted-foreground font-medium">
                        {agent.domain}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block font-mono">
                      Domain Responsibilities
                    </span>
                    <ul className="space-y-1.5 text-xs text-foreground/85">
                      {agent.scope.map((item, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono block mb-1">
                    Sample Recommendation
                  </span>
                  <p className="text-xs text-muted-foreground italic leading-relaxed bg-surface-secondary/70 p-2.5 rounded-lg border border-border/60">
                    &ldquo;{agent.preview}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
