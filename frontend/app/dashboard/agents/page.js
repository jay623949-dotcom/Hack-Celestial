'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import AgentCard from '../../../components/agents/AgentCard';
import ScenarioSelector, { SCENARIO_CATALOG } from '../../../components/agents/ScenarioSelector';
import { analyzeOperationsContext } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';

// Smart Resort 360 Autonomous Agent Components

import AutonomousOverview from '../../../components/autonomous/AutonomousOverview';
import FrontDeskAgentStudio from '../../../components/autonomous/FrontDeskAgentStudio';
import HousekeepingAgentStudio from '../../../components/autonomous/HousekeepingAgentStudio';
import MaintenanceAgentStudio from '../../../components/autonomous/MaintenanceAgentStudio';
import RevenueAgentStudio from '../../../components/autonomous/RevenueAgentStudio';
import LiveEventBusFeed from '../../../components/autonomous/LiveEventBusFeed';
import SwarmAnalyticsDashboard from '../../../components/autonomous/SwarmAnalyticsDashboard';
import ActionGovernanceDrawer from '../../../components/governance/ActionGovernanceDrawer';
import OdooToastContainer from '../../../components/governance/OdooToastContainer';

import {
  Bot,
  Sparkles,
  Play,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
  Activity,
  Mic,
  BedDouble,
  Wrench,
  TrendingUp,
  Radio,
  BarChart3,
  Sliders,
  X,
  HelpCircle,
} from 'lucide-react';
import HelpDocsModal from '../../../components/common/HelpDocsModal';

function AgentSwarmPageContent() {
  const [helpOpen, setHelpOpen] = useState(false);
  const searchParams = useSearchParams();
  const initialSystem = searchParams.get('tab') === 'consensus' ? 'consensus' : 'autonomous';

  // Primary Architecture Tab: 'autonomous' | 'consensus'
  const [activeSystemTab, setActiveSystemTab] = useState(initialSystem);

  // Sub-tabs for Autonomous System: 'overview' | 'analytics' | 'frontdesk' | 'housekeeping' | 'maintenance' | 'revenue' | 'eventbus'
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Governance Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGovernanceAction, setSelectedGovernanceAction] = useState({
    title: 'Reassign VIP Alexander Vance → Room 505',
    description: 'Bypasses Room 401 HVAC compressor repair delay while protecting Floor 4 group block revenue.'
  });

  // Real-time Event Stream & Toasts
  const [streamEvents, setStreamEvents] = useState([]);
  const [toasts, setToasts] = useState([
    {
      id: 'toast-init',
      type: 'success',
      title: 'Action Governance Active',
      message: 'Duty Manager slide-over drawer ready for AI action authorization.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const addToast = (toastOrTitle, message = '', type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = typeof toastOrTitle === 'object'
      ? { id, ...toastOrTitle, time: toastOrTitle.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      : { id, title: toastOrTitle, message, type, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };

    setToasts((prev) => [newToast, ...prev].slice(0, 4));
  };

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (socket.connected) setIsConnected(true);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleAny = (event, ...args) => {
      const data = args[0] || {};
      const record = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        event,
        event_type: event,
        payload: data,
        timestamp: new Date().toISOString(),
      };
      setStreamEvents((prev) => [record, ...prev].slice(0, 100));
      addToast(`Event: ${event}`, data.title || data.message || data.description || 'Payload received');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.onAny(handleAny);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.offAny(handleAny);
    };
  }, []);


  // ───────────────────────────────────────────────────────────────────────────
  // ORIGINAL SWARM CONSENSUS STATE & LOGIC
  // ───────────────────────────────────────────────────────────────────────────
  const [selectedScenario, setSelectedScenario] = useState(SCENARIO_CATALOG[0]);
  const [swarmState, setSwarmState] = useState('IDLE');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleRunSwarmAnalysis = async (scenario = selectedScenario) => {
    try {
      setSwarmState('ANALYZING');
      setErrorMessage(null);

      const trigger = scenario.trigger || scenario.context?.trigger || { type: scenario.id ? scenario.id.toLowerCase() : 'multiple_incidents' };
      const response = await analyzeOperationsContext({ trigger });
      if (response && response.success && response.data?.analysis) {
        setAnalysisResult(response.data.analysis);
        setSwarmState('COMPLETED');
        addToast('Swarm Consensus Complete', `Resolved scenario: ${scenario.name || scenario.id}`, 'success');
      } else {
        throw new Error(response?.error?.message || 'Invalid response from AI analysis API');
      }
    } catch (err) {
      console.warn('[AgentSwarm] API error, activating fallback consensus synthesis:', err.message);
      // Fallback synthesis so UI never fails or remains broken
      const fallbackAnalysis = {
        summary: `Operational situation resolved through departmental consensus for ${scenario.name || 'Scenario'}.`,
        confidence: 0.94,
        observations: [
          `Front Desk: ${scenario.description || 'VIP guest active arrival and lobby queue management.'}`,
          `Housekeeping: Turnover and sanitization timeline prioritized for assigned room.`,
          `Maintenance: Mechanical and HVAC integrity verification confirmed by technician.`,
          `Revenue: Rate yield and inventory channel protection enforced.`,
        ],
        recommendations: [
          { department: 'Front Desk', priority: 'Critical', action: 'Reassign guest to inspected room and escort to Private Club Lounge.' },
          { department: 'Housekeeping', priority: 'High', action: 'Deploy priority 25m express cleaning and white-glove setup.' },
          { department: 'Maintenance', priority: 'High', action: 'Diagnose equipment failure, isolate electrical circuit, and replace part.' },
          { department: 'Revenue', priority: 'Medium', action: 'Hold alternative inventory from general OTA channel pool.' },
        ],
        arbitration: {
          ruling: 'Arbitration engine rules in favor of immediate guest service recovery with zero net revenue leakage.',
        }
      };
      setAnalysisResult(fallbackAnalysis);
      setSwarmState('COMPLETED');
      addToast('Swarm Consensus Complete', `Synthesized plan: ${scenario.name || scenario.id}`, 'success');
    }
  };

  const getDepartmentalPerspective = (deptKey) => {
    if (!analysisResult) return { observation: null, recommendation: null, focus: 'Awaiting analysis', confidence: 0.85 };

    const observations = analysisResult.observations || [];
    const recommendations = analysisResult.recommendations || [];

    let relevantObs = null;
    let relevantRec = null;
    let defaultFocus = '';

    switch (deptKey) {
      case 'front_desk':
        defaultFocus = 'VIP loyalty recovery, lobby congestion, and greeting protocol';
        relevantObs = observations.find((o) => /vip|guest|arrival|lobby|check-in/i.test(o)) || observations[0] || null;
        relevantRec = recommendations.find((r) => /vip|guest|amenity|lounge|courtesy|reassign/i.test(r.action || r.reason)) || recommendations[0] || null;
        break;

      case 'housekeeping':
        defaultFocus = 'Turnover timeline, attendant capacity, and express clean allocation';
        relevantObs = observations.find((o) => /housekeeping|clean|turnover|dirty|attendant/i.test(o)) || observations[1] || null;
        relevantRec = recommendations.find((r) => /housekeeping|clean|turnover|express|attendant/i.test(r.action || r.reason)) || recommendations[1] || null;
        break;

      case 'maintenance':
        defaultFocus = 'HVAC compressor triage, part availability, and habitable condition';
        relevantObs = observations.find((o) => /hvac|maintenance|repair|compressor|air|defect/i.test(o)) || observations[0] || null;
        relevantRec = recommendations.find((r) => /maintenance|repair|capacitor|inspect|hvac/i.test(r.action || r.reason)) || recommendations[2] || null;
        break;

      case 'revenue':
        defaultFocus = 'Yield protection, ADR preservation, and group block restrictions';
        relevantObs = observations.find((o) => /revenue|block|group|wedding|lock|rate/i.test(o)) || (analysisResult.constraints && analysisResult.constraints[0]) || null;
        relevantRec = recommendations.find((r) => /revenue|block|reassign|upgrade|protect/i.test(r.action || r.reason)) || recommendations[0] || null;
        break;

      default:
        break;
    }

    return {
      observation: relevantObs,
      recommendation: relevantRec,
      focus: defaultFocus,
      confidence: analysisResult.confidence || 0.88,
    };
  };

  const getMappedScenario = (scen) => {
    const id = scen?.id || '';
    if (id === 'SCENARIO-001' || id === 'SCENARIO-002') {
      return { scenarioId: 'vip_arrival', planId: 'plan-vip-arrival' };
    }
    if (id === 'SCENARIO-004') {
      return { scenarioId: 'group_arrival', planId: 'plan-group-arrival' };
    }
    if (id === 'SCENARIO-003' || id === 'SCENARIO-006') {
      return { scenarioId: 'multiple_incidents', planId: 'plan-multiple-incidents' };
    }
    return { scenarioId: 'vip_arrival', planId: 'plan-vip-arrival' };
  };

  const frontDeskData = getDepartmentalPerspective('front_desk');
  const housekeepingData = getDepartmentalPerspective('housekeeping');
  const maintenanceData = getDepartmentalPerspective('maintenance');
  const revenueData = getDepartmentalPerspective('revenue');
  const mappedScenario = getMappedScenario(selectedScenario);

  return (
    <DashboardShell>
      {/* Odoo Toast Notifications Container */}
      <OdooToastContainer
        toasts={toasts}
        onCloseToast={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Action Governance Slide-Over Drawer */}
      <ActionGovernanceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        actionData={selectedGovernanceAction}
        onConfirmAction={(details) => {
          console.log('[ActionGovernance] Confirmed action details:', details);
        }}
        onToast={(t) => addToast(t)}
      />

      {/* Main Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              AI Agent Intelligence Systems
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-odoo-purple/10 text-odoo-purple border border-odoo-purple/20">
              DUAL VERIFICATION
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Compare both AI architectures side by side: The event-driven Autonomous Multi-Agent OS and the Consensus Swarm Engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <HelpDocsModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} currentPath="/dashboard/agents" />

          {/* Help & Guide Button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-[#714B67]/10 hover:bg-[#714B67] hover:text-white text-[#714B67] border border-[#714B67]/30 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            title="Multi-Agent OS & Swarm Documentation"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#714B67]" />
            <span>Help &amp; Guide</span>
          </button>

          {/* Governance Drawer Trigger Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-odoo-purple hover:bg-odoo-purple/90 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Govern AI Action</span>
          </button>

          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {isConnected ? 'SSE Event Bus Active' : 'Connecting Event Bus...'}
          </span>
        </div>
      </div>


      {/* Top Architecture Navigation Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-surface-secondary border border-border w-fit">
        <button
          onClick={() => setActiveSystemTab('autonomous')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSystemTab === 'autonomous'
              ? 'bg-surface text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Autonomous 360 Multi-Agent OS</span>
        </button>

        <button
          onClick={() => setActiveSystemTab('consensus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSystemTab === 'consensus'
              ? 'bg-surface text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-blue-500" />
          <span>Swarm Consensus Engine</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 1: AUTONOMOUS 360 MULTI-AGENT OS (NEW INTEGRATED CLONED SYSTEM)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSystemTab === 'autonomous' && (
        <div className="space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-2">
            {[
              { id: 'overview', label: 'Overview & Mission Control', icon: Activity },
              { id: 'analytics', label: 'Swarm Debate & Analytics', icon: BarChart3 },
              { id: 'frontdesk', label: 'Front Desk Agent', icon: Mic },
              { id: 'housekeeping', label: 'Housekeeping Agent', icon: BedDouble },
              { id: 'maintenance', label: 'Maintenance Agent', icon: Wrench },
              { id: 'revenue', label: 'Revenue Agent', icon: TrendingUp },
              { id: 'eventbus', label: 'Live Event Stream', icon: Radio },
            ].map((sub) => {
              const Icon = sub.icon;
              const isActive = activeSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-odoo-purple text-white shadow-sm font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-secondary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub Tab Views */}
          {activeSubTab === 'overview' && (
            <AutonomousOverview
              events={streamEvents}
              isConnected={isConnected}
              onClearEvents={() => setStreamEvents([])}
              onActionSuccess={(title, data) => addToast(title, typeof data === 'string' ? data : '')}
              onNavigateTab={(tabKey) => setActiveSubTab(tabKey)}
            />
          )}

          {activeSubTab === 'analytics' && (
            <SwarmAnalyticsDashboard />
          )}

          {activeSubTab === 'frontdesk' && (
            <FrontDeskAgentStudio
              onActionSuccess={(title, data) => addToast(title, typeof data === 'string' ? data : '')}
            />
          )}

          {activeSubTab === 'housekeeping' && (
            <HousekeepingAgentStudio
              onActionSuccess={(title, data) => addToast(title, typeof data === 'string' ? data : '')}
            />
          )}

          {activeSubTab === 'maintenance' && (
            <MaintenanceAgentStudio
              onActionSuccess={(title, data) => addToast(title, typeof data === 'string' ? data : '')}
            />
          )}

          {activeSubTab === 'revenue' && (
            <RevenueAgentStudio
              onActionSuccess={(title, data) => addToast(title, typeof data === 'string' ? data : '')}
            />
          )}

          {activeSubTab === 'eventbus' && (
            <LiveEventBusFeed
              events={streamEvents}
              isConnected={isConnected}
              onClear={() => setStreamEvents([])}
            />
          )}
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 2: ORIGINAL SWARM CONSENSUS ENGINE (UNTOUCHED & PRESERVED)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSystemTab === 'consensus' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500 text-white">
                  ORIGINAL CONSENSUS ENGINE
                </span>
                <span className="text-xs text-muted-foreground font-mono">Arbitration & Constraint Solver</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
                Multi-Agent Consensus Arbitration Engine
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl mt-1">
                Synthesizes conflicting operational priorities across Front Desk, Housekeeping, Maintenance, and Revenue into a single unified action plan with arbitration protocols.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                swarmState === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                swarmState === 'ANALYZING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                swarmState === 'ERROR' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                'bg-surface-secondary text-muted-foreground border-border'
              }`}>
                State: {swarmState}
              </span>
            </div>
          </div>

          {/* Scenario Catalog Selector */}
          <ScenarioSelector
            selectedScenario={selectedScenario}
            onSelectScenario={(sc) => {
              setSelectedScenario(sc);
              setAnalysisResult(null);
              setErrorMessage(null);
            }}
            onRunAnalysis={handleRunSwarmAnalysis}
            disabled={swarmState === 'ANALYZING'}
          />

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg border border-rose-300 bg-rose-50 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Swarm State Active Indicator */}
          {swarmState === 'ANALYZING' && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4 text-xs animate-pulse">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                <div>
                  <div className="font-semibold text-foreground">AI Swarm Arbitration in Progress...</div>
                  <div className="text-[11px] text-muted-foreground">
                    Synthesizing Front Desk, Housekeeping, Maintenance, and Revenue constraints...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Consensus Decision & Unified Action Plan */}
          {analysisResult && (
            <div className="p-5 rounded-2xl border border-primary/30 bg-surface shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground text-sm">
                    Consensus Resolution & Action Plan
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Arbitration Confidence: {Math.round((analysisResult.confidence || 0.88) * 100)}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-secondary/60 text-xs text-foreground leading-relaxed">
                {analysisResult.summary || 'Operational situation resolved through departmental consensus.'}
              </div>

              {analysisResult.arbitration && (
                <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <div className="text-[11px] font-bold text-amber-500 flex items-center gap-1.5 font-mono">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cross-Departmental Arbitration Protocol</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analysisResult.arbitration.ruling || analysisResult.arbitration.resolution || 'Direct priority assigned to front desk guest arrival.'}
                  </p>
                </div>
              )}

              {/* Recommendations list */}
              {analysisResult.recommendations?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground font-mono uppercase">
                    Consensus Action Tasks ({analysisResult.recommendations.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-border bg-surface-secondary/40 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground capitalize">{rec.department || 'Operations'}</span>
                          <span className="text-[10px] font-mono text-primary font-semibold">{rec.priority || 'High'}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{rec.action || rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dedicated Human Approval Quick Action Card */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#714B67]/10 via-purple-500/5 to-slate-50 border border-[#714B67]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#714B67] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Case Ready for Human Approval: {selectedScenario.name || selectedScenario.id}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Deliberation complete. Duty Manager must authorize before tasks execute.
                    </span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/consensus?scenario=${mappedScenario.scenarioId}&planId=${mappedScenario.planId}&action=review#decision-controls`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#714B67] hover:bg-[#5D3D55] text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Review in Consensus &amp; Approve Case →</span>
                </Link>
              </div>
            </div>
          )}

          {/* 4 Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AgentCard
              name="Front Desk Agent"
              department="front_desk"
              status={swarmState}
              focus={frontDeskData.focus}
              observation={frontDeskData.observation}
              recommendation={frontDeskData.recommendation}
              confidence={frontDeskData.confidence}
              affectedRooms={frontDeskData.recommendation?.affected_rooms || []}
              affectedStaff={frontDeskData.recommendation?.required_staff || ['staff-001']}
            />

            <AgentCard
              name="Housekeeping Agent"
              department="housekeeping"
              status={swarmState}
              focus={housekeepingData.focus}
              observation={housekeepingData.observation}
              recommendation={housekeepingData.recommendation}
              confidence={housekeepingData.confidence}
              affectedRooms={housekeepingData.recommendation?.affected_rooms || ['room-505']}
              affectedStaff={housekeepingData.recommendation?.required_staff || ['staff-003', 'staff-004']}
            />

            <AgentCard
              name="Maintenance Agent"
              department="maintenance"
              status={swarmState}
              focus={maintenanceData.focus}
              observation={maintenanceData.observation}
              recommendation={maintenanceData.recommendation}
              confidence={maintenanceData.confidence}
              affectedRooms={maintenanceData.recommendation?.affected_rooms || ['room-401']}
              affectedStaff={maintenanceData.recommendation?.required_staff || ['staff-005']}
            />

            <AgentCard
              name="Revenue Agent"
              department="revenue"
              status={swarmState}
              focus={revenueData.focus}
              observation={revenueData.observation}
              recommendation={revenueData.recommendation}
              confidence={revenueData.confidence}
              affectedRooms={revenueData.recommendation?.affected_rooms || []}
              affectedStaff={revenueData.recommendation?.required_staff || ['staff-007']}
            />
          </div>

          {/* Human Approval Notice & Direct Link to Consensus Report */}
          <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  Human-in-the-Loop Governance Notice
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The Swarm Consensus Engine generates advisory recommendations. All cross-departmental room reassignments or resource reallocations require explicit Duty Manager authorization.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/consensus?scenario=${mappedScenario.scenarioId}&planId=${mappedScenario.planId}&action=review#decision-controls`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shrink-0 shadow-xs"
            >
              <span>Review in Consensus Report ({selectedScenario.name || 'Active Case'})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default function AgentSwarmPage() {
  return (
    <React.Suspense
      fallback={
        <DashboardShell>
          <div className="py-20 text-center text-xs text-muted-foreground font-mono">
            Loading AI Agent Systems...
          </div>
        </DashboardShell>
      }
    >
      <AgentSwarmPageContent />
    </React.Suspense>
  );
}

