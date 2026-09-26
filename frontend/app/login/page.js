'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRole, DEMO_ROLES } from '../../lib/roleContext';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [email, setEmail] = useState('manager@atria.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const routes = {
      admin: '/dashboard',
      front_desk: '/dashboard/frontdesk',
      housekeeping: '/dashboard/housekeeping',
      maintenance: '/dashboard/maintenance',
      revenue: '/dashboard/revenue-mgr',
    };

    setTimeout(() => {
      setRole(selectedRole);
      router.push(routes[selectedRole] || '/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-background flex flex-col items-center justify-center p-4 py-8 selection:bg-odoo-purple/20 selection:text-odoo-purple">
      {/* Centered Crisp Pure White Login Card */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-odoo-hover border border-border space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Center Logo & Title */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <img
            src="/atria_logo.jpg"
            alt="Atria Intelligence Logo"
            className="h-16 w-auto object-contain rounded-xl shadow-sm hover:scale-105 transition-transform duration-200"
          />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Atria <span className="text-odoo-purple">intelligence</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Enterprise Resort Operations &amp; Swarm Intelligence
            </p>
          </div>
        </div>

        {/* Minimalist Odoo Style Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Odoo Form Input 1: Email */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-foreground uppercase font-mono tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@atria.ai"
                className="w-full bg-transparent border-b-2 border-gray-200 focus:border-odoo-purple focus:outline-none py-2.5 text-base text-foreground font-medium transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Odoo Form Input 2: Password */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase font-mono tracking-wider block">
                Password
              </label>
              <a href="#reset" className="text-xs text-odoo-purple hover:underline font-semibold">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-gray-200 focus:border-odoo-purple focus:outline-none py-2.5 text-base text-foreground font-medium transition-colors"
              />
            </div>
          </div>

          {/* Demo Role Selector Pills */}
          <div className="space-y-2 pt-1 text-left">
            <label className="text-xs font-bold text-foreground uppercase font-mono tracking-wider block">
              Select Demo Persona
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(DEMO_ROLES).slice(0, 4).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r.id);
                    setEmail(r.email);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedRole === r.id
                      ? 'bg-odoo-purple/10 border-odoo-purple text-odoo-purple shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="truncate font-bold">{r.shortLabel}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">{r.dept}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Playful Marker Accent Text floating near button */}
          <div className="text-center pt-1">
            <span className="font-caveat font-accent text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 block">
              ⚡ Instant Single Sign-On for Operations Managers
            </span>
          </div>

          {/* Primary Full-Width Odoo Teal Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-odoo-purple hover:bg-odoo-purple/90 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Log in to Atria OS</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Card Footer Security Badge */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
          <ShieldCheck className="w-4 h-4 text-odoo-purple" />
          <span>Atria Intelligence Enterprise Auth v2.4</span>
        </div>
      </div>
    </div>
  );
}
