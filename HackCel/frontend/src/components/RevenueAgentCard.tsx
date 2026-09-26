import React from 'react';
import {
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { RevenueMetric } from '../types/schemas';

interface RevenueAgentCardProps {
  metrics: RevenueMetric;
  activeSalesCount: number;
}

export const RevenueAgentCard: React.FC<RevenueAgentCardProps> = ({
  metrics,
  activeSalesCount,
}) => {
  return (
    <div className="rounded-2xl border border-[#3D405B]/15 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="p-4 border-b border-[#3D405B]/15 bg-white text-[#3D405B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F4F1DE] border border-[#3D405B]/15 text-[#81B29A]">
            <DollarSign className="w-4 h-4 text-[#81B29A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
              Revenue Net RevPAR Agent
              <span className="w-2 h-2 rounded-full bg-[#81B29A] animate-pulse" />
            </h3>
            <p className="text-[11px] text-[#3D405B]/70 font-mono">
              Margin Ticker • Cost Incidents • Dynamic Perishable Flash Sales
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#81B29A]">
            ${metrics.currentNetRevPAR.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#3D405B]/60 font-mono block">Net RevPAR</span>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin bg-[#FAF8EE]">
        {/* Net RevPAR Equation Visualizer */}
        <div className="p-3.5 rounded-xl bg-[#F4F1DE] border border-[#3D405B]/15 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#3D405B]/70">
            <span>Property Yield Realization:</span>
            <span className="text-[#3D405B] font-semibold">Daily Per-Room Metric</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-lg bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] text-[#3D405B]/70 block">Base RevPAR</span>
              <span className="text-xs font-bold text-[#3D405B]">
                ${metrics.baseRevPAR.toFixed(2)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-[#E07A5F]/40 shadow-xs">
              <span className="text-[10px] text-[#E07A5F] font-bold block">Incident Delta</span>
              <span className="text-xs font-bold text-[#E07A5F]">
                -${Math.abs(metrics.totalCostIncidentsDelta).toFixed(2)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-[#81B29A]/40 shadow-xs">
              <span className="text-[10px] text-[#81B29A] font-bold block">Flash Yield Uplift</span>
              <span className="text-xs font-bold text-[#81B29A]">
                +${metrics.projectedRecoveredYield.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#3D405B]/15 flex items-center justify-between text-xs font-mono">
            <span className="text-[#3D405B] font-bold">Current Operating Net RevPAR:</span>
            <span className="text-sm font-bold text-[#81B29A]">
              ${metrics.currentNetRevPAR.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Active Flash Sale Yield Programs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[#3D405B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F2CC8F]" />
              Active Perishable Micro-Sales ({activeSalesCount})
            </span>
            <span className="text-[#81B29A] font-bold text-[10px]">Autonomously Dispatched</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 space-y-2 text-xs font-mono shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#3D405B] font-bold">Spa Suite 2:00 PM Slot</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2CC8F] text-[#3D405B]">
                Expires in 35m
              </span>
            </div>
            <p className="text-[11px] text-[#3D405B]/80 font-sans">
              40% yield optimization push pushed to Luxury & Loyalist checked-in guests.
            </p>
            <div className="pt-1.5 border-t border-[#3D405B]/10 flex items-center justify-between text-[10px] text-[#3D405B]/70">
              <span>Recaptured: <strong>+$195.00</strong></span>
              <span className="text-[#81B29A] font-bold">Zero Empty Inventory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
