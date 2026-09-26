'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import StatCard from '../../components/dashboard/StatCard';
import RoomOverview from '../../components/dashboard/RoomOverview';
import IncidentOverview from '../../components/dashboard/IncidentOverview';
import ActiveTasks from '../../components/dashboard/ActiveTasks';
import AttentionPanel from '../../components/dashboard/AttentionPanel';
import GuestOverview from '../../components/dashboard/GuestOverview';
import RevenueOverview from '../../components/dashboard/RevenueOverview';
import StaffOverview from '../../components/dashboard/StaffOverview';
import { getOperationsSummary, getRooms, getIncidents, getTasks, getGuests, getStaff } from '../../lib/api';
import { BedDouble, Users, AlertTriangle, CheckSquare, RefreshCw, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);

  const [activeRoomFilter, setActiveRoomFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (roomFilter = activeRoomFilter) => {
    try {
      setLoading(true);
      setError(null);

      // Concurrent fetch of core operational endpoints
      const [summaryRes, roomsRes, incidentsRes, tasksRes, guestsRes, staffRes] = await Promise.all([
        getOperationsSummary(),
        getRooms({ status: roomFilter }),
        getIncidents({ status: 'open' }),
        getTasks(),
        getGuests(),
        getStaff(),
      ]);

      setSummary(summaryRes?.data || null);
      setRooms(roomsRes?.data || []);
      setIncidents(incidentsRes?.data || []);
      setTasks(tasksRes?.data || []);
      setGuests(guestsRes?.data || []);
      setStaff(staffRes?.data || []);
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
  const totalRooms = summary?.rooms?.total || 45;
  const occupiedRooms = summary?.rooms?.occupied || 0;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <DashboardShell>
      {/* Overview Greeting & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Azure Bay Resort — Operations Console
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time hotel operations, guest arrival workflows, and revenue intelligence.
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(activeRoomFilter)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground transition-colors self-start sm:self-auto shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="p-3.5 rounded-lg border border-rose-300 bg-rose-50 text-xs text-rose-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Unable to load operational data. Ensure Express backend is running on port 5000.</span>
          </div>
          <button
            onClick={() => fetchDashboardData(activeRoomFilter)}
            className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium text-xs hover:bg-rose-700 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Operational KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL ROOMS"
          value={summary?.rooms?.total ?? (loading ? '-' : 45)}
          subtext="Azure Bay Main Wing & Beach Villas"
          icon={BedDouble}
          loading={loading}
        />
        <StatCard
          title="OCCUPIED"
          value={summary?.rooms?.occupied ?? (loading ? '-' : 32)}
          subtext={`${occupancyPct}% occupancy rate`}
          badge={`${occupancyPct}%`}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="AVAILABLE"
          value={summary?.rooms?.available ?? (loading ? '-' : 8)}
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

      {/* Area 1: Room Overview Section */}
      <RoomOverview
        rooms={rooms}
        summary={summary?.rooms || {}}
        onFilterChange={handleRoomFilter}
        activeFilter={activeRoomFilter}
        loading={loading}
      />

      {/* Area 2: Guest Entry & Guest Operations */}
      <GuestOverview
        guests={guests}
        rooms={rooms}
        onGuestCreated={() => fetchDashboardData(activeRoomFilter)}
        loading={loading}
      />

      {/* Area 3: Revenue & Yield Management */}
      <RevenueOverview
        summary={summary?.rooms || {}}
        rooms={rooms}
        guests={guests}
      />

      {/* Staff Management Overview */}
      <StaffOverview
        staff={staff}
        tasks={tasks}
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

