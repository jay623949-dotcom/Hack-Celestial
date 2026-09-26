import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Camera,
  Eye,
  FileCheck,
  Play,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { CV_BENCHMARKS, CvScenario } from '../data/benchmarks';
import { callMaintenanceCv } from '../services/apiClient';
import { MaintenanceCvResult } from '../types/schemas';
import { JsonViewer } from './JsonViewer';
import { SvgFixturePreview } from './SvgFixturePreview';
import { UiActionList } from './UiActionList';

interface MaintenanceCvStudioProps {
  onEventDispatched: (event: MaintenanceCvResult) => void;
}

export const MaintenanceCvStudio: React.FC<MaintenanceCvStudioProps> = ({ onEventDispatched }) => {
  const [selectedScenario, setSelectedScenario] = useState<CvScenario>(CV_BENCHMARKS[0]);
  const [roomId, setRoomId] = useState<string>(CV_BENCHMARKS[0].room_id);
  const [fixtureHint, setFixtureHint] = useState<string>(CV_BENCHMARKS[0].fixture_name);
  const [simulatedConfidence, setSimulatedConfidence] = useState<number>(
    CV_BENCHMARKS[0].simulated_confidence
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MaintenanceCvResult | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | undefined>();
  const [customImage, setCustomImage] = useState<string | null>(null);

  const handleSelectScenario = (sc: CvScenario) => {
    setSelectedScenario(sc);
    setRoomId(sc.room_id);
    setFixtureHint(sc.fixture_name);
    setSimulatedConfidence(sc.simulated_confidence);
    setCustomImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const res = await callMaintenanceCv({
        image_data: customImage || undefined,
        room_id: roomId.trim() || null,
        fixture_hint: fixtureHint,
        override_confidence: simulatedConfidence,
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

  const isLowConfidenceGuardrail = simulatedConfidence < 0.6;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#FAF8EE] border border-[#3D405B]/15 text-[#3D405B] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#81B29A]" />
            Computer Vision Fixture Triage & Safety Lockout Pipeline
          </h3>
          <p className="text-xs text-[#3D405B]/75 mt-0.5">
            Real-time visual defect classification, strict confidence thresholds (&lt; 0.60 human review guardrail), and safety-enforced room lockouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLowConfidenceGuardrail ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E07A5F] text-white text-xs font-mono font-bold shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              Guardrail Triggered: Conf &lt; 0.60
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#81B29A] text-white text-xs font-mono font-bold shadow-xs">
              <FileCheck className="w-3.5 h-3.5 text-[#F2CC8F]" />
              High Precision Mode
            </span>
          )}
        </div>
      </div>

      {/* Scenario Presets Selector */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] mb-2">
          Select Fixture Inspection Test Case
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CV_BENCHMARKS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id && !customImage;
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
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#81B29A]">{sc.room_id}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      sc.expected_severity === 'safety'
                        ? 'bg-[#E07A5F] text-white'
                        : 'bg-[#F4F1DE] text-[#3D405B]'
                    }`}
                  >
                    {sc.expected_severity}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#3D405B] line-clamp-1">{sc.fixture_name}</div>
                <div className="text-[11px] text-[#3D405B]/75 mt-1 line-clamp-2 leading-tight">
                  {sc.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Fixture Visual Feed */}
        <div className="lg:col-span-6 rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#81B29A]" />
              Multimodal Sensor / Camera Ingestion
            </span>

            <label className="cursor-pointer text-xs font-mono font-bold text-[#81B29A] hover:text-[#6D9E86] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Visual Display */}
          {customImage ? (
            <div className="relative rounded-xl overflow-hidden border border-[#3D405B]/20 max-h-64 flex items-center justify-center bg-[#FAF8EE]">
              <img src={customImage} alt="Custom uploaded fixture" className="max-h-64 object-contain" />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#81B29A] text-white text-[10px] font-mono">
                Custom Upload Active
              </div>
            </div>
          ) : (
            <SvgFixturePreview type={selectedScenario.svg_icon} />
          )}

          <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15 text-xs font-mono space-y-1 text-[#3D405B]">
            <div>
              <span className="font-bold text-[#81B29A]">Telemetry Annotation: </span>
              {selectedScenario.image_data_description}
            </div>
          </div>
        </div>

        {/* Right: Triage Controls & Guardrail Tester */}
        <div className="lg:col-span-6 rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B]">
              Inference Parameters & Guardrail Overrides
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3D405B] mb-1">Room ID Context</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. Suite 412 (or null)"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D405B] mb-1">Fixture Identifier</label>
                <input
                  type="text"
                  value={fixtureHint}
                  onChange={(e) => setFixtureHint(e.target.value)}
                  placeholder="e.g. HVAC Grille, Faucet"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A]"
                />
              </div>
            </div>

            {/* Confidence Slider with Guardrail Indicator */}
            <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#3D405B]/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#3D405B] font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#81B29A]" />
                  Confidence Score Calibration:
                </span>
                <span
                  className={`text-sm font-bold ${
                    isLowConfidenceGuardrail ? 'text-[#E07A5F]' : 'text-[#81B29A]'
                  }`}
                >
                  {simulatedConfidence.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.02"
                value={simulatedConfidence}
                onChange={(e) => setSimulatedConfidence(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#E8E4CE] rounded-lg appearance-none cursor-pointer accent-[#81B29A]"
              />

              <div className="flex justify-between text-[10px] font-mono text-[#3D405B]/70">
                <span>0.20 (Degraded)</span>
                <span className="text-[#E07A5F] font-bold">0.60 Guardrail Threshold</span>
                <span>1.00 (High Certainty)</span>
              </div>

              {isLowConfidenceGuardrail && (
                <div className="mt-2 p-2 rounded bg-[#E07A5F]/15 border border-[#E07A5F] text-[11px] text-[#3D405B] font-mono flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#E07A5F]">Guardrail Enforced:</strong> When confidence &lt; 0.60, system prohibits part guessing. Identified model is set to null and requires_human_review is flagged true.
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15 text-xs text-[#3D405B]/85 leading-relaxed">
              <strong className="text-[#81B29A] font-mono font-bold">Operations Note: </strong>
              {selectedScenario.notes}
            </div>
          </div>

          <div className="pt-3 border-t border-[#3D405B]/15 flex items-center justify-between">
            <button
              onClick={() => handleSelectScenario(selectedScenario)}
              className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#3D405B]/70 hover:text-[#81B29A]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Benchmark
            </button>

            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#81B29A] hover:bg-[#6D9E86] text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-sm active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>CV Triage Inferencing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run CV Triage Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Status Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] font-mono text-[#3D405B]/70 uppercase tracking-wider block">
                Detected Severity
              </span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block uppercase ${
                  result.severity === 'safety'
                    ? 'text-[#E07A5F] animate-pulse'
                    : result.severity === 'guest-facing'
                    ? 'text-[#F2CC8F]'
                    : 'text-[#81B29A]'
                }`}
              >
                {result.severity}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] font-mono text-[#3D405B]/70 uppercase tracking-wider block">
                Confidence Score
              </span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block ${
                  result.confidence_score < 0.6 ? 'text-[#E07A5F]' : 'text-[#81B29A]'
                }`}
              >
                {result.confidence_score.toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] font-mono text-[#3D405B]/70 uppercase tracking-wider block">
                Requires Human Review
              </span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block ${
                  result.requires_human_review ? 'text-[#E07A5F]' : 'text-[#81B29A]'
                }`}
              >
                {result.requires_human_review ? 'YES (FLAGGED)' : 'NO (AUTONOMOUS)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#3D405B]/15 shadow-xs">
              <span className="text-[10px] font-mono text-[#3D405B]/70 uppercase tracking-wider block">
                Lockout Action
              </span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block ${
                  result.ui_actions.some((a) => a.component === 'room_lockout' && a.action === 'lock')
                    ? 'text-[#E07A5F]'
                    : 'text-[#81B29A]'
                }`}
              >
                {result.ui_actions.some((a) => a.component === 'room_lockout' && a.action === 'lock')
                  ? 'MANDATORY LOCKOUT'
                  : 'NONE (OPEN)'}
              </span>
            </div>
          </div>

          {/* Dispatched UI Actions */}
          <UiActionList actions={result.ui_actions} title="Maintenance & Safety UI Actions Triggered" />

          {/* Strict JSON Output Inspector */}
          <JsonViewer
            data={result}
            title="MAINTENANCE_CV_RESULT (JSON Schema #2)"
            eventType="MAINTENANCE_CV_RESULT"
            latencyMs={latencyMs}
          />
        </div>
      )}
    </div>
  );
};
