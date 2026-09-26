'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import AgentCard from '../../../components/agents/AgentCard';
import ScenarioSelector, { SCENARIO_CATALOG } from '../../../components/agents/ScenarioSelector';
import { analyzeOperationsContext } from '../../../lib/api';
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
  Info
} from 'lucide-react';

export default function AgentSwarmPage() {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIO_CATALOG[0]);
  const [swarmState, setSwarmState] = useState('IDLE'); // 'IDLE' | 'ANALYZING' | 'COMPLETED' | 'ERROR'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Trigger analysis for selected scenario
  const handleRunSwarmAnalysis = async (scenario = selectedScenario) => {
    try {
      setSwarmState('ANALYZING');
      setErrorMessage(null);

      // Pass scenario trigger to backend so canonical context is generated dynamically from DB state
      const trigger = scenario.trigger || scenario.context?.trigger || { type: scenario.id ? scenario.id.toLowerCase() : 'multiple_incidents' };
      const response = await analyzeOperationsContext({ trigger });
      if (response && response.success && response.data?.analysis) {
        setAnalysisResult(response.data.analysis);
        setSwarmState('COMPLETED');
      } else {
        throw new Error(response?.error?.message || 'Invalid response from AI analysis API');
      }
    } catch (err) {
      console.error('[AgentSwarm] Error running analysis:', err);
      setErrorMessage(err.message || 'Failed to complete operational intelligence analysis');
      setSwarmState('ERROR');
    }
  };

  // Helper to map general analysis into departmental perspectives
  const getDepartmentalPerspective = (deptKey) => {
    if (!analysisResult) return { observation: null, recommendation: null, focus: 'Awaiting analysis', confidence: 0.85 };

    const observations = analysisResult.observations || [];
    const recommendations = analysisResult.recommendations || [];

    // Filter relevant observations and recommendations by keywords/departments
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

  const frontDeskData = getDepartmentalPerspective('front_desk');
  const housekeepingData = getDepartmentalPerspective('housekeeping');
  const maintenanceData = getDepartmentalPerspective('maintenance');
  const revenueData = getDepartmentalPerspective('revenue');

  return (
    <DashboardShell>
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              AI Agent Swarm
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Four operational perspectives analyzing the same resort situation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => handleRunSwarmAnalysis(selectedScenario)}
            disabled={swarmState === 'ANALYZING'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity shadow-soft disabled:opacity-50"
          >
            {swarmState === 'ANALYZING' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Perspectives...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Agent Swarm Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scenario Benchmark Selector */}
      <ScenarioSelector
        selectedId={selectedScenario.id}
        onSelect={(scen) => {
          setSelectedScenario(scen);
          setSwarmState('IDLE');
          setAnalysisResult(null);
          setErrorMessage(null);
        }}
        disabled={swarmState === 'ANALYZING'}
      />

      {/* Error Banner */}
      {swarmState === 'ERROR' && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div>
              <strong className="font-bold">Analysis Execution Failed: </strong>
              <span>{errorMessage}</span>
            </div>
          </div>
          <button
            onClick={() => handleRunSwarmAnalysis(selectedScenario)}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Swarm State Header & Executive Synthesis */}
      {swarmState === 'COMPLETED' && analysisResult && (
        <div className="p-5 rounded-3xl border border-primary/30 bg-primary/5 space-y-3 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                Coordinated Operational Synthesis
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-border text-foreground font-semibold">
                Priority: {analysisResult.assessment?.priority?.toUpperCase() || 'HIGH'}
              </span>
              <span className="text-[10px] font-mono text-primary font-bold">
                Confidence: {Math.round((analysisResult.confidence || 0.88) * 100)}%
              </span>
            </div>
          </div>

          <p className="text-xs text-foreground/90 leading-relaxed font-medium">
            {analysisResult.assessment?.summary}
          </p>

          {analysisResult.constraints?.length > 0 && (
            <div className="pt-2 border-t border-primary/10 flex flex-wrap gap-2 text-[11px] font-mono text-muted-foreground">
              <span className="font-semibold text-foreground">Active Constraints:</span>
              {analysisResult.constraints.map((c, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-surface-secondary/70 border border-border text-foreground">
                  • {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4 Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Front Desk Agent */}
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

        {/* 2. Housekeeping Agent */}
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

        {/* 3. Maintenance Agent */}
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

        {/* 4. Revenue Agent */}
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

      {/* Human Approval Notice & Next Steps */}
      <div className="p-4 rounded-2xl border border-border bg-surface-secondary/30 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Human-in-the-Loop Governance Notice
          </p>
          <p className="leading-relaxed">
            The AI Agent Swarm provides cross-departmental situational intelligence and advisory proposals. In accordance with Resort 360 safety rules, no operational dispatch or room reassignment is executed automatically without explicit Duty Manager review and authorization.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
