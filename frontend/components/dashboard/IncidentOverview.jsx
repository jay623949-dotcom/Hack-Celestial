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
    <div id="incidents" className="p-6 rounded-3xl border border-border bg-surface shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Incidents Requiring Attention
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active disruptions and coordination bottlenecks prioritized by severity
          </p>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-semibold">
          {incidents.filter((i) => i.severity === 'critical').length} Critical • {incidents.length} Open
        </div>
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : sortedIncidents.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <p className="text-xs text-muted-foreground">
            No active incidents. Everything is currently operating normally.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedIncidents.map((incident) => {
            const badge = getSeverityBadge(incident.severity);
            const isCritical = incident.severity?.toLowerCase() === 'critical';

            return (
              <div
                key={incident.id}
                className={`p-4 rounded-2xl border transition-all ${badge.cardBorder}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badge.badgeBg} flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${isCritical ? 'animate-pulse' : ''}`} />
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-surface border border-border">
                      {formatDepartment(incident.department)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {incident.reported_at ? new Date(incident.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:40 AM'}
                    </span>
                    <span className="capitalize font-semibold text-foreground">
                      {incident.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-sm font-bold text-foreground">
                  {incident.title}
                </div>

                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {incident.description}
                </p>

                {/* Metadata footer */}
                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
                  {incident.room_id && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-primary" />
                      Room: <strong className="text-foreground">{incident.room_id.replace('room-', '')}</strong>
                    </span>
                  )}
                  {incident.guest_id && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-primary" />
                      Guest: <strong className="text-foreground">Alexander Vance (VIP)</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
