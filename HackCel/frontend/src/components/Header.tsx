import React from 'react';
import {
  Compass,
  Cpu,
  DollarSign,
  Hotel,
  Layers,
  Sparkles,
  Wrench,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'studio' | 'cockpit';
  onTabChange: (tab: 'studio' | 'cockpit') => void;
  activeAgentsCount?: number;
  totalEventsProcessed?: number;
  currentNetRevpar?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activeAgentsCount = 4,
  totalEventsProcessed = 18,
  currentNetRevpar = 368.5,
}) => {
  return (
    <header className="border-b border-[#3D405B]/15 bg-white text-[#3D405B] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#F4F1DE] border border-[#F2CC8F] shadow-sm text-[#3D405B]">
              <Compass className="w-6 h-6 text-[#3D405B]" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#81B29A] ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#3D405B] flex items-center gap-2">
                  SMART RESORT 360
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F2CC8F] text-[#3D405B] uppercase tracking-wider shadow-xs">
                    OS Intelligence Engine
                  </span>
                </h1>
              </div>
              <p className="text-xs text-[#3D405B]/70 flex items-center gap-2">
                Structured Multimodal Reasoning Layer
                <span className="text-[#3D405B]/30">•</span>
                <span className="font-mono text-[#81B29A] text-[11px] font-bold">4 Backend Services</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-xl bg-[#F4F1DE] border border-[#3D405B]/15 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#3D405B]/75">Net RevPAR:</span>
              <span className="text-[#81B29A] font-bold font-mono">
                ${currentNetRevpar.toFixed(2)}
              </span>
            </div>
            <div className="h-4 w-px bg-[#3D405B]/15" />
            <div className="flex items-center gap-2">
              <span className="text-[#3D405B]/75">Events Routed:</span>
              <span className="text-[#3D405B] font-bold font-mono">{totalEventsProcessed}</span>
            </div>
            <div className="h-4 w-px bg-[#3D405B]/15" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#81B29A] animate-pulse" />
              <span className="text-[#3D405B] font-medium">Multi-Agent Synced</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <div className="flex items-center p-1 rounded-xl bg-[#F4F1DE] border border-[#3D405B]/15">
              <button
                onClick={() => onTabChange('studio')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'studio'
                    ? 'bg-[#81B29A] text-white shadow-sm'
                    : 'text-[#3D405B]/80 hover:text-[#3D405B] hover:bg-white/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Intelligence Engine Studio
              </button>

              <button
                onClick={() => onTabChange('cockpit')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'cockpit'
                    ? 'bg-[#81B29A] text-white shadow-sm'
                    : 'text-[#3D405B]/80 hover:text-[#3D405B] hover:bg-white/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Resort Operations Cockpit
              </button>
            </div>
          </div>
        </div>

        {/* 4 Agent Badges Indicator */}
        <div className="mt-3 pt-2.5 border-t border-[#3D405B]/15 flex items-center justify-between text-[11px] font-mono text-[#3D405B]/80 overflow-x-auto">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-[#3D405B]/60 uppercase tracking-wider text-[10px] font-semibold">Active Agents:</span>
            
            <div className="flex items-center gap-1.5 text-[#3D405B]">
              <Hotel className="w-3.5 h-3.5 text-[#81B29A]" />
              <span>Front Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" />
            </div>

            <div className="flex items-center gap-1.5 text-[#3D405B]">
              <Sparkles className="w-3.5 h-3.5 text-[#81B29A]" />
              <span>Housekeeping</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" />
            </div>

            <div className="flex items-center gap-1.5 text-[#3D405B]">
              <Wrench className="w-3.5 h-3.5 text-[#81B29A]" />
              <span>Maintenance CV</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" />
            </div>

            <div className="flex items-center gap-1.5 text-[#3D405B]">
              <DollarSign className="w-3.5 h-3.5 text-[#81B29A]" />
              <span>Revenue Net RevPAR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#3D405B]/70">
            <span>Model: gemini-3.8-flash</span>
            <span>•</span>
            <span>Temp: 0.15</span>
            <span>•</span>
            <span className="text-[#3D405B] font-semibold px-1.5 py-0.5 rounded bg-[#F2CC8F]/40 border border-[#F2CC8F]">
              Strict JSON Schema Mode
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
