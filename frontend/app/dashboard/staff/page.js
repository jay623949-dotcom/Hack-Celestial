'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import StaffOverview from '../../../components/dashboard/StaffOverview';
import StatCard from '../../../components/dashboard/StatCard';
import { getStaff, getTasks } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  RefreshCw,
  ArrowLeft,
  Wrench,
  Sparkles,
} from 'lucide-react';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [staffRes, tasksRes] = await Promise.allSettled([
        getStaff(),
        getTasks(),
      ]);

      if (staffRes.status === 'fulfilled') {
        setStaff(staffRes.value?.data || []);
      }
      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value?.data || []);
      }
    } catch (err) {
      console.error('[StaffPage] Failed to fetch staff data:', err);
      setError('Unable to load staff duty rosters.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Real-time WebSocket listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStaffUpdate = () => {
      fetchStaffData();
    };

    socket.on('staff.status_changed', handleStaffUpdate);
    socket.on('task.dispatched', handleStaffUpdate);
    socket.on('task.completed', handleStaffUpdate);
    socket.on('task.in_progress', handleStaffUpdate);

    return () => {
      socket.off('staff.status_changed', handleStaffUpdate);
      socket.off('task.dispatched', handleStaffUpdate);
      socket.off('task.completed', handleStaffUpdate);
      socket.off('task.in_progress', handleStaffUpdate);
    };
  }, [fetchStaffData]);

  const totalStaff = staff.length;
  const onDutyCount = staff.filter((s) => s.status === 'on_duty' || s.status === 'available').length;
  const busyCount = staff.filter((s) => s.status === 'busy').length;
  const activeTasksCount = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;

  return (
    <DashboardShell>
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Staff Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-primary" />
            <span>Staff Rostering &amp; Duty Operations</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-department team deployment across Front Desk, Housekeeping, Maintenance, and Revenue intelligence
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchStaffData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh Staff Roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="ACTIVE ROSTER"
          value={totalStaff}
          subtext="Registered resort staff"
          icon={UserCheck}
          loading={loading}
        />
        <StatCard
          title="AVAILABLE / ON DUTY"
          value={onDutyCount}
          subtext="Ready for dispatch"
          icon={CheckCircle2}
          badge="READY"
          loading={loading}
        />
        <StatCard
          title="ACTIVELY BUSY"
          value={busyCount}
          subtext="Executing assigned work orders"
          icon={Clock}
          alert={busyCount > 0}
          loading={loading}
        />
        <StatCard
          title="ACTIVE WORK ORDERS"
          value={activeTasksCount}
          subtext="Tasks in progress or pending"
          icon={Briefcase}
          loading={loading}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Staff Overview Component */}
      <StaffOverview
        staff={staff}
        tasks={tasks}
        loading={loading}
      />
    </DashboardShell>
  );
}
