'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import { Users, BedDouble, AlertTriangle, CalendarCheck, Clock, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { getGuests, getRooms, getIncidents } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';

function StatCard({ label, value, sub, color = 'text-foreground' }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value ?? '—'}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function GuestRow({ guest }) {
  const isVip = guest.vip || guest.vip_tier !== 'Standard';
  const statusColor = {
    'checked_in': 'bg-emerald-100 text-emerald-700',
    'expected': 'bg-blue-100 text-blue-700',
    'checked_out': 'bg-slate-100 text-slate-500',
  };
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-secondary/50 transition-colors">
      <td className="py-2.5 px-3 text-xs">
        <div className="flex items-center gap-2">
          {isVip && <Star className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" />}
          <span className="font-semibold text-foreground">{guest.name}</span>
        </div>
        {isVip && <div className="text-[10px] text-amber-600 font-mono ml-5">{guest.vip_tier}</div>}
      </td>
      <td className="py-2.5 px-3 text-[11px] text-muted-foreground">{guest.room_id || '—'}</td>
      <td className="py-2.5 px-3 text-[11px] text-muted-foreground">{guest.check_in ? new Date(guest.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
      <td className="py-2.5 px-3">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[guest.arrival_type] || 'bg-slate-100 text-slate-600'}`}>
          {guest.arrival_type || 'standard'}
        </span>
      </td>
    </tr>
  );
}

export default function FrontDeskDashboard() {
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([getGuests(), getRooms({}), getIncidents({ status: 'open' })])
      .then(([g, r, i]) => {
        setGuests(g?.data || []);
        setRooms(r?.data || []);
        setIncidents(i?.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();
    if (!socket) return;

    socket.on('room.status_changed', loadData);
    socket.on('incident.status_changed', loadData);
    socket.on('task.completed', loadData);
    socket.on('task.dispatched', loadData);

    return () => {
      socket.off('room.status_changed', loadData);
      socket.off('incident.status_changed', loadData);
      socket.off('task.completed', loadData);
      socket.off('task.dispatched', loadData);
    };
  }, []);

  const vipGuests = guests.filter(g => g.vip || g.vip_tier !== 'Standard');
  const todayArrivals = guests.filter(g => g.check_in && new Date(g.check_in).toDateString() === new Date().toDateString());
  const availableRooms = rooms.filter(r => r.status === 'available');
  const dirtyRooms = rooms.filter(r => r.status === 'dirty');
  const openIncidents = incidents.filter(i => ['front_desk', 'guest_services'].includes(i.department));

  return (
    <DashboardShell>
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Front Desk Operations</h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200">FRONT DESK</span>
        </div>
        <p className="text-xs text-muted-foreground">Guest arrivals, room assignments, check-ins and departures · Azure Bay Resort</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Guests In-House" value={guests.length} sub="Active registrations" />
        <StatCard label="VIP Guests" value={vipGuests.length} sub="Platinum & Diamond" color="text-amber-600" />
        <StatCard label="Available Rooms" value={availableRooms.length} sub="Ready for assignment" color="text-emerald-600" />
        <StatCard label="Open Issues" value={openIncidents.length} sub="Needs attention" color={openIncidents.length > 0 ? 'text-rose-600' : 'text-foreground'} />
      </div>

      {/* Arrivals Today */}
      <section id="arrivals">
        <div className="flex items-center gap-2 mb-3">
          <CalendarCheck className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Today&apos;s Arrivals</h2>
          <span className="text-[10px] font-mono text-muted-foreground">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading arrivals...</div>
          ) : todayArrivals.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No arrivals scheduled for today</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-border bg-surface-secondary/50">
                <tr>
                  {['Guest', 'Room', 'Check-in', 'Status'].map(h => (
                    <th key={h} className="py-2 px-3 text-left text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayArrivals.map(g => <GuestRow key={g.id} guest={g} />)}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* All Guests */}
      <section id="guests">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Guest Register</h2>
        </div>
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading guests...</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-border bg-surface-secondary/50">
                <tr>
                  {['Guest', 'Room', 'Check-in', 'Status'].map(h => (
                    <th key={h} className="py-2 px-3 text-left text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests.slice(0, 15).map(g => <GuestRow key={g.id} guest={g} />)}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Room Readiness */}
      <section id="rooms">
        <div className="flex items-center gap-2 mb-3">
          <BedDouble className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Room Readiness</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Available', rooms: availableRooms, color: 'border-emerald-200 bg-emerald-50', textColor: 'text-emerald-700' },
            { label: 'Dirty / Needs Clean', rooms: dirtyRooms, color: 'border-amber-200 bg-amber-50', textColor: 'text-amber-700' },
            { label: 'Maintenance', rooms: rooms.filter(r => r.status === 'maintenance'), color: 'border-red-200 bg-red-50', textColor: 'text-red-700' },
          ].map(({ label, rooms: rs, color, textColor }) => (
            <div key={label} className={`rounded-xl border p-4 ${color}`}>
              <div className={`text-2xl font-bold ${textColor}`}>{rs.length}</div>
              <div className="text-[11px] font-medium text-foreground mt-0.5">{label}</div>
              <div className="mt-2 space-y-1">
                {rs.slice(0, 4).map(r => (
                  <div key={r.id} className="text-[10px] text-muted-foreground font-mono">Room {r.number} · {r.type}</div>
                ))}
                {rs.length > 4 && <div className="text-[10px] text-muted-foreground">+{rs.length - 4} more</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Incidents */}
      <section id="incidents">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-foreground">Open Guest Issues</h2>
        </div>
        {incidents.length === 0 ? (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-2 text-[11px] text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> No open guest issues
          </div>
        ) : (
          <div className="space-y-2">
            {incidents.slice(0, 5).map(inc => (
              <div key={inc.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-surface">
                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${inc.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{inc.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${inc.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{inc.severity}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{inc.description}</p>
                  <div className="text-[10px] text-muted-foreground font-mono mt-1">{inc.department} · Room {inc.room_id || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}