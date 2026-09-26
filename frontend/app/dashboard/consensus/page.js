'use client';

import React, { useState, useCallback } from 'react';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import {
  Bot, Sparkles, Play, RefreshCw, AlertCircle, CheckCircle2,
  AlertTriangle, ShieldAlert, Users, BedDouble, Wrench, TrendingUp,
  ChevronDown, ChevronUp, Clock, Zap, ThumbsUp, ThumbsDown, Edit3,
  ArrowRight, Layers, CheckSquare, XCircle, Info
} from 'lucide-react';

async function fetchConsensus(trigger) {
  const res = await fetch('http://localhost:5000/api/v1/ai/consensus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trigger }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `API error ${res.status}`);
  return data;
}

const SCENARIOS = [
  { id: 'vip_arrival',           label: 'VIP Early Arrival',        desc: 'Platinum guest arrives 2 hrs early, suite unavailable' },
  { id: 'group_arrival',         label: 'Large Group Check-in',      desc: '28-room wedding block arriving simultaneously' },
  { id: 'multiple_incidents',    label: 'Multiple Active Incidents', desc: 'HVAC fault, housekeeping backlog, revenue lock conflict' },
  { id: 'maintenance_emergency', label: 'Maintenance Emergency',     desc: 'Critical HVAC failure on occupied floor' },
];

const AGENT_META = {
  front_desk:   { label: 'Front Desk',   icon: Users,      color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  housekeeping: { label: 'Housekeeping', icon: BedDouble,  color: 'text-violet-600',  bg: 'bg-violet-50 border-violet-200' },
  maintenance:  { label: 'Maintenance',  icon: Wrench,     color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200' },
  revenue:      { label: 'Revenue',      icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
};

function PriorityBadge({ priority }) {
  const map = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high:     'bg-orange-100 text-orange-700 border-orange-200',
    medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    low:      'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${map[priority?.toLowerCase()] || map.medium}`}>
      {priority || 'medium'}
    </span>
  );
}

function ConfidenceBar({ value }) {
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

const STAGES = ['Gathering agent decisions','Comparing recommendations','Resolving conflicts','Preparing action plan'];

function LoadingView({ stage }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Layers className="w-7 h-7 text-primary animate-pulse" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-foreground text-sm">Building operational consensus...</p>
        <p className="text-xs text-muted-foreground mt-1">This may take up to 90 seconds with a local model</p>
      </div>
      <div className="space-y-2 w-64">
        {STAGES.map((s, i) => {
          const active = i === stage;
          const done = i < stage;
          return (
            <div key={s} className={`flex items-center gap-2.5 text-xs px-3 py-2 rounded-lg border transition-all ${
              active ? 'bg-primary/10 border-primary/20 text-primary font-medium'
                     : done ? 'bg-surface-secondary border-border text-muted-foreground line-through'
                            : 'border-transparent text-muted-foreground/50'
            }`}>
              {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    : active ? <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                             : <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />}
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentSummaryCard({ agentResult }) {
  const [expanded, setExpanded] = useState(false);
  const meta = AGENT_META[agentResult.agent] || AGENT_META.front_desk;
  const Icon = meta.icon;
  const data = agentResult.data || {};
  const topRec = data.recommendations?.[0];
  const topObs = data.observations?.[0];
  const ok = agentResult.status === 'completed';
  return (
    <div className={`rounded-xl border bg-surface p-4 space-y-3 ${ok ? 'border-border' : 'border-red-200 bg-red-50/30'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${meta.bg}`}>
            <Icon className={`w-4 h-4 ${meta.color}`} />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">{meta.label}</div>
            <div className={`text-[10px] font-mono ${ok ? 'text-emerald-600' : 'text-red-500'}`}>
              {ok ? 'Analysis complete' : `Failed: ${agentResult.error || 'unknown error'}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {ok && <PriorityBadge priority={data.assessment?.priority} />}
          {ok && (
            <button onClick={() => setExpanded(e => !e)} className="p-1 rounded text-muted-foreground hover:text-foreground">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
      {!ok && (
        <div className="text-xs text-red-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Consensus uses fallback data for this department.
        </div>
      )}
      {ok && (
        <>
          <ConfidenceBar value={agentResult.confidence} />
          {topObs && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              <span className="font-semibold text-foreground">Obs: </span>{topObs}
            </p>
          )}
          {topRec && (
            <div className="rounded-lg bg-surface-secondary border border-border px-3 py-2 text-[11px]">
              <span className="text-muted-foreground">Action: </span>
              <span className="font-medium text-foreground">{topRec.action}</span>
            </div>
          )}
          {expanded && data.recommendations?.slice(1).map((r, i) => (
            <div key={i} className="text-[11px] flex gap-2 items-start pt-1 border-t border-border">
              <span className="text-muted-foreground shrink-0">#{i + 2}</span>
              <span className="text-foreground">{r.action}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function ConflictCard({ conflict, index }) {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Conflict #{index + 1} Detected</span>
        {conflict.type && (
          <span className="ml-auto text-[10px] font-mono text-amber-600 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
            {conflict.type.replace(/_/g, ' ')}
          </span>
        )}
      </div>
      <p className="text-xs text-amber-900 leading-relaxed">{conflict.description}</p>
      {conflict.agents?.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-amber-700">Between:</span>
          {conflict.agents.map(a => {
            const m = AGENT_META[a];
            return m ? (
              <span key={a} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.bg} ${m.color}`}>{m.label}</span>
            ) : null;
          })}
        </div>
      )}
      {conflict.resolution && (
        <div className="flex items-start gap-2 pt-2 border-t border-amber-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-semibold text-amber-800 mb-0.5">Proposed Resolution</div>
            <p className="text-[11px] text-amber-900 leading-relaxed">{conflict.resolution}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationRow({ rec, index }) {
  const meta = AGENT_META[rec.department || rec.agent];
  const Icon = meta?.icon || Bot;
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-surface hover:bg-surface-secondary transition-colors">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${meta?.bg || 'bg-muted border-border'}`}>
          <Icon className={`w-3.5 h-3.5 ${meta?.color || 'text-muted-foreground'}`} />
        </div>
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {String(index + 1).padStart(3, '0')} · {meta?.label || rec.department || 'General'}
            </span>
            <p className="text-sm font-semibold text-foreground mt-0.5 leading-snug">{rec.action}</p>
          </div>
          <PriorityBadge priority={rec.priority} />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.reason}</p>
        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          {rec.affected_rooms?.length > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{rec.affected_rooms.join(', ')}</span>}
          {rec.required_staff?.length > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{rec.required_staff.join(', ')}</span>}
          {rec.estimated_duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{rec.estimated_duration_minutes} min</span>}
          {rec.confidence && <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{Math.round(rec.confidence * 100)}%</span>}
        </div>
        {rec.risks?.length > 0 && (
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700">{rec.risks[0]}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionStep({ action, index }) {
  const meta = AGENT_META[action.department];
  const borders = { critical: 'border-l-red-500 bg-red-50', high: 'border-l-orange-400 bg-orange-50/50', medium: 'border-l-yellow-400 bg-yellow-50/50', low: 'border-l-slate-300 bg-slate-50/50' };
  return (
    <div className={`flex gap-4 p-3.5 rounded-lg border border-border border-l-4 ${borders[action.priority?.toLowerCase()] || borders.medium}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-border text-xs font-bold text-muted-foreground shrink-0">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground leading-snug">{action.description}</p>
          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={action.priority} />
            <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-surface text-muted-foreground font-mono">Pending approval</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-muted-foreground">
          {meta && <span className={`font-semibold ${meta.color}`}>{meta.label}</span>}
          {action.room_id && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{action.room_id}</span>}
          {action.assigned_to && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{action.assigned_to}</span>}
          {action.estimated_duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{action.estimated_duration_minutes} min</span>}
        </div>
      </div>
    </div>
  );
}

function ApprovalPanel({ onApprove, onModify, onReject, state }) {
  if (state === 'approved') return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-emerald-800">Action Plan Approved for Review</p>
        <p className="text-xs text-emerald-700 mt-0.5">Forwarded to Duty Manager. No automated actions have been taken.</p>
      </div>
    </div>
  );
  if (state === 'rejected') return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-700">Action Plan Rejected</p>
        <p className="text-xs text-red-600 mt-0.5">No actions taken. Run a new analysis to generate fresh recommendations.</p>
      </div>
    </div>
  );
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-foreground">Human Approval Required</h3>
          <p className="text-[11px] text-muted-foreground">Advisory only — no actions execute without explicit human sign-off.</p>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Approving marks this plan as reviewed and sends it to the Duty Manager dashboard.
          It does <strong>not</strong> automatically assign staff, relocate guests, or change room status.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={onApprove} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm">
          <ThumbsUp className="w-4 h-4" /> Approve Action Plan
        </button>
        <button onClick={onModify} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-foreground text-sm font-medium hover:bg-surface-secondary transition-colors">
          <Edit3 className="w-4 h-4" /> Modify
        </button>
        <button onClick={onReject} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors">
          <ThumbsDown className="w-4 h-4" /> Reject
        </button>
      </div>
    </div>
  );
}

export default function ConsensusPage() {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [pageState, setPageState] = useState('IDLE');
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [approvalState, setApprovalState] = useState('pending');

  const runConsensus = useCallback(async () => {
    setPageState('LOADING');
    setLoadingStage(0);
    setResult(null);
    setErrorMsg(null);
    setApprovalState('pending');
    const timer = setInterval(() => setLoadingStage(s => Math.min(s + 1, STAGES.length - 1)), 8000);
    try {
      const data = await fetchConsensus(scenario.trigger || { type: scenario.id });
      clearInterval(timer);
      if (data.success) { setResult(data.data); setPageState('DONE'); }
      else throw new Error(data.error?.message || 'Consensus API error');
    } catch (err) {
      clearInterval(timer);
      setErrorMsg(err.message);
      setPageState('ERROR');
    }
  }, [scenario]);

  const consensus = result?.consensus;
  const agents = result?.agents || [];
  const failed = agents.filter(a => a.status !== 'completed');

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Operational Consensus</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">PHASE 3</span>
          </div>
          <p className="text-xs text-muted-foreground">Four departmental perspectives coordinated into one action plan.</p>
        </div>
        {pageState === 'DONE' && (
          <button onClick={runConsensus} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground transition-colors shadow-sm self-start">
            <RefreshCw className="w-3.5 h-3.5 text-primary" /> Re-run Analysis
          </button>
        )}
      </div>

      {/* Scenario selector */}
      {(pageState === 'IDLE' || pageState === 'ERROR') && (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Scenario</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map(s => (
                <button key={s.id} onClick={() => setScenario(s)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${scenario.id === s.id ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-border bg-surface hover:bg-surface-secondary'}`}>
                  <div className="text-sm font-semibold text-foreground">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
          {pageState === 'ERROR' && (
            <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700">Analysis failed</p>
                <p className="text-[11px] text-red-600 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
          <button onClick={runConsensus}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm">
            <Play className="w-4 h-4" /> Run Consensus Analysis — {scenario.label}
          </button>
        </div>
      )}

      {pageState === 'LOADING' && <LoadingView stage={loadingStage} />}

      {pageState === 'DONE' && consensus && (
        <div className="space-y-8">
          {/* Flow breadcrumb */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-muted-foreground">
            {['Agent Analysis','Consensus','Conflicts','Action Plan','Human Approval'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">{step}</span>
                {i < arr.length - 1 && <ArrowRight className="w-3 h-3 shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          {/* 1. Agent Cards */}
          <section>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><Bot className="w-4 h-4 text-primary" />Agent Analysis</h2>
              <span className="text-[10px] text-muted-foreground font-mono">
                {agents.filter(a => a.status === 'completed').length}/{agents.length} completed
                {result.duration_ms ? ` · ${(result.duration_ms / 1000).toFixed(1)}s` : ''}
              </span>
            </div>
            {failed.length > 0 && (
              <div className="mb-3 p-3 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800">
                  {failed.length} agent{failed.length > 1 ? 's' : ''} failed: {failed.map(a => AGENT_META[a.agent]?.label || a.agent).join(', ')}.
                  Consensus built using fallback synthesis.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {agents.map(a => <AgentSummaryCard key={a.agent} agentResult={a} />)}
            </div>
          </section>

          {/* 2. Consensus Summary */}
          <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><Layers className="w-4 h-4 text-primary" />Consensus Summary</h2>
              <PriorityBadge priority={consensus.priority} />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{consensus.summary}</p>
            {consensus.agreements?.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Agreements</div>
                {consensus.agreements.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /><span>{a}</span>
                  </div>
                ))}
              </div>
            )}
            {consensus.action_plan?.risks?.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Key Constraints</div>
                {consensus.action_plan.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /><span>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 3. Conflicts */}
          {consensus.conflicts?.length > 0 ? (
            <section>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-amber-500" />Detected Conflicts
                <span className="text-[10px] font-mono bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                  {consensus.conflicts.length} conflict{consensus.conflicts.length > 1 ? 's' : ''}
                </span>
              </h2>
              <div className="space-y-3">
                {consensus.conflicts.map((c, i) => <ConflictCard key={c.conflict_id || i} conflict={c} index={i} />)}
              </div>
            </section>
          ) : (
            <section className="flex items-center gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-[11px] text-emerald-800 font-medium">No conflicts detected. All agents are aligned.</p>
            </section>
          )}

          {/* 4. Recommendations */}
          {consensus.recommendations?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />Coordinated Recommendations
              </h2>
              <div className="space-y-2">
                {consensus.recommendations.map((r, i) => <RecommendationRow key={r.recommendation_id || i} rec={r} index={i} />)}
              </div>
            </section>
          )}

          {/* 5. Action Plan */}
          {consensus.action_plan?.actions?.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" />Action Plan</h2>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {consensus.action_plan.affected_rooms?.length > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{consensus.action_plan.affected_rooms.length} room{consensus.action_plan.affected_rooms.length > 1 ? 's' : ''}</span>}
                  {consensus.action_plan.affected_guests?.length > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{consensus.action_plan.affected_guests.length} guest{consensus.action_plan.affected_guests.length > 1 ? 's' : ''}</span>}
                </div>
              </div>
              <div className="space-y-2">
                {consensus.action_plan.actions.map((a, i) => <ActionStep key={a.action_id || i} action={a} index={i} />)}
              </div>
            </section>
          )}

          {/* 6. Human Approval */}
          <section>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-primary" />Human Approval
            </h2>
            <ApprovalPanel state={approvalState} onApprove={() => setApprovalState('approved')} onModify={() => alert('Export plan and edit manually — modification UI not yet implemented.')} onReject={() => setApprovalState('rejected')} />
          </section>

          {/* Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] font-mono text-muted-foreground flex-wrap gap-2">
            <span>consensus_id: {consensus.consensus_id}</span>
            <span>context_id: {result.context_id}</span>
            <span>trigger: {result.trigger?.type}</span>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
