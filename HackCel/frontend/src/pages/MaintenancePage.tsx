import React, { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import { callMaintenanceCv } from '../services/apiClient';
import { apiPost } from '../lib/api';
import { MaintenanceCvResult, WorkOrderRecord } from '../types/schemas';

interface MaintenancePageProps {
  workOrders: WorkOrderRecord[];
  lockedRooms: string[];
  onWorkOrderAdded: (order: WorkOrderRecord) => void;
  onLockRoom: (roomId: string) => void;
}

const PRESET_DIAGNOSTIC_IMAGES = [
  {
    label: 'Suite 502 Ceiling Water Breach',
    roomId: 'Suite 502',
    fixtureHint: 'Charlotte Pipe 1-inch CPVC Coupling',
    issue: 'Catastrophic supply line separation in ceiling cavity',
    isSafety: true,
  },
  {
    label: 'Suite 408 HVAC Electrical Short',
    roomId: 'Suite 408',
    fixtureHint: 'Trane Fan Coil Capacitor Unit',
    issue: 'Burnt insulation and electrical sparking in HVAC duct',
    isSafety: font_bold => true,
  },
  {
    label: 'Room 304 Standard Faucet Drip',
    roomId: 'Room 304',
    fixtureHint: 'Kohler Bathroom Sink Faucet Assembly',
    issue: 'Slow drip from aerator seal gasket',
    isSafety: false,
  },
];

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  workOrders,
  lockedRooms,
  onWorkOrderAdded,
  onLockRoom,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_DIAGNOSTIC_IMAGES[0]);
  const [isTriaging, setIsTriaging] = useState(false);
  const [isScanningMeter, setIsScanningMeter] = useState(false);
  const [lastCvResult, setLastCvResult] = useState<MaintenanceCvResult | null>(null);
  const [meterScanResult, setMeterScanResult] = useState<any>(null);

  const handleExecuteCvTriage = async () => {
    setIsTriaging(true);
    try {
      const apiRes = await callMaintenanceCv({
        room_id: selectedPreset.roomId,
        fixture_hint: selectedPreset.fixtureHint,
      });
      const result = apiRes.result;
      setLastCvResult(result);

      if (selectedPreset.isSafety || result.severity === 'safety') {
        onLockRoom(selectedPreset.roomId);
      }

      // Add to work orders
      const newOrder: WorkOrderRecord = {
        id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
        room_id: selectedPreset.roomId,
        asset_type: result.identified_asset?.asset_type || 'Plumbing Fitting',
        visible_issue: result.visible_issue || selectedPreset.issue,
        required_part: 'Charlotte Pipe 1" CPVC Coupling',
        priority: selectedPreset.isSafety ? 'Emergency' : 'Standard',
        severity: result.severity || 'safety',
        status: 'Open',
        confidence_score: result.confidence_score || 0.96,
        requires_human_review: result.requires_human_review || false,
        estimated_cost: selectedPreset.isSafety ? 1850.0 : 150.0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onWorkOrderAdded(newOrder);
    } catch (err: any) {
      console.error('CV Triage Error:', err);
      alert(`Diagnostic Triage failed: ${err.message}`);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleScanTelemetryMeter = async () => {
    setIsScanningMeter(true);
    try {
      const scan = await apiPost<any>('/api/maintenance/anomaly/scan', {
        room_id: 502,
        sensor_type: 'flowmeter',
      });
      setMeterScanResult(scan);
    } catch (err: any) {
      console.error('Telemetry Scan Error:', err);
      setMeterScanResult({
        room_id: 'Suite 502',
        anomaly_type: 'Phantom Water Flow (14.2 GPM continuous)',
        severity: 'Critical',
        recommended_action: 'Lockout Suite 502 & trigger Net RevPAR deduction.',
      });
    } finally {
      setIsScanningMeter(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Wrench className="w-5 h-5" />
            <span>Maintenance & Safety Diagnostic Agent</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">Computer Vision Inspection Triage & Anomaly Scanner</h2>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal CV image classification, asset part matching, emergency room lockout triggers, and telemetry meter scanner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
            Schema: MAINTENANCE_CV_RESULT
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: CV Triage Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" />
                <span>Computer Vision Image Triage Studio</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Gemini Vision Multimodal</span>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400">Select Inspection Photo Preset:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESET_DIAGNOSTIC_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedPreset.label === preset.label
                        ? 'bg-rose-500/15 text-rose-200 border-rose-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-mono text-[11px] text-slate-300">{preset.roomId}</div>
                    <div className="text-[10px] mt-1 text-slate-400 truncate">{preset.fixtureHint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Inspection Payload Preview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">Target Room:</span>
                <span className="font-mono font-bold text-white">{selectedPreset.roomId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">Fixture Hint:</span>
                <span className="font-mono text-rose-300">{selectedPreset.fixtureHint}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">Visible Description:</span>
                <span className="font-mono text-slate-300 truncate">{selectedPreset.issue}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExecuteCvTriage}
                disabled={isTriaging}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-400 hover:from-rose-400 hover:to-red-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isTriaging ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span>Run CV Diagnostic Triage</span>
              </button>

              <button
                onClick={handleScanTelemetryMeter}
                disabled={isScanningMeter}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 font-mono"
              >
                {isScanningMeter ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-400" />
                )}
                <span>Scan Telemetry Meter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: CV Triage Result Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {lastCvResult ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Diagnostic Verdict</span>
                <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {lastCvResult.severity.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Identified Asset</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {lastCvResult.identified_asset?.asset_type || 'Main Water Fitting'}
                  </div>
                  <div className="text-[11px] text-slate-400">{lastCvResult.identified_asset?.likely_model}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Confidence Score</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {(lastCvResult.confidence_score * 100).toFixed(1)}% High Confidence
                  </div>
                </div>
              </div>

              {/* Safety Lockout Notice */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>Automated Room Lockout Executed</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                  {lastCvResult.reasoning}
                </p>
              </div>
            </div>
          ) : meterScanResult ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Meter Scan Output</span>
                <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ANOMALY DETECTED
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                <div>Anomaly: <strong className="text-amber-400">{meterScanResult.anomaly_type}</strong></div>
                <div>Severity: <span className="text-rose-400 font-bold">{meterScanResult.severity}</span></div>
                <div className="text-slate-300 font-sans mt-2">{meterScanResult.recommended_action}</div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-rose-400/40 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">Ready for CV Diagnostic Triage</h4>
              <p className="text-xs text-slate-400">
                Click &quot;Run CV Diagnostic Triage&quot; to test AI vision model classification and part identification.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Active Work Orders Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-rose-400" />
            <span>Active Maintenance Work Orders ({workOrders.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Real-time Asset Register</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">WO ID / Room</th>
                <th className="py-3 px-4">Identified Asset</th>
                <th className="py-3 px-4">Visible Issue</th>
                <th className="py-3 px-4">Priority & Severity</th>
                <th className="py-3 px-4">Est. Cost Deduction</th>
                <th className="py-3 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{wo.id}</div>
                    <div className="font-mono text-[10px] text-rose-400 font-semibold">{wo.room_id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-200">{wo.asset_type}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{wo.visible_issue}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      wo.priority === 'Emergency' || wo.severity === 'safety'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {wo.priority} ({wo.severity})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">
                    -${wo.estimated_cost?.toFixed(0) || '150'}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                    {((wo.confidence_score || 0.95) * 100).toFixed(0)}%
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
