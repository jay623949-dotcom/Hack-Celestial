'use client';

import React, { useState } from 'react';
import RoomMapVisualizer from './RoomMapVisualizer';
import { BedDouble, CheckCircle2, Wrench, ShieldAlert, Sparkles, LayoutGrid, Table } from 'lucide-react';

export default function RoomOverview({ rooms = [], summary = {}, onFilterChange = () => {}, activeFilter = 'all', loading = false }) {
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'table'

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
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          dot: 'bg-emerald-500',
          label: 'AVAILABLE',
        };
      case 'occupied':
        return {
          bg: 'bg-odoo-purple/10 text-odoo-purple border-odoo-purple/20',
          dot: 'bg-odoo-purple',
          label: 'OCCUPIED',
        };
      case 'maintenance':
        return {
          bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
          dot: 'bg-rose-500',
          label: 'MAINTENANCE',
        };
      case 'reserved':
        return {
          bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          dot: 'bg-amber-500',
          label: 'RESERVED',
        };
      case 'dirty':
        return {
          bg: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
          dot: 'bg-orange-500',
          label: 'DIRTY',
        };
      default:
        return {
          bg: 'bg-surface-secondary text-muted-foreground border-border',
          dot: 'bg-muted-foreground',
          label: String(status).toUpperCase(),
        };
    }
  };

  return (
    <div id="rooms" className="rounded-2xl border border-border bg-white shadow-odoo overflow-hidden transition-all">
      {/* Top Header & View Toggle */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-odoo-purple" />
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Room Inventory &amp; Operations Map
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational status across resort floors, VIP suites, and maintenance nodes
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-secondary p-1 rounded-2xl border border-border text-xs">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                viewMode === 'visual'
                  ? 'bg-odoo-teal text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Visual Floorplan</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-odoo-teal text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Visual Map vs Table */}
      {viewMode === 'visual' ? (
        <div className="p-4 sm:p-6 bg-background">
          <RoomMapVisualizer rooms={rooms} />
        </div>
      ) : (
        <div>
          {/* Filter Tabs */}
          <div className="px-4 py-2.5 bg-surface-secondary/50 border-b border-border flex items-center gap-2 overflow-x-auto">
            {filters.map((flt) => (
              <button
                key={flt.key}
                onClick={() => onFilterChange(flt.key)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  activeFilter === flt.key
                    ? 'bg-odoo-purple text-white font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white'
                }`}
              >
                {flt.label}
              </button>
            ))}
          </div>

          {/* Operational Table */}
          {loading ? (
            <div className="p-6 space-y-2 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-muted/60" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No rooms found matching &quot;{activeFilter}&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-secondary/70 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Room</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Floor</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Housekeeping</th>
                    <th className="py-3 px-4 font-semibold">Operational Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rooms.map((room) => {
                    const badge = getStatusBadge(room.status);
                    return (
                      <tr key={room.id} className="hover:bg-surface-secondary/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          #{room.number}
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          {room.type}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          Floor {room.floor}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] capitalize text-muted-foreground">
                          {room.housekeeping_status || (room.status === 'dirty' ? 'dirty' : 'clean')}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                          {room.status === 'maintenance' && (
                            <span className="text-rose-700 font-semibold flex items-center gap-1">
                              <Wrench className="w-3.5 h-3.5 text-rose-500" /> HVAC compressor fault
                            </span>
                          )}
                          {room.number === '505' && (
                            <span className="text-odoo-teal font-semibold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-odoo-teal" /> Alternate VIP Candidate
                            </span>
                          )}
                          {room.status === 'available' && !['505'].includes(room.number) && (
                            <span className="text-emerald-700">Inspected &amp; Ready</span>
                          )}
                          {room.status === 'occupied' && (
                            <span className="text-gray-600">Guest in residence</span>
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
      )}
    </div>
  );
}

