'use client';

import React, { useState, useEffect } from 'react';
import { smartResortApi } from '../../lib/api';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Clock,
  Sparkles,
  RefreshCw,
  Building,
  Tag,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react';

export default function RevenueAgentStudio({ onActionSuccess = () => {} }) {
  const [netRevPar, setNetRevPar] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Pricing recalculation state
  const [selectedCategory, setSelectedCategory] = useState('deluxe');
  const [occupancyPct, setOccupancyPct] = useState(0.75);
  const [demandSignal, setDemandSignal] = useState('surge');
  const [pricingResult, setPricingResult] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Flash sale state
  const [flashAsset, setFlashAsset] = useState('Sunset Spa & Cabana Bundle');
  const [flashPrice, setFlashPrice] = useState(79);
  const [flashExpiry, setFlashExpiry] = useState(45);
  const [flashResult, setFlashResult] = useState(null);
  const [flashLoading, setFlashLoading] = useState(false);

  // Wing shutdown state
  const [wingShutdownResult, setWingShutdownResult] = useState(null);
  const [wingLoading, setWingLoading] = useState(false);

  const fetchNetRevPar = async () => {
    try {
      setLoadingMetrics(true);
      const data = await smartResortApi.getNetRevPar();
      setNetRevPar(data);
    } catch (e) {
      console.error('Failed to get Net RevPAR:', e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchNetRevPar();
  }, []);

  const handleRecalculatePricing = async () => {
    try {
      setPricingLoading(true);
      const res = await smartResortApi.recalculatePricing({
        room_category: selectedCategory,
        occupancy_pct: occupancyPct,
        demand_signal: demandSignal,
        manual_reason: 'Yield optimization via Revenue Agent',
      });
      setPricingResult(res);
      await fetchNetRevPar();
      onActionSuccess('Dynamic pricing adjusted within guardrails', res);
    } catch (err) {
      alert(`Pricing error: ${err.message}`);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleLaunchFlashSale = async () => {
    try {
      setFlashLoading(true);
      const res = await smartResortApi.createFlashSale({
        asset_description: flashAsset,
        price: flashPrice,
        expiry_minutes: flashExpiry,
      });
      setFlashResult(res);
      onActionSuccess('Perishable asset flash sale broadcasted to checked-in guests', res);
    } catch (err) {
      alert(`Flash sale error: ${err.message}`);
    } finally {
      setFlashLoading(false);
    }
  };

  const handleSimulateWingShutdown = async (wingId) => {
    try {
      setWingLoading(true);
      const res = await smartResortApi.simulateWingShutdown(wingId);
      setWingShutdownResult(res);
      onActionSuccess(`Wing ${wingId} shutdown simulation calculated`, res);
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setWingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-black">
              REVENUE AGENT
            </span>
            <span className="text-xs text-muted-foreground font-mono">Differentiators: Real-Time Net RevPAR & Persona Flash Sales</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
            Dynamic Yield Protection & Margin Optimization
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl mt-1">
            Tracks Net RevPAR in real time by instantly deducting active maintenance work order costs, enforces ±15% guardrail caps on dynamic pricing, and monetizes expiring perishable inventory with persona-matched copy.
          </p>
        </div>

        <button
          onClick={fetchNetRevPar}
          disabled={loadingMetrics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-secondary shadow-sm self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? 'animate-spin' : ''}`} />
          <span>Refresh Margin</span>
        </button>
      </div>

      {/* Net RevPAR Live Ticker Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Gross RevPAR</div>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            ${netRevPar?.gross_revpar || 385.0}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-1">
            Before maintenance deductions
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <div className="text-[10px] font-mono text-emerald-500 uppercase font-bold">Current Net RevPAR</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-500 mt-1">
            ${netRevPar?.net_revpar || 368.5}
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1 font-semibold">
            True operating margin yield
          </div>
        </div>

        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 shadow-sm">
          <div className="text-[10px] font-mono text-rose-500 uppercase font-bold">Active Cost Deductions</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-500 mt-1">
            -${netRevPar?.total_active_cost_incidents || 1850}
          </div>
          <div className="text-[10px] text-rose-600 font-mono mt-1">
            Auto-deducted from Net RevPAR
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Resort Occupancy</div>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {Math.round((netRevPar?.occupancy_pct || 0.68) * 100)}%
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-1">
            Across standard, deluxe & suites
          </div>
        </div>
      </div>

      {/* Studio Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Dynamic Pricing Recalculation (with ±15% Cap) */}
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                Dynamic Pricing Engine (±15% Cap)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              GUARDRAIL ACTIVE
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Adjusts room rates dynamically based on occupancy deviation and demand signals. Strictly limits adjustments to ±15% to maintain rate integrity.
          </p>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Room Tier</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-border bg-surface-secondary text-foreground text-xs"
              >
                <option value="standard">Standard ($149)</option>
                <option value="deluxe">Deluxe ($219)</option>
                <option value="suite">Suite ($349)</option>
                <option value="villa">Villa ($599)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Occupancy</label>
              <select
                value={occupancyPct}
                onChange={(e) => setOccupancyPct(Number(e.target.value))}
                className="w-full mt-1 p-2 rounded-lg border border-border bg-surface-secondary text-foreground text-xs"
              >
                <option value={0.3}>Low (30%)</option>
                <option value={0.6}>Target (60%)</option>
                <option value={0.85}>High (85%)</option>
                <option value={0.98}>Surge (98%)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Demand Signal</label>
              <select
                value={demandSignal}
                onChange={(e) => setDemandSignal(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-border bg-surface-secondary text-foreground text-xs"
              >
                <option value="low">Low (-5%)</option>
                <option value="neutral">Neutral (0%)</option>
                <option value="high">High (+8%)</option>
                <option value="surge">Surge (+15%)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRecalculatePricing}
            disabled={pricingLoading}
            className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {pricingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
            <span>Recalculate Rate with Guardrails</span>
          </button>

          {pricingResult && (
            <div className="p-3.5 rounded-lg border border-border bg-surface-secondary text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between font-bold">
                <span className="text-foreground capitalize">{pricingResult.room_category} Rate</span>
                <span className="text-emerald-500 font-mono">
                  ${pricingResult.old_rate} → ${pricingResult.new_rate}/night ({pricingResult.change_pct > 0 ? `+${pricingResult.change_pct}` : pricingResult.change_pct}%)
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">
                {pricingResult.reasoning}
              </p>
            </div>
          )}
        </div>

        {/* Panel 2: Perishable Asset Flash Sale Studio */}
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                Perishable Asset Flash Sale Studio
              </h3>
            </div>
            <span className="text-[10px] font-mono text-purple-500 font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
              MICRO-YIELD
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Monetizes unsold afternoon spa slots and pool cabanas. Generates persona-tailored marketing copy for checked-in guests.
          </p>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="col-span-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Asset Description</label>
              <input
                type="text"
                value={flashAsset}
                onChange={(e) => setFlashAsset(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-border bg-surface-secondary text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Price ($)</label>
              <input
                type="number"
                value={flashPrice}
                onChange={(e) => setFlashPrice(Number(e.target.value))}
                className="w-full mt-1 p-2 rounded-lg border border-border bg-surface-secondary text-foreground text-xs font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleLaunchFlashSale}
            disabled={flashLoading}
            className="w-full py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {flashLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Broadcast Persona Flash Sale</span>
          </button>

          {flashResult && (
            <div className="p-3.5 rounded-lg border border-purple-500/30 bg-purple-500/5 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span>{flashResult.offers_created} Personalized Offers Sent</span>
                <span className="text-purple-400 font-mono text-[10px]">Expiry: {flashExpiry}m</span>
              </div>
              <div className="p-2 rounded bg-surface text-[11px] text-muted-foreground font-mono">
                {flashResult.guests_targeted?.[0]?.offer_copy || 'Special flash sale broadcasted to checked-in guest folios.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wing Shutdown Simulator */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              Wing Shutdown Profit Simulator
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Target Net Margin Preservation
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Evaluates safety feasibility of shutting down an entire wing for maintenance or low season, and calculates required average daily rate (ADR) on remaining rooms to match total resort net revenue.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleSimulateWingShutdown('B')}
            disabled={wingLoading}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-secondary hover:bg-surface-secondary/80 text-xs font-medium text-foreground transition-colors"
          >
            Simulate Wing B Closure (Suites)
          </button>
          <button
            onClick={() => handleSimulateWingShutdown('C')}
            disabled={wingLoading}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-secondary hover:bg-surface-secondary/80 text-xs font-medium text-foreground transition-colors"
          >
            Simulate Wing C Closure (Villas)
          </button>
        </div>

        {wingShutdownResult && (
          <div className="p-3.5 rounded-lg border border-border bg-surface-secondary/40 text-xs space-y-1 font-mono animate-in fade-in">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>Feasibility: {wingShutdownResult.feasible ? 'FEASIBLE' : 'NOT FEASIBLE'}</span>
              <span className="text-primary font-mono">Required ADR: ${wingShutdownResult.revised_rate_required}/night</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{wingShutdownResult.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
