import React from 'react';
import {
  AlertOctagon,
  Lock,
  Wrench,
} from 'lucide-react';
import { WorkOrderRecord } from '../types/schemas';

interface MaintenanceAgentCardProps {
  workOrders: WorkOrderRecord[];
  lockedRooms: string[];
  onToggleLockout?: (roomId: string) => void;
}

export const MaintenanceAgentCard: React.FC<MaintenanceAgentCardProps> = ({
  workOrders,
  lockedRooms,
}) => {
  return (
    <div className="rounded-2xl border border-[#3D405B]/15 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="p-4 border-b border-[#3D405B]/15 bg-white text-[#3D405B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F4F1DE] border border-[#3D405B]/15 text-[#81B29A]">
            <Wrench className="w-4 h-4 text-[#81B29A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
              Maintenance Service Agent
              <span className="w-2 h-2 rounded-full bg-[#81B29A] animate-pulse" />
            </h3>
            <p className="text-[11px] text-[#3D405B]/70 font-mono">
              CV Triage • Automated Work Orders & Safety Lockouts
            </p>
          </div>
        </div>

        <div className="text-right flex items-center gap-2">
          {lockedRooms.length > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E07A5F] text-white animate-pulse shadow-xs">
              {lockedRooms.length} Locked Out
            </span>
          )}
        </div>
      </div>

      {/* Safety Lockout Emergency Banner if any room is locked */}
      {lockedRooms.length > 0 && (
        <div className="px-4 py-2.5 bg-[#E07A5F]/15 border-b border-[#E07A5F]/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E07A5F] font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>MANDATORY SAFETY LOCKOUT: {lockedRooms.join(', ')} (fault_free: false)</span>
          </div>
          <span className="text-[10px] font-mono text-[#E07A5F] font-semibold">Auto-gated from Front Desk</span>
        </div>
      )}

      {/* Work Orders List */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin bg-[#FAF8EE]">
        {workOrders.map((wo) => (
          <div
            key={wo.id}
            className="p-3 rounded-xl bg-white border border-[#3D405B]/15 hover:border-[#81B29A] transition-colors space-y-2 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#3D405B]">{wo.room_id}</span>
                  <span className="text-[10px] font-mono text-[#81B29A] font-bold">{wo.id}</span>
                  <span className="text-[10px] font-mono text-[#3D405B]/60 font-medium">
                    {wo.timestamp}
                  </span>
                </div>
                <div className="text-xs text-[#3D405B] font-bold mt-0.5">
                  {wo.asset_type}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    wo.severity === 'safety'
                      ? 'bg-[#E07A5F] text-white'
                      : wo.severity === 'guest-facing'
                      ? 'bg-[#F2CC8F] text-[#3D405B]'
                      : 'bg-[#F4F1DE] text-[#3D405B]'
                  }`}
                >
                  {wo.severity}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    wo.priority === 'Emergency'
                      ? 'bg-[#E07A5F] text-white'
                      : wo.priority === 'High'
                      ? 'bg-[#F2CC8F] text-[#3D405B]'
                      : 'bg-[#F4F1DE] text-[#3D405B]'
                  }`}
                >
                  {wo.priority}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#3D405B]/85 font-mono leading-relaxed bg-[#FAF8EE] p-2 rounded-lg border border-[#3D405B]/10">
              {wo.visible_issue}
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#3D405B]/70">
              <span className="flex items-center gap-1">
                CV Confidence:{' '}
                <strong className="text-[#3D405B]">{(wo.confidence_score * 100).toFixed(0)}%</strong>
              </span>

              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  wo.status === 'Dispatched'
                    ? 'text-white bg-[#81B29A]'
                    : wo.status === 'Pending Triage'
                    ? 'text-[#3D405B] bg-[#F2CC8F]'
                    : 'text-[#3D405B] bg-[#F4F1DE]'
                }`}
              >
                {wo.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
