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
    <div id="tasks" className="p-6 rounded-3xl border border-border bg-surface shadow-soft">
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-border/70">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Active Tasks
          </h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {tasks.length} Assigned
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">
          No active tasks at this moment.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-xl border border-border bg-surface-secondary/40 hover:border-primary/40 transition-colors flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="font-bold text-foreground">
                  {task.title}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span>{formatDepartment(task.department)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-primary" />
                    {task.assigned_to || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getPriorityBadge(task.priority)}`}>
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
