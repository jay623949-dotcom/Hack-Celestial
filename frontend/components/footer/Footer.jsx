'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                360
              </div>
              <span className="font-bold text-foreground text-base tracking-tight">
                RESORT <span className="text-primary font-black">360</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              AI-Powered Resort Operations. Bringing context, multi-agent reasoning, and manager approval together into one calm operational layer.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#overview" className="hover:text-primary transition-colors">Overview</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#agents" className="hover:text-primary transition-colors">AI Agents</a></li>
              <li><a href="#operations" className="hover:text-primary transition-colors">Operations</a></li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><span className="hover:text-foreground cursor-pointer">About</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Contact</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Documentation</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Architecture</span></li>
            </ul>
          </div>

          {/* Authentication */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Authentication
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/sign-in" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RESORT 360. All rights reserved.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Next.js 14</span>
            <span>Pure JavaScript</span>
            <span>Hospitality Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
