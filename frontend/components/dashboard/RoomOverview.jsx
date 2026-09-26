'use client';

import React, { useState } from 'react';
import { BedDouble, CheckCircle2, Wrench, ShieldAlert, Sparkles } from 'lucide-react';

export default function RoomOverview({ rooms = [], summary = {}, onFilterChange = () => {}, activeFilter = 'all', loading = false }) {
  const filters = [
    { label: 'All', key: 'all' },
    { label: 'Available', key: 'available' },
    { label: 'Occupied', key: 'occupied' },
    { label: 'Maintenance', key: 'maintenance' },
    { label: 'Reserved', key: 'reserved' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
          label: 'AVAILABLE',
        };
      case 'occupied':
        return {
          bg: 'bg-primary/10 text-primary border-primary/20',
          dot: 'bg-primary',
          label: 'OCCUPIED',
        };
      case 'maintenance':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
          label: 'MAINTENANCE',
        };
      case 'reserved':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          label: 'RESERVED',
        };
      case 'dirty':
        return {
          bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
          dot: 'bg-orange-500',
          label: 'DIRTY',
        };
      default:
        return {
          bg: 'bg-surface-secondary text-muted-foreground border-border',
          dot: 'bg-muted-foreground',
          label: status.toUpperCase(),
        };
    }
  };

  return (
    <div id="rooms" className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
      {/* Top Header & Metrics */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Room Inventory Overview
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Operational status across resort floors and room tiers
          </p>
        </div>

        {/* Dynamic Metric Counter Capsules */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          <div className="px-2 py-0.5 rounded bg-surface-secondary border border-border flex items-center gap-1 text-[11px]">
            <span className="text-muted-foreground">Total:</span>
            <strong className="text-foreground">{summary.total || rooms.length}</strong>
          </div>
          <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary flex items-center gap-1 text-[11px]">
            <span>Occupied:</span>
            <strong>{summary.occupied ?? '-'}</strong>
          </div>
          <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 text-[11px]">
            <span>Available:</span>
            <strong>{summary.available ?? '-'}</strong>
          </div>
          <div className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 text-[11px]">
            <span>Maintenance:</span>
            <strong>{summary.maintenance ?? '-'}</strong>
          </div>
          <div className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 text-[11px]">
            <span>Reserved:</span>
            <strong>{summary.reserved ?? '-'}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-surface-secondary/40 border-b border-border flex items-center gap-1.5 overflow-x-auto">
        {filters.map((flt) => (
          <button
            key={flt.key}
            onClick={() => onFilterChange(flt.key)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
              activeFilter === flt.key
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-secondary'
            }`}
          >
            {flt.label}
          </button>
        ))}
      </div>

      {/* Professional Operational Room Table */}
      {loading ? (
        <div className="p-6 space-y-2 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-9 rounded bg-muted/60" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-xs text-muted-foreground">
          No rooms found matching &quot;{activeFilter}&quot;.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary/60 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Room</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Floor</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Housekeeping</th>
                <th className="py-2.5 px-4 font-semibold">Operational Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rooms.map((room) => {
                const badge = getStatusBadge(room.status);
                return (
                  <tr key={room.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-foreground">
                      {room.number}
                    </td>
                    <td className="py-2.5 px-4 text-foreground font-medium">
                      {room.type}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">
                      Floor {room.floor}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] capitalize text-muted-foreground">
                      {room.housekeeping_status || (room.status === 'dirty' ? 'dirty' : 'clean')}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {room.status === 'maintenance' && (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> HVAC fault (repair active)
                        </span>
                      )}
                      {room.number === '505' && (
                        <span className="text-teal-700 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary" /> Alternate VIP Candidate
                        </span>
                      )}
                      {room.floor === 4 && room.status === 'reserved' && (
                        <span className="text-amber-700 font-semibold">
                          Wedding block lock
                        </span>
                      )}
                      {room.status === 'available' && !['505'].includes(room.number) && (
                        <span className="text-emerald-700">Inspected & Ready</span>
                      )}
                      {room.status === 'occupied' && (
                        <span className="text-slate-600">Guest in residence</span>
                      )}
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
