'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import IncidentOverview from '../../../components/dashboard/IncidentOverview';
import StatCard from '../../../components/dashboard/StatCard';
import { getIncidents, getOperationsSummary } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldAlert,
  HelpCircle,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import HelpDocsModal from '../../../components/common/HelpDocsModal';
import ReportConcernModal from '../../../components/common/ReportConcernModal';

export default function IncidentsPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncidentsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [incRes, sumRes] = await Promise.allSettled([
        getIncidents(),
        getOperationsSummary(),
      ]);

      if (incRes.status === 'fulfilled') {
        setIncidents(incRes.value?.data || []);
      }
      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value?.data || null);
      }
    } catch (err) {
      console.error('[IncidentsPage] Failed to fetch incidents:', err);
      setError('Unable to load operational incidents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidentsData();
  }, [fetchIncidentsData]);

  // Real-time WebSocket listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncidentChange = () => {
      fetchIncidentsData();
    };

    socket.on('incident:created', handleIncidentChange);
    socket.on('incident.created', handleIncidentChange);
    socket.on('incident:updated', handleIncidentChange);
    socket.on('incident.status_changed', handleIncidentChange);

    return () => {
      socket.off('incident:created', handleIncidentChange);
      socket.off('incident.created', handleIncidentChange);
      socket.off('incident:updated', handleIncidentChange);
      socket.off('incident.status_changed', handleIncidentChange);
    };
  }, [fetchIncidentsData]);

  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const openCount = incidents.filter((i) => i.status !== 'resolved').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <DashboardShell>
      <HelpDocsModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} currentPath="/dashboard/incidents" />
      <ReportConcernModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onCreated={() => fetchIncidentsData()}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Operations Console</span>
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-semibold text-primary">Incident Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-1 flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Operational Concerns &amp; Disruption Center</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live cross-departmental log of active incidents, maintenance outages, guest concerns, and resolution states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#714B67]/30 bg-[#714B67] hover:bg-[#714B67]/90 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report New Concern</span>
          </button>

          <button
            onClick={() => fetchIncidentsData()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL RECORDED"
          value={totalIncidents}
          subtext="Total resort incidents"
          icon={AlertCircle}
          loading={loading}
        />
        <StatCard
          title="CRITICAL ATTENTION"
          value={criticalCount}
          subtext="Requires immediate swarm action"
          badge={criticalCount > 0 ? `${criticalCount} URGENT` : undefined}
          icon={ShieldAlert}
          alert={criticalCount > 0}
          loading={loading}
        />
        <StatCard
          title="ACTIVE / OPEN"
          value={openCount}
          subtext="Currently under resolution"
          icon={Clock}
          loading={loading}
        />
        <StatCard
          title="RESOLVED"
          value={resolvedCount}
          subtext="Completed successfully"
          icon={CheckCircle2}
          loading={loading}
        />
      </div>

      {/* Main Incident Overview Component */}
      <IncidentOverview
        incidents={incidents}
        loading={loading}
        onIncidentUpdated={(id) => {
          if (id) {
            setIncidents((prev) =>
              prev.map((inc) => (inc.id === id ? { ...inc, status: 'resolved' } : inc))
            );
          }
          fetchIncidentsData();
        }}
      />
    </DashboardShell>
  );
}
