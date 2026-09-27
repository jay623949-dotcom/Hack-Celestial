'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import {
  Bot, Sparkles, Play, RefreshCw, AlertCircle, CheckCircle2,
  AlertTriangle, ShieldAlert, Users, BedDouble, Wrench, TrendingUp,
  Clock, Zap, CheckSquare, XCircle, Info, ArrowRight, Layers,
  UserCheck, ShieldCheck, Edit3, ThumbsUp, ThumbsDown, History,
  FileText, CornerDownRight, Check
} from 'lucide-react';
import { useRole } from '../../../lib/roleContext';
import {
  getActionPlan,
  approveActionPlan,
  rejectActionPlan,
  modifyActionPlan,
  updateActionItemStatus,
  getActionPlanAuditTrail,
  analyzeWithNugen,
  getNugenStatus
} from '../../../lib/api';

const SCENARIOS = [
  { id: 'vip_arrival', label: 'VIP Early Arrival — Room 401 AC Failure', desc: 'VIP guest Arjun Mehta arrives 2 hrs early (14:00) while assigned Room 401 has an AC compressor failure.' },
  { id: 'multiple_incidents', label: 'Multiple Active Incidents', desc: 'HVAC breakdown on 4th floor, housekeeping turnover bottleneck, wedding group incoming.' },
  { id: 'group_arrival', label: 'Large Group Check-in', desc: '24-room wedding block arriving at 2:00 PM with Floor 4 inventory constraints.' },
];

const AGENT_META = {
  front_desk:   { label: 'Front Desk',   dept: 'Guest Operations',     icon: Users,      color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  housekeeping: { label: 'Housekeeping', dept: 'Turnover & Readiness', icon: BedDouble,  color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200' },
  maintenance:  { label: 'Maintenance',  dept: 'Engineering & HVAC',   icon: Wrench,     color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' },
  revenue:      { label: 'Revenue',      dept: 'Inventory & Yield',    icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

export default function OperationalDecisionReviewPage() {
  const { role, roleData } = useRole();
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Core plan data
  const [plan, setPlan] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);

  // Dialog & Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);

  // Form Inputs
  const [approveComment, setApproveComment] = useState('Approved for execution. Proceed with room turnover and VIP escort.');
  const [rejectReason, setRejectReason] = useState('');
  const [modifyReason, setModifyReason] = useState('Reassigning to Room 205 which is already inspected and available.');
  const [editableActions, setEditableActions] = useState([]);
  const [activeTab, setActiveTab] = useState('decision'); // 'decision' | 'audit'

  // Nugen Domain-Aligned AI State
  const [nugenIntelligence, setNugenIntelligence] = useState(null);
  const [nugenStatus, setNugenStatus] = useState(null);
  const [nugenLoading, setNugenLoading] = useState(false);

  const fetchNugenAnalysis = useCallback(async (scenario = selectedScenario) => {
    try {
      setNugenLoading(true);
      const [analysisRes, statusRes] = await Promise.allSettled([
        analyzeWithNugen({ trigger: { type: scenario.id || 'vip_arrival', incident_id: 'INC-401-AC' } }),
        getNugenStatus(),
      ]);

      if (analysisRes.status === 'fulfilled' && analysisRes.value?.data?.domain_analysis) {
        setNugenIntelligence(analysisRes.value.data.domain_analysis);
      }
      if (statusRes.status === 'fulfilled' && statusRes.value?.data) {
        setNugenStatus(statusRes.value.data);
      }
    } catch (err) {
      console.warn('Nugen fetch error:', err.message);
    } finally {
      setNugenLoading(false);
    }
  }, [selectedScenario]);

  // Fetch plan from backend
  const loadPlan = useCallback(async (planId = 'plan-vip-arrival') => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await getActionPlan(planId);
      if (res?.data) {
        setPlan(res.data);
        setEditableActions(JSON.parse(JSON.stringify(res.data.items || [])));
        const auditRes = await getActionPlanAuditTrail(planId);
        setAuditTrail(auditRes?.data?.audit_trail || []);
      }
    } catch (err) {
      console.warn('Failed to load plan, using initial state:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlan();
    fetchNugenAnalysis();
  }, [loadPlan, fetchNugenAnalysis]);

  // Handle Approve
  const handleApprove = async () => {
    if (!plan) return;
    try {
      setLoading(true);
      const res = await approveActionPlan(plan.id, {
        comment: approveComment,
        actorId: roleData?.email || 'admin@resort360.demo',
        actorRole: role || 'admin',
      });
      setShowApproveModal(false);
      await loadPlan(plan.id);
    } catch (err) {
      setErrorMsg(err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!plan || !rejectReason.trim()) return;
    try {
      setLoading(true);
      const res = await rejectActionPlan(plan.id, {
        reason: rejectReason,
        actorId: roleData?.email || 'admin@resort360.demo',
        actorRole: role || 'admin',
      });
      setShowRejectModal(false);
      await loadPlan(plan.id);
    } catch (err) {
      setErrorMsg(err.message || 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Modify
  const handleModify = async () => {
    if (!plan || !modifyReason.trim()) return;
    try {
      setLoading(true);
      const res = await modifyActionPlan(plan.id, {
        reason: modifyReason,
        modifications: editableActions,
        actorId: roleData?.email || 'admin@resort360.demo',
        actorRole: role || 'admin',
      });
      setShowModifyModal(false);
      await loadPlan(plan.id);
    } catch (err) {
      setErrorMsg(err.message || 'Modification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle individual item status progression
  const handleItemStatusToggle = async (itemId, currentStatus) => {
    if (!plan || plan.status !== 'approved') return;
    const nextStatus = currentStatus === 'approved' ? 'in_progress' : currentStatus === 'in_progress' ? 'completed' : 'approved';
    try {
      await updateActionItemStatus(plan.id, itemId, nextStatus);
      await loadPlan(plan.id);
    } catch (err) {
      console.error('Failed to update task item status:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { label: 'APPROVED', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'modified_pending_approval':
        return { label: 'MODIFIED — AWAITING APPROVAL', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'rejected':
        return { label: 'REJECTED', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'in_progress':
        return { label: 'IN PROGRESS', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'completed':
        return { label: 'COMPLETED', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'pending_review':
      case 'pending_approval':
      default:
        return { label: 'AWAITING MANAGER REVIEW', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
  };

  const statusBadge = getStatusBadge(plan?.status);
  const items = plan?.items || [];
  const completedCount = items.filter(i => i.status === 'completed').length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Operational Decision Review
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Human-in-the-Loop decision governance: AI multi-agent recommendations require explicit manager review and approval.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('decision')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'decision'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Decision Console
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit Trail ({auditTrail.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg border border-rose-300 bg-rose-50 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs text-rose-600 hover:text-rose-800 font-bold">Dismiss</button>
        </div>
      )}

      {/* TOP SECTION: INCIDENT / SITUATION CONTEXT */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                CRITICAL OPERATIONAL EVENT
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">EVENT #INC-401-AC</span>
              <span className="text-[11px] font-mono text-muted-foreground">Reported: 14:00 IST</span>
            </div>
            <h2 className="text-base font-bold text-foreground">
              VIP Early Arrival — Room 401 AC Failure
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              VIP guest Arjun Mehta arrived 2 hours early (14:00, expected 16:00) while assigned Room 401 has an active AC compressor failure. Four operational departments require immediate coordination.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center shrink-0">
            <div className="p-2 rounded-lg bg-surface-secondary/70 border border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Priority</div>
              <div className="text-xs font-bold text-rose-600 mt-0.5">CRITICAL</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-secondary/70 border border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Affected Rooms</div>
              <div className="text-xs font-bold text-foreground mt-0.5">Room 401, 205</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-secondary/70 border border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Affected Guest</div>
              <div className="text-xs font-bold text-foreground mt-0.5">Arjun Mehta (VIP)</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-secondary/70 border border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Departments</div>
              <div className="text-xs font-bold text-primary mt-0.5">4 Active</div>
            </div>
          </div>
        </div>

        {/* Status Lifecycle Timeline */}
        <div className="pt-4 flex items-center justify-between overflow-x-auto text-xs">
          {[
            { label: 'AI Generated', desc: 'Swarm Consensus', active: true, done: true },
            { label: 'Manager Review', desc: 'Active Decision', active: plan?.status !== 'pending_review', done: ['approved', 'rejected', 'modified_pending_approval', 'in_progress', 'completed'].includes(plan?.status) },
            { label: 'Modified', desc: plan?.modified_plan ? 'Manager Edits' : 'None', active: plan?.status === 'modified_pending_approval', done: !!plan?.modified_plan },
            { label: 'Approved', desc: plan?.approved_by ? `${plan.approved_by.split('@')[0]}` : 'Required', active: plan?.status === 'approved', done: ['approved', 'in_progress', 'completed'].includes(plan?.status) },
            { label: 'In Progress', desc: `${completedCount}/${items.length} Tasks`, active: plan?.status === 'in_progress', done: plan?.status === 'completed' },
            { label: 'Completed', desc: 'All Actions Cleared', active: plan?.status === 'completed', done: plan?.status === 'completed' },
          ].map((step, idx, arr) => (
            <div key={idx} className="flex items-center gap-2 shrink-0 pr-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                step.done
                  ? 'bg-emerald-600 text-white'
                  : step.active
                  ? 'bg-primary text-primary-foreground animate-pulse'
                  : 'bg-surface-secondary text-muted-foreground border border-border'
              }`}>
                {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div>
                <div className={`font-semibold ${step.done || step.active ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{step.desc}</div>
              </div>
              {idx < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 ml-2" />}
            </div>
          ))}
        </div>
      </section>

      {activeTab === 'audit' ? (
        /* AUDIT TRAIL TAB */
        <section className="rounded-xl border border-border bg-surface p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Immutable Decision Audit Trail
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every AI generation, manager review, modification, and execution state change is recorded with actor timestamping.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-secondary border border-border text-muted-foreground">
              {auditTrail.length} Logged Events
            </span>
          </div>

          <div className="space-y-3">
            {auditTrail.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No audit records logged yet.</div>
            ) : (
              auditTrail.map((log, i) => (
                <div key={log.id || i} className="p-3.5 rounded-lg border border-border bg-surface-secondary/30 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        log.decision === 'approve'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : log.decision === 'reject'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : log.decision === 'modify'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {log.decision}
                      </span>
                      <span className="font-semibold text-foreground">{log.actor_id} ({log.actor_role})</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {log.previous_status} → {log.new_status}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{log.reason}</p>

                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="mt-2 p-2 rounded bg-surface border border-border/80 font-mono text-[11px] text-muted-foreground">
                        <span className="font-bold text-foreground">Logged Changes: </span>
                        {JSON.stringify(log.changes)}
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground shrink-0">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
        /* DECISION CONSOLE TAB */
        <div className="space-y-6">
          {/* NUGEN DOMAIN-ALIGNED INTELLIGENCE */}
          <section className="rounded-xl border border-primary/40 bg-primary/[0.03] p-5 shadow-soft space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
                      Nugen Domain-Aligned Model
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      {nugenIntelligence?.confidence_score || 96.2}% Confidence
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                    Resort 360 Hospitality Intelligence
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-mono self-start sm:self-auto">
                <span className="text-muted-foreground text-[11px]">
                  Model: <strong className="text-foreground">{nugenIntelligence?.aligned_model_id || 'resort360-hospitality-v1'}</strong>
                </span>
                <button
                  onClick={() => fetchNugenAnalysis()}
                  disabled={nugenLoading}
                  className="px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <RefreshCw className={`w-3 h-3 ${nugenLoading ? 'animate-spin text-primary' : ''}`} />
                  Re-analyze
                </button>
              </div>
            </div>

            {/* Structured Domain Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-border/80">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Incident</span>
                <strong className="text-foreground text-xs mt-0.5 block truncate">
                  VIP Early Arrival + Room 401 AC
                </strong>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border/80">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Severity</span>
                <span className="inline-block mt-0.5 text-xs font-bold text-rose-600 uppercase">
                  {nugenIntelligence?.severity || 'CRITICAL'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border/80 sm:col-span-2">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Affected Teams</span>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {(nugenIntelligence?.affected_departments || ['front_desk', 'maintenance', 'housekeeping', 'revenue']).map((dept) => (
                    <span key={dept} className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-secondary border border-border font-semibold text-foreground">
                      {dept.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommendation, Why, Impact */}
            <div className="space-y-2.5 text-xs leading-relaxed">
              <div className="p-3.5 rounded-lg bg-surface border border-border/80">
                <div className="font-bold text-foreground text-xs flex items-center gap-1.5 text-primary mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  AI Domain Recommendation
                </div>
                <p className="text-foreground/90">
                  {nugenIntelligence?.summary || 'Reassign VIP guest Arjun Mehta to alternative inspected Room 205, escort to Private Club Lounge with welcome beverage, and dispatch maintenance technician Rohan Mehta for Room 401 compressor breaker diagnosis.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-lg bg-surface border border-border/80">
                  <div className="font-bold text-foreground text-xs text-amber-700 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    Why (Operational Justification)
                  </div>
                  <p className="text-muted-foreground">
                    {nugenIntelligence?.explanation?.why || 'AC compressor repair window exceeds allowable guest wait time. Reassignment to pre-inspected Deluxe Room 205 eliminates lobby congestion while protecting 82% occupancy yield.'}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-surface border border-border/80">
                  <div className="font-bold text-foreground text-xs text-rose-700 mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Impact & Risk Mitigation
                  </div>
                  <p className="text-muted-foreground">
                    {nugenIntelligence?.explanation?.impact || 'Prevents Tier-1 VIP dissatisfaction; zero net revenue leakage; maintenance isolated to back-of-house work order.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1: WHAT IS THE AI RECOMMENDING? */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                1. What is the AI Recommending?
              </h2>
              <span className="text-[10px] font-mono text-muted-foreground">AI Consensus Synthesis</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              The AI Swarm recommends an immediate coordinated action plan: keep <strong>Room 401</strong> blocked for AC repair, prepare alternative <strong>Room 205 (Deluxe)</strong> for VIP guest <strong>Arjun Mehta</strong>, escort the guest to the Private Club Lounge with beverage service via Amit Shah, and assign technician Rohan Mehta to inspect the Room 401 AC compressor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="p-2.5 rounded-lg border border-border/80 bg-surface-secondary/40 flex items-start gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{item.description}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5 capitalize">
                      {item.department?.replace('_', ' ')} · {item.assigned_staff || 'Available Staff'} · {item.estimated_duration_minutes || 20}m est.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: WHY? (Plain Operational Reasoning) */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-soft space-y-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              2. Why? Operational Justification
            </h2>
            <div className="p-3.5 rounded-lg bg-surface-secondary/50 border border-border/80 text-xs text-foreground leading-relaxed space-y-1.5">
              <p>
                <strong>Root Cause:</strong> Assigned Room 401 air conditioner has failed and cannot be handed over. Technician Rohan Mehta is on standby to diagnose and execute repairs.
              </p>
              <p>
                <strong>VIP Priority:</strong> Arjun Mehta has VIP priority status with a 2-night stay. Waiting time in the lobby must be minimized through lounge hospitality and fast reassignment.
              </p>
              <p>
                <strong>Inventory Match:</strong> Alternative Room 205 (Deluxe) is available on Floor 2. Priya Sharma is available to perform priority preparation and inspection.
              </p>
            </div>
          </section>

          {/* SECTION 3: DEPARTMENT PERSPECTIVES */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              3. Departmental Perspectives (Summarized)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  dept: 'front_desk',
                  obs: 'VIP Arjun Mehta waiting in lobby. Room 401 is unavailable due to AC failure.',
                  rec: 'Reassign to alternative Deluxe Room 205; escort guest to Private Club Lounge.',
                },
                {
                  dept: 'housekeeping',
                  obs: 'Room 205 is clean & available. Attendant Priya Sharma available on Floor 2.',
                  rec: 'Prioritize Room 205 for immediate preparation & inspection before reassignment.',
                },
                {
                  dept: 'maintenance',
                  obs: 'Room 401 AC compressor failure. Room must remain offline until repair is verified.',
                  rec: 'Keep Room 401 blocked; assign technician Rohan Mehta to inspect and repair AC.',
                },
                {
                  dept: 'revenue',
                  obs: '82% hotel occupancy. Deluxe category inventory is limited today.',
                  rec: 'Moving VIP to Room 205 consumes inventory; hold from general OTA pool.',
                },
              ].map((d) => {
                const meta = AGENT_META[d.dept];
                const Icon = meta.icon;
                return (
                  <div key={d.dept} className="rounded-xl border border-border bg-surface p-4 shadow-soft space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${meta.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground leading-tight">{meta.label}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{meta.dept}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <strong className="text-foreground font-semibold">Observation: </strong>{d.obs}
                    </div>
                    <div className="text-[11px] text-foreground font-medium pt-1 border-t border-border/60">
                      <span className="text-primary font-bold">Proposal: </span>{d.rec}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 4 & 5: AGREEMENTS & CONFLICTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Agreements */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-soft space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  4. Departmental Agreements
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Suite 401 must remain strictly blocked and offline until Engineering confirms ambient temperature drops below 72°F.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>VIP guest Arjun Mehta cannot be kept waiting in lobby without escalated service recovery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Front Desk will notify Housekeeping immediately upon VIP entry to Club Lounge.</span>
                </li>
              </ul>
            </div>

            {/* Conflicts */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    5. Detected Operational Conflict
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  DECISION REQUIRED
                </span>
              </div>
              <div className="text-xs text-amber-950 space-y-1.5 leading-relaxed">
                <p>
                  <strong>Revenue Management:</strong> Prefers keeping Room 205 open for same-day unconstrained OTA walk-in at peak ADR (₹24,000).
                </p>
                <p>
                  <strong>Front Desk:</strong> Recommends assigning Room 205 directly to Diamond VIP Vance to prevent high-value guest churn.
                </p>
                <p className="text-[11px] text-amber-900 font-semibold pt-1 border-t border-amber-200">
                  Manager Resolution: Approving this plan endorses Front Desk priority over same-day retail sale.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 6: IMPACT ANALYSIS */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-soft space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              6. Impact Analysis &amp; Risk Assessment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Guest Impact</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">High Positive</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Eliminates lobby wait; lounge amenity provided.</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Operational Impact</div>
                <div className="text-xs font-bold text-foreground mt-1">1 Attendant Allocated</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Lakshmi Naik assigned 25m express clean.</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Revenue Impact</div>
                <div className="text-xs font-bold text-foreground mt-1">Protected ADR</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Protects ₹48k VIP reservation value.</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Resource Impact</div>
                <div className="text-xs font-bold text-foreground mt-1">2 Staff Active</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Front desk escort + HVAC technician.</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Operational Risk</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">Low Risk</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Alternative standard inventory remains for 2 PM group.</p>
              </div>
            </div>
          </section>

          {/* SECTION 7: ACTION PLAN OPERATIONAL TABLE */}
          <section className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  7. Action Plan Task Table
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detailed operational steps dispatched to departments upon approval.
                </p>
              </div>

              {plan?.status === 'approved' && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-mono text-muted-foreground">Progress:</span>
                  <div className="w-24 bg-surface-secondary rounded-full h-2 overflow-hidden border border-border">
                    <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="font-mono font-bold text-foreground text-[11px]">{completedCount}/{items.length} Done</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary/50 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5 px-4 font-semibold">Priority</th>
                    <th className="py-2.5 px-4 font-semibold">Action Description</th>
                    <th className="py-2.5 px-4 font-semibold">Department</th>
                    <th className="py-2.5 px-4 font-semibold">Assigned Staff</th>
                    <th className="py-2.5 px-4 font-semibold">Room</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status &amp; Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-surface-secondary/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          it.priority === 'critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : it.priority === 'high'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {it.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-foreground max-w-xs">
                        {it.description}
                      </td>

                      <td className="py-3 px-4 capitalize text-muted-foreground">
                        {it.department?.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-foreground">
                        {it.assigned_staff || 'Floor Attendant'}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {it.room_id ? `Room ${it.room_id.replace('room-', '')}` : '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {plan?.status === 'approved' ? (
                          <button
                            onClick={() => handleItemStatusToggle(it.id, it.status)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-colors ${
                              it.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : it.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                                : 'bg-surface-secondary text-foreground border border-border hover:bg-surface-secondary/80'
                            }`}
                            title="Click to advance status"
                          >
                            {it.status === 'completed' && <Check className="w-3 h-3" />}
                            {it.status?.toUpperCase()}
                          </button>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground bg-surface-secondary border border-border">
                            {it.status?.toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 8: APPROVAL CONTROLS */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  8. Human-in-the-Loop Decision Controls
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Logged in as <strong className="text-foreground">{roleData?.label || 'Resort Admin'}</strong> ({roleData?.email || 'admin@resort360.demo'}).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {plan?.status === 'approved' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Plan Approved by {plan.approved_by || 'Admin'} at {plan.approved_at ? new Date(plan.approved_at).toLocaleTimeString() : '10:45 AM'}</span>
                    </div>
                    <Link
                      href={`/dashboard/execution/${plan.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>View Live Execution &amp; Dispatch →</span>
                    </Link>
                  </div>
                ) : plan?.status === 'rejected' ? (

                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 px-4 py-2 rounded-lg border border-rose-200">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Plan Rejected ({plan.rejected_reason})</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Reject Plan
                    </button>

                    <button
                      onClick={() => setShowModifyModal(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-primary" />
                      Modify Plan
                    </button>

                    <button
                      onClick={() => setShowApproveModal(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Approve Plan
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* APPROVE CONFIRMATION DIALOG */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-foreground">Approve Operational Action Plan?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              By approving, you confirm that the proposed operational actions can proceed immediately. Tasks will be formally dispatched to Housekeeping, Front Desk, and Engineering.
            </p>

            <div className="p-3 rounded-lg bg-surface-secondary/50 border border-border text-xs space-y-1">
              <div className="font-semibold text-foreground">Summary of Authorization:</div>
              <div className="text-[11px] text-muted-foreground">• Reassign Diamond VIP to Room 205</div>
              <div className="text-[11px] text-muted-foreground">• Dispatch 25m express cleaning to attendant Lakshmi Naik</div>
              <div className="text-[11px] text-muted-foreground">• Authorize Club Lounge beverage amenity courtesy</div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Approval Comment (Optional)
              </label>
              <input
                type="text"
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-surface text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-xs font-bold"
              >
                {loading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION DIALOG */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-foreground">Reject Operational Action Plan</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Rejecting this AI proposal halts automated execution. A meaningful reason is required to maintain the decision audit log.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Reason for Rejection <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Guest requested to wait in lobby for Room 401 instead of moving to Floor 2."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-surface text-foreground focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold disabled:opacity-50"
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODIFY PLAN DIALOG */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Modify Proposed Action Plan</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Human Override
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Edit operational parameters below. The original AI recommendation remains preserved in the audit trail.
            </p>

            {/* Editable Action Items */}
            <div className="space-y-3">
              {editableActions.map((act, idx) => (
                <div key={act.id || idx} className="p-3 rounded-lg border border-border bg-surface-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase">Task #{idx + 1} ({act.department})</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground uppercase">Action Description</label>
                    <input
                      type="text"
                      value={act.description}
                      onChange={(e) => {
                        const copy = [...editableActions];
                        copy[idx].description = e.target.value;
                        setEditableActions(copy);
                      }}
                      className="w-full text-xs p-1.5 rounded border border-border bg-surface text-foreground mt-0.5"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-muted-foreground uppercase">Room</label>
                      <input
                        type="text"
                        value={act.room_id || ''}
                        onChange={(e) => {
                          const copy = [...editableActions];
                          copy[idx].room_id = e.target.value;
                          setEditableActions(copy);
                        }}
                        className="w-full text-xs p-1.5 rounded border border-border bg-surface text-foreground mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-muted-foreground uppercase">Resource / Staff</label>
                      <input
                        type="text"
                        value={act.assigned_staff || ''}
                        onChange={(e) => {
                          const copy = [...editableActions];
                          copy[idx].assigned_staff = e.target.value;
                          setEditableActions(copy);
                        }}
                        className="w-full text-xs p-1.5 rounded border border-border bg-surface text-foreground mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-muted-foreground uppercase">Priority</label>
                      <select
                        value={act.priority}
                        onChange={(e) => {
                          const copy = [...editableActions];
                          copy[idx].priority = e.target.value;
                          setEditableActions(copy);
                        }}
                        className="w-full text-xs p-1.5 rounded border border-border bg-surface text-foreground mt-0.5"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Reason for Modification <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Changed assigned attendant and verified Room 205 availability."
                value={modifyReason}
                onChange={(e) => setModifyReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-surface text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleModify}
                disabled={loading || !modifyReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-xs font-bold disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes & Await Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
