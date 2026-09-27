import React, { useState } from 'react';
import {
  AlertCircle,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { INTAKE_BENCHMARKS, IntakeScenario } from '../data/benchmarks';
import { callGuestIntake } from '../services/apiClient';
import { GuestIntakeResult } from '../types/schemas';
import { JsonViewer } from './JsonViewer';
import { UiActionList } from './UiActionList';

interface IntakeStudioProps {
  onEventDispatched: (event: GuestIntakeResult) => void;
}

export const IntakeStudio: React.FC<IntakeStudioProps> = ({ onEventDispatched }) => {
  const [selectedScenario, setSelectedScenario] = useState<IntakeScenario>(INTAKE_BENCHMARKS[0]);
  const [transcript, setTranscript] = useState<string>(INTAKE_BENCHMARKS[0].transcript);
  const [guestId, setGuestId] = useState<string>(INTAKE_BENCHMARKS[0].guest_id);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GuestIntakeResult | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleToggleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type or use benchmark scenarios.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleSelectScenario = (sc: IntakeScenario) => {
    setSelectedScenario(sc);
    setTranscript(sc.transcript);
    setGuestId(sc.guest_id);
    setError(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await callGuestIntake({
        transcript,
        guest_id: guestId.trim() || null,
        reservation_context: selectedScenario.reservation_context,
      });
      setResult(res.result);
      setLatencyMs(res.latencyMs);
      onEventDispatched(res.result);
    } catch (err: any) {
      setError(err.message || 'Error processing intake');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Guidelines */}
      <div className="p-4 rounded-xl bg-[#FAF8EE] border border-[#3D405B]/15 text-[#3D405B] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#81B29A]" />
            Front Desk Ambient Voice Intake Pipeline
          </h3>
          <p className="text-xs text-[#3D405B]/75 mt-0.5">
            Structured extraction from transcribed check-in voice: 8 Persona labels, Value × Sentiment matrix, discrete sub-request splitting, and proactive service recovery perks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#3D405B] bg-[#F2CC8F] px-3 py-1.5 rounded-lg shrink-0 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Intent Parser Active</span>
        </div>
      </div>

      {/* Benchmark Presets Selector */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] mb-2">
          Select Benchmark Operational Scenario (Judge Test Suite)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {INTAKE_BENCHMARKS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-white border-[#81B29A] shadow-sm ring-2 ring-[#81B29A]'
                    : 'bg-white border-[#3D405B]/15 hover:border-[#81B29A] hover:bg-[#FAF8EE]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono text-[#81B29A] font-bold">{sc.guest_id}</span>
                  <span className="text-[10px] font-mono text-[#3D405B]/60">
                    {sc.audio_duration_seconds}s audio
                  </span>
                </div>
                <div className="text-xs font-bold text-[#3D405B] line-clamp-1">{sc.guest_name}</div>
                <div className="text-[11px] text-[#3D405B]/75 mt-1 line-clamp-2 leading-tight">
                  {sc.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Configuration & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Context & Metadata */}
        <div className="rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-4 shadow-xs">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B]">
            Reservation Record Context
          </h4>

          <div>
            <label className="block text-xs font-semibold text-[#3D405B] mb-1">Guest ID (Pass-through guardrail)</label>
            <input
              type="text"
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              placeholder="e.g. G-7041 (or blank for null)"
              className="w-full px-3 py-2 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A]"
            />
            <p className="text-[10px] text-[#3D405B]/60 mt-1">
              *Guardrail: Never fabricate guest_id. Blank returns null.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15 space-y-2 text-xs font-mono text-[#3D405B]">
            <div className="flex justify-between">
              <span className="text-[#3D405B]/70">Room Tier:</span>
              <span className="font-bold text-[#81B29A]">{selectedScenario.reservation_context.room_tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#3D405B]/70">Club Tier:</span>
              <span className="font-bold text-[#E07A5F]">{selectedScenario.reservation_context.membership_tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#3D405B]/70">Purpose:</span>
              <span className="font-medium text-right text-[#3D405B]">{selectedScenario.reservation_context.stay_purpose}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15">
            <div className="text-[11px] font-mono font-bold text-[#3D405B] mb-1">
              Test Objective:
            </div>
            <div className="text-xs text-[#3D405B]/80 leading-relaxed">
              {selectedScenario.notes}
            </div>
          </div>
        </div>

        {/* Center / Right Columns: Transcribed Text Input & Execution */}
        <div className="lg:col-span-2 rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B]">
                Ambient Voice Transcribed Text (Whisper Upstream)
              </label>

              <button
                onClick={handleToggleMic}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                  isRecording
                    ? 'bg-[#E07A5F] text-white border-[#E07A5F] animate-pulse'
                    : 'bg-[#FAF8EE] hover:bg-[#81B29A] hover:text-white text-[#3D405B] border-[#3D405B]/20'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste guest check-in transcript here..."
              className="w-full p-3 rounded-xl bg-[#FAF8EE] border border-[#3D405B]/20 text-[#3D405B] text-sm leading-relaxed focus:outline-none focus:border-[#81B29A] font-sans resize-none font-medium"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#E07A5F]/15 border border-[#E07A5F] text-[#E07A5F] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#3D405B]/15">
            <button
              onClick={() => handleSelectScenario(selectedScenario)}
              className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#3D405B]/70 hover:text-[#81B29A]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Transcript
            </button>

            <button
              onClick={handleExecute}
              disabled={isLoading || !transcript.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#81B29A] hover:bg-[#6D9E86] text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reasoning Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Structured Extraction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Quick Matrix Summary Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] font-mono text-[#3D405B]/70 uppercase tracking-wider block">
                Assigned Persona
              </span>
              <span className="text-base font-bold text-[#81B29A] font-mono mt-0.5 block">
                {result.persona_label}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] font-mono text-[#3D405B]/70 uppercase tracking-wider block">
                Value Tier
              </span>
              <span className="text-base font-bold text-[#E07A5F] font-mono mt-0.5 block">
                {result.value_sentiment_cell.value_tier}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] font-mono text-[#3D405B]/70 uppercase tracking-wider block">
                Sentiment Status
              </span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block ${
                  result.value_sentiment_cell.sentiment === 'Positive'
                    ? 'text-[#81B29A]'
                    : result.value_sentiment_cell.sentiment === 'At-Risk'
                    ? 'text-[#E07A5F]'
                    : 'text-[#F2CC8F]'
                }`}
              >
                {result.value_sentiment_cell.sentiment}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] font-mono text-[#3D405B]/70 uppercase tracking-wider block">
                Split Sub-Requests
              </span>
              <span className="text-base font-bold text-[#3D405B] font-mono mt-0.5 block">
                {result.extracted_preferences.explicit_requests.length} Tagged
              </span>
            </div>
          </div>

          {/* Dispatched UI Actions */}
          <UiActionList actions={result.ui_actions} title="Front Desk UI Actions Triggered" />

          {/* Strict JSON Output Inspector */}
          <JsonViewer
            data={result}
            title="GUEST_INTAKE_RESULT (JSON Schema #1)"
            eventType="GUEST_INTAKE_RESULT"
            latencyMs={latencyMs}
          />
        </div>
      )}
    </div>
  );
};
