'use client';

import React, { useState } from 'react';
import {
  X, AlertTriangle, ShieldAlert, Wrench, Users, BedDouble,
  TrendingUp, CheckCircle2, Lock, FileWarning, Sparkles
} from 'lucide-react';
import { createIncident, updateRoom } from '../../lib/api';

const ROOM_OPTIONS = [
  { id: 'room-101', number: '101', label: 'Room 101 — Deluxe Garden (Floor 1)' },
  { id: 'room-102', number: '102', label: 'Room 102 — Deluxe Garden (Floor 1)' },
  { id: 'room-103', number: '103', label: 'Room 103 — Deluxe Garden (Floor 1)' },
  { id: 'room-104', number: '104', label: 'Room 104 — Deluxe Garden (Floor 1)' },
  { id: 'room-105', number: '105', label: 'Room 105 — Deluxe Ocean (Floor 1)' },
  { id: 'room-201', number: '201', label: 'Room 201 — Premier Sea View (Floor 2)' },
  { id: 'room-202', number: '202', label: 'Room 202 — Premier Sea View (Floor 2)' },
  { id: 'room-203', number: '203', label: 'Room 203 — Premier Sea View (Floor 2)' },
  { id: 'room-204', number: '204', label: 'Room 204 — Premier Sea View (Floor 2)' },
  { id: 'room-205', number: '205', label: 'Room 205 — Executive Suite (Floor 2)' },
  { id: 'room-301', number: '301', label: 'Room 301 — Luxury Ocean (Floor 3)' },
  { id: 'room-302', number: '302', label: 'Room 302 — Luxury Ocean (Floor 3)' },
  { id: 'room-303', number: '303', label: 'Room 303 — Luxury Ocean (Floor 3)' },
  { id: 'room-304', number: '304', label: 'Room 304 — Luxury Ocean (Floor 3)' },
  { id: 'room-305', number: '305', label: 'Room 305 — Presidential Villa (Floor 3)' },
  { id: 'room-401', number: '401', label: 'Room 401 — Penthouse Ocean Suite (Floor 4)' },
  { id: 'room-402', number: '402', label: 'Room 402 — Premium Deluxe (Floor 4)' },
  { id: 'room-403', number: '403', label: 'Room 403 — Premium Deluxe (Floor 4)' },
  { id: 'room-404', number: '404', label: 'Room 404 — Premium Deluxe (Floor 4)' },
  { id: 'room-405', number: '405', label: 'Room 405 — Premium Deluxe (Floor 4)' },
  { id: 'room-501', number: '501', label: 'Room 501 — Executive Suite (Floor 5)' },
  { id: 'room-502', number: '502', label: 'Room 502 — Executive Suite (Floor 5)' },
  { id: 'room-503', number: '503', label: 'Room 503 — Executive Suite (Floor 5)' },
  { id: 'room-504', number: '504', label: 'Room 504 — Executive Suite (Floor 5)' },
  { id: 'room-505', number: '505', label: 'Room 505 — Presidential Sky Suite (Floor 5)' },
  { id: 'facility-general', number: 'General', label: 'General / Lobby / Public Resort Area' },
];

const DEPARTMENTS = [
  { id: 'front_desk', label: 'Front Desk', icon: Users, desc: 'Guest arrival issues, lobby queue, early check-in' },
  { id: 'maintenance', label: 'Maintenance & Eng.', icon: Wrench, desc: 'HVAC, plumbing, electrical, lock defects' },
  { id: 'housekeeping', label: 'Housekeeping', icon: BedDouble, desc: 'Turnover bottlenecks, linen shortages, deep cleans' },
  { id: 'revenue', label: 'Revenue & Yield', icon: TrendingUp, desc: 'Group block restrictions, rate parity, room locks' },
];

export default function ReportConcernModal({ isOpen, onClose, onSuccess, initialRoomId = '' }) {
  const [department, setDepartment] = useState('maintenance');
  const [roomId, setRoomId] = useState(initialRoomId || 'room-401');
  const [severity, setSeverity] = useState('critical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blockRoom, setBlockRoom] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a brief concern title or summary.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const selectedRoom = ROOM_OPTIONS.find((r) => r.id === roomId);
      const isActualRoom = roomId !== 'facility-general';

      const incidentPayload = {
        title: title.trim(),
        description: description.trim() || `Operational concern raised by ${department.replace('_', ' ')}.`,
        department,
        severity,
        status: 'open',
        room_id: isActualRoom ? roomId : undefined,
        room_number: isActualRoom && selectedRoom ? selectedRoom.number : undefined,
        source: 'Manager / Staff Concern Log',
      };

      const res = await createIncident(incidentPayload);

      // If manager requested room lock and it's a specific room, update room status
      if (blockRoom && isActualRoom && roomId) {
        try {
          await updateRoom(roomId, {
            status: 'maintenance',
            notes: `Locked due to registered concern: ${title.trim()}`,
          });
        } catch (roomErr) {
          console.warn('Could not update room status directly:', roomErr);
        }
      }

      setSuccessMsg('Concern registered successfully! Room status updated and problem recorded for pre-booking checks.');
      setTimeout(() => {
        setSuccessMsg('');
        if (onSuccess) onSuccess(res?.data);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to register concern:', err);
      setErrorMsg(err.message || 'Failed to submit concern. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <FileWarning className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Raise Operational Concern / Report Room Defect
              </h2>
              <p className="text-[11px] text-slate-400">
                Register issues into the system to alert staff and prevent accidental room bookings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Department Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reporting Department
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENTS.map((dept) => {
                const Icon = dept.icon;
                const isSelected = department === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setDepartment(dept.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/80 text-teal-950 ring-1 ring-teal-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-700' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-bold">{dept.label}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{dept.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room / Facility Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Affected Room / Facility
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {ROOM_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Concern Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">Low (Cosmetic / Minor Note)</option>
                <option value="medium">Medium (Service Delay / Partial Impact)</option>
                <option value="high">High (Priority Attention Required)</option>
                <option value="critical">Critical (Blocks Room / Guest Impact)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue / Problem Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AC compressor failure, water leak in bathroom, VIP noise complaint"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Operational Notes &amp; Repair Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details for housekeeping attendants or technicians (e.g. capacitor blown, requires 45 mins, guest arrives at 2 PM)..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Pre-Booking Inventory Protection Checkbox */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="blockRoomCheck"
              checked={blockRoom}
              onChange={(e) => setBlockRoom(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="blockRoomCheck" className="text-xs text-amber-900 cursor-pointer">
              <span className="font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-700 inline" />
                Lock Room from Booking &amp; Assignment (Pre-Booking Safeguard)
              </span>
              <span className="text-[11px] text-amber-800 block mt-0.5">
                Automatically sets room status to &lsquo;maintenance&rsquo; so front desk staff cannot assign this room until cleared.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Registering Concern...' : 'Register Problem & Update Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
