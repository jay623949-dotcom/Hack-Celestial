'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, Wrench, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export default function StaffOverview({ staff = [], tasks = [], loading = false }) {
  const [activeDept, setActiveDept] = useState('all');

  const departments = [
    { label: 'All Staff', key: 'all' },
    { label: 'Front Desk', key: 'front_desk' },
    { label: 'Housekeeping', key: 'housekeeping' },
    { label: 'Maintenance', key: 'maintenance' },
  ];

  const filteredStaff = staff.filter((s) => {
    if (activeDept === 'all') return true;
    return s.department === activeDept;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'on_duty':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
          label: 'ON DUTY',
        };
      case 'busy':
        return {
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          label: 'BUSY',
        };
      case 'available':
        return {
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500',
          label: 'AVAILABLE',
        };
      case 'off_duty':
      default:
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          label: 'OFF DUTY',
        };
    }
  };

  const getDeptIcon = (dept) => {
    switch (dept) {
      case 'front_desk':
        return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'housekeeping':
        return <Sparkles className="w-3.5 h-3.5 text-violet-600" />;
      case 'maintenance':
        return <Wrench className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-primary" />;
    }
  };

  // Count active tasks per staff member
  const getStaffTaskCount = (staffId) => {
    return tasks.filter((t) => t.assigned_to === staffId && t.status !== 'completed').length;
  };

  return (
    <div id="staff" className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground tracking-tight">Staff Management Overview</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {staff.length} Active Personnel
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor duty status, departmental allocation, and active workload across resort staff.
          </p>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {departments.map((dept) => (
            <button
              key={dept.key}
              onClick={() => setActiveDept(dept.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                activeDept === dept.key
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-surface-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Loading staff directory...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No staff records found for this department.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-4 font-semibold">Staff Member</th>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold">Role</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Current Task / Assignment</th>
                <th className="py-2.5 px-4 font-semibold text-right">Workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredStaff.map((person) => {
                const badge = getStatusBadge(person.status);
                const taskCount = getStaffTaskCount(person.id);
                const initials = person.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr key={person.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px]">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{person.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{person.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 capitalize text-muted-foreground font-medium">
                        {getDeptIcon(person.department)}
                        <span>{person.department?.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-foreground font-medium">{person.role}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {person.current_task || (
                        <span className="italic text-muted-foreground/60 text-[11px]">Ready for assignment</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold ${
                          taskCount > 2
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : taskCount > 0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
