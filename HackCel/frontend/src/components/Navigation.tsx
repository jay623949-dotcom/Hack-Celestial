import React from 'react';
import {
  Activity,
  BedDouble,
  DollarSign,
  Layers,
  LayoutDashboard,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Wrench,
  UserCheck,
} from 'lucide-react';

export type PageId = 'overview' | 'frontdesk' | 'housekeeping' | 'maintenance' | 'revenue';

interface NavigationProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
  isConnected: boolean;
  netRevPAR: number;
  costDeduction: number;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onPageChange,
  isConnected,
  netRevPAR,
  costDeduction,
  onResetDemo,
  isResetting,
}) => {
  const pages: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview Cockpit', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'frontdesk', label: 'Front Desk', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'housekeeping', label: 'Housekeeping', icon: <BedDouble className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance & Safety', icon: <Wrench className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue Intelligence', icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1E222D]/95 backdrop-blur-md border-b border-slate-700/60 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Smart Resort 360
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  OS v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Autonomous Multi-Agent Resort System
              </p>
            </div>
          </div>

          {/* Navigation Page Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
            {pages.map((p) => {
              const isActive = activePage === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onPageChange(p.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-bold shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Controls & Status */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Live Net RevPAR Badge */}
            <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700/60 text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Net RevPAR</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black font-mono text-emerald-400">${netRevPAR.toFixed(2)}</span>
                {costDeduction > 0 && (
                  <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-1 rounded">
                    -${costDeduction.toFixed(0)}
                  </span>
                )}
              </div>
            </div>

            {/* SSE Connection Pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden lg:inline">{isConnected ? 'SSE Synced' : 'Connecting'}</span>
            </div>

            {/* Demo Reset Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all active:scale-95 disabled:opacity-50"
              title="Reset Database to Seed State for Demo Rehearsals"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isResetting ? 'Resetting...' : 'Demo Reset'}</span>
            </button>

          </div>

        </div>

        {/* Mobile Page Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800 gap-1 overflow-x-auto">
          {pages.map((p) => {
            const isActive = activePage === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPageChange(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
                  isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
