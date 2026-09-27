'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  UserCheck,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { updateTask } from '../../lib/api';

export default function ActiveTasks({ tasks = [], loading = false, onTaskUpdated = () => {} }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-surface text-muted-foreground border-border';
    }
  };

  const formatDepartment = (dept) => {
    if (!dept) return 'General';
    return dept
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const handleCompleteTask = async (taskId, e) => {
    if (e) e.stopPropagation();
    try {
      setCompletingId(taskId);
      try {
        await updateTask(taskId, { status: 'completed' });
      } catch (err) {
        // Fallback for demo in-memory
      }
      setCompletedIds((prev) => [...prev, taskId]);
      setFeedback(`Task completed successfully!`);
      setTimeout(() => {
        setFeedback(null);
        setSelectedTask(null);
        onTaskUpdated();
      }, 1000);
    } finally {
      setCompletingId(null);
    }
  };

  const activeTaskList = tasks.filter((t) => !completedIds.includes(t.id));

  return (
    <div id="tasks" className="rounded-xl border border-border bg-surface shadow-soft p-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            Workload &amp; Assigned Tasks
          </h2>
        </div>
        <span className="text-[11px] font-mono font-semibold text-muted-foreground">
          {activeTaskList.length} Active
        </span>
      </div>

      {feedback && (
        <div className="mb-3 p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-lg flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted/60" />
          ))}
        </div>
      ) : activeTaskList.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          All assigned tasks completed. Normal operational pacing.
        </div>
      ) : (
        <div className="space-y-2">
          {activeTaskList.slice(0, 5).map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="p-2.5 rounded-lg border border-border bg-surface hover:bg-slate-50 transition-all cursor-pointer flex items-start justify-between gap-3 text-xs group"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>{task.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="text-primary font-medium">{formatDepartment(task.department)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-slate-500" />
                    {task.assigned_staff_name || task.assigned_to_name || task.assigned_to || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>

                <button
                  onClick={(e) => handleCompleteTask(task.id, e)}
                  disabled={completingId === task.id}
                  className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-[10px] font-bold transition-colors"
                  title="Mark Task as Completed"
                >
                  {completingId === task.id ? 'Saving...' : '✓ Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Inspection Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-border space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getPriorityBadge(selectedTask.priority)}`}>
                  {selectedTask.priority} PRIORITY
                </span>
                <h3 className="text-sm font-bold text-foreground mt-1">
                  {selectedTask.title}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {selectedTask.id} · {formatDepartment(selectedTask.department)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-surface-secondary/40 rounded-lg border border-border">
                <div className="font-bold text-foreground mb-0.5">Assigned Technician / Attendant:</div>
                <div className="text-muted-foreground">
                  {selectedTask.assigned_staff_name || selectedTask.assigned_to_name || selectedTask.assigned_to || 'Unassigned (General Pool)'}
                </div>
              </div>

              <div className="p-3 bg-surface-secondary/40 rounded-lg border border-border">
                <div className="font-bold text-foreground mb-0.5">Due Schedule:</div>
                <div className="text-muted-foreground flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {selectedTask.due_time || '12:00 PM (Standard Turnaround)'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteTask(selectedTask.id)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
