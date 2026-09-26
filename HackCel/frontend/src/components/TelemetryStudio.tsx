import React, { useState } from 'react';
import {
  DollarSign,
  Droplets,
  Gauge,
  Play,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { TELEMETRY_BENCHMARKS, TelemetryScenario } from '../data/benchmarks';
import { callCostIncident } from '../services/apiClient';
import { CostIncidentSummary } from '../types/schemas';
import { JsonViewer } from './JsonViewer';
import { UiActionList } from './UiActionList';

interface TelemetryStudioProps {
  onEventDispatched: (event: CostIncidentSummary) => void;
}

export const TelemetryStudio: React.FC<TelemetryStudioProps> = ({ onEventDispatched }) => {
  const [selectedScenario, setSelectedScenario] = useState<TelemetryScenario>(
    TELEMETRY_BENCHMARKS[0]
  );
  const [workOrderId, setWorkOrderId] = useState<string>(
    TELEMETRY_BENCHMARKS[0].source_work_order_id
  );
  const [costImpact, setCostImpact] = useState<number>(
    TELEMETRY_BENCHMARKS[0].estimated_cost_impact
  );
  const [affectsRooms, setAffectsRooms] = useState<string>(
    TELEMETRY_BENCHMARKS[0].affects_room_ids.join(', ')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CostIncidentSummary | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | undefined>();

  const handleSelectScenario = (sc: TelemetryScenario) => {
    setSelectedScenario(sc);
    setWorkOrderId(sc.source_work_order_id);
    setCostImpact(sc.estimated_cost_impact);
    setAffectsRooms(sc.affects_room_ids.join(', '));
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const roomList = affectsRooms
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await callCostIncident({
        source_work_order_id: workOrderId.trim() || null,
        anomaly_data: {
          meter_type: selectedScenario.meter_type,
          reading: selectedScenario.current_reading,
          baseline: selectedScenario.normal_baseline,
          duration_minutes: selectedScenario.duration_minutes,
          estimated_cost: costImpact,
        },
        affects_room_ids: roomList,
      });
      setResult(res.result);
      setLatencyMs(res.latencyMs);
      onEventDispatched(res.result);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#FAF8EE] border border-[#3D405B]/15 text-[#3D405B] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#81B29A]" />
            Telemetry Anomaly & Cost Incident Pipeline
          </h3>
          <p className="text-xs text-[#3D405B]/75 mt-0.5">
            Classifies pre-aggregated sensor anomalies (water flow GPM spikes, compressor kW surges) and calculates Net RevPAR margin impact.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3D405B] bg-[#F2CC8F] px-3 py-1.5 rounded-lg shadow-xs">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Real-time Net RevPAR Link</span>
        </div>
      </div>

      {/* Benchmark Presets */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] mb-2">
          Select Meter Anomaly Scenario
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TELEMETRY_BENCHMARKS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-white border-[#81B29A] shadow-sm ring-2 ring-[#81B29A]'
                    : 'bg-white border-[#3D405B]/15 hover:border-[#81B29A] hover:bg-[#FAF8EE]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#3D405B] flex items-center gap-1.5">
                    {sc.meter_type.includes('Water') ? (
                      <Droplets className="w-3.5 h-3.5 text-[#81B29A]" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-[#E07A5F]" />
                    )}
                    {sc.room_id} ({sc.occupancy_status})
                  </span>
                  <span className="text-xs font-mono text-[#E07A5F] font-bold">
                    -${sc.estimated_cost_impact.toFixed(0)} Delta
                  </span>
                </div>
                <div className="text-xs text-[#3D405B] font-medium">{sc.anomaly_description}</div>
                <div className="mt-2 text-[11px] font-mono text-[#3D405B]/70 flex items-center gap-4">
                  <span>Reading: {sc.current_reading}</span>
                  <span>Normal: {sc.normal_baseline}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anomaly Configuration */}
      <div className="rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-4 shadow-xs">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B]">
          Telemetry Incident Data & Impact Calculation
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3D405B] mb-1">Source Work Order ID</label>
            <input
              type="text"
              value={workOrderId}
              onChange={(e) => setWorkOrderId(e.target.value)}
              placeholder="e.g. WO-8842 (or null)"
              className="w-full px-3 py-2 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D405B] mb-1">Estimated Remediation Cost ($)</label>
            <input
              type="number"
              value={costImpact}
              onChange={(e) => setCostImpact(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D405B] mb-1">Affected Room IDs (CSV)</label>
            <input
              type="text"
              value={affectsRooms}
              onChange={(e) => setAffectsRooms(e.target.value)}
              placeholder="e.g. Suite 502, Suite 402"
              className="w-full px-3 py-2 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#3D405B]/15">
          <div className="text-xs text-[#3D405B] font-mono flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#E07A5F]" />
            <span>Net RevPAR Deduction: </span>
            <span className="text-[#E07A5F] font-bold">-${costImpact.toFixed(2)}</span>
          </div>

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#81B29A] hover:bg-[#6D9E86] text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Computing Cost Impact...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Emit COST_INCIDENT_SUMMARY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-4 pt-2">
          <UiActionList
            actions={result.ui_actions}
            title="Revenue Management Net RevPAR Actions"
          />

          <JsonViewer
            data={result}
            title="COST_INCIDENT_SUMMARY (JSON Schema #3)"
            eventType="COST_INCIDENT_SUMMARY"
            latencyMs={latencyMs}
          />
        </div>
      )}
    </div>
  );
};
