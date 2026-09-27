import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BedDouble,
  CheckCircle,
  DollarSign,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { LoggedEvent } from '../components/EventBusLog';
import { GuestRecord, HousekeepingTask, RevenueMetric, WorkOrderRecord } from '../types/schemas';

interface OverviewPageProps {
  netRevPAR: number;
  costDeduction: number;
  guests: GuestRecord[];
  workOrders: WorkOrderRecord[];
  housekeepingTasks: HousekeepingTask[];
  eventLogs: LoggedEvent[];
  onTriggerDemoCascade: () => void;
  isCascading: boolean;
  onSelectPage: (page: any) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  netRevPAR,
  costDeduction,
  guests,
  workOrders,
  housekeepingTasks,
  eventLogs,
  onTriggerDemoCascade,
  isCascading,
  onSelectPage,
}) => {
  const atRiskGuests = guests.filter((g) => g.sentiment === 'At-Risk').length;
  const openWorkOrders = workOrders.filter((w) => w.status !== 'Resolved').length;
  const emergencyWorkOrders = workOrders.filter((w) => w.priority === 'Emergency' || w.severity === 'safety').length;
  const expeditedHousekeeping = housekeepingTasks.filter((h) => h.status === 'Priority-Expedite').length;

  return (
    <div className="space-[#12151E] text-slate-100 space-y-6">
      
      {/* Hero Welcome & Hackathon Demo Cascade Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/80 border border-slate-700/60 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Demo Cascade Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">• 3-Minute Hackathon Orchestration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
              Autonomous Multi-Agent Resort Operating System
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Watch real-time decision cascades propagate seamlessly between <strong className="text-emerald-400">Front Desk</strong>, <strong className="text-amber-400">Maintenance CV</strong>, <strong className="text-teal-400">Housekeeping Priority</strong>, and <strong className="text-rose-400">Revenue Net RevPAR</strong> agents.
            </p>
          </div>

          <button
            onClick={onTriggerDemoCascade}
            disabled={isCascading}
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Play className={`w-5 h-5 fill-slate-950 ${isCascading ? 'animate-pulse' : ''}`} />
            <span>{isCascading ? 'Executing Demo Cascade...' : 'Run 1-Click Demo Cascade'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net RevPAR Card */}
        <div
          onClick={() => onSelectPage('revenue')}
          className="cursor-pointer group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 shadow-lg hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Net RevPAR</span>
            <DollarSign className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">${netRevPAR.toFixed(2)}</span>
            {costDeduction > 0 ? (
              <span className="flex items-center text-xs font-mono text-rose-400 font-bold">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                -${costDeduction.toFixed(0)}
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-400 font-bold">+100% Margin</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1">
            <span>Click to view Revenue Agent</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Front Desk & At-Risk Guests */}
        <div
          onClick={() => onSelectPage('frontdesk')}
          className="cursor-pointer group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 shadow-lg hover:shadow-amber-500/5"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Front Desk Intake</span>
            <UserCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">{guests.length} Checked-In</span>
            {atRiskGuests > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {atRiskGuests} At-Risk
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1">
            <span>Click to view Front Desk Agent</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Maintenance & Safety */}
        <div
          onClick={() => onSelectPage('maintenance')}
          className="cursor-pointer group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all duration-200 shadow-lg hover:shadow-rose-500/5"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Maintenance CV</span>
            <Wrench className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">{openWorkOrders} Open Orders</span>
            {emergencyWorkOrders > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                {emergencyWorkOrders} Safety Lock
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1">
            <span>Click to view Maintenance Agent</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Housekeeping Expedite */}
        <div
          onClick={() => onSelectPage('housekeeping')}
          className="cursor-pointer group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all duration-200 shadow-lg hover:shadow-teal-500/5"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Housekeeping Queue</span>
            <BedDouble className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">{housekeepingTasks.length} Rooms</span>
            {expeditedHousekeeping > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/30">
                {expeditedHousekeeping} Priority Bump
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1">
            <span>Click to view Housekeeping Agent</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

      </div>

      {/* Agents Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Front Desk Agent Quick Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>Front Desk Agent</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Analyzes ambient guest speech during check-in to extract implicit needs, sentiment, and value tier.
            </p>
          </div>
          <button
            onClick={() => onSelectPage('frontdesk')}
            className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition-all text-center"
          >
            Launch Voice Check-In Studio →
          </button>
        </div>

        {/* Maintenance CV Agent Quick Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Wrench className="w-4 h-4" />
              <span>Maintenance CV Agent</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Triages inspection photos using Computer Vision & scans telemetry meters for phantom leaks.
            </p>
          </div>
          <button
            onClick={() => onSelectPage('maintenance')}
            className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all text-center"
          >
            Launch CV Diagnostic Studio →
          </button>
        </div>

        {/* Housekeeping Agent Quick Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <BedDouble className="w-4 h-4" />
              <span>Housekeeping Agent</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Dynamically reorders room turnover queues based on guest arrival ETA and maintenance lockouts.
            </p>
          </div>
          <button
            onClick={() => onSelectPage('housekeeping')}
            className="w-full py-2 px-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold transition-all text-center"
          >
            View Room Turnover Grid →
          </button>
        </div>

        {/* Revenue Agent Quick Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <DollarSign className="w-4 h-4" />
              <span>Revenue Intelligence</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Calculates net operating margins, runs persona-framed flash sales, and manages wing shutdowns.
            </p>
          </div>
          <button
            onClick={() => onSelectPage('revenue')}
            className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold transition-all text-center"
          >
            Launch Flash Sale Builder →
          </button>
        </div>

      </div>

      {/* Cross-Agent Event Bus Stream Log */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-extrabold text-white">Live Cross-Agent Event Stream</h3>
            <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded-md">
              {eventLogs.length} Events Recorded
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Pub/Sub SSE Connection Active</span>
        </div>

        <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto rounded-xl bg-slate-950/70 border border-slate-800/80">
          {eventLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500 text-[11px]">{log.timestamp}</span>
                <span className="px-2.5 py-1 font-mono font-bold text-[10px] rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {log.eventType}
                </span>
                <span className="text-slate-300 font-medium">{log.targetService}</span>
              </div>
              {log.data && (
                <div className="text-[11px] font-mono text-slate-400 truncate max-w-md bg-slate-900 px-2 py-1 rounded">
                  {JSON.stringify(log.data)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
