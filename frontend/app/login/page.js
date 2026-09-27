'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Lock, Mail, Sparkles, CheckCircle2, Users, BedDouble, Wrench, TrendingUp, Shield } from 'lucide-react';
import { useRole, DEMO_ROLES } from '../../lib/roleContext';

const ROLE_ICONS = {
  admin: Shield,
  front_desk: Users,
  housekeeping: BedDouble,
  maintenance: Wrench,
  revenue: TrendingUp,
};

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [email, setEmail] = useState('admin@resort360.demo');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = (roleId) => {
    const activeRole = roleId || selectedRole || 'admin';
    setIsLoading(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('resort360_demo_role', activeRole);
      }
      setRole(activeRole);
    } catch (_) {}

    const routes = {
      admin: '/dashboard',
      front_desk: '/dashboard',
      housekeeping: '/dashboard',
      maintenance: '/dashboard',
      revenue: '/dashboard',
    };

    const target = routes[activeRole] || '/dashboard';
    
    // Immediate and reliable redirect
    window.location.href = target;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(selectedRole);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 relative flex flex-col items-center justify-center p-4 py-8 selection:bg-[#714B67]/20 selection:text-[#714B67] overflow-hidden">
      {/* Ambient Deep Plum Purple Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#714B67]/15 via-[#714B67]/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#714B67]/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#714B67]/10 blur-3xl pointer-events-none rounded-full" />

      {/* Centered Crisp Pure White Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-2xl border border-slate-200/80 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Center Logo & Title */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#714B67] text-white font-black text-xl shadow-md shadow-[#714B67]/30 ring-4 ring-[#714B67]/10">
            360
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Resort 360 <span className="text-[#714B67] font-extrabold">Command Center</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Autonomous Hospitality Operations &amp; AI Swarm Intelligence
            </p>
          </div>
        </div>

        {/* Minimalist Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Form Input 1: Email */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider block">
              Operator Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@resort360.demo"
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20 focus:bg-white focus:outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-900 font-semibold transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Form Input 2: Password */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider block">
                Access Password
              </label>
              <span className="text-[11px] text-[#714B67] font-semibold cursor-pointer hover:underline">
                Demo Auth Active
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20 focus:bg-white focus:outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-900 font-semibold transition-all"
              />
            </div>
          </div>

          {/* Select Demo Persona (All 5 Roles are 100% Clickable) */}
          <div className="space-y-2 pt-1 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider block">
                Choose Department Persona
              </label>
              <span className="text-[10px] font-mono text-[#714B67] font-bold bg-[#714B67]/10 px-2 py-0.5 rounded-full border border-[#714B67]/20">
                1-Click Sign In
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(DEMO_ROLES).map((r) => {
                const isSelected = selectedRole === r.id;
                const Icon = ROLE_ICONS[r.id] || Shield;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.id);
                      setEmail(r.email);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#714B67]/10 border-[#714B67] ring-2 ring-[#714B67]/30 text-slate-900 shadow-sm'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-[#714B67] text-white border-[#714B67]' : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate leading-tight">{r.label}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{r.dept}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#714B67] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Full-Width Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#714B67] hover:bg-[#5D3D55] active:scale-98 text-white font-bold text-sm shadow-md shadow-[#714B67]/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Entering Command Center...</span>
              </span>
            ) : (
              <>
                <span>Sign In as {DEMO_ROLES[selectedRole]?.label || 'Resort Admin'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Direct Instant Bypass Link */}
        <div className="text-center pt-1 border-t border-slate-100">
          <Link
            href="/dashboard"
            onClick={() => {
              try { localStorage.setItem('resort360_demo_role', 'admin'); } catch (_) {}
            }}
            className="text-xs font-bold text-[#714B67] hover:text-[#5D3D55] transition-colors inline-flex items-center gap-1.5"
          >
            <span>Direct Access: Open Command Center without Sign In →</span>
          </Link>
        </div>

        {/* Card Footer Security Badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#714B67]" />
          <span>Resort 360 Enterprise Multi-Agent OS</span>
        </div>
      </div>
    </div>
  );
}
