'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  BedDouble,
  Users,
  Wrench,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
} from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="relative py-28 md:py-40 bg-background overflow-hidden border-t border-border">
      {/* =====================================================================
          SECTION 6: VISUAL DEPARTMENT FIELD (Background Operational Elements)
          Inspired by Reference 3: Playful, scattered ambient operational cards
          ===================================================================== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-60 sm:opacity-85">
        {/* Top-Left Ambient Card: VIP Arrival */}
        <div className="hidden lg:flex absolute top-12 left-8 xl:left-16 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-border shadow-xs rotate-[-3deg] hover:rotate-0 transition-transform">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-amber-600">VIP Arrival</div>
            <div className="text-xs font-semibold text-slate-800">Arjun Mehta • 14:00</div>
          </div>
        </div>

        {/* Top-Right Ambient Card: Room 401 Incident */}
        <div className="hidden lg:flex absolute top-16 right-8 xl:right-20 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-rose-200 shadow-xs rotate-[4deg]">
          <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-rose-600">Incident #401</div>
            <div className="text-xs font-semibold text-slate-800">AC Compressor Tripped</div>
          </div>
        </div>

        {/* Mid-Left Ambient Pill: Housekeeping Ready */}
        <div className="hidden xl:flex absolute top-1/2 -translate-y-24 left-6 items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rotate-[2deg] shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Room 205 • Deluxe Clean &amp; Ready</span>
        </div>

        {/* Mid-Right Ambient Pill: Maintenance Dispatched */}
        <div className="hidden xl:flex absolute top-1/2 -translate-y-20 right-6 items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rotate-[-2deg] shadow-2xs">
          <Wrench className="w-3.5 h-3.5 text-blue-600" />
          <span>Rohan Mehta • HVAC Capacitor Dispatched</span>
        </div>

        {/* Bottom-Left Ambient Card: Revenue Protection */}
        <div className="hidden lg:flex absolute bottom-16 left-12 xl:left-24 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-border shadow-xs rotate-[3deg]">
          <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-purple-700">82% Occupancy</div>
            <div className="text-xs font-semibold text-slate-800">ADR Parity Protected</div>
          </div>
        </div>

        {/* Bottom-Right Ambient Pill: Manager Decision */}
        <div className="hidden lg:flex absolute bottom-20 right-10 xl:right-28 items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-border shadow-xs rotate-[-3deg]">
          <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-mono text-xs font-bold">
            ✓
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-purple-700">Action Plan</div>
            <div className="text-xs font-semibold text-slate-800">Approved by Duty Manager</div>
          </div>
        </div>

        {/* Decorative soft pastel shapes (Inspired by Reference 3 grid of soft shapes) */}
        <div className="hidden md:block absolute top-8 left-1/4 w-12 h-12 rounded-2xl bg-slate-200/50 rotate-12" />
        <div className="hidden md:block absolute top-28 right-1/4 w-10 h-10 rounded-full bg-purple-100/40" />
        <div className="hidden md:block absolute bottom-12 left-1/3 w-14 h-14 rounded-3xl bg-amber-100/40 -rotate-6" />
        <div className="hidden md:block absolute bottom-28 right-1/3 w-11 h-11 rounded-2xl bg-purple-100/40 rotate-45" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* =====================================================================
            SECTION 1: MASSIVE FINAL EDITORIAL STATEMENT
            Inspired by References 1 & 2: Huge handwritten headline + marker highlight + burst
            ===================================================================== */}
        
        {/* Hand-Drawn Sunburst / Rays Doodle above headline (Inspired by Reference 2) */}
        <div className="flex justify-center mb-3">
          <svg className="w-16 h-8 text-amber-500 overflow-visible" viewBox="0 0 64 32" fill="none" stroke="currentColor">
            <path d="M 32,24 L 32,4" strokeWidth="3" strokeLinecap="round" />
            <path d="M 22,25 L 10,12" strokeWidth="3" strokeLinecap="round" />
            <path d="M 42,25 L 54,12" strokeWidth="3" strokeLinecap="round" />
            <path d="M 14,28 L 2,24" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 50,28 L 62,24" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Massive Editorial Headline */}
        <div className="space-y-2 sm:space-y-3">
          <p className="font-caveat font-accent text-3xl sm:text-5xl lg:text-6xl text-slate-800 font-bold tracking-tight">
            Your resort already has the people. The data. The systems.
          </p>

          <h2 className="font-caveat font-accent text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-slate-900 font-bold tracking-tight leading-[1.12] pt-1">
            What it needs is{' '}
            <span className="relative inline-block px-3 py-1 whitespace-nowrap">
              {/* Hand-Drawn Marker Highlight Shape (Inspired by Reference 1 & 3) */}
              <span
                className="absolute inset-0 -skew-y-1 bg-amber-300/80 rounded-xl -z-10 shadow-xs transform scale-105"
                style={{
                  clipPath: 'polygon(1% 8%, 99% 2%, 98% 92%, 2% 98%)',
                }}
              />
              <span className="relative text-slate-950 font-black">one operational picture.</span>

              {/* Hand-Drawn Marker Underline */}
              <svg
                className="absolute -bottom-3 sm:-bottom-4 left-0 w-full h-5 text-odoo-purple overflow-visible pointer-events-none"
                viewBox="0 0 300 24"
                fill="none"
              >
                <path
                  d="M 5,16 Q 80,4 160,14 T 295,12"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Small Handwritten Note pointing up (Inspired by Reference 3 "^ happy") */}
              <span className="hidden sm:inline-block absolute -top-8 -right-8 lg:-right-12 font-caveat font-accent text-lg sm:text-xl font-bold text-amber-600 rotate-12">
                ^ in real time
              </span>
            </span>
          </h2>
        </div>

        {/* =====================================================================
            SECTION 2: CONCISE BUSINESS MESSAGE
            Maximum 2-3 lines of clear, modern sans-serif
            ===================================================================== */}
        <p className="mt-8 sm:mt-10 text-base sm:text-lg lg:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
          Resort 360 connects the people, rooms, incidents and decisions behind every guest experience — so your team can respond as one.
        </p>

        {/* =====================================================================
            SECTION 3 & 4: FINAL CTA & HUMAN HAND-DRAWN ANNOTATION
            Inspired by Reference 1 & 2: Dominant CTA + Hand-drawn arrow & note
            ===================================================================== */}
        <div className="relative mt-10 sm:mt-12 inline-block">
          {/* Handwritten Annotation & Hand-Drawn Arrow (Inspired by Reference 1 & 2) */}
          <div className="hidden sm:flex absolute -left-36 lg:-left-44 top-1/2 -translate-y-1/2 items-center gap-2 pointer-events-none">
            <span className="font-caveat font-accent text-xl lg:text-2xl font-bold text-odoo-purple rotate-[-8deg] whitespace-nowrap">
              Start here →
            </span>
            <svg
              className="w-14 h-10 text-odoo-purple -rotate-6 overflow-visible"
              viewBox="0 0 60 40"
              fill="none"
            >
              <path
                d="M 6,24 Q 28,6 48,18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <polyline
                points="38,12 49,18 42,26"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Two-Button CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-odoo-purple hover:bg-odoo-purple-hover text-white font-bold text-sm sm:text-base shadow-soft hover:shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
            >
              <span>Register Your Resort</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base transition-colors"
            >
              <span>Sign In to Account</span>
            </Link>
          </div>

          {/* Small Supporting Micro-Text Beneath CTA (Inspired by Reference 2) */}
          <p className="mt-3 text-xs text-muted-foreground font-medium">
            Built for modern resort operations • No complex onboarding required
          </p>
        </div>

        {/* =====================================================================
            SECTION 5: SOCIAL PROOF & TRUST (Truthful Hospitality Alignment)
            ===================================================================== */}
        <div className="mt-20 pt-10 border-t border-slate-200/80 max-w-3xl mx-auto">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Built around the way hotel teams actually work
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/70 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              FRONT DESK
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/70 flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-purple-600" />
              HOUSEKEEPING
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/70 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-orange-600" />
              MAINTENANCE
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/70 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              REVENUE
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/70 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-odoo-purple" />
              DUTY MANAGERS
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
