'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import {
  Wrench, AlertTriangle, CheckCircle2, Clock, ShieldAlert,
  UserCheck, RefreshCw, PenTool, CheckSquare, Zap, Activity
} from 'lucide-react';
import { getIncidents, getTasks, getStaff, getRooms } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';

function StatCard({ label, value, sub, color = 'text-foreground', badge, alert = false }) {

  return (
    <div className={`rounded-xl border p-4 shadow-soft ${alert ? 'border-rose-300 bg-rose-50/40' : 'border-border bg-surface'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        {badge && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
            alert ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-primary/10 text-primary'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div className={`text-2xl font-bold ${color}`}>{value ?? '—'}</div>
      </div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default function MaintenanceDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [i, t, s, r] = await Promise.all([
        getIncidents({}),
        getTasks({ department: 'maintenance' }),
        getStaff({ department: 'maintenance' }),
        getRooms({ status: 'maintenance' }),
      ]);
      setIncidents(i?.data || []);
      setTasks(t?.data || []);
      setStaff(s?.data || []);
      setRooms(r?.data || []);
    } catch (err) {
      console.error('Failed to load maintenance operations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      fetchData();
    };

    socket.on('task.dispatched', handleUpdate);
    socket.on('task.accepted', handleUpdate);
    socket.on('task.in_progress', handleUpdate);
    socket.on('task.completed', handleUpdate);
    socket.on('room.status_changed', handleUpdate);
    socket.on('incident.status_changed', handleUpdate);
    socket.on('staff.status_changed', handleUpdate);

    return () => {
      socket.off('task.dispatched', handleUpdate);
      socket.off('task.accepted', handleUpdate);
      socket.off('task.in_progress', handleUpdate);
      socket.off('task.completed', handleUpdate);
      socket.off('room.status_changed', handleUpdate);
      socket.off('incident.status_changed', handleUpdate);
      socket.off('staff.status_changed', handleUpdate);
    };
  }, []);


  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'in_progress');
  const criticalIncidents = openIncidents.filter((i) => i.severity === 'critical' || i.severity === 'high');
  const maintenanceRooms = rooms.length > 0 ? rooms : [{ number: '401', type: 'Executive Suite', issue: 'HVAC Failure' }];

  return (
    <DashboardShell>
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Engineering &amp; Maintenance</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
              MAINTENANCE
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active equipment work orders, room repair status, and technician dispatching · Azure Bay Resort
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Open Incidents"
          value={openIncidents.length || 4}
          sub="Requires technician action"
          color="text-amber-600"
        />
        <StatCard
          label="Critical Priority"
          value={criticalIncidents.length || 1}
          sub="Immediate resolution required"
          color="text-rose-600"
          badge="CRITICAL"
          alert={criticalIncidents.length > 0}
        />
        <StatCard
          label="Rooms Under Maintenance"
          value={maintenanceRooms.length || 1}
          sub="Suite 401 offline"
          color="text-orange-600"
        />
        <StatCard
          label="Active Technicians"
          value={staff.length || 3}
          sub="On-duty engineering crew"
          color="text-emerald-600"
        />
      </div>

      {/* Primary Highlight: Room 401 Critical Work Order */}
      <div className="rounded-xl border-2 border-rose-300 bg-rose-50/40 p-5 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-600 text-white tracking-wider">
                CRITICAL INCIDENT
              </span>
              <span className="text-xs font-mono font-semibold text-rose-800">TICKET #INC-001</span>
              <span className="text-xs text-rose-600 font-mono">Reported 10:41 AM</span>
            </div>

            <h3 className="text-lg font-bold text-rose-950">
              Room 401 — HVAC Compressor Failure (Penthouse Wing)
            </h3>

            <p className="text-xs text-rose-900 leading-relaxed max-w-3xl">
              Central rooftop compressor relay tripped; internal ambient temperature reached 82°F.
              Diamond VIP guest arrival scheduled. Requires capacitor replacement and diagnostic pressure test.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/80 rounded-lg p-2.5 border border-rose-200">
                <div className="text-[10px] font-mono text-rose-600 uppercase">Assigned Technician</div>
                <div className="text-xs font-bold text-foreground mt-0.5">Ramesh Sawant (Chief HVAC)</div>
              </div>
              <div className="bg-white/80 rounded-lg p-2.5 border border-rose-200">
                <div className="text-[10px] font-mono text-rose-600 uppercase">Current Work Status</div>
                <div className="text-xs font-bold text-amber-700 mt-0.5">In Progress · Parts Sourced</div>
              </div>
              <div className="bg-white/80 rounded-lg p-2.5 border border-rose-200">
                <div className="text-[10px] font-mono text-rose-600 uppercase">Est. Completion</div>
                <div className="text-xs font-bold text-emerald-700 mt-0.5">11:55 AM (45 min remaining)</div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200 text-xs font-mono font-bold text-center">
              ROOM BLOCKED
            </div>
          </div>
        </div>
      </div>

      {/* Active Work Orders & Incidents Table */}
      <section id="incidents" className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-600" />
            <h2 className="text-sm font-bold text-foreground">Active Maintenance Work Orders</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              Engineering Queue
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-4 font-semibold">Severity</th>
                <th className="py-2.5 px-4 font-semibold">Location / Room</th>
                <th className="py-2.5 px-4 font-semibold">Issue Title</th>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Reported Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-surface-secondary/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      inc.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : inc.severity === 'high'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {inc.severity?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground font-mono">
                    {inc.room_id ? `Room ${inc.room_id.replace('room-', '')}` : 'General Facility'}
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium max-w-sm">
                    <div>{inc.title}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{inc.description}</div>
                  </td>
                  <td className="py-3 px-4 capitalize text-muted-foreground">{inc.department?.replace('_', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      inc.status === 'open'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : inc.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {inc.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-muted-foreground">
                    {inc.reported_at ? new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:41 AM'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Engineering Staff & Scheduled Preventative Tasks */}
      <div id="staff" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Technicians On Duty */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Engineering Team ({staff.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Crew
            </span>
          </div>

          <div className="space-y-2">
            {staff.map((tech) => (
              <div key={tech.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-surface-secondary/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{tech.name}</div>
                    <div className="text-[10px] text-muted-foreground">{tech.role} · {tech.current_task || 'On Standby'}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {tech.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Preventative Maintenance Schedule */}
        <div id="tasks" className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Preventative &amp; Scheduled Tasks
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg border border-border/70 bg-surface-secondary/30 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Chiller Loop B Inspection</div>
                <div className="text-[10px] text-muted-foreground">Central Plant · Weekly Audit</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                SCHEDULED 3:00 PM
              </span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/70 bg-surface-secondary/30 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Room 404 Sliding Door Latch</div>
                <div className="text-[10px] text-muted-foreground">Balcony safety latch alignment</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                PENDING CREW
              </span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/70 bg-surface-secondary/30 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Pool Filtration Backwash</div>
                <div className="text-[10px] text-muted-foreground">North Pool Deck · Daily Log</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                COMPLETED 08:30 AM
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
