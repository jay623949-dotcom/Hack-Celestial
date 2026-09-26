'use client';

import React from 'react';
import { IndianRupee, TrendingUp, BarChart3, PieChart, ShieldCheck } from 'lucide-react';

export default function RevenueOverview({ summary = {}, rooms = [], guests = [] }) {
  const totalRooms = summary.total || rooms.length || 45;
  const occupiedRooms = summary.occupied || 32;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 71;

  // Realistically calculated resort metrics
  const adr = 18500; // Average Daily Rate in INR (₹)
  const estRevPAR = Math.round(adr * (occupancyRate / 100));
  const dailyRoomRevenue = occupiedRooms * adr;

  // Booking source distribution (realistic mix for luxury resort in Goa)
  const bookingMix = [
    { source: 'Direct Website', percentage: 42, count: Math.round(occupiedRooms * 0.42), revenue: Math.round(dailyRoomRevenue * 0.44) },
    { source: 'OTA (Booking.com/Expedia)', percentage: 28, count: Math.round(occupiedRooms * 0.28), revenue: Math.round(dailyRoomRevenue * 0.26) },
    { source: 'Corporate / Groups', percentage: 20, count: Math.round(occupiedRooms * 0.20), revenue: Math.round(dailyRoomRevenue * 0.20) },
    { source: 'Luxury Travel Consortium / VIP', percentage: 10, count: Math.round(occupiedRooms * 0.10), revenue: Math.round(dailyRoomRevenue * 0.10) },
  ];

  return (
    <div id="revenue" className="rounded-xl border border-border bg-surface shadow-soft p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-odoo-purple" />
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Revenue & Inventory Yield Management
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Operational yield, ADR performance, and group block protections
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
            ADR: ₹{adr.toLocaleString('en-IN')}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
            RevPAR: ₹{estRevPAR.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Yield KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-border bg-surface-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Estimated Daily Revenue</div>
          <div className="text-base font-bold font-mono text-foreground mt-1">
            ₹{dailyRoomRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">+8.4% vs last week</div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-surface-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Occupancy Rate</div>
          <div className="text-base font-bold font-mono text-foreground mt-1">
            {occupancyRate}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{occupiedRooms} of {totalRooms} rooms active</div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-surface-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Wedding Block Protection</div>
          <div className="text-base font-bold font-mono text-amber-700 mt-1">
            Floor 4 (Locked)
          </div>
          <div className="text-[10px] text-amber-800 font-medium mt-0.5">50-guest wedding lock</div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-surface-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Revenue Displacement Risk</div>
          <div className="text-base font-bold font-mono text-teal-700 mt-1">
            ₹0 Displacement
          </div>
          <div className="text-[10px] text-teal-800 font-medium mt-0.5">Suite 505 unreserved</div>
        </div>
      </div>

      {/* Booking Channel Mix Table */}
      <div className="border border-border rounded-lg overflow-hidden text-xs">
        <div className="bg-surface-secondary/50 px-3 py-2 border-b border-border flex items-center justify-between font-mono text-[10px] font-semibold text-muted-foreground uppercase">
          <span>Booking Channel</span>
          <span>Share / Rooms / Est. Revenue</span>
        </div>
        <div className="divide-y divide-border">
          {bookingMix.map((mix) => (
            <div key={mix.source} className="px-3 py-2 flex items-center justify-between hover:bg-surface-secondary/30 transition-colors">
              <span className="font-medium text-foreground">{mix.source}</span>
              <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">{mix.percentage}%</span>
                <span>({mix.count} rooms)</span>
                <span className="text-slate-800 font-medium">₹{mix.revenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
