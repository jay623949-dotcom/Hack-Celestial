'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, Building2, User } from 'lucide-react';
import ThemeToggle from '../../components/ui/ThemeToggle';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Minimal Header */}
      <header className="border-b border-border/70 bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg p-8 rounded-3xl border border-border bg-surface shadow-elevated">
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-3">
              360
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Register Your Property
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              Set up Resort 360 operational intelligence for your resort or hotel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Elena Rostova"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary/70 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Resort / Hotel Property Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="The Grand Azure Bay Resort & Villas"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary/70 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Corporate Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="director.ops@grandazure.resort"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary/70 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shadow-soft transition-all duration-150"
              >
                Create Account & Request Command Center Access
              </Link>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-5 border-t border-border flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Multi-Department Operations Platform</span>
          </div>
        </div>
      </main>
    </div>
  );
}
