'use client';

import React from 'react';
import { CheckSquare, Clock, UserCheck } from 'lucide-react';

export default function ActiveTasks({ tasks = [], loading = false }) {
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

  return (
    <div id="tasks" className="rounded-xl border border-border bg-surface shadow-soft p-4">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            Workload & Assigned Tasks
          </h2>
        </div>
        <span className="text-[11px] font-mono font-semibold text-muted-foreground">
          {tasks.length} Active
        </span>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted/60" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          No active tasks assigned.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="p-2.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary/50 transition-colors flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground">
                  {task.title}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="text-primary font-medium">{formatDepartment(task.department)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-slate-500" />
                    {task.assigned_to || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {task.due_time || '12:00 PM'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
