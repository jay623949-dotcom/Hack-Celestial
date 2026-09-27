import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { IntelligenceEngineEvent } from '../types/schemas';

export interface LoggedEvent {
  id: string;
  timestamp: string;
  eventType: string;
  targetService: string;
  data: IntelligenceEngineEvent;
  uiActionsCount: number;
}

interface EventBusLogProps {
  events: LoggedEvent[];
  onClear?: () => void;
}

export const EventBusLog: React.FC<EventBusLogProps> = ({ events, onClear }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'GUEST_INTAKE_RESULT':
        return 'bg-[#81B29A] text-white';
      case 'MAINTENANCE_CV_RESULT':
        return 'bg-[#E07A5F] text-white';
      case 'COST_INCIDENT_SUMMARY':
        return 'bg-[#E07A5F] text-white';
      case 'FLASH_SALE_OFFER':
        return 'bg-[#F2CC8F] text-[#3D405B] font-bold';
      case 'HOUSEKEEPING_REORDER':
      default:
        return 'bg-[#81B29A] text-white';
    }
  };

  return (
    <div className="rounded-2xl border border-[#3D405B]/15 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#3D405B]/15 bg-white text-[#3D405B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F4F1DE] border border-[#3D405B]/15 text-[#81B29A]">
            <Activity className="w-4 h-4 text-[#81B29A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
              Cross-Agent Event Bus Telemetry
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F2CC8F] text-[#3D405B]">
                {events.length} Events Logged
              </span>
            </h3>
            <p className="text-[11px] text-[#3D405B]/70 font-mono">
              Synchronous JSON Dispatch Stream between Structured Reasoning Layer & 4 Agent Services
            </p>
          </div>
        </div>

        {onClear && (
          <button
            onClick={onClear}
            className="text-xs font-mono font-semibold text-[#3D405B]/70 hover:text-[#E07A5F] transition-colors"
          >
            Clear Log
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="divide-y divide-[#3D405B]/10 max-h-72 overflow-y-auto scrollbar-thin bg-white">
        {events.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#3D405B]/60">
            No events dispatched yet. Trigger an inference in the Intelligence Engine Studio to stream events.
          </div>
        ) : (
          events.map((evt) => {
            const isExpanded = expandedId === evt.id;
            return (
              <div key={evt.id} className="p-3 hover:bg-[#FAF8EE] transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-[#3D405B]/60 shrink-0 font-medium">
                      {evt.timestamp}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 shadow-xs ${getEventBadgeColor(
                        evt.eventType
                      )}`}
                    >
                      {evt.eventType}
                    </span>

                    <span className="text-[#3D405B]/80 text-xs flex items-center gap-1 font-mono shrink-0">
                      <ArrowRight className="w-3 h-3 text-[#E07A5F]" />
                      <strong className="text-[#3D405B]">{evt.targetService}</strong>
                    </span>

                    <span className="text-xs text-[#3D405B]/80 truncate italic">
                      "{evt.data.reasoning}"
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-[#3D405B] bg-[#F4F1DE] border border-[#3D405B]/15 px-2 py-0.5 rounded">
                      {evt.uiActionsCount} UI Actions
                    </span>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                      className="p-1 rounded text-[#3D405B] hover:bg-[#F4F1DE] transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Raw Payload */}
                {isExpanded && (
                  <div className="mt-3 p-3 rounded-xl bg-[#3D405B] text-[#F4F1DE] border border-[#3D405B]/20 overflow-x-auto shadow-inner">
                    <pre className="text-xs font-mono leading-relaxed">
                      {JSON.stringify(evt.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
