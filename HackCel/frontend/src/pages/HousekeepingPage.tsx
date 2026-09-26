import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowUpRight,
  BedDouble,
  CheckCircle,
  Clock,
  Lock,
  RefreshCw,
  ShieldAlert,
  User,
  Sparkles,
} from 'lucide-react';
import { apiPost } from '../lib/api';
import { HousekeepingTask } from '../types/schemas';

interface HousekeepingPageProps {
  tasks: HousekeepingTask[];
  lockedRooms: string[];
  onTaskCompleted: (roomId: string) => void;
}

export const HousekeepingPage: React.FC<HousekeepingPageProps> = ({
  tasks,
  lockedRooms,
  onTaskCompleted,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>('Suite 502');
  const [isCompleting, setIsCompleting] = useState(false);

  // Generate 33-room grid representation
  const roomNumbers = Array.from({ length: 33 }, (_, i) => {
    const num = 501 + i;
    return `Suite ${num}`;
  });

  const handleCompleteTask = async (roomId: string) => {
    setIsCompleting(true);
    try {
      await apiPost('/api/housekeeping/complete-task', { room_id: roomId });
      onTaskCompleted(roomId);
    } catch (err: any) {
      console.error('Failed to complete housekeeping task:', err);
      // Fallback local UI update
      onTaskCompleted(roomId);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <BedDouble className="w-5 h-5" />
            <span>Housekeeping Priority Dispatch Agent</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">Room Turnover Grid & Dynamic Priority Queue</h2>
          <p className="text-xs text-slate-400 mt-1">
            Reorders cleaning turnover queues based on guest arrival ETA, VIP status, and maintenance lockout safety flags.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold">
            Schema: HOUSEKEEPING_REORDER
          </span>
        </div>
      </div>

      {/* Safety Lockout Alert Banner */}
      {lockedRooms.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold font-mono text-rose-300 uppercase tracking-wider">
                Maintenance Lockout Enforcement Active ({lockedRooms.length} Rooms Locked)
              </h4>
              <p className="text-xs text-rose-200/80 mt-0.5">
                {lockedRooms.join(', ')} out-of-order due to safety quarantine (water breach/electrical leak). Staff entry prohibited.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
            AUTO-BUMPED TO BOTTOM
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 33-Room Readiness Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-teal-400" />
                <span>33-Room Resort Turnover Grid</span>
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Cleaned
                </span>
                <span className="flex items-center gap-1 text-teal-400">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> Expedite
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Locked
                </span>
              </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-2">
              {roomNumbers.map((roomNum) => {
                const isLocked = lockedRooms.includes(roomNum);
                const task = tasks.find((t) => t.room_id === roomNum);
                const isCleaned = task?.status === 'Cleaned';
                const isExpedite = task?.status === 'Priority-Expedite';
                const isSelected = selectedRoomId === roomNum;

                let stateStyle = 'bg-slate-950 text-slate-400 border-slate-800';
                if (isLocked) {
                  stateStyle = 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-bold';
                } else if (isCleaned) {
                  stateStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                } else if (isExpedite) {
                  stateStyle = 'bg-teal-500/15 text-teal-300 border-teal-500/40 font-bold';
                }

                return (
                  <button
                    key={roomNum}
                    onClick={() => setSelectedRoomId(roomNum)}
                    className={`p-3 rounded-xl border text-center transition-all duration-150 relative ${stateStyle} ${
                      isSelected ? 'ring-2 ring-teal-400 scale-105 shadow-lg' : 'hover:border-slate-600'
                    }`}
                  >
                    {isLocked && <Lock className="w-3 h-3 text-rose-400 absolute top-1.5 right-1.5" />}
                    <div className="text-xs font-mono font-bold">{roomNum.replace('Suite ', 'S-')}</div>
                    <div className="text-[9px] font-mono mt-1 opacity-80 uppercase truncate">
                      {isLocked ? 'Locked' : isCleaned ? 'Clean' : isExpedite ? 'Expedite' : 'In-Progress'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Priority Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Turnover Priority Ranking</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">{tasks.length} Active Queue</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {tasks.map((task) => {
                const isLocked = lockedRooms.includes(task.room_id);
                return (
                  <div
                    key={task.room_id}
                    className={`p-4 rounded-xl border transition-all ${
                      isLocked
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : task.status === 'Cleaned'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-lg text-xs font-mono font-black flex items-center justify-center ${
                          isLocked
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-teal-500/20 text-teal-300'
                        }`}>
                          #{task.priority_rank}
                        </span>
                        <span className="font-extrabold text-sm text-white">{task.room_id}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        isLocked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : task.status === 'Cleaned'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      }`}>
                        {isLocked ? 'LOCKED-OUT' : task.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-300 font-mono flex items-center justify-between">
                      <span>Staff: {task.assignedStaff}</span>
                      <span>ETA: {task.eta_minutes} mins</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                      Reason: {task.reason}
                    </p>

                    {task.status !== 'Cleaned' && !isLocked && (
                      <button
                        onClick={() => handleCompleteTask(task.room_id)}
                        disabled={isCompleting}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Room Cleaned & Verified</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
