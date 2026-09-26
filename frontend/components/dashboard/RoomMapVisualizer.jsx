'use client';

import React, { useState } from 'react';
import {
  BedDouble, CheckCircle2, Wrench, AlertTriangle, UserCheck,
  Sparkles, Filter, ShieldAlert, ChevronRight, Info
} from 'lucide-react';

const DEFAULT_FLOORPLAN_ROOMS = [
  // Floor 5 - VIP & Presidential Suites
  { id: 'r505', number: '505', floor: 5, type: 'Presidential Suite', status: 'available', housekeeping: 'clean', guest: 'Available for VIP Swap', vip: 'Alternate Candidate', staff: 'Elena R.' },
  { id: 'r504', number: '504', floor: 5, type: 'Executive Suite', status: 'occupied', housekeeping: 'clean', guest: 'Lord Harrison Smith', vip: 'Platinum VIP', staff: 'Elena R.', checkIn: '12:00 PM', checkOut: 'Tomorrow' },
  { id: 'r503', number: '503', floor: 5, type: 'Penthouse Ocean', status: 'occupied', housekeeping: 'clean', guest: 'Dr. Evelyn Reed', vip: 'Diamond VIP', staff: 'Elena R.', checkIn: '2:00 PM', checkOut: 'Sep 29' },
  { id: 'r502', number: '502', floor: 5, type: 'Executive Suite', status: 'maintenance', housekeeping: 'dirty', guest: 'Unassigned', vip: 'None', staff: 'Dave K. (Tech)', issue: 'HVAC Compressor Fault' },
  { id: 'r501', number: '501', floor: 5, type: 'Presidential Suite', status: 'available', housekeeping: 'clean', guest: 'Ready for Arrival', vip: 'None', staff: 'Elena R.' },

  // Floor 4 - Deluxe Ocean Suites (Wedding & Group Block)
  { id: 'r401', number: '401', floor: 4, type: 'Deluxe Suite', status: 'maintenance', housekeeping: 'dirty', guest: 'Alexander Vance', vip: 'Diamond VIP (Early Check-In)', staff: 'Dave K. (Tech)', issue: 'AC System Failure (Urgent)' },
  { id: 'r402', number: '402', floor: 4, type: 'Ocean Suite', status: 'reserved', housekeeping: 'clean', guest: 'Wedding Party Block', vip: 'Group VIP', staff: 'Maria S.', checkIn: '2:00 PM' },
  { id: 'r403', number: '403', floor: 4, type: 'Ocean Suite', status: 'reserved', housekeeping: 'clean', guest: 'Wedding Party Block', vip: 'Group VIP', staff: 'Maria S.', checkIn: '2:00 PM' },
  { id: 'r404', number: '404', floor: 4, type: 'Ocean Suite', status: 'occupied', housekeeping: 'clean', guest: 'Sophia & Liam Martinez', vip: 'Gold Elite', staff: 'Maria S.', checkIn: 'In-House' },
  { id: 'r405', number: '405', floor: 4, type: 'Deluxe Suite', status: 'available', housekeeping: 'clean', guest: 'Vacant', vip: 'None', staff: 'Maria S.' },

  // Floor 3 - Garden & Poolside Villas
  { id: 'r301', number: '301', floor: 3, type: 'Poolside Villa', status: 'occupied', housekeeping: 'clean', guest: 'Marcus Brody', vip: 'Silver Tier', staff: 'Carlos M.', checkIn: 'In-House' },
  { id: 'r302', number: '302', floor: 3, type: 'Poolside Villa', status: 'available', housekeeping: 'clean', guest: 'Vacant', vip: 'None', staff: 'Carlos M.' },
  { id: 'r303', number: '303', floor: 3, type: 'Garden Room', status: 'dirty', housekeeping: 'dirty', guest: 'Departed (Cleaning In-Progress)', vip: 'None', staff: 'Carlos M.', note: '25m Express Turndown' },
  { id: 'r304', number: '304', floor: 3, type: 'Garden Room', status: 'available', housekeeping: 'clean', guest: 'Vacant', vip: 'None', staff: 'Carlos M.' },

  // Floor 2 - Standard Rooms
  { id: 'r201', number: '201', floor: 2, type: 'Deluxe Room', status: 'occupied', housekeeping: 'clean', guest: 'Chloe & Ben Watson', vip: 'Standard', staff: 'Ana P.' },
  { id: 'r202', number: '202', floor: 2, type: 'Deluxe Room', status: 'available', housekeeping: 'clean', guest: 'Vacant', vip: 'None', staff: 'Ana P.' },
  { id: 'r203', number: '203', floor: 2, type: 'Deluxe Room', status: 'available', housekeeping: 'clean', guest: 'Vacant', vip: 'None', staff: 'Ana P.' },
];

export default function RoomMapVisualizer({ rooms = DEFAULT_FLOORPLAN_ROOMS }) {
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const displayRooms = (rooms.length > 0 ? rooms : DEFAULT_FLOORPLAN_ROOMS).filter((room) => {
    if (selectedFloor !== 'all' && room.floor !== Number(selectedFloor)) return false;
    if (activeFilter === 'clean' || activeFilter === 'available') return room.status === 'available';
    if (activeFilter === 'action') return room.status === 'maintenance' || room.status === 'dirty' || room.housekeeping === 'dirty';
    if (activeFilter === 'occupied') return room.status === 'occupied' || room.status === 'reserved';
    return true;
  });

  // Group rooms by floor
  const floors = [5, 4, 3, 2];

  const getStatusDotColor = (room) => {
    if (room.status === 'maintenance' || room.status === 'dirty' || room.issue) {
      return 'bg-rose-500 ring-4 ring-rose-100'; // Red = Action Required / Maintenance
    }
    if (room.status === 'occupied' || room.status === 'reserved') {
      return 'bg-amber-500 ring-4 ring-amber-100'; // Orange = Occupied / Reserved
    }
    return 'bg-emerald-500 ring-4 ring-emerald-100'; // Green = Clean / Available
  };

  const getStatusLabel = (room) => {
    if (room.status === 'maintenance') return 'Action Required (Maintenance)';
    if (room.status === 'dirty' || room.housekeeping === 'dirty') return 'Action Required (Cleaning)';
    if (room.status === 'occupied') return 'Occupied';
    if (room.status === 'reserved') return 'Reserved Block';
    return 'Clean & Ready';
  };

  return (
    <div id="visual-floorplan" className="w-full space-y-6">
      {/* Central Canvas Container with Pure White Background & Shadow-Odoo */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-odoo border border-border transition-all">
        {/* Floorplan Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-odoo-purple/10 text-odoo-purple flex items-center justify-center font-bold text-sm">
                360
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Visual Resort Floorplan
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Interactive node map with real-time operational status dots &amp; guest cards
            </p>
          </div>

          {/* Controls & Legend */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Minimalist Status Legend */}
            <div className="flex items-center gap-4 bg-surface-secondary px-4 py-2 rounded-2xl border border-border text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-700 font-medium">Clean</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-gray-700 font-medium">Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-gray-700 font-medium">Action Required</span>
              </div>
            </div>

            {/* Floor Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-secondary p-1 rounded-2xl border border-border text-xs">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedFloor === 'all'
                    ? 'bg-odoo-purple text-white shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Floors
              </button>
              {[5, 4, 3, 2].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(String(f))}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    selectedFloor === String(f)
                      ? 'bg-odoo-purple text-white shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Floor {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floorplan Layout Grid */}
        <div className="space-y-8">
          {floors
            .filter((f) => selectedFloor === 'all' || selectedFloor === String(f))
            .map((floorNum) => {
              const floorRooms = displayRooms.filter((r) => r.floor === floorNum);
              if (floorRooms.length === 0) return null;

              return (
                <div key={floorNum} className="space-y-3">
                  {/* Floor Label */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-odoo-purple">
                        Floor {floorNum}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-accent">
                        {floorNum === 5 && 'Presidential & VIP Suites'}
                        {floorNum === 4 && 'Deluxe Ocean View Suites'}
                        {floorNum === 3 && 'Garden & Poolside Villas'}
                        {floorNum === 2 && 'Deluxe Rooms'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {floorRooms.length} Rooms
                    </span>
                  </div>

                  {/* Rooms Node Grid for Floor */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {floorRooms.map((room) => {
                      const isHovered = hoveredRoom?.id === room.id;
                      const dotClass = getStatusDotColor(room);

                      return (
                        <div
                          key={room.id}
                          onMouseEnter={() => setHoveredRoom(room)}
                          onMouseLeave={() => setHoveredRoom(null)}
                          className="relative group"
                        >
                          {/* Visual Node Card */}
                          <div
                            className={`bg-white rounded-2xl p-4 border border-gray-200 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 relative ${
                              isHovered
                                ? 'shadow-odoo-hover border-odoo-purple/40 -translate-y-1'
                                : 'hover:border-gray-300'
                            }`}
                          >
                            {/* Top Row: Room Number & Status Dot */}
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-mono font-bold text-foreground">
                                #{room.number}
                              </span>

                              {/* Single Small Bright Status Dot */}
                              <span
                                className={`w-3 h-3 rounded-full transition-transform duration-200 group-hover:scale-125 ${dotClass}`}
                                title={getStatusLabel(room)}
                              />
                            </div>

                            {/* Middle Row: Room Category */}
                            <div className="text-xs font-medium text-gray-600 truncate mt-1">
                              {room.type}
                            </div>

                            {/* Bottom Row: Micro Status Label */}
                            <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-gray-100">
                              <span className="text-gray-500 font-mono text-[10px] truncate">
                                {room.issue ? (
                                  <span className="text-rose-600 font-bold flex items-center gap-1">
                                    <Wrench className="w-3 h-3 inline" /> Fault
                                  </span>
                                ) : room.number === '505' ? (
                                  <span className="text-odoo-teal font-bold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 inline" /> VIP Swap
                                  </span>
                                ) : (
                                  room.housekeeping || 'Ready'
                                )}
                              </span>

                              <span className="text-[10px] font-accent text-odoo-purple font-semibold">
                                {room.vip !== 'None' ? room.vip : 'Details →'}
                              </span>
                            </div>

                            {/* Floating White Tooltip Hover Card */}
                            {isHovered && (
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-white rounded-2xl p-4 shadow-odoo-hover border border-border z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
                                {/* Triangle Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />

                                <div className="space-y-2">
                                  {/* Guest Name in Handwritten Accent Font */}
                                  <div className="flex items-start justify-between border-b border-gray-100 pb-2">
                                    <div>
                                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                        Guest In Residence
                                      </div>
                                      <div className="font-accent text-lg font-bold text-odoo-purple leading-tight">
                                        {room.guest || 'Vacant / Ready'}
                                      </div>
                                    </div>
                                    <span
                                      className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${dotClass}`}
                                    />
                                  </div>

                                  {/* Tooltip Details */}
                                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                    <div>
                                      <span className="text-[10px] text-muted-foreground block">
                                        Status:
                                      </span>
                                      <span className="font-semibold text-gray-800 capitalize">
                                        {room.status}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-[10px] text-muted-foreground block">
                                        VIP Tier:
                                      </span>
                                      <span className="font-semibold text-odoo-teal">
                                        {room.vip || 'Standard'}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-[10px] text-muted-foreground block">
                                        Housekeeping:
                                      </span>
                                      <span className="font-semibold text-gray-800 capitalize">
                                        {room.housekeeping || 'Inspected'}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-[10px] text-muted-foreground block">
                                        Assigned Staff:
                                      </span>
                                      <span className="font-semibold text-gray-800">
                                        {room.staff || 'On-Duty'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Operational Notes / Issues */}
                                  {(room.issue || room.note) && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-rose-600 font-medium flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                                      <span>{room.issue || room.note}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
