'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ShieldCheck, Users, BedDouble, Wrench, TrendingUp,
  LayoutDashboard, ChevronRight, Sparkles
} from 'lucide-react';
import { useRole, DEMO_ROLES } from '../../lib/roleContext';

const ROLE_ICONS = {
  admin: LayoutDashboard,
  front_desk: Users,
  housekeeping: BedDouble,
  maintenance: Wrench,
  revenue: TrendingUp,
};

const ROLE_ROUTES = {
  admin: '/dashboard',
  front_desk: '/dashboard/frontdesk',
  housekeeping: '/dashboard/housekeeping',
  maintenance: '/dashboard/maintenance',
  revenue: '/dashboard/revenue-mgr',
};

const ROLE_ORDER = ['admin', 'front_desk', 'housekeeping', 'maintenance', 'revenue'];

export default function SignInPage() {
  const router = useRouter();
  const { setRole } = useRole();

  const enterDemo = (roleId) => {
    setRole(roleId);
    router.push(ROLE_ROUTES[roleId]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/70 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Resort 360</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">JUDGE DEMONSTRATION MODE</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold font-mono">DEMO</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-4">
            360
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Resort 360 — Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Azure Bay Resort &amp; Spa · Goa, India
          </p>
        </div>

        {/* Demo Access Section */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Demo Access</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Explore Resort 360 from different operational perspectives. No credentials required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLE_ORDER.map((roleId) => {
              const role = DEMO_ROLES[roleId];
              const Icon = ROLE_ICONS[roleId];
              return (
                <div
                  key={roleId}
                  className="flex flex-col rounded-xl border border-border bg-surface hover:bg-surface-secondary hover:border-primary/30 transition-all p-4 group"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${role.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground leading-tight">{role.label}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{role.dept}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed flex-1 mb-3">
                    {role.desc}
                  </p>
                  <button
                    onClick={() => enterDemo(roleId)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-colors group-hover:shadow-sm"
                  >
                    Enter Demo
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Judge scenario hint */}
          <div className="mt-5 p-3 rounded-lg bg-primary/5 border border-primary/15">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary mb-1">Recommended Demo Path</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Start as <strong className="text-foreground">Resort Admin</strong> → see the VIP arrival scenario → 
              switch to department roles → return to Admin → run AI Intelligence → open Operational Consensus.
            </p>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Demo access is isolated. No production credentials required.</span>
        </div>
      </main>
    </div>
  );
}