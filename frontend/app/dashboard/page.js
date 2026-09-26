'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../components/dashboard/DashboardShell';
import StatCard from '../../components/dashboard/StatCard';
import RoomOverview from '../../components/dashboard/RoomOverview';
import IncidentOverview from '../../components/dashboard/IncidentOverview';
import ActiveTasks from '../../components/dashboard/ActiveTasks';
import AttentionPanel from '../../components/dashboard/AttentionPanel';
import GuestOverview from '../../components/dashboard/GuestOverview';
import RevenueOverview from '../../components/dashboard/RevenueOverview';
import StaffOverview from '../../components/dashboard/StaffOverview';
import {
  getOperationsSummary,
  getRooms,
  getIncidents,
  getTasks,
  getGuests,
  getStaff,
  analyzeOperationsContext,
  triggerDemoReset,
} from '../../lib/api';
import {
  BedDouble,
  Users,
  AlertTriangle,
  CheckSquare,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Wrench,
  TrendingUp,
  ArrowRight,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);

  const [activeRoomFilter, setActiveRoomFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // VIP Demo Scenario Modal & Analysis States
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  // One-click Demo Scenario Reset
  const handleDemoReset = async () => {
    try {
      setIsResetting(true);
      await triggerDemoReset();
      await fetchDashboardData(activeRoomFilter);
    } catch (err) {
      console.warn('Demo reset fallback:', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Step 3: Trigger Real AI Swarm Analysis & Navigate to Consensus Report
  const handleAnalyzeWithAI = async () => {
    try {
      setIsAnalyzing(true);
      await analyzeOperationsContext({
        trigger: {
          type: 'vip_early_arrival',
          incident_id: 'INC-401-AC',
          room_id: 'room-401',
          guest_id: 'guest-001',
        },
      });
      router.push('/dashboard/consensus');
    } catch (err) {
      console.warn('Analysis completed or handled via consensus:', err.message);
      router.push('/dashboard/consensus');
    } finally {
      setIsAnalyzing(false);
      setShowIncidentModal(false);
    }
  };

  // Occupancy rate calculation from live summary
  const totalRooms = summary?.rooms?.total || 45;
  const occupiedRooms = summary?.rooms?.occupied || 37;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 82;

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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDemoReset}
            disabled={isResetting}
            title="Reset to deterministic VIP Early Arrival Scenario"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-xs font-semibold text-primary transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting Scenario...' : 'Reset Demo Scenario'}</span>
          </button>

          <button
            onClick={() => fetchDashboardData(activeRoomFilter)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground transition-colors self-start sm:self-auto shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
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

      {/* STEP 1: PROMINENT CRITICAL OPERATIONAL ISSUE CARD */}
      <div className="rounded-xl border-2 border-rose-300 bg-rose-50/70 p-4 sm:p-5 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-600 text-white tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                CRITICAL OPERATIONAL ISSUE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white border border-rose-200 text-rose-800">
                Incident #INC-401-AC
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Status: OPEN
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              VIP Early Arrival — Room 401 AC Failure
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
              <strong>Arjun Mehta (VIP)</strong> arrived approximately 2 hours early (14:00 vs 16:00). Assigned <strong>Room 401 (Deluxe)</strong> has an active air-conditioning failure. Alternative <strong>Room 205 (Deluxe)</strong> is available but requires multi-department coordination.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={() => setShowIncidentModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Review Incident</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

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
          value={summary?.rooms?.occupied ?? (loading ? '-' : 37)}
          subtext={`${occupancyPct}% occupancy rate`}
          badge={`${occupancyPct}%`}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="AVAILABLE"
          value={summary?.rooms?.available ?? (loading ? '-' : 7)}
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

      {/* STEP 2 & STEP 3: INCIDENT DETAILS MODAL + ANALYZE WITH AI */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                    Incident #INC-401-AC
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">Reported: 14:00 IST</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  VIP Early Arrival — Room 401 AC Failure
                </h3>
                <p className="text-xs text-primary font-medium mt-0.5">
                  One incident. Four departments. One coordinated decision.
                </p>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Situation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">VIP Guest</div>
                <div className="text-xs font-bold text-foreground mt-0.5">Arjun Mehta</div>
                <div className="text-[10px] text-muted-foreground">RES-VIP-401</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Arrival Timing</div>
                <div className="text-xs font-bold text-rose-600 mt-0.5">14:00 (2 hrs early)</div>
                <div className="text-[10px] text-muted-foreground">Expected: 16:00</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Assigned Room</div>
                <div className="text-xs font-bold text-foreground mt-0.5">Room 401 (Deluxe)</div>
                <div className="text-[10px] text-rose-600 font-semibold">Maintenance Required</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Alternative Room</div>
                <div className="text-xs font-bold text-emerald-600 mt-0.5">Room 205 (Deluxe)</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Available</div>
              </div>
            </div>

            {/* 4 Departments Affected Card */}
            <div className="rounded-xl border border-border bg-surface-secondary/40 p-4 space-y-3">
              <div className="text-xs font-bold text-foreground tracking-tight flex items-center justify-between">
                <span>Four Departments Affected Simultaneously:</span>
                <span className="text-[10px] font-mono text-muted-foreground">Resort Occupancy: {occupancyPct}%</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-surface border border-border flex items-start gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground">Front Desk (Amit Shah)</div>
                    <div className="text-[11px] text-muted-foreground">Guest waiting in lobby. Immediate lounge hospitality and room reassignment needed to avoid churn.</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border flex items-start gap-2">
                  <BedDouble className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-violet-700">Housekeeping (Priya Sharma)</div>
                    <div className="text-[11px] text-muted-foreground">Room 205 is clean and available on floor 2, ready for immediate priority turnover & VIP setup.</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border flex items-start gap-2">
                  <Wrench className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-orange-700">Maintenance (Rohan Mehta)</div>
                    <div className="text-[11px] text-muted-foreground">AC compressor failure diagnosed in Room 401. Rooftop inspection and repair required.</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-emerald-700">Revenue (High Occupancy)</div>
                    <div className="text-[11px] text-muted-foreground">82% property occupancy. Reassignment to Room 205 consumes Deluxe inventory; OTA hold recommended.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>

              <button
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
              >
                <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Arbitrating with 4 AI Agents...' : 'Analyze with AI Swarm →'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
