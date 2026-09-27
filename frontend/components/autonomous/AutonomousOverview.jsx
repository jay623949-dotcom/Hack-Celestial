'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { smartResortApi, weatherDigitalTwinApi } from '../../lib/api';
import LiveEventBusFeed from './LiveEventBusFeed';
import {
  Play,
  Sparkles,
  ShieldAlert,
  Radio,
  Activity,
  Layers,
  CheckCircle2,
  IndianRupee,
  TrendingDown,
  Lock,
  Tag,
  RefreshCw,
  CloudSun,
  ArrowRight,
} from 'lucide-react';


export default function AutonomousOverview({
  events = [],
  isConnected = false,
  onClearEvents = () => {},
  onActionSuccess = () => {},
  onNavigateTab = () => {},
}) {
  const [cascading, setCascading] = useState(false);
  const [cascadeStep, setCascadeStep] = useState(null);

  // Live KPI state
  const [kpis, setKpis] = useState({
    baseRevPAR: 385.0,
    currentNetRevPAR: 368.5,
    costDeduction: 1850.0,
    lockedRooms: ['Suite 401'],
    activeFlashSales: 1,
    projectedYield: 195.0,
  });

  // Environmental context for Phase 11
  const [weatherContext, setWeatherContext] = useState(null);

  useEffect(() => {
    weatherDigitalTwinApi.getContext()
      .then((res) => {
        if (res?.data) setWeatherContext(res.data);
      })
      .catch(() => {});
  }, []);

  // Full Rehearsal Cascade Simulation
  const handleRunCascadeSimulation = async () => {
    try {
      setCascading(true);
      setCascadeStep('1/3: Front Desk Guest Check-In & Priority Triage...');
      const intakeRes = await smartResortApi.checkIn({
        name: 'Alexander Vance',
        reservation_id: 'RES-VIP-001',
        room_id: 'room-205',
        transcript: 'Diamond VIP early arrival. Requesting expedited room readiness and lounge access.',
      });
      onActionSuccess('Cascade Step 1: Front Desk checked in Alexander Vance (VIP)', intakeRes);

      await new Promise((r) => setTimeout(r, 700));
      setCascadeStep('2/3: Maintenance Diagnostic (Suite 401 compressor lockout)...');
      const diagRes = await smartResortApi.imageTriage({
        room_id: 'room-401',
        description: 'HVAC compressor capacitor failure and high-pressure head cutoff.',
        source: 'sensor_telemetry',
      });
      setKpis((prev) => ({
        ...prev,
        lockedRooms: [...new Set([...prev.lockedRooms, 'Suite 401'])],
      }));
      onActionSuccess('Cascade Step 2: Maintenance flagged safety issue & locked Suite 401', diagRes);

      await new Promise((r) => setTimeout(r, 700));
      setCascadeStep('3/3: Revenue live Net RevPAR deduction & flash sale...');
      const revRes = await smartResortApi.getNetRevPar();
      await smartResortApi.createFlashSale({
        asset_description: 'Sunset Spa & Cabana Bundle',
        price: 79,
        expiry_minutes: 45,
      });

      setKpis((prev) => ({
        ...prev,
        currentNetRevPAR: revRes.net_revpar || 368.5,
        costDeduction: revRes.cost_deduction || 1850.0,
        activeFlashSales: prev.activeFlashSales + 1,
      }));

      onActionSuccess('Cascade Step 3: Revenue Net RevPAR updated and Flash Sale launched!');
      setCascadeStep('Cascade Complete: All 4 agents synchronized across live Event Bus.');
    } catch (err) {
      console.error('Error during cascade simulation:', err);
    } finally {
      setCascading(false);
    }
  };

  const handleSmokePing = async () => {
    try {
      await smartResortApi.ping();
      onActionSuccess('Smoke test ping published to Event Bus.');
    } catch (err) {
      alert(`Ping error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-surface to-surface p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary text-primary-foreground">
              AUTONOMOUS MULTI-AGENT OS
            </span>
            <span className="text-xs text-muted-foreground font-mono">Real-Time Operational Intelligence</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mt-1">
            Smart Resort 360 Operational Mission Control
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl mt-1">
            4 autonomous departmental agents coordinating via live Socket.IO pub/sub. Test individual agent capabilities or run the full live demonstration cascade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunCascadeSimulation}
            disabled={cascading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow transition-all disabled:opacity-50"
          >
            {cascading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Run Rehearsal Cascade</span>
          </button>

          <button
            onClick={handleSmokePing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground shadow-sm transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-primary" />
            <span>Smoke Ping</span>
          </button>
        </div>
      </div>


      {/* ENVIRONMENTAL CONDITIONS (PHASE 11 REQUIREMENT 20) */}
      <div className="rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50/70 to-emerald-50/50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 text-white rounded-lg shadow-sm">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                ENVIRONMENTAL CONDITIONS · DIGITAL TWIN
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-teal-700 border border-teal-200">
                {weatherContext?.weather?.severity || 'ACTIVE'}
              </span>
            </div>
            <div className="text-sm font-bold text-gray-900 mt-0.5">
              {weatherContext?.weather?.current?.condition || 'Coastal Conditions'} ({weatherContext?.weather?.current?.temperature || 28}°C)
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-xs font-semibold text-gray-600">
                Travel Delay Risk: <strong className="text-teal-800">{weatherContext?.impacts?.overallRisk === 'EXTREME' || weatherContext?.impacts?.overallRisk === 'HIGH' ? 'HIGH' : 'MODERATE'}</strong>
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-xs font-semibold text-gray-600">
                Operational Impact: <strong className="text-teal-800">{weatherContext?.impacts?.overallRisk || 'NORMAL'}</strong>
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/weather-digital-twin"
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-white hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 shadow-2xs transition whitespace-nowrap self-start sm:self-auto"
        >
          View in Weather Digital Twin <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {cascadeStep && (
        <div className="p-3.5 rounded-lg border border-primary/30 bg-primary/5 text-xs text-foreground font-mono flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {cascadeStep}
          </span>
          <button onClick={() => setCascadeStep(null)} className="text-[11px] text-muted-foreground hover:text-foreground">
            Clear
          </button>
        </div>
      )}

      {/* KPI Ticker Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Base RevPAR</div>
          <div className="text-xl font-bold text-foreground mt-1">₹{Math.round(kpis.baseRevPAR * 80).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-1">Target baseline yield</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <div className="text-[10px] font-mono text-emerald-500 uppercase font-bold">Current Net RevPAR</div>
          <div className="text-xl font-bold text-emerald-500 mt-1">₹{Math.round(kpis.currentNetRevPAR * 80).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1 font-semibold">Live margin yield</div>
        </div>

        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 shadow-sm">
          <div className="text-[10px] font-mono text-rose-500 uppercase font-bold">Active Cost Impact</div>
          <div className="text-xl font-bold text-rose-500 mt-1">-₹{Math.round(kpis.costDeduction * 80).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-rose-600 font-mono mt-1">Auto-deducted from Net RevPAR</div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center justify-between">
            <span>Locked Rooms</span>
            <Lock className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-foreground mt-1">{kpis.lockedRooms.length} Rooms</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-1 truncate">
            {kpis.lockedRooms.join(', ') || 'Zero locked rooms'}
          </div>
        </div>
      </div>

      {/* Agent Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('frontdesk')}
          className="p-4 rounded-xl border border-border bg-surface hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              AGENT 1
            </span>
            <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">Open Tab →</span>
          </div>
          <h4 className="text-sm font-bold text-foreground mt-2">Front Desk Agent</h4>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
            Ambient voice intake, persona & sentiment classification, and automated service recovery protocols.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('housekeeping')}
          className="p-4 rounded-xl border border-border bg-surface hover:border-amber-500/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              AGENT 2
            </span>
            <span className="text-[10px] font-mono text-muted-foreground group-hover:text-amber-500 transition-colors">Open Tab →</span>
          </div>
          <h4 className="text-sm font-bold text-foreground mt-2">Housekeeping Agent</h4>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
            Real-time turnover queue, VIP/At-Risk priority bumping, and safety lockout auto-block synchronization.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('maintenance')}
          className="p-4 rounded-xl border border-border bg-surface hover:border-orange-500/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
              AGENT 3
            </span>
            <span className="text-[10px] font-mono text-muted-foreground group-hover:text-orange-500 transition-colors">Open Tab →</span>
          </div>
          <h4 className="text-sm font-bold text-foreground mt-2">Maintenance Agent</h4>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
            Computer vision photo triage, parts inventory cross-referencing, and vacant room micro-leak telemetry.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('revenue')}
          className="p-4 rounded-xl border border-border bg-surface hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              AGENT 4
            </span>
            <span className="text-[10px] font-mono text-muted-foreground group-hover:text-emerald-500 transition-colors">Open Tab →</span>
          </div>
          <h4 className="text-sm font-bold text-foreground mt-2">Revenue Agent</h4>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
            Real-time Net RevPAR deduction ticker, dynamic pricing with ±15% cap, and persona-matched flash sales.
          </p>
        </div>
      </div>

      {/* Live Event Bus Stream Monitor */}
      <LiveEventBusFeed
        events={events}
        isConnected={isConnected}
        onClear={onClearEvents}
      />
    </div>
  );
}
