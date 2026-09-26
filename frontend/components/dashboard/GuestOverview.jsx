'use client';

import React, { useState } from 'react';
import { Users, UserCheck, Star, Shield, Plus, Check } from 'lucide-react';
import { createGuest } from '../../lib/api';

export default function GuestOverview({ guests = [], rooms = [], onGuestCreated = () => {}, loading = false }) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vip: false,
    vip_tier: 'Standard',
    room_id: '',
    arrival_type: 'standard',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Available rooms for assignment
  const assignableRooms = rooms.filter((r) => r.status === 'available' || r.status === 'dirty');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Guest name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const checkInTime = new Date().toISOString();
      const checkOutDate = new Date();
      checkOutDate.setDate(checkOutDate.getDate() + 3);

      await createGuest({
        name: formData.name.trim(),
        vip: formData.vip,
        vip_tier: formData.vip ? formData.vip_tier : 'Standard',
        room_id: formData.room_id || null,
        check_in: checkInTime,
        check_out: checkOutDate.toISOString(),
        arrival_type: formData.arrival_type,
        notes: formData.notes,
      });

      setShowCheckInModal(false);
      setFormData({
        name: '',
        vip: false,
        vip_tier: 'Standard',
        room_id: '',
        arrival_type: 'standard',
        notes: '',
      });
      onGuestCreated();
    } catch (err) {
      setModalError(err.message || 'Failed to check-in guest');
    } finally {
      setSubmitting(false);
    }
  };

  const getTierBadge = (guest) => {
    if (!guest.vip) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Standard
        </span>
      );
    }

    const tier = guest.vip_tier || 'VIP';
    if (tier.includes('Diamond')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 inline-flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-teal-600 text-teal-600" />
          {tier}
        </span>
      );
    }
    if (tier.includes('Platinum')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1">
          <Shield className="w-2.5 h-2.5 text-indigo-600" />
          {tier}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        {tier}
      </span>
    );
  };

  return (
    <div id="guests" className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Guest Operations & Entry
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Active resident and arriving guest profiles across Azure Bay Resort
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            {guests.length} Registered
          </span>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Guest Entry</span>
          </button>
        </div>
      </div>

      {/* Guest Table */}
      {loading ? (
        <div className="p-6 space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 rounded bg-muted/60" />
          ))}
        </div>
      ) : guests.length === 0 ? (
        <div className="text-center py-10 text-xs text-muted-foreground">
          No guests currently registered.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary/60 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Guest</th>
                <th className="py-2.5 px-4 font-semibold">Tier</th>
                <th className="py-2.5 px-4 font-semibold">Room</th>
                <th className="py-2.5 px-4 font-semibold">Check-In</th>
                <th className="py-2.5 px-4 font-semibold">Check-Out</th>
                <th className="py-2.5 px-4 font-semibold">Guest Profile & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {guests.map((guest) => {
                const assignedRoom = rooms.find((r) => r.id === guest.room_id);
                return (
                  <tr key={guest.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{guest.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      {getTierBadge(guest)}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-foreground">
                      {assignedRoom ? (
                        <span>Suite {assignedRoom.number}</span>
                      ) : guest.room_id ? (
                        <span>{guest.room_id.replace('room-', 'Suite ')}</span>
                      ) : (
                        <span className="text-muted-foreground italic font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {guest.check_in ? new Date(guest.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {guest.check_out ? new Date(guest.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-muted-foreground max-w-xs truncate">
                      {guest.notes || 'Standard reservation'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Guest Entry / Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-elevated max-w-md w-full p-5 space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Guest Entry & Check-In</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Register arriving guest and assign room inventory
              </p>
            </div>

            {modalError && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singhania"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">VIP Status</label>
                  <select
                    value={formData.vip ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, vip: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="false">Standard Guest</option>
                    <option value="true">VIP Resident</option>
                  </select>
                </div>

                {formData.vip && (
                  <div>
                    <label className="block font-semibold text-foreground mb-1">VIP Tier</label>
                    <select
                      value={formData.vip_tier}
                      onChange={(e) => setFormData({ ...formData, vip_tier: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="Diamond VIP">Diamond VIP</option>
                      <option value="Platinum VIP">Platinum VIP</option>
                      <option value="Gold VIP">Gold VIP</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Room Assignment</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">-- Assign Later / Pending --</option>
                  {assignableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Suite {r.number} — {r.type} ({r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Operational Preferences / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Arrived early; high floor requested; attending conference"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-surface-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register & Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
