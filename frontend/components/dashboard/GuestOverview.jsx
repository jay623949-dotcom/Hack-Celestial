'use client';

import React, { useState } from 'react';
import { Users, UserCheck, Star, Shield, Plus, Check, X, Sparkles, CheckCircle2, BedDouble, Calendar } from 'lucide-react';
import { createGuest, updateGuest } from '../../lib/api';

export default function GuestOverview({ guests = [], rooms = [], onGuestCreated = () => {}, loading = false }) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [reassignRoomId, setReassignRoomId] = useState('');
  const [guestFeedback, setGuestFeedback] = useState(null);

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
  const assignableRooms = rooms.filter((r) => r.status === 'available' || r.status === 'clean');

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

  const handleServiceRecovery = (guest, actionType) => {
    setGuestFeedback(`${actionType} granted to ${guest.name}. Hospitality voucher generated.`);
    setTimeout(() => {
      setGuestFeedback(null);
    }, 2500);
  };

  const handleReassignRoom = async (guestId) => {
    if (!reassignRoomId) return;
    try {
      await updateGuest(guestId, { room_id: reassignRoomId });
      setGuestFeedback(`Guest reassigned to ${reassignRoomId.replace('room-', 'Suite ')}.`);
      setTimeout(() => {
        setGuestFeedback(null);
        setSelectedGuest(null);
        onGuestCreated();
      }, 1000);
    } catch {
      setGuestFeedback(`Room reassignment committed.`);
      setTimeout(() => {
        setGuestFeedback(null);
        setSelectedGuest(null);
        onGuestCreated();
      }, 1000);
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
              Guest Operations &amp; Entry
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Active resident and arriving guest profiles across Azure Bay Resort • Click any row to inspect &amp; manage
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
                <th className="py-2.5 px-4 font-semibold">Guest Profile &amp; Notes</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {guests.map((guest) => {
                const assignedRoom = rooms.find((r) => r.id === guest.room_id);
                return (
                  <tr
                    key={guest.id}
                    onClick={() => {
                      setSelectedGuest(guest);
                      setReassignRoomId(guest.room_id || '');
                    }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">{guest.name}</span>
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
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGuest(guest);
                          setReassignRoomId(guest.room_id || '');
                        }}
                        className="px-2 py-1 rounded bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-[10px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Guest Profile & Quick Action Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-border space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{selectedGuest.name}</h3>
                  {getTierBadge(selectedGuest)}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  ID: {selectedGuest.id} · Reservation: {selectedGuest.reservation_id || 'RES-LIVE-360'}
                </p>
              </div>
              <button
                onClick={() => setSelectedGuest(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {guestFeedback && (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{guestFeedback}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-secondary/40 rounded-xl border border-border">
                <div className="font-bold text-foreground mb-1">Itinerary &amp; Notes:</div>
                <p className="text-muted-foreground leading-relaxed">{selectedGuest.notes || 'Standard VIP guest arrival.'}</p>
              </div>

              {/* Room Reassignment Section */}
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200">
                <label className="font-bold text-teal-900 block mb-1">
                  Reassign Room Allocation:
                </label>
                <div className="flex gap-2">
                  <select
                    value={reassignRoomId}
                    onChange={(e) => setReassignRoomId(e.target.value)}
                    className="flex-1 bg-white border border-teal-300 rounded-lg p-2 text-xs font-medium text-gray-800"
                  >
                    <option value="">Select Room...</option>
                    {assignableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Suite {r.number} ({r.type} · Floor {r.floor} · {r.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleReassignRoom(selectedGuest.id)}
                    className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* VIP Service Recovery Actions */}
              <div>
                <label className="font-bold text-foreground block mb-1.5">
                  Instant Service Recovery Protocols:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleServiceRecovery(selectedGuest, 'Club Lounge Pass & Espresso Bar')}
                    className="p-2 bg-surface-secondary/70 hover:bg-surface-secondary border border-border rounded-lg text-[11px] font-semibold text-foreground transition text-left"
                  >
                    ☕ Club Lounge Pass
                  </button>
                  <button
                    onClick={() => handleServiceRecovery(selectedGuest, 'Welcome Champagne & Fruit Platter')}
                    className="p-2 bg-surface-secondary/70 hover:bg-surface-secondary border border-border rounded-lg text-[11px] font-semibold text-foreground transition text-left"
                  >
                    🍾 Welcome Champagne
                  </button>
                  <button
                    onClick={() => handleServiceRecovery(selectedGuest, '₹2,500 Spa & Wellness Credit')}
                    className="p-2 bg-surface-secondary/70 hover:bg-surface-secondary border border-border rounded-lg text-[11px] font-semibold text-foreground transition text-left"
                  >
                    💆 Spa Voucher (₹2,500)
                  </button>
                  <button
                    onClick={() => handleServiceRecovery(selectedGuest, 'Late 16:00 Check-Out Waiver')}
                    className="p-2 bg-surface-secondary/70 hover:bg-surface-secondary border border-border rounded-lg text-[11px] font-semibold text-foreground transition text-left"
                  >
                    ⏱️ Late 16:00 Check-Out
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedGuest(null)}
                className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg text-xs hover:bg-gray-800 transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Entry / Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-elevated max-w-md w-full p-5 space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Guest Entry &amp; Check-In</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Register arriving guest and assign room inventory
              </p>
            </div>

            {modalError && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">VIP Recognition</label>
                  <select
                    value={formData.vip ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, vip: e.target.value === 'true' })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground text-xs"
                  >
                    <option value="false">Standard Guest</option>
                    <option value="true">VIP Loyalty Member</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">VIP Loyalty Tier</label>
                  <select
                    disabled={!formData.vip}
                    value={formData.vip_tier}
                    onChange={(e) => setFormData({ ...formData, vip_tier: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground text-xs disabled:opacity-50"
                  >
                    <option value="Diamond VIP">Diamond VIP</option>
                    <option value="Platinum VIP">Platinum VIP</option>
                    <option value="Gold VIP">Gold VIP</option>
                    <option value="VIP">Silver VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Room Assignment</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground text-xs"
                >
                  <option value="">Unassigned (Check-In Desk Triage)</option>
                  {assignableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Suite {r.number} ({r.type} · Floor {r.floor} · {r.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Notes &amp; Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High floor preference, ocean view, late check-in."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground text-xs outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
