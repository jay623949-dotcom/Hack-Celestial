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
    <div id="rooms" className="p-6 rounded-3xl border border-border bg-surface shadow-soft">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-6 border-b border-border/70 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Room Overview
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational status across all floors and room categories
          </p>
        </div>

        {/* Dynamic Metric Counter Capsules */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-surface-secondary border border-border flex items-center gap-1.5">
            <span className="text-muted-foreground">Total:</span>
            <strong className="text-foreground">{summary.total || rooms.length}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center gap-1.5">
            <span>Occupied:</span>
            <strong>{summary.occupied ?? '-'}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span>Available:</span>
            <strong>{summary.available ?? '-'}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <span>Maint:</span>
            <strong>{summary.maintenance ?? '-'}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span>Reserved:</span>
            <strong>{summary.reserved ?? '-'}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
        {filters.map((flt) => (
          <button
            key={flt.key}
            onClick={() => onFilterChange(flt.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              activeFilter === flt.key
                ? 'bg-primary text-primary-foreground font-semibold shadow-soft'
                : 'text-muted-foreground hover:text-foreground bg-surface-secondary/70 hover:bg-surface-secondary'
            }`}
          >
            {flt.label}
          </button>
        ))}
      </div>

      {/* Room Grid Visualization */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 animate-pulse">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <p className="text-xs text-muted-foreground">No rooms found matching &quot;{activeFilter}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {rooms.map((room) => {
            const badge = getStatusBadge(room.status);
            return (
              <div
                key={room.id}
                className="p-3.5 rounded-xl border border-border bg-surface-secondary/30 hover:border-primary/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm sm:text-base font-mono text-foreground">
                      {room.number}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate" title={room.type}>
                    {room.type}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Floor {room.floor}</span>
                  {room.status === 'maintenance' && (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <Wrench className="w-2.5 h-2.5" /> AC
                    </span>
                  )}
                  {room.number === '505' && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Express
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
