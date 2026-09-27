'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import RoomOverview from '../../../components/dashboard/RoomOverview';
import EditRoomModal from '../../../components/dashboard/EditRoomModal';
import StatCard from '../../../components/dashboard/StatCard';
import { getRooms, getOperationsSummary } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import {
  BedDouble,
  CheckCircle2,
  AlertTriangle,
  Users,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  PlusCircle,
  FileWarning,
} from 'lucide-react';
import HelpDocsModal from '../../../components/common/HelpDocsModal';
import ReportConcernModal from '../../../components/common/ReportConcernModal';

export default function RoomsPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  const fetchRoomsData = useCallback(async (filter = activeFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params = filter && filter !== 'all' ? { status: filter } : {};
      const [roomsRes, summaryRes] = await Promise.allSettled([
        getRooms(params),
        getOperationsSummary(),
      ]);

      if (roomsRes.status === 'fulfilled') {
        setRooms(roomsRes.value?.data || []);
      }
      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value?.data?.rooms || null);
      }
    } catch (err) {
      console.error('[RoomsPage] Failed to fetch rooms:', err);
      setError('Unable to load rooms inventory.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchRoomsData(activeFilter);
  }, [fetchRoomsData, activeFilter]);

  // Real-time WebSocket listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRoomUpdate = () => {
      fetchRoomsData(activeFilter);
    };

    socket.on('room.status_changed', handleRoomUpdate);
    socket.on('room:updated', handleRoomUpdate);
    socket.on('room:created', handleRoomUpdate);

    return () => {
      socket.off('room.status_changed', handleRoomUpdate);
      socket.off('room:updated', handleRoomUpdate);
      socket.off('room:created', handleRoomUpdate);
    };
  }, [fetchRoomsData, activeFilter]);

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    fetchRoomsData(newFilter);
  };

  const handleRoomSaved = (updatedRoom) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === updatedRoom.id || r.number === updatedRoom.number ? { ...r, ...updatedRoom } : r))
    );
    // Refresh to ensure full synchronization
    fetchRoomsData(activeFilter);
  };

  const totalCount = summary?.total ?? rooms.length;
  const availableCount = summary?.available ?? rooms.filter((r) => r.status === 'available').length;
  const occupiedCount = summary?.occupied ?? rooms.filter((r) => r.status === 'occupied').length;
  const maintenanceCount = summary?.maintenance ?? rooms.filter((r) => r.status === 'maintenance').length;

  return (
    <DashboardShell>
      <HelpDocsModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} currentPath="/dashboard/rooms" />

      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Rooms Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <BedDouble className="w-6 h-6 text-primary" />
            <span>Room Inventory &amp; Floor Plan</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete physical inventory, live floor plan status, housekeeping cleanliness, and maintenance nodes • Click any room to edit condition
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Raise Operational Concern / Room Defect (Odoo ERP Style) */}
          <button
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#714B67]/30 bg-[#714B67]/10 hover:bg-[#714B67] text-[#714B67] hover:text-white text-xs font-semibold transition-colors shadow-xs"
            title="Log an operational problem or defect for this room inventory"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Room Concern</span>
          </button>

          <button
            onClick={() => setHelpOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-xs font-bold text-teal-800 transition-colors shadow-xs"
            title="Rooms Hub Documentation & Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Help &amp; Guide</span>
          </button>

          <button
            onClick={() => fetchRoomsData(activeFilter)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh Room State"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL ROOMS"
          value={totalCount}
          subtext="Azure Bay Main Wing & Villas"
          icon={BedDouble}
          loading={loading}
        />
        <StatCard
          title="AVAILABLE"
          value={availableCount}
          subtext="Ready for check-in"
          icon={CheckCircle2}
          badge="READY"
          loading={loading}
        />
        <StatCard
          title="OCCUPIED"
          value={occupiedCount}
          subtext="In-house guests"
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="MAINTENANCE"
          value={maintenanceCount}
          subtext="Mechanical isolation"
          icon={AlertTriangle}
          alert={maintenanceCount > 0}
          loading={loading}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Room Overview Component with Visualizer & Table View */}
      <RoomOverview
        rooms={rooms}
        summary={summary || {}}
        onFilterChange={handleFilterChange}
        activeFilter={activeFilter}
        loading={loading}
        onEditRoom={(room) => setEditingRoom(room)}
      />

      {/* Edit Room Condition Modal */}
      <EditRoomModal
        isOpen={!!editingRoom}
        room={editingRoom}
        onClose={() => setEditingRoom(null)}
        onSaved={handleRoomSaved}
      />

      {/* Register Operational Concern / Report Defect Modal */}
      <ReportConcernModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSuccess={() => fetchRoomsData(activeFilter)}
      />
    </DashboardShell>
  );
}
