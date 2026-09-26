'use client';

import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, Sparkles, Building2, User } from 'lucide-react';

export default function IncidentOverview({ incidents = [], loading = false }) {
  const getSeverityBadge = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return {
          cardBorder: 'border-rose-500/40 bg-rose-500/5',
          badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
          label: 'CRITICAL',
        };
      case 'high':
        return {
          cardBorder: 'border-amber-500/30 bg-amber-500/5',
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          label: 'HIGH',
        };
      case 'medium':
        return {
          cardBorder: 'border-border bg-surface-secondary/40',
          badgeBg: 'bg-primary/10 text-primary border-primary/20',
          dot: 'bg-primary',
          label: 'MEDIUM',
        };
      default:
        return {
          cardBorder: 'border-border bg-surface-secondary/20',
          badgeBg: 'bg-muted text-muted-foreground border-border',
          dot: 'bg-muted-foreground',
          label: severity.toUpperCase(),
        };
    }
  };

  const formatDepartment = (dept) => {
    if (!dept) return 'General';
    return dept
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Sort incidents: critical first, then high, medium, low
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedIncidents = [...incidents].sort((a, b) => {
    const aOrder = severityOrder[a.severity?.toLowerCase()] ?? 4;
    const bOrder = severityOrder[b.severity?.toLowerCase()] ?? 4;
    return aOrder - bOrder;
  });

  return (
    <div id="incidents" className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Operational Incidents Queue
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Active disruptions and coordination bottlenecks prioritized by severity
          </p>
        </div>

        <div className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-mono font-semibold">
          {incidents.filter((i) => i.severity === 'critical').length} Critical • {incidents.length} Open
        </div>
      </div>

      {/* Incident Operational Queue Table */}
      {loading ? (
        <div className="p-6 space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted/60" />
          ))}
        </div>
      ) : sortedIncidents.length === 0 ? (
        <div className="text-center py-10 text-xs text-muted-foreground">
          No active incidents. Normal operations across property.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary/60 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Severity</th>
                <th className="py-2.5 px-4 font-semibold">Incident</th>
                <th className="py-2.5 px-4 font-semibold">Room / Asset</th>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedIncidents.map((incident) => {
                const badge = getSeverityBadge(incident.severity);
                return (
                  <tr key={incident.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badge.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-foreground">{incident.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{incident.description}</div>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">
                      {incident.room_id ? incident.room_id.replace('room-', 'Room ') : 'Property Wide'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-primary">
                      {formatDepartment(incident.department)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="capitalize font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-secondary border border-border text-foreground">
                        {incident.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {incident.reported_at ? new Date(incident.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:40 AM'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
