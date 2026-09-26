import React from 'react';
import {
  CheckCircle,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { HousekeepingTask } from '../types/schemas';

interface HousekeepingAgentCardProps {
  tasks: HousekeepingTask[];
}

export const HousekeepingAgentCard: React.FC<HousekeepingAgentCardProps> = ({ tasks }) => {
  // Sort tasks by priority rank
  const sortedTasks = [...tasks].sort((a, b) => a.priority_rank - b.priority_rank);

  return (
    <div className="rounded-2xl border border-[#3D405B]/15 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="p-4 border-b border-[#3D405B]/15 bg-white text-[#3D405B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F4F1DE] border border-[#3D405B]/15 text-[#81B29A]">
            <Sparkles className="w-4 h-4 text-[#81B29A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
              Housekeeping Service Agent
              <span className="w-2 h-2 rounded-full bg-[#81B29A] animate-pulse" />
            </h3>
            <p className="text-[11px] text-[#3D405B]/70 font-mono">
              Dynamic Kanban Priority Dispatch • Turnaround ETAs
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#3D405B]">
            {tasks.filter((t) => t.status === 'Cleaned').length}/{tasks.length}
          </span>
          <span className="text-[10px] text-[#3D405B]/60 font-mono block">Ready Ratio</span>
        </div>
      </div>

      {/* Prioritized Kanban Task List */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin bg-[#FAF8EE]">
        {sortedTasks.map((t) => (
          <div
            key={t.room_id}
            className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
              t.status === 'Locked-Out'
                ? 'bg-[#E07A5F]/10 border-[#E07A5F]/40'
                : t.status === 'Priority-Expedite'
                ? 'bg-[#F2CC8F]/25 border-[#F2CC8F] shadow-xs'
                : 'bg-white border-[#3D405B]/15'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 mt-0.5 ${
                  t.priority_rank === 1
                    ? 'bg-[#81B29A] text-white shadow-xs'
                    : t.priority_rank === 2
                    ? 'bg-[#E07A5F] text-white'
                    : 'bg-[#F4F1DE] text-[#3D405B]'
                }`}
              >
                #{t.priority_rank}
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#3D405B]">{t.room_id}</span>
                  <span className="text-[10px] font-mono text-[#3D405B]/70 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-[#81B29A]" />
                    {t.assignedStaff}
                  </span>
                </div>

                <p className="text-[11px] text-[#3D405B]/80 font-mono mt-1 leading-snug">
                  {t.reason}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 flex flex-col items-end gap-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  t.status === 'Locked-Out'
                    ? 'bg-[#E07A5F] text-white'
                    : t.status === 'Priority-Expedite'
                    ? 'bg-[#F2CC8F] text-[#3D405B] animate-pulse'
                    : t.status === 'Cleaned'
                    ? 'bg-[#81B29A] text-white'
                    : 'bg-[#F4F1DE] text-[#3D405B]'
                }`}
              >
                {t.status}
              </span>

              <span className="flex items-center gap-1 text-[10px] font-mono text-[#3D405B]/70">
                <Clock className="w-3 h-3 text-[#3D405B]/60" />
                ETA: {t.turnaroundEta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
