'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const DEPARTMENTS = [
  'Housekeeping & Turndown',
  'Front Desk & VIP Arrivals',
  'HVAC & Maintenance',
  'Yield & Revenue AI',
  'Live Incident Resolution',
  'Staff Duty Rosters',
];

export default function OdooHero() {
  const [deptIndex, setDeptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = DEPARTMENTS[deptIndex];
    const speed = isDeleting ? 30 : 70;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
        if (displayedText === fullText) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayedText(fullText.substring(0, displayedText.length - 1));
        if (displayedText === '') {
          setIsDeleting(false);
          setDeptIndex((prev) => (prev + 1) % DEPARTMENTS.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, deptIndex]);

  return (
    <section className="pt-12 pb-10 md:pt-16 md:pb-14 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Micro Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-odoo-purple/30 bg-odoo-purple/10 text-odoo-purple text-xs font-semibold tracking-wide mb-6">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          <span>AI-Powered Resort Operations Platform</span>
        </div>

        {/* Hero Headline with SVG Marker Scribble Underline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
          Turn Resort Complexity Into{' '}
          <span className="relative inline-block px-1">
            <span className="relative z-10 text-odoo-purple">Coordinated Intelligence</span>
            {/* SVG Marker Scribble Underline */}
            <svg
              className="absolute -bottom-3 left-0 w-full h-5 text-odoo-purple overflow-visible pointer-events-none"
              viewBox="0 0 300 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 16C60 6 180 20 294 10M12 20C90 11 210 17 284 14"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </h1>

        {/* Animated Typing Text */}
        <div className="mt-8 text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto h-12 flex items-center justify-center">
          <span>Manage your... </span>
          <span className="font-caveat font-accent text-2xl sm:text-3xl font-bold ml-2 underline decoration-dashed decoration-odoo-purple/40 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 inline-block">
            {displayedText}
          </span>
          <span className="w-0.5 h-6 bg-odoo-purple ml-1 animate-pulse" />
        </div>

        {/* Subtext description */}
        <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Resort 360 connects Front Desk, Housekeeping, Maintenance, and Revenue into one real-time multi-agent swarm with human-in-the-loop governance.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-odoo-purple hover:bg-odoo-purple-hover text-white font-semibold text-base shadow-odoo hover:shadow-odoo-hover transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>Register Your Resort</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold text-base shadow-xs hover:shadow-sm transition-all duration-200"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
