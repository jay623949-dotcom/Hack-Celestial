import React, { useState } from 'react';
import {
  ArrowDownUp,
  LayoutList,
  Play,
  RotateCcw,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { INITIAL_HOUSEKEEPING_TASKS } from '../data/benchmarks';
import { callHousekeepingReorder } from '../services/apiClient';
import { HousekeepingReorder, HousekeepingTask } from '../types/schemas';
import { JsonViewer } from './JsonViewer';
import { UiActionList } from './UiActionList';

interface HousekeepingStudioProps {
  onEventDispatched: (event: HousekeepingReorder) => void;
  tasks?: HousekeepingTask[];
}

export const HousekeepingStudio: React.FC<HousekeepingStudioProps> = ({
  onEventDispatched,
  tasks = INITIAL_HOUSEKEEPING_TASKS,
}) => {
  const [triggerReason, setTriggerReason] = useState<string>(
    'VIP Ambassador arrival ETA 11:15 AM - Priority expedite Suite 304 & Penthouse 601'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HousekeepingReorder | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | undefined>();

  const presetTriggers = [
    {
      title: 'VIP Early Arrival (ETA 11:15)',
      reason: 'VIP Ambassador Jean-Luc arrival ETA 11:15 AM - Priority turnover for Penthouse 601',
    },
    {
      title: 'Safety Lockout Dry-Out Cleared',
      reason: 'Room 412 plumbing safety lockout resolved - Immediate deep sanitation expedite',
    },
    {
      title: 'Late Departure Turnover',
      reason: 'Family late checkout 2:00 PM turnaround for incoming Diamond wedding party',
    },
  ];

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const res = await callHousekeepingReorder({
        trigger_reason: triggerReason,
        current_queue: tasks.map((t) => ({
          room_id: t.room_id,
          current_rank: t.priority_rank,
          status: t.status,
        })),
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
            <Sparkles className="w-4 h-4 text-[#81B29A]" />
            Housekeeping Cascade & Dynamic Queue Reorder Pipeline
          </h3>
          <p className="text-xs text-[#3D405B]/75 mt-0.5">
            Event-driven cascading reordering triggered by Front Desk VIP arrivals, travel disruption ETAs, and Maintenance safety clearings.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3D405B] bg-[#F2CC8F] px-3 py-1.5 rounded-lg shadow-xs">
          <ArrowDownUp className="w-3.5 h-3.5" />
          <span>Dynamic Priority Dispatch Active</span>
        </div>
      </div>

      {/* Preset Trigger Selectors */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] mb-2">
          Select Operational Cascade Trigger
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presetTriggers.map((p, idx) => {
            const isSelected = triggerReason === p.reason;
            return (
              <button
                key={idx}
                onClick={() => setTriggerReason(p.reason)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-white border-[#81B29A] shadow-sm ring-2 ring-[#81B29A]'
                    : 'bg-white border-[#3D405B]/15 hover:border-[#81B29A] hover:bg-[#FAF8EE]'
                }`}
              >
                <div className="text-xs font-bold text-[#3D405B]">{p.title}</div>
                <div className="text-[11px] text-[#3D405B]/75 mt-1 line-clamp-2 leading-tight">
                  {p.reason}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Queue & Trigger Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Current Active Housekeeping Queue */}
        <div className="lg:col-span-5 rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] flex items-center gap-1.5">
              <LayoutList className="w-3.5 h-3.5 text-[#81B29A]" />
              Current Floor Queue State ({tasks.length} Rooms)
            </span>
            <span className="text-[10px] font-mono text-[#3D405B]/70">Baseline Priority</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {tasks.map((task) => (
              <div
                key={task.room_id}
                className="p-2.5 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15 text-xs font-mono flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded flex items-center justify-center font-bold bg-[#81B29A] text-white text-[11px]">
                    #{task.priority_rank}
                  </span>
                  <div>
                    <div className="font-bold text-[#3D405B]">{task.room_id}</div>
                    <div className="text-[10px] text-[#3D405B]/70 mt-0.5">{task.assignedStaff}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.status === 'Locked-Out'
                        ? 'bg-[#E07A5F] text-white'
                        : task.status === 'Priority-Expedite'
                        ? 'bg-[#F2CC8F] text-[#3D405B]'
                        : task.status === 'Cleaned'
                        ? 'bg-[#81B29A] text-white'
                        : 'bg-[#F4F1DE] text-[#3D405B]'
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.eta_minutes > 0 && (
                    <div className="text-[10px] text-[#81B29A] font-bold mt-0.5 font-mono">
                      ETA {task.eta_minutes}m
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cascade Trigger Editor */}
        <div className="lg:col-span-7 rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B]">
              Trigger Reason Specification
            </h4>

            <div>
              <label className="block text-xs font-semibold text-[#3D405B] mb-1">
                Event Reason Payload (Cascade Trigger)
              </label>
              <textarea
                rows={3}
                value={triggerReason}
                onChange={(e) => setTriggerReason(e.target.value)}
                placeholder="Enter triggering operational event..."
                className="w-full p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A] resize-none"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15 text-xs text-[#3D405B]/85">
              <strong className="text-[#81B29A] font-mono font-bold">Cascade Behavior: </strong>
              Intelligence Engine dynamically shifts rooms into rank 1-2, updates the Housekeeping Kanban board, and recalculates room-ready ETA badges across staff terminals.
            </div>
          </div>

          <div className="pt-3 border-t border-[#3D405B]/15 flex items-center justify-between">
            <button
              onClick={() => setTriggerReason(presetTriggers[0].reason)}
              className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#3D405B]/70 hover:text-[#81B29A]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Trigger
            </button>

            <button
              onClick={handleExecute}
              disabled={isLoading || !triggerReason.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#81B29A] hover:bg-[#6D9E86] text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cascading Queue...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Emit HOUSEKEEPING_REORDER</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Reordered Queue View */}
          <div className="rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4 text-[#81B29A]" />
              Reordered Queue Dispatch
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.reordered_queue.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#81B29A] font-mono">
                      Rank #{item.new_priority_rank}
                    </span>
                    <span className="text-xs font-mono text-[#3D405B] font-bold">
                      {item.room_id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3D405B]/80 italic">"{item.reason}"</p>
                </div>
              ))}
            </div>
          </div>

          <UiActionList
            actions={result.ui_actions}
            title="Housekeeping Mobile Terminals & Kanban Actions"
          />

          <JsonViewer
            data={result}
            title="HOUSEKEEPING_REORDER (JSON Schema #5)"
            eventType="HOUSEKEEPING_REORDER"
            latencyMs={latencyMs}
          />
        </div>
      )}
    </div>
  );
};
