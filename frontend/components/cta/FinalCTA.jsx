'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-primary-light border-y border-primary/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Operational Intelligence for Modern Hospitality</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight max-w-3xl mx-auto leading-tight">
          Your resort already has the information. <br />
          <span className="text-primary">Now give it the intelligence to act.</span>
        </h2>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Enable your hotel departments to coordinate when unexpected incidents strike. Fast, explainable, and manager-approved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#command-center"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm shadow-soft transition-all duration-150"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#operations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-foreground font-semibold text-xs sm:text-sm transition-colors"
          >
            <span>Explore Operations</span>
          </a>
        </div>
      </div>
    </section>
  );
}
