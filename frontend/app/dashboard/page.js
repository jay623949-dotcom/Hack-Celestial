'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import StatCard from '../../components/dashboard/StatCard';
import RoomOverview from '../../components/dashboard/RoomOverview';
import IncidentOverview from '../../components/dashboard/IncidentOverview';
import ActiveTasks from '../../components/dashboard/ActiveTasks';
import AttentionPanel from '../../components/dashboard/AttentionPanel';
import { getOperationsSummary, getRooms, getIncidents, getTasks } from '../../lib/api';
import { BedDouble, Users, AlertTriangle, CheckSquare, RefreshCw, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [activeRoomFilter, setActiveRoomFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (roomFilter = activeRoomFilter) => {
    try {
      setLoading(true);
      setError(null);

      // Concurrent fetch of core operational endpoints
      const [summaryRes, roomsRes, incidentsRes, tasksRes] = await Promise.all([
        getOperationsSummary(),
        getRooms({ status: roomFilter }),
        getIncidents({ status: 'open' }),
        getTasks(),
      ]);

      setSummary(summaryRes?.data || null);
      setRooms(roomsRes?.data || []);
      setIncidents(incidentsRes?.data || []);
      setTasks(tasksRes?.data || []);
    } catch (err) {
      console.error('Failed to load dashboard operational data:', err);
      setError(err.message || 'Unable to connect to Resort 360 Operational API');
    } finally {
      setLoading(false);
    }
  }, [activeRoomFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRoomFilter = async (filterKey) => {
    setActiveRoomFilter(filterKey);
    try {
      const res = await getRooms({ status: filterKey });
      setRooms(res?.data || []);
    } catch (err) {
      console.error('Failed to filter rooms:', err);
    }
  };

  // Occupancy rate calculation from live summary
  const totalRooms = summary?.rooms?.total || 20;
  const occupiedRooms = summary?.rooms?.occupied || 0;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <DashboardShell>
      {/* Overview Greeting & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Good morning.
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening across your resort.
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(activeRoomFilter)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold text-foreground transition-colors self-start sm:self-auto shadow-soft disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Unable to load operational data. Ensure Express backend is running on port 5000.</span>
          </div>
          <button
            onClick={() => fetchDashboardData(activeRoomFilter)}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Operational KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL ROOMS"
          value={summary?.rooms?.total ?? (loading ? '-' : 20)}
          subtext="Azure Bay Main Wing & Villas"
          icon={BedDouble}
          loading={loading}
        />
        <StatCard
          title="OCCUPIED"
          value={summary?.rooms?.occupied ?? (loading ? '-' : 11)}
          subtext={`${occupancyPct}% occupancy`}
          badge={`${occupancyPct}%`}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="AVAILABLE"
          value={summary?.rooms?.available ?? (loading ? '-' : 5)}
          subtext="Ready for check-in / express clean"
          icon={CheckSquare}
          loading={loading}
        />
        <StatCard
          title="ACTIVE INCIDENTS"
          value={summary?.incidents?.open ?? (loading ? '-' : 6)}
          subtext={`${summary?.incidents?.critical ?? 1} critical attention required`}
          badge={summary?.incidents?.critical ? `${summary.incidents.critical} CRITICAL` : undefined}
          icon={AlertTriangle}
          alert={(summary?.incidents?.critical || 0) > 0}
          loading={loading}
        />
      </div>

      {/* Room Overview Section */}
      <RoomOverview
        rooms={rooms}
        summary={summary?.rooms || {}}
        onFilterChange={handleRoomFilter}
        activeFilter={activeRoomFilter}
        loading={loading}
      />

      {/* Incidents & Operational Pressure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <IncidentOverview incidents={incidents} loading={loading} />
        </div>
        <div className="space-y-6">
          <AttentionPanel />
          <ActiveTasks tasks={tasks} loading={loading} />
        </div>
      </div>
    </DashboardShell>
  );
}
