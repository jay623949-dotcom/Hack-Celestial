'use client';

import React, { useState, useEffect } from 'react';
import { smartResortApi } from '../../lib/api';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  RefreshCw,
  BedDouble,
  UserCheck,
  CheckSquare
} from 'lucide-react';

export default function HousekeepingAgentStudio({ onActionSuccess = () => {} }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await smartResortApi.getHousekeepingTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load housekeeping tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleMoveRank = async (index, direction) => {
    const newTasks = [...tasks];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newTasks.length) return;

    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIdx];
    newTasks[targetIdx] = temp;

    setTasks(newTasks);

    try {
      setActionLoading(true);
      const taskIds = newTasks.map((t) => t.id);
      await smartResortApi.reorderHousekeeping(taskIds);
      setBannerMessage('Housekeeping queue priorities updated on event bus.');
      onActionSuccess('Housekeeping tasks manually reordered', { taskIds });
    } catch (err) {
      alert(`Reorder failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (taskId, roomId) => {
    try {
      setActionLoading(true);
      await smartResortApi.completeHousekeepingTask(taskId);
      setBannerMessage(`Room ${roomId || taskId} completed and released to available inventory.`);
      await fetchTasks();
      onActionSuccess(`Room ${roomId || taskId} marked clean and available`, { taskId });
    } catch (err) {
      alert(`Complete failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black">
              HOUSEKEEPING AGENT
            </span>
            <span className="text-xs text-muted-foreground font-mono">Differentiator: Dynamic VIP Priority Bumping & Safety Lockout Sync</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
            Real-Time Turnover Queue & Intelligent Dispatch
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl mt-1">
            Automatically rearranges cleaning priorities when VIP or At-Risk guests check in, accelerates turnover timelines, and halts cleaning immediately when Maintenance flags a safety defect.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-secondary shadow-sm self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {bannerMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-medium flex items-center justify-between">
          <span>✓ {bannerMessage}</span>
          <button onClick={() => setBannerMessage(null)} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
        </div>
      )}

      {/* Task Queue Table */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              Active Room Cleaning Queue
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {tasks.length} active cleaning assignments
          </span>
        </div>

        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground font-mono">
              No pending housekeeping tasks. All rooms ready.
            </div>
          ) : (
            tasks.map((task, idx) => {
              const isBlocked = task.blocked === 'true' || task.status === 'blocked';
              return (
                <div
                  key={task.id || idx}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isBlocked
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : task.priority_rank === 1
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border bg-surface-secondary/40'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-surface border border-border flex items-center justify-center font-mono font-bold text-xs text-foreground shrink-0">
                      #{task.priority_rank || idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">Room {task.room_id}</span>
                        {isBlocked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> BLOCKED (MAINTENANCE)
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                            task.status === 'cleaning'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {task.status}
                          </span>
                        )}

                        {task.priority_rank === 1 && !isBlocked && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
                            TOP PRIORITY
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground font-mono mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> {task.assigned_attendant || 'Attendant Assigned'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> ETA: {task.eta_minutes} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Rank adjust buttons */}
                    <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
                      <button
                        onClick={() => handleMoveRank(idx, -1)}
                        disabled={idx === 0 || actionLoading}
                        className="p-1.5 hover:bg-surface-secondary text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveRank(idx, 1)}
                        disabled={idx === tasks.length - 1 || actionLoading}
                        className="p-1.5 hover:bg-surface-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 border-l border-border"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleCompleteTask(task.id, task.room_id)}
                      disabled={actionLoading || isBlocked}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
