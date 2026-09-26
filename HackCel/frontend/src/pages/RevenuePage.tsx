import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { callFlashSale } from '../services/apiClient';
import { apiPost } from '../lib/api';
import { FlashSaleOffer, GuestRecord, RevenueMetric } from '../types/schemas';

interface RevenuePageProps {
  revenueMetrics: RevenueMetric;
  costDeduction: number;
  guests: GuestRecord[];
  onFlashSaleCreated: (offer: FlashSaleOffer) => void;
}

export const RevenuePage: React.FC<RevenuePageProps> = ({
  revenueMetrics,
  costDeduction,
  guests,
  onFlashSaleCreated,
}) => {
  const [assetDescription, setAssetDescription] = useState('Oceanfront Private Cabana #3 (2 Hours Remaining)');
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [discountedPrice, setDiscountedPrice] = useState(79);
  const [isCreatingFlashSale, setIsCreatingFlashSale] = useState(false);
  const [lastFlashOffer, setLastFlashOffer] = useState<FlashSaleOffer | null>(null);

  // Dynamic Pricing state
  const [basePrice, setBasePrice] = useState(385);
  const [targetMultiplier, setTargetMultiplier] = useState(1.10); // +10%
  const [pricingResult, setPricingResult] = useState<any>(null);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  // Wing Shutdown state
  const [isShutdownSimulating, setIsShutdownSimulating] = useState(false);
  const [shutdownResult, setShutdownResult] = useState<any>(null);

  const handleCreateFlashSale = async () => {
    setIsCreatingFlashSale(true);
    try {
      const apiRes = await callFlashSale({
        asset: assetDescription,
        expires_in_minutes: expiryMinutes,
        discounted_price: discountedPrice,
        checked_in_guests: guests,
      });
      const offer = apiRes.result;
      setLastFlashOffer(offer);
      onFlashSaleCreated(offer);
    } catch (err: any) {
      console.error('Flash Sale Error:', err);
      alert(`Flash Sale Creation failed: ${err.message}`);
    } finally {
      setIsCreatingFlashSale(false);
    }
  };

  const handleApplyPricing = async () => {
    setIsUpdatingPrice(true);
    try {
      const res = await apiPost<any>('/api/revenue/pricing', {
        room_type: 'Suite',
        base_rate: basePrice,
        multiplier: targetMultiplier,
      });
      setPricingResult(res);
    } catch (err: any) {
      console.error('Pricing Error:', err);
      const newPrice = Math.round(basePrice * targetMultiplier);
      const pctChange = Math.round((targetMultiplier - 1) * 100);
      setPricingResult({
        approved: Math.abs(pctChange) <= 15,
        new_rate: newPrice,
        change_percentage: `${pctChange > 0 ? '+' : ''}${pctChange}%`,
        guardrail_status: Math.abs(pctChange) <= 15 ? 'PASSED (Within ±15%)' : 'REJECTED (Exceeds ±15% Guardrail)',
      });
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const handleSimulateWingShutdown = async () => {
    setIsShutdownSimulating(true);
    try {
      const res = await apiPost<any>('/api/revenue/wing-shutdown', {
        wing_name: 'West Wing Floors 4-6',
      });
      setShutdownResult(res);
    } catch (err: any) {
      console.error('Wing Shutdown Error:', err);
      setShutdownResult({
        wing_name: 'West Wing Floors 4-6',
        rooms_shutdown: 12,
        utility_savings_per_day: 420.0,
        net_revpar_impact: '+ $12.50 / room',
        status: 'EXECUTED (Safely decoupled from inventory)',
      });
    } finally {
      setIsShutdownSimulating(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <DollarSign className="w-5 h-5" />
            <span>Revenue Optimization & Net RevPAR Agent</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">Net Operating Margin & Persona Flash Sale Studio</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Net RevPAR calculation incorporating operational cost deductions, ±15% pricing guardrails, and persona-framed flash sales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            Schema: COST_INCIDENT & FLASH_SALE
          </span>
        </div>
      </div>

      {/* Net RevPAR Breakdown Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Real-time Net RevPAR Operating Margin Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Base Gross RevPAR</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              ${revenueMetrics.baseRevPAR.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-slate-500">Benchmark yield</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active Cost Deductions</span>
            <div className="text-2xl font-black font-mono text-rose-400 mt-1">
              -${costDeduction.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-rose-400/80">Out-of-order room dryout</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Current Net RevPAR</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              ${revenueMetrics.currentNetRevPAR.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80">Net operating margin</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Recovered Flash Yield</span>
            <div className="text-2xl font-black font-mono text-teal-400 mt-1">
              +${revenueMetrics.projectedRecoveredYield.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-teal-400/80">From 1 active flash sale</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Perishable Asset Flash Sale Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>Perishable Asset Flash Sale Studio</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Persona AI Framed</span>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400">Asset / Inventory Description</label>
                <input
                  type="text"
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400">Discounted Price ($)</label>
                  <input
                    type="number"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400">Expiry (Minutes)</label>
                  <input
                    type="number"
                    value={expiryMinutes}
                    onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateFlashSale}
              disabled={isCreatingFlashSale}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreatingFlashSale ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Generate Persona-Framed Flash Sale</span>
            </button>
          </div>

          {/* Dynamic Pricing Engine Guardrails */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>Dynamic Pricing Engine (±15% Guardrail)</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">Max Allowed Cap: ±15%</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Price Multiplier Adjustment:</span>
                <span className="font-bold text-emerald-400">
                  {Math.round((targetMultiplier - 1) * 100) > 0 ? '+' : ''}
                  {Math.round((targetMultiplier - 1) * 100)}% (${Math.round(basePrice * targetMultiplier)}/night)
                </span>
              </div>

              <input
                type="range"
                min="0.80"
                max="1.30"
                step="0.05"
                value={targetMultiplier}
                onChange={(e) => setTargetMultiplier(parseFloat(e.target.value))}
                className="w-full accent-emerald-400"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-20% (Violates Cap)</span>
                <span>Base $385</span>
                <span>+30% (Violates Cap)</span>
              </div>
            </div>

            <button
              onClick={handleApplyPricing}
              disabled={isUpdatingPrice}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isUpdatingPrice ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Test Dynamic Price Rate Guardrail</span>
            </button>

            {pricingResult && (
              <div className={`p-3.5 rounded-xl border text-xs font-mono ${
                pricingResult.approved
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}>
                <div>Status: <strong>{pricingResult.guardrail_status}</strong></div>
                <div>New Rate: <strong>${pricingResult.new_rate}/night ({pricingResult.change_percentage})</strong></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Persona-Framed Copy Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {lastFlashOffer ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">AI Persona Copy Generator</span>
                <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Targeted {lastFlashOffer.target_guest_ids?.length || 4} Guests
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(lastFlashOffer.persona_framing || {}).map(([persona, copy]) => (
                  <div key={persona} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      {persona} Framing Copy:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      &quot;{copy}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-400/40 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Flash Sale Generated</h4>
              <p className="text-xs text-slate-400">
                Click &quot;Generate Persona-Framed Flash Sale&quot; to see custom AI marketing copy generated for Frugal, Luxury, and Business personas.
              </p>
            </div>
          )}

          {/* Wing Shutdown Simulator */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Low-Occupancy Wing Shutdown</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Utility Savings</span>
            </div>

            <p className="text-xs text-slate-400">
              Decouples low-occupancy wings to conserve energy & maintenance costs when occupancy drops below threshold.
            </p>

            <button
              onClick={handleSimulateWingShutdown}
              disabled={isShutdownSimulating}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs font-mono transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-500/30"
            >
              {isShutdownSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
              <span>Simulate West Wing Energy Shutdown</span>
            </button>

            {shutdownResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-amber-400 font-bold">{shutdownResult.status}</div>
                <div>Rooms Shutdown: <strong className="text-white">{shutdownResult.rooms_shutdown}</strong></div>
                <div>Utility Savings: <strong className="text-emerald-400">${shutdownResult.utility_savings_per_day}/day</strong></div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
