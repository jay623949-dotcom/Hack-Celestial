'use client';

import React, { useState, useEffect } from 'react';
import { INTAKE_BENCHMARKS } from '../../lib/autonomous/benchmarks';
import { smartResortApi } from '../../lib/api';
import {
  Mic,
  Sparkles,
  Play,
  Volume2,
  ShieldAlert,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
  RefreshCw,
  Gift,
  AlertTriangle
} from 'lucide-react';

export default function FrontDeskAgentStudio({ onActionSuccess = () => {} }) {
  const [selectedScenario, setSelectedScenario] = useState(INTAKE_BENCHMARKS[0]);
  const [transcript, setTranscript] = useState(INTAKE_BENCHMARKS[0].transcript);
  const [processing, setProcessing] = useState(false);
  const [intakeResult, setIntakeResult] = useState(null);
  const [recoveryMessage, setRecoveryMessage] = useState(null);

  const [priorityQueue, setPriorityQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  const handleSelectScenario = (sc) => {
    setSelectedScenario(sc);
    setTranscript(sc.transcript);
    setIntakeResult(null);
    setRecoveryMessage(null);
  };

  const fetchPriorityQueue = async () => {
    try {
      setLoadingQueue(true);
      const data = await smartResortApi.getPriorityQueue();
      setPriorityQueue(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load priority queue:', e);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchPriorityQueue();
  }, []);

  const handleProcessIntake = async () => {
    try {
      setProcessing(true);
      setRecoveryMessage(null);

      // Call Express Front Desk Check-in
      const res = await smartResortApi.checkIn({
        name: selectedScenario.guest_name,
        reservation_id: `RES-${selectedScenario.guest_id}`,
        room_id: 1, // Standard/Suite room
        transcript,
      });

      setIntakeResult(res);
      fetchPriorityQueue();
      onActionSuccess('Guest checked in via Front Desk Agent', res);
    } catch (err) {
      console.error('Error in intake:', err);
      alert(`Intake Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyServiceRecovery = async (action) => {
    if (!intakeResult?.id) return;
    try {
      const res = await smartResortApi.serviceRecovery(intakeResult.id, action);
      setRecoveryMessage(res.action_taken);
      fetchPriorityQueue();
      onActionSuccess('Service recovery protocol applied', res);
    } catch (err) {
      alert(`Recovery error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary text-primary-foreground">
              FRONT DESK AGENT
            </span>
            <span className="text-xs text-muted-foreground font-mono">Differentiator: Ambient Voice Intake & Instant Service Recovery</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
            Ambient Voice Intake & Persona Classification Studio
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl mt-1">
            Listens to guest dialogue at check-in, runs structured sentiment & persona classification, triggers immediate room readiness priority adjustments, and activates service recovery perks for at-risk travelers.
          </p>
        </div>

        <button
          onClick={fetchPriorityQueue}
          disabled={loadingQueue}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-secondary shadow-sm self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingQueue ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scenarios & Voice Intake */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
              1. Select Benchmark Ambient Audio Scenario
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INTAKE_BENCHMARKS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-surface-secondary/40 hover:bg-surface-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{sc.title}</span>
                      <Volume2 className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1 font-mono">
                      {sc.guest_name} • {sc.reservation_context.membership_tier}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transcript & Process */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Front Desk Microphone Stream</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                Audio Duration: {selectedScenario.audio_duration_seconds}s
              </span>
            </div>

            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-surface-secondary text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Guest intake dialogue transcript..."
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground italic">
                {selectedScenario.notes}
              </span>

              <button
                onClick={handleProcessIntake}
                disabled={processing || !transcript}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Classifying Persona...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Process Voice Intake</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Classification Output Result */}
          {intakeResult && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-foreground">Intake Analysis Complete</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Confidence: {Math.round((intakeResult.confidence || 0.92) * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Classified Persona</div>
                  <div className="text-sm font-bold text-primary mt-0.5">{intakeResult.persona_label}</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Value Tier</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{intakeResult.value_tier}</div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  intakeResult.sentiment_state === 'At-Risk'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                }`}>
                  <div className="text-[10px] font-mono uppercase">Sentiment State</div>
                  <div className="text-sm font-bold mt-0.5">{intakeResult.sentiment_state}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-secondary text-xs text-foreground font-mono">
                <span className="text-primary font-bold">Reasoning: </span>
                {intakeResult.reasoning}
              </div>

              {/* Service Recovery Panel if At-Risk */}
              {intakeResult.sentiment_state === 'At-Risk' && (
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Autonomous Service Recovery Protocol Triggered</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Guest is experiencing travel friction. Select an immediate perk to reset guest sentiment before lobby departure:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApplyServiceRecovery('complimentary_upgrade')}
                      className="p-2.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground text-left transition-colors"
                    >
                      ⭐ Complimentary Upgrade
                    </button>
                    <button
                      onClick={() => handleApplyServiceRecovery('spa_voucher')}
                      className="p-2.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground text-left transition-colors"
                    >
                      🧖 Complimentary Spa Voucher
                    </button>
                    <button
                      onClick={() => handleApplyServiceRecovery('room_credit')}
                      className="p-2.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground text-left transition-colors"
                    >
                      💳 $50 Food & Beverage Credit
                    </button>
                    <button
                      onClick={() => handleApplyServiceRecovery('manager_callback')}
                      className="p-2.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground text-left transition-colors"
                    >
                      📞 Duty Manager Priority Call
                    </button>
                  </div>

                  {recoveryMessage && (
                    <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-medium">
                      ✓ {recoveryMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Priority Guest Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">Ranked Priority Service Queue</h3>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                Formula: Value Tier + Sentiment
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Cross-departmental prioritization score: VIP (+100), Premium (+60), Standard (+20) combined with At-Risk (+80), Neutral (0), Positive (-10).
            </p>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {priorityQueue.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-mono">
                  Loading queue...
                </div>
              ) : (
                priorityQueue.map((item, idx) => (
                  <div
                    key={item.guest_id || idx}
                    className="p-3 rounded-lg border border-border bg-surface-secondary/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground truncate">{item.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">({item.persona_label})</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        Tier: {item.value_tier} • Sentiment: {item.sentiment_state}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-primary/10 text-primary border border-primary/20">
                        {item.priority_score} pts
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
