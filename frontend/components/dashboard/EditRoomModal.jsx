'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  BedDouble,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  User,
  ShieldCheck,
  Save,
  Sparkles,
} from 'lucide-react';
import { updateRoom } from '../../lib/api';

export default function EditRoomModal({ isOpen, room, onClose, onSaved }) {
  const [status, setStatus] = useState('available');
  const [housekeeping, setHousekeeping] = useState('clean');
  const [guest, setGuest] = useState('');
  const [issue, setIssue] = useState('');
  const [vip, setVip] = useState('None');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (room) {
      setStatus(room.status || 'available');
      setHousekeeping(room.housekeeping_status || room.housekeeping || (room.status === 'dirty' ? 'dirty' : 'clean'));
      // If occupied but guest was 'Vacant', default to 'In-House Guest'
      const initialGuest = room.guest === 'Vacant' && room.status === 'occupied' ? 'In-House Guest' : (room.guest || '');
      setGuest(initialGuest);
      setIssue(room.issue || room.notes || '');
      setVip(room.vip || 'None');
      setError(null);
    }
  }, [room]);

  if (!isOpen || !room) return null;

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'available') {
      if (guest === 'In-House Guest' || !guest) {
        setGuest('Vacant');
      }
      if (housekeeping === 'dirty') {
        setHousekeeping('clean');
      }
    } else if (newStatus === 'occupied') {
      if (!guest || guest === 'Vacant') {
        setGuest('In-House Guest');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // If occupied, enforce that guest is not marked "Vacant"
    const sanitizedGuest = status === 'occupied' 
      ? (guest && guest.trim() !== 'Vacant' ? guest.trim() : 'In-House Guest')
      : (status === 'available' ? 'Vacant' : guest.trim());

    const updates = {
      status,
      housekeeping,
      housekeeping_status: housekeeping,
      guest: sanitizedGuest,
      issue: issue.trim(),
      vip,
      last_updated: new Date().toISOString(),
    };

    try {
      // Call backend API if room.id exists
      if (room.id) {
        await updateRoom(room.id, updates).catch((err) => {
          console.warn('[EditRoomModal] Backend update fallback to optimistic:', err.message);
        });
      }

      const updatedRoom = {
        ...room,
        ...updates,
      };

      if (onSaved) {
        onSaved(updatedRoom);
      }
      onClose();
    } catch (err) {
      console.error('[EditRoomModal] Failed to save room:', err);
      setError('Failed to update room condition. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-border shadow-elevated overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-odoo-purple/10 text-odoo-purple flex items-center justify-center font-bold">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  Edit Room #{room.number}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Floor {room.floor}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {room.type || 'Resort Suite'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Operational Status */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Operational State
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'available', label: 'Available', dot: 'bg-emerald-500' },
                { id: 'occupied', label: 'Occupied', dot: 'bg-amber-500' },
                { id: 'maintenance', label: 'Maintenance', dot: 'bg-rose-500' },
                { id: 'dirty', label: 'Dirty', dot: 'bg-orange-500' },
                { id: 'reserved', label: 'Reserved', dot: 'bg-blue-500' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleStatusChange(opt.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    status === opt.id
                      ? 'border-odoo-purple bg-odoo-purple/10 text-odoo-purple shadow-xs font-bold'
                      : 'border-border bg-white text-muted-foreground hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Room Condition / Housekeeping Status */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Room Condition &amp; Cleanliness
            </label>
            <select
              value={housekeeping}
              onChange={(e) => setHousekeeping(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary/40 text-foreground text-xs font-medium focus:outline-none focus:border-odoo-purple transition-colors cursor-pointer"
            >
              <option value="clean">Clean &amp; Inspected (Ready for Guests)</option>
              <option value="dirty">Dirty (Turndown / Express Clean Required)</option>
              <option value="in_progress">Cleaning In Progress</option>
              <option value="maintenance_required">Maintenance / Repairs Required</option>
              <option value="inspected">Inspected &amp; Quality Verified</option>
            </select>
          </div>

          {/* Guest In Residence (Displayed properly if occupied) */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between">
              <span>Guest In Residence</span>
              {status === 'occupied' && (
                <span className="text-[10px] font-sans text-amber-600 font-bold">
                  ● State: Occupied
                </span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder={status === 'occupied' ? 'e.g. Dr. Evelyn Reed' : 'Vacant / Ready'}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary/40 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-odoo-purple transition-colors"
              />
            </div>
            {status === 'occupied' && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Room is currently occupied. Will display guest name or &quot;Occupied&quot; — never &quot;Vacant / Ready&quot;.
              </p>
            )}
          </div>

          {/* Operational Notes / Issues */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Operational Notes / Maintenance Faults
            </label>
            <textarea
              rows={2}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. HVAC compressor repaired; inspected by engineering team."
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface-secondary/40 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-odoo-purple transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-odoo-purple hover:bg-odoo-purple-hover text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Updating...' : 'Save Room Condition'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
