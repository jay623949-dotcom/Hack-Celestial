import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle,
  ChevronRight,
  Hotel,
} from 'lucide-react';
import { GuestRecord } from '../types/schemas';

interface FrontDeskAgentCardProps {
  guests: GuestRecord[];
  onTriggerCheckIn?: (guest: GuestRecord) => void;
}

export const FrontDeskAgentCard: React.FC<FrontDeskAgentCardProps> = ({
  guests,
}) => {
  const [selectedGuest, setSelectedGuest] = useState<GuestRecord | null>(guests[0] || null);

  const getSentimentBadge = (color?: string, sentiment?: string) => {
    switch (color) {
      case 'green':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#81B29A] text-white flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {sentiment || 'Positive'}
          </span>
        );
      case 'red':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E07A5F] text-white flex items-center gap-1 animate-pulse shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {sentiment || 'At-Risk'}
          </span>
        );
      case 'yellow':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F2CC8F] text-[#3D405B] flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D405B]" />
            {sentiment || 'Neutral'}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-[#3D405B]/15 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Agent Card Header */}
      <div className="p-4 border-b border-[#3D405B]/15 bg-white text-[#3D405B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F4F1DE] border border-[#3D405B]/15 text-[#3D405B]">
            <Hotel className="w-4 h-4 text-[#81B29A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
              Front Desk Service Agent
              <span className="w-2 h-2 rounded-full bg-[#81B29A] animate-pulse" />
            </h3>
            <p className="text-[11px] text-[#3D405B]/70 font-mono">
              Intake Voice Reasoner • Sentiment & Recovery
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#3D405B]">{guests.length}</span>
          <span className="text-[10px] text-[#3D405B]/60 font-mono block">Roster Size</span>
        </div>
      </div>

      {/* Guest Roster Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 divide-y md:divide-y-0 md:divide-x divide-[#3D405B]/15">
        {/* Left: Guest List */}
        <div className="md:col-span-6 p-3 space-y-2 overflow-y-auto max-h-[380px] scrollbar-thin">
          {guests.map((g) => {
            const isSelected = selectedGuest?.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGuest(g)}
                className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#F4F1DE] border-[#81B29A] shadow-xs ring-1 ring-[#81B29A]'
                    : 'bg-white border-[#3D405B]/15 hover:border-[#81B29A] hover:bg-[#FAF8EE]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#3D405B] truncate">{g.name}</span>
                    <span className="text-[10px] font-mono text-[#81B29A] font-bold">{g.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#3D405B]/70 mt-1">
                    <span>{g.roomNumber || 'Awaiting Room'}</span>
                    <span>•</span>
                    <span className="text-[#3D405B] font-bold">{g.vipTier}</span>
                    {g.persona && (
                      <>
                        <span>•</span>
                        <span className="text-[#E07A5F] font-semibold">{g.persona}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  {getSentimentBadge(g.sentimentColor, g.sentiment)}
                  {g.serviceRecoveryTriggered && (
                    <span className="flex items-center gap-1 text-[9px] font-mono text-[#E07A5F] font-bold">
                      <BellRing className="w-2.5 h-2.5 text-[#E07A5F]" />
                      Recovery Alert
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Guest Detail Card */}
        <div className="md:col-span-6 p-4 bg-[#FAF8EE] flex flex-col justify-between space-y-4">
          {selectedGuest ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#3D405B]/15">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B]">
                    {selectedGuest.name}
                  </h4>
                  <span className="text-[10px] font-mono text-[#3D405B]/70">
                    ID: {selectedGuest.id} • Room: {selectedGuest.roomNumber || 'Pending'}
                  </span>
                </div>
                {getSentimentBadge(selectedGuest.sentimentColor, selectedGuest.sentiment)}
              </div>

              {/* Persona & Value Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-white border border-[#3D405B]/15">
                  <span className="text-[9px] text-[#3D405B]/70 uppercase block">Persona Label</span>
                  <span className="font-bold text-[#81B29A]">{selectedGuest.persona || 'Unclassified'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[#3D405B]/15">
                  <span className="text-[9px] text-[#3D405B]/70 uppercase block">Value Tier</span>
                  <span className="font-bold text-[#E07A5F]">{selectedGuest.vipTier}</span>
                </div>
              </div>

              {/* Service Recovery Banner */}
              {selectedGuest.serviceRecoveryTriggered ? (
                <div className="p-3 rounded-xl bg-[#E07A5F]/10 border border-[#E07A5F] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] font-mono">
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Autonomous Service Recovery Active</span>
                  </div>
                  <p className="text-[11px] text-[#3D405B] italic">
                    Perk Granted: "{selectedGuest.recoveryPerk || 'Executive Lounge Access & Folio Credit'}"
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#81B29A]/15 border border-[#81B29A]/30 text-[11px] font-mono text-[#3D405B] flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-[#81B29A]" />
                  <span>Stay Experience Stable • No Escalation Required</span>
                </div>
              )}

              {/* Extracted Preferences */}
              <div>
                <span className="text-[10px] font-mono font-bold text-[#3D405B] uppercase tracking-wider block mb-1">
                  Stated Operational Preferences:
                </span>
                {selectedGuest.preferences && selectedGuest.preferences.length > 0 ? (
                  <div className="space-y-1">
                    {selectedGuest.preferences.map((p, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded bg-white border border-[#3D405B]/15 text-[11px] font-mono text-[#3D405B] flex items-center gap-2"
                      >
                        <ChevronRight className="w-3 h-3 text-[#81B29A]" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-[#3D405B]/60 italic">
                    No special requests recorded.
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-[#3D405B]/60 py-12 font-mono">
              Select a guest from the roster to inspect state
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
