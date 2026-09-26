'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import {
  TrendingUp, BedDouble, Radio, Layers, AlertTriangle,
  Calendar, CheckCircle2, RefreshCw, Sparkles, ArrowRight, ShieldCheck
} from 'lucide-react';
import { getOperationsSummary, getRooms, getGuests } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';

function StatCard({ label, value, sub, color = 'text-foreground', badge, subColor = 'text-muted-foreground' }) {
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
      {sub && <div className={`text-[11px] mt-0.5 ${subColor}`}>{sub}</div>}
    </div>
  );
}

export default function RevenueDashboard() {
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, rRes, gRes] = await Promise.all([
        getOperationsSummary(),
        getRooms({}),
        getGuests({}),
      ]);
      setSummary(sRes?.data || null);
      setRooms(rRes?.data || []);
      setGuests(gRes?.data || []);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    if (!socket) return;

    socket.on('room.status_changed', fetchData);
    socket.on('task.completed', fetchData);

    return () => {
      socket.off('room.status_changed', fetchData);
      socket.off('task.completed', fetchData);
    };
  }, []);

  const totalRooms = summary?.rooms?.total || rooms.length || 45;
  const occupiedRooms = summary?.rooms?.occupied || rooms.filter((r) => r.status === 'occupied').length || 32;
  const availableRooms = summary?.rooms?.available || rooms.filter((r) => r.status === 'available').length || 8;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length || 1;
  const dirtyRooms = rooms.filter((r) => r.status === 'dirty').length || 4;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 71;

  // Room category breakdown
  const categoryStats = [
    {
      name: 'Standard Deluxe',
      total: 20,
      occupied: 16,
      rate: '₹12,500',
      adr: 'High',
      revImpact: 'Optimal',
    },
    {
      name: 'Ocean Breeze Villa',
      total: 12,
      occupied: 9,
      rate: '₹24,000',
      adr: 'Peak',
      revImpact: 'Optimal',
    },
    {
      name: 'Executive Suite',
      total: 8,
      occupied: 5,
      rate: '₹38,000',
      adr: 'High Demand',
      revImpact: 'Suite 401 Offline (-₹38k/nt)',
      alert: true,
    },
    {
      name: 'Presidential Penthouse',
      total: 5,
      occupied: 2,
      rate: '₹65,000',
      adr: 'Premium',
      revImpact: 'Available for VIP Upgrade',
    },
  ];

  return (
    <DashboardShell>
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Revenue &amp; Inventory Management</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              REVENUE
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Room inventory distribution, group allocation constraints, and operational yield · Azure Bay Resort
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
      <div id="occupancy" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Current Occupancy"
          value={`${occupancyRate}%`}
          sub={`${occupiedRooms} of ${totalRooms} rooms occupied`}
          color="text-primary"
          badge="HIGH DEMAND"
        />
        <StatCard
          label="Available Sellable"
          value={availableRooms}
          sub="Ready for walk-in / same-day"
          color="text-emerald-600"
        />
        <StatCard
          label="Upcoming Group Block"
          value="24 Rooms"
          sub="Kapoor Wedding (2:00 PM)"
          color="text-amber-600"
          badge="ARRIVAL SOON"
        />
        <StatCard
          label="Offline Inventory"
          value={`${maintenanceRooms} Room`}
          sub="Suite 401 HVAC downtime"
          color="text-rose-600"
          subColor="text-rose-600 font-semibold"
        />
      </div>

      {/* Operational Impact Notice: Room 401 & Group Block */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                Revenue &amp; Inventory Conflict Warning
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed max-w-3xl">
              <strong>High Compression Day:</strong> Resort is operating at {occupancyRate}% occupancy with 24 rooms committed to the incoming wedding group on Floor 4.
              Suite 401 being offline for HVAC maintenance reduces sellable Executive Suite inventory to zero, directly conflicting with Diamond VIP arrival Alexander Vance.
            </p>
          </div>

          <Link
            href="/dashboard/consensus"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold shrink-0 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View AI Consensus Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Room Inventory Status Breakdown */}
      <section id="inventory" className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Room Inventory &amp; Category Yield</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-secondary text-muted-foreground border border-border">
              {totalRooms} Total Units
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-4 font-semibold">Room Category</th>
                <th className="py-2.5 px-4 font-semibold">Total Inventory</th>
                <th className="py-2.5 px-4 font-semibold">Occupied</th>
                <th className="py-2.5 px-4 font-semibold">Base Rate / Night</th>
                <th className="py-2.5 px-4 font-semibold">Demand Tier</th>
                <th className="py-2.5 px-4 font-semibold text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {categoryStats.map((cat, idx) => (
                <tr key={idx} className="hover:bg-surface-secondary/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground">{cat.name}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">{cat.total} rooms</td>
                  <td className="py-3 px-4 font-mono font-semibold text-foreground">
                    {cat.occupied} ({Math.round((cat.occupied / cat.total) * 100)}%)
                  </td>
                  <td className="py-3 px-4 font-mono text-foreground font-semibold">{cat.rate}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                      {cat.adr}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      cat.alert
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {cat.revImpact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Booking Sources & Group Allocations */}
      <div id="bookings" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Booking Channel Distribution */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Booking Source Mix
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Group &amp; Events (Wedding Block)</span>
                <span className="font-mono font-bold text-foreground">42% (24 Rooms)</span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Direct Brand Website &amp; Loyalty</span>
                <span className="font-mono font-bold text-foreground">34% (15 Rooms)</span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '34%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Online Travel Agencies (OTA)</span>
                <span className="font-mono font-bold text-foreground">18% (8 Rooms)</span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Corporate &amp; Consortia</span>
                <span className="font-mono font-bold text-foreground">6% (3 Rooms)</span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '6%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Group Block Schedule */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              High-Demand Dates &amp; Group Blocks
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg border border-border/70 bg-surface-secondary/30">
              <div className="flex items-center justify-between">
                <div className="font-bold text-foreground">Kapoor &amp; Singhania Wedding</div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  24 ROOMS · TODAY
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Floor 4 Wing Blocked · Check-in 2:00 PM · F&amp;B Banquet Package Active
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-surface-secondary/30">
              <div className="flex items-center justify-between">
                <div className="font-bold text-foreground">Global Tech Leadership Retreat</div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  14 ROOMS · OCT 02
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Villas 201-214 · 3 Nights Guaranteed Buyout
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
