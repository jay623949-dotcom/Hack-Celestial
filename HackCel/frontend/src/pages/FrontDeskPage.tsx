import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Gift,
  Mic,
  RefreshCw,
  Send,
  Sparkles,
  UserCheck,
  UserX,
  Volume2,
} from 'lucide-react';
import { callGuestIntake } from '../services/apiClient';
import { GuestIntakeResult, GuestRecord } from '../types/schemas';

interface FrontDeskPageProps {
  guests: GuestRecord[];
  onGuestAdded: (guest: GuestRecord) => void;
}

const PRESET_TRANSCRIPTS = [
  {
    label: 'VIP At-Risk Business Keynote',
    transcript:
      'Hi, my flight was delayed five hours and my luggage is still stuck at SFO. I have a critical keynote presentation at 9:00 AM sharp tomorrow. I urgently need a whisper-quiet room on a high floor away from the elevators, blazing fast Wi-Fi, and could someone please arrange early morning coffee service by 6:30 AM? Also, could you check if my company billed the master folio?',
  },
  {
    label: 'Family Holiday with Kids',
    transcript:
      'Hello! We just arrived with our two toddlers after a long drive. Are there adjoining rooms near the pool available? We also need extra towels and a crib sent up right away if possible.',
  },
  {
    label: 'Frugal Traveler Price Sensitive',
    transcript:
      'Good afternoon. I noticed there was a resort fee on my reservation confirmation. Are all amenities included, or is there a way to opt out of the spa surcharge?',
  },
];

export const FrontDeskPage: React.FC<FrontDeskPageProps> = ({ guests, onGuestAdded }) => {
  const [transcript, setTranscript] = useState(PRESET_TRANSCRIPTS[0].transcript);
  const [guestId, setGuestId] = useState('G-7041');
  const [guestName, setGuestName] = useState('Alexandra Chen');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<GuestIntakeResult | null>(null);

  const handleProcessIntake = async () => {
    if (!transcript.trim()) return;
    setIsLoading(true);
    try {
      const apiRes = await callGuestIntake({
        transcript,
        guest_id: guestId,
      });
      const result = apiRes.result;
      setLastResult(result);

      // Create new guest record for live roster
      const newGuest: GuestRecord = {
        id: guestId || `G-${Math.floor(1000 + Math.random() * 9000)}`,
        name: guestName || 'Guest User',
        roomNumber: 'Suite 502',
        vipTier: result.value_sentiment_cell?.value_tier || 'Standard',
        persona: result.persona_label || 'Business',
        sentiment: result.value_sentiment_cell?.sentiment || 'Neutral',
        sentimentColor:
          result.value_sentiment_cell?.sentiment === 'At-Risk'
            ? 'red'
            : result.value_sentiment_cell?.sentiment === 'Positive'
            ? 'green'
            : 'yellow',
        checkInStatus: 'Checked-In',
        arrivalEta: 'Immediate',
        preferences: result.extracted_preferences?.explicit_requests || [transcript],
        serviceRecoveryTriggered: result.value_sentiment_cell?.sentiment === 'At-Risk',
        recoveryPerk:
          result.value_sentiment_cell?.sentiment === 'At-Risk'
            ? 'Complimentary Late Check-out & Executive Lounge Pass'
            : undefined,
      };

      onGuestAdded(newGuest);
    } catch (err: any) {
      console.error('Front Desk Check-In Error:', err);
      alert(`Check-in failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <UserCheck className="w-5 h-5" />
            <span>Front Desk Intelligence Agent</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">Ambient Voice Intake & Guest Profiling</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time LLM structured extraction classifying guest persona, value tier, sentiment state, and service recovery perks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
            Schema: GUEST_INTAKE_RESULT
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Intake Studio Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-400" />
                <span>Ambient Voice Transcribed Text</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Whisper Upstream Stream</span>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400">Select Benchmark Transcript Preset:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_TRANSCRIPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTranscript(preset.transcript)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Metadata Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400">Guest ID / Folio</label>
                <input
                  type="text"
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>

            {/* Transcript Textarea */}
            <div>
              <label className="text-[11px] font-mono text-slate-400">Speech Transcript</label>
              <textarea
                rows={5}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans"
              />
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleProcessIntake}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Guest Intent & Persona...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute Structured Check-In Intake</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Intake Result & Service Recovery (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {lastResult ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Structured Result</span>
                <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  200 OK
                </span>
              </div>

              {/* Persona & Sentiment Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Persona Classification</span>
                  <div className="text-base font-extrabold text-amber-400 mt-1">{lastResult.persona_label}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Sentiment State</span>
                  <div className={`text-base font-extrabold mt-1 ${
                    lastResult.value_sentiment_cell?.sentiment === 'At-Risk' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {lastResult.value_sentiment_cell?.sentiment || 'Neutral'}
                  </div>
                </div>
              </div>

              {/* Service Recovery Panel */}
              {lastResult.value_sentiment_cell?.sentiment === 'At-Risk' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <Gift className="w-4 h-4 text-rose-400" />
                    <span>Automated Service Recovery Triggered</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    Suggested Perk: <strong>Complimentary Late Check-out & Executive Lounge Pass</strong>
                  </p>
                </div>
              )}

              {/* LLM Reasoning */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Agent Reasoning Chain</span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {lastResult.reasoning}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400/40 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Active Check-In Session</h4>
              <p className="text-xs text-slate-400">
                Select a benchmark transcript preset and click &quot;Execute Structured Check-In Intake&quot; to test guest classification.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Checked-In Guest Roster Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Active Checked-In Guest Roster ({guests.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Live Folio Database</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Guest Name / ID</th>
                <th className="py-3 px-4">Assigned Room</th>
                <th className="py-3 px-4">Persona</th>
                <th className="py-3 px-4">Value Tier</th>
                <th className="py-3 px-4">Sentiment State</th>
                <th className="py-3 px-4">Recovery Perk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {guests.map((g) => (
                <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{g.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{g.id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-400">{g.roomNumber || 'Unassigned'}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{g.persona || 'Standard'}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      g.vipTier === 'VIP' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {g.vipTier}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      g.sentiment === 'At-Risk'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : g.sentiment === 'Positive'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {g.sentiment || 'Neutral'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {g.recoveryPerk ? (
                      <span className="text-rose-300 font-semibold">{g.recoveryPerk}</span>
                    ) : (
                      'None'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
