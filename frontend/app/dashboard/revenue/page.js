'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import RevenueOverview from '../../../components/dashboard/RevenueOverview';
import StatCard from '../../../components/dashboard/StatCard';
import { getOperationsSummary, getRooms, getGuests } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import {
  TrendingUp,
  DollarSign,
  Percent,
  BedDouble,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export default function RevenuePage() {
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, roomsRes, guestsRes] = await Promise.allSettled([
        getOperationsSummary(),
        getRooms({}),
        getGuests(),
      ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value?.data || null);
      }
      if (roomsRes.status === 'fulfilled') {
        setRooms(roomsRes.value?.data || []);
      }
      if (guestsRes.status === 'fulfilled') {
        setGuests(guestsRes.value?.data || []);
      }
    } catch (err) {
      console.error('[RevenuePage] Failed to fetch revenue metrics:', err);
      setError('Unable to load revenue metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Real-time WebSocket listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      fetchRevenueData();
    };

    socket.on('room.status_changed', handleUpdate);
    socket.on('guest:created', handleUpdate);

    return () => {
      socket.off('room.status_changed', handleUpdate);
      socket.off('guest:created', handleUpdate);
    };
  }, [fetchRevenueData]);

  const totalRooms = summary?.rooms?.total || rooms.length || 45;
  const occupiedRooms = summary?.rooms?.occupied || rooms.filter((r) => r.status === 'occupied').length || 37;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 82;
  const adrValue = 420; // Average Daily Rate ($)
  const estDailyRevenue = occupiedRooms * adrValue;

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
            <span className="text-foreground font-semibold">Revenue Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span>Revenue &amp; Yield Management</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dynamic room inventory yield, ADR rate parity protection, corporate group blocks, and revenue loss prevention
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchRevenueData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh Revenue Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="OCCUPANCY RATE"
          value={`${occupancyPct}%`}
          subtext={`${occupiedRooms} of ${totalRooms} suites occupied`}
          icon={Percent}
          badge={occupancyPct > 80 ? 'HIGH DEMAND' : 'NORMAL'}
          loading={loading}
        />
        <StatCard
          title="AVERAGE DAILY RATE (ADR)"
          value={`$${adrValue}`}
          subtext="Target yield: $410"
          icon={DollarSign}
          loading={loading}
        />
        <StatCard
          title="EST. DAILY ROOM REVENUE"
          value={`$${estDailyRevenue.toLocaleString()}`}
          subtext="Based on active in-house stays"
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="INVENTORY ON OTA HOLD"
          value={summary?.rooms?.maintenance ? `${summary.rooms.maintenance} Rooms` : '1 Suite'}
          subtext="Protected from double booking"
          icon={ShieldCheck}
          loading={loading}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Revenue Overview Component */}
      <RevenueOverview
        summary={summary?.rooms || {}}
        rooms={rooms}
        guests={guests}
      />
    </DashboardShell>
  );
}
