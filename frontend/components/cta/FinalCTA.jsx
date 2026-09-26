'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-slate-900 text-white">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-radial-gradient from-odoo-purple/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-purple-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Operational Intelligence for Modern Hospitality</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Ready to unite your resort operations?
        </h2>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Enable your hotel teams to coordinate when unexpected moments strike. Fast, explainable, and manager-approved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-odoo-purple hover:bg-odoo-purple-hover text-white font-bold text-sm shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
          >
            <span>Register Your Resort</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors"
          >
            <span>Sign In to Account</span>
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Human-in-the-Loop Governance • Seamless PMS Coexistence</span>
        </div>
      </div>
    </section>
  );
}
