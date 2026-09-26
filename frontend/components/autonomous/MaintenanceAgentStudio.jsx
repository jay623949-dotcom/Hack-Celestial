'use client';

import React, { useState } from 'react';
import { CV_BENCHMARKS } from '../../lib/autonomous/benchmarks';
import { smartResortApi } from '../../lib/api';
import {
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Droplet,
  Zap,
  PackageCheck,
  FileText
} from 'lucide-react';

export default function MaintenanceAgentStudio({ onActionSuccess = () => {} }) {
  const [selectedBenchmark, setSelectedBenchmark] = useState(CV_BENCHMARKS[0]);
  const [processingDiagnostic, setProcessingDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  const [scanningTelemetry, setScanningTelemetry] = useState(false);
  const [telemetryResult, setTelemetryResult] = useState(null);

  const handleRunDiagnosticTriage = async () => {
    try {
      setProcessingDiagnostic(true);
      const res = await smartResortApi.imageTriage({
        room_id: selectedBenchmark.room_id,
        description: selectedBenchmark.description,
        source: 'sensor_telemetry',
      });
      setDiagnosticResult(res);
      onActionSuccess('Technical work order diagnostic completed', res);
    } catch (err) {
      alert(`Diagnostic error: ${err.message}`);
    } finally {
      setProcessingDiagnostic(false);
    }
  };

  const handleRunTelemetryScan = async () => {
    try {
      setScanningTelemetry(true);
      const res = await smartResortApi.scanAnomalies();
      setTelemetryResult(res);
      onActionSuccess('Micro-leak & phantom load telemetry scan complete', res);
    } catch (err) {
      alert(`Telemetry scan error: ${err.message}`);
    } finally {
      setScanningTelemetry(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500 text-black">
              MAINTENANCE AGENT
            </span>
            <span className="text-xs text-muted-foreground font-mono">Predictive Sensor Diagnostics & Safety Lockout</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
            Predictive Maintenance & Automated Safety Lockout
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl mt-1">
            Diagnoses equipment anomalies, cross-references inventory for replacement parts, detects phantom load leaks, and enforces safety lockouts across resort rooms.
          </p>
        </div>

        <button
          onClick={handleRunTelemetryScan}
          disabled={scanningTelemetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition-colors self-start md:self-auto disabled:opacity-50"
        >
          {scanningTelemetry ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
          <span>Run Telemetry Anomaly Scan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Diagnostics Studio */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
              1. Select Benchmark Equipment Issue
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CV_BENCHMARKS.map((bm) => {
                const isSelected = selectedBenchmark.id === bm.id;
                return (
                  <button
                    key={bm.id}
                    onClick={() => { setSelectedBenchmark(bm); setDiagnosticResult(null); }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 shadow-sm'
                        : 'border-border bg-surface-secondary/40 hover:bg-surface-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate">{bm.title}</span>
                      <Wrench className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-1" />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                      {bm.room_id} • {bm.fixture_hint}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Feed */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-foreground">Equipment Diagnostic Telemetry</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                Target Room: {selectedBenchmark.room_id}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-surface-secondary border border-border space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>{selectedBenchmark.fixture_hint}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 text-orange-800 uppercase font-semibold">
                  Expected Severity: {selectedBenchmark.expected_severity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedBenchmark.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-muted-foreground">
                Component: <strong className="text-foreground">{selectedBenchmark.fixture_hint}</strong>
              </span>

              <button
                onClick={handleRunDiagnosticTriage}
                disabled={processingDiagnostic}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow transition-colors disabled:opacity-50"
              >
                {processingDiagnostic ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Diagnosing Defect...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Defect Triage &amp; Parts Check</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Diagnostic Output */}
          {diagnosticResult && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-foreground">Diagnostic Triage Results</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Confidence: {Math.round((diagnosticResult.confidence_score || 0.9) * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Detected Asset</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{diagnosticResult.identified_asset}</div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  diagnosticResult.priority === 'safety'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                }`}>
                  <div className="text-[10px] font-mono uppercase">Priority / Severity</div>
                  <div className="text-sm font-bold mt-0.5">{diagnosticResult.priority || 'safety'}</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Required Part</div>
                  <div className="text-xs font-bold text-foreground mt-0.5 truncate">
                    {diagnosticResult.required_part || 'Brass Coupling 1/2"'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-secondary text-xs text-foreground font-mono">
                <span className="text-orange-500 font-bold">Identified Issue: </span>
                {diagnosticResult.visible_issue}
              </div>

              {diagnosticResult.priority === 'safety' && (
                <div className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-center gap-3 text-xs text-rose-500 font-medium">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Safety condition detected. Room {selectedBenchmark.room_id} has been automatically LOCKED OUT across all systems.</span>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Right Column: Telemetry & Micro-Leak Anomaly Scanner */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-bold text-foreground">Vacant Room Telemetry Scanner</h3>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                Meters: Water & Power
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Flags micro-leaks (water draw &gt; 0L in vacant rooms) and phantom power draw (&gt; 0.5kWh in vacant rooms). Automatically computes dollar cost impact.
            </p>

            {telemetryResult ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Total Cost Impact:</span>
                  <span className="font-mono font-bold text-orange-500 text-sm">
                    ${telemetryResult.total_estimated_cost_impact?.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {telemetryResult.flagged_rooms?.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border bg-surface-secondary/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          {flag.type === 'micro_leak' ? <Droplet className="w-3.5 h-3.5 text-blue-500" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                          Room {flag.room_number} ({flag.type.replace('_', ' ')})
                        </span>
                        <span className="font-mono font-bold text-rose-500 text-xs">
                          +${flag.estimated_cost_impact}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {flag.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground font-mono border border-dashed border-border rounded-lg p-4">
                Click "Run Telemetry Anomaly Scan" above to analyze all 33 resort room utility meters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
