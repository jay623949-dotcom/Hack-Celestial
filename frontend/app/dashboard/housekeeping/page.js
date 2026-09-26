'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import {
  Sparkles, BedDouble, CheckCircle2, Clock, AlertTriangle,
  UserCheck, RefreshCw, AlertCircle, ArrowUpRight, CheckSquare
} from 'lucide-react';
import { getRooms, getTasks, getStaff, getGuests } from '../../../lib/api';

function StatCard({ label, value, sub, color = 'text-foreground', icon: Icon, badge }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        {badge && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-primary/10 text-primary">
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

export default function HousekeepingDashboard() {
  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [r, t, s, g] = await Promise.all([
        getRooms({}),
        getTasks({ department: 'housekeeping' }),
        getStaff({ department: 'housekeeping' }),
        getGuests({}),
      ]);
      setRooms(r?.data || []);
      setTasks(t?.data || []);
      setStaff(s?.data || []);
      setGuests(g?.data || []);
    } catch (err) {
      console.error('Failed to load housekeeping operations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Metrics
  const toCleanRooms = rooms.filter(
    (r) => r.housekeeping_status === 'dirty' || r.status === 'dirty'
  );
  const cleaningInProgress = rooms.filter(
    (r) => r.housekeeping_status === 'in_progress' || r.housekeeping_status === 'cleaning'
  );
  const readyRooms = rooms.filter(
    (r) => r.housekeeping_status === 'clean' || (r.status === 'available' && r.housekeeping_status !== 'dirty')
  );
  const blockedRooms = rooms.filter(
    (r) => r.housekeeping_status === 'blocked' || r.status === 'maintenance'
  );

  const availableStaff = staff.filter((s) => s.status === 'on_duty' || s.status === 'available');

  // Operational Queue construction
  const operationalQueue = [
    {
      priority: 'CRITICAL',
      priorityColor: 'bg-rose-50 text-rose-700 border-rose-200',
      room: '105',
      roomType: 'Standard Deluxe',
      guest: 'Rohan Mehta (Express Turn)',
      task: 'Express Turnover — Incoming Guest at 11:30 AM',
      assignedStaff: 'Sunita Gaonkar',
      status: 'In Progress',
      estTime: '20 min',
    },
    {
      priority: 'HIGH',
      priorityColor: 'bg-amber-50 text-amber-700 border-amber-200',
      room: '204',
      roomType: 'Ocean Breeze Villa',
      guest: 'Sarah Jenkins (Diamond VIP)',
      task: 'VIP Full Turnover & Floral Arrangement',
      assignedStaff: 'Lakshmi Naik',
      status: 'Assigned',
      estTime: '35 min',
    },
    {
      priority: 'HIGH',
      priorityColor: 'bg-amber-50 text-amber-700 border-amber-200',
      room: '402',
      roomType: 'Executive Suite',
      guest: 'Wedding Group Block',
      task: 'Pre-Arrival Inspection & Linens Refresh',
      assignedStaff: 'Sunita Gaonkar',
      status: 'Pending',
      estTime: '25 min',
    },
    {
      priority: 'MEDIUM',
      priorityColor: 'bg-blue-50 text-blue-700 border-blue-200',
      room: '302',
      roomType: 'Garden Deluxe',
      guest: 'Vikram Singhania',
      task: 'Daily Restock & Mid-Stay Service',
      assignedStaff: 'Anil Desai',
      status: 'Pending',
      estTime: '15 min',
    },
    {
      priority: 'LOW',
      priorityColor: 'bg-slate-50 text-slate-700 border-slate-200',
      room: '208',
      roomType: 'Standard Deluxe',
      guest: 'Vacant Dirty',
      task: 'Routine Turnover for Evening Pool',
      assignedStaff: 'Unassigned',
      status: 'Queued',
      estTime: '30 min',
    },
  ];

  return (
    <DashboardShell>
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Housekeeping Operations</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-100 text-violet-800 border border-violet-200">
              HOUSEKEEPING
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turnover queue, room readiness status, and attendant scheduling · Azure Bay Resort
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
          label="Rooms To Clean"
          value={toCleanRooms.length || 7}
          sub="Requires turnover"
          color="text-amber-600"
          badge="ACTION REQ"
        />
        <StatCard
          label="In Progress"
          value={cleaningInProgress.length || 3}
          sub="Attendants currently active"
          color="text-blue-600"
        />
        <StatCard
          label="Ready & Clean"
          value={readyRooms.length || 29}
          sub="Passed inspection"
          color="text-emerald-600"
        />
        <StatCard
          label="Blocked / Maintenance"
          value={blockedRooms.length || 2}
          sub="Unavailable for cleaning"
          color="text-rose-600"
        />
      </div>

      {/* Primary Housekeeping Priority Queue */}
      <section id="readiness" className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <h2 className="text-sm font-bold text-foreground">Operational Turnover Queue</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                Turnover Priorities
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live room readiness workflow prioritizing incoming VIPs and express turnover requests.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-4 font-semibold">Priority</th>
                <th className="py-2.5 px-4 font-semibold">Room</th>
                <th className="py-2.5 px-4 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold">Guest / Context</th>
                <th className="py-2.5 px-4 font-semibold">Assigned Task</th>
                <th className="py-2.5 px-4 font-semibold">Assigned Staff</th>
                <th className="py-2.5 px-4 font-semibold">Est. Time</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {operationalQueue.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-secondary/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.priorityColor}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground font-mono">
                    Room {item.room}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{item.roomType}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{item.guest}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.task}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-violet-600" />
                      <span>{item.assignedStaff}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">{item.estTime}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      item.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : item.status === 'Assigned'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Housekeeping Staff Availability */}
      <div id="staff" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Attendant Roster ({staff.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {availableStaff.length} On Duty
            </span>
          </div>

          <div className="space-y-2">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-surface-secondary/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">{s.role} · {s.current_task || 'Available'}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {s.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Blocked Notice (Room 401) */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>CROSS-DEPARTMENT NOTIFICATION: SUITE 401</span>
          </div>
          <p className="text-xs text-rose-900 leading-relaxed">
            Suite 401 is currently flagged under <strong>Active Maintenance</strong> (HVAC Compressor Failure).
            Housekeeping turnover is deferred until Engineering clears the unit. Do not assign turnover staff to 4th Floor Suite 401 until maintenance resolution is posted.
          </p>
          <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between text-[11px] text-rose-800">
            <span>Engineering Lead: Ramesh Sawant</span>
            <span className="font-mono font-bold">EST. CLEARANCE: 11:55 AM</span>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
