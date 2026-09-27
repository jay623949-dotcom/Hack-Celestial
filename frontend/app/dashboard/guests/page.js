'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import GuestOverview from '../../../components/dashboard/GuestOverview';
import StatCard from '../../../components/dashboard/StatCard';
import { getGuests, getRooms } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import {
  Users,
  Star,
  CalendarCheck,
  RefreshCw,
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import HelpDocsModal from '../../../components/common/HelpDocsModal';

export default function GuestsPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuestsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [guestsRes, roomsRes] = await Promise.allSettled([
        getGuests(),
        getRooms({}),
      ]);

      if (guestsRes.status === 'fulfilled') {
        setGuests(guestsRes.value?.data || []);
      }
      if (roomsRes.status === 'fulfilled') {
        setRooms(roomsRes.value?.data || []);
      }
    } catch (err) {
      console.error('[GuestsPage] Failed to fetch guests:', err);
      setError('Unable to load guest directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuestsData();
  }, [fetchGuestsData]);

  // Real-time WebSocket listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleGuestUpdate = () => {
      fetchGuestsData();
    };

    socket.on('guest:created', handleGuestUpdate);
    socket.on('guest:updated', handleGuestUpdate);
    socket.on('GUEST_CHECKED_IN', handleGuestUpdate);

    return () => {
      socket.off('guest:created', handleGuestUpdate);
      socket.off('guest:updated', handleGuestUpdate);
      socket.off('GUEST_CHECKED_IN', handleGuestUpdate);
    };
  }, [fetchGuestsData]);

  const totalGuests = guests.length;
  const vipGuests = guests.filter((g) => g.vip || g.vip_tier === 'Diamond VIP' || g.vip_tier === 'Platinum VIP');
  const assignedGuests = guests.filter((g) => g.room_id);
  const pendingAssignment = guests.filter((g) => !g.room_id);

  return (
    <DashboardShell>
      <HelpDocsModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} currentPath="/dashboard/guests" />

      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Guests Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            <span>Guest Directory &amp; In-House Operations</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active in-house guests, Diamond/Platinum VIP profiles, stay dates, and instant check-in registration
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setHelpOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-xs font-bold text-teal-800 transition-colors shadow-xs"
            title="Guests Hub Documentation & Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Help &amp; Guide</span>
          </button>

          <button
            onClick={fetchGuestsData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh Guests Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL GUESTS"
          value={totalGuests}
          subtext="In-house registry records"
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="VIP LOYALTY"
          value={vipGuests.length}
          subtext="Diamond & Platinum VIPs"
          icon={Star}
          badge="HIGH PRIORITY"
          loading={loading}
        />
        <StatCard
          title="ASSIGNED TO ROOMS"
          value={assignedGuests.length}
          subtext="Keys issued & active"
          icon={UserCheck}
          loading={loading}
        />
        <StatCard
          title="AWAITING ALLOCATION"
          value={pendingAssignment.length}
          subtext="In lobby / early arrivals"
          icon={CalendarCheck}
          alert={pendingAssignment.length > 0}
          loading={loading}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Guest Overview Component */}
      <GuestOverview
        guests={guests}
        rooms={rooms}
        onGuestCreated={fetchGuestsData}
        loading={loading}
      />
    </DashboardShell>
  );
}
