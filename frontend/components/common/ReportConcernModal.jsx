'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRole } from '../../lib/roleContext';
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
  { id: 'facility-general', number: 'General', label: 'General / Public Resort Facility' },
];

const DEPARTMENT_OPTIONS = [
  { id: 'front_desk', label: 'Front Desk' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'maintenance', label: 'Maintenance & Engineering' },
  { id: 'revenue', label: 'Revenue Management' },
];

const DEPARTMENT_CATEGORIES = {
  front_desk: [
    'Guest complaint',
    'Early arrival constraint',
    'Late checkout request',
    'Check-in issue',
    'Guest request',
    'Room assignment issue',
    'General operational issue',
  ],
  housekeeping: [
    'Room not ready',
    'Cleaning issue',
    'Linen shortage',
    'Housekeeping delay',
    'Room turnover issue',
    'General operational issue',
  ],
  maintenance: [
    'AC failure',
    'Electrical issue',
    'Plumbing issue',
    'Water heater issue',
    'Equipment failure',
    'Structural defect',
    'General operational issue',
  ],
  revenue: [
    'Inventory restriction',
    'Rate issue',
    'Booking conflict',
    'Overbooking risk',
    'Room availability issue',
    'Revenue concern',
    'General operational issue',
  ],
};

const ALL_CATEGORIES = [
  'AC failure',
  'Guest complaint',
  'Room not ready',
  'Electrical issue',
  'Plumbing issue',
  'Cleaning issue',
  'Linen shortage',
  'Early arrival constraint',
  'Late checkout request',
  'Inventory restriction',
  'Rate issue',
  'Equipment failure',
  'General operational issue',
];

export default function ReportConcernModal({ isOpen, onClose, onSuccess, initialRoomId = '' }) {
  const { role, roleData } = useRole();
  const isAdmin = role === 'admin' || !role;

  // Determine user's native department
  const userDept = (() => {
    if (role === 'front_desk') return 'front_desk';
    if (role === 'housekeeping') return 'housekeeping';
    if (role === 'maintenance') return 'maintenance';
    if (role === 'revenue') return 'revenue';
    return 'front_desk'; // default if admin
  })();

  const [reportingDept, setReportingDept] = useState(userDept);
  const [affectedDept, setAffectedDept] = useState('maintenance');
  const [roomId, setRoomId] = useState(initialRoomId || 'room-401');
  const [severity, setSeverity] = useState('critical');
  const [category, setCategory] = useState('AC failure');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blockRoom, setBlockRoom] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep reporting department synchronized with role
  useEffect(() => {
    if (!isAdmin) {
      setReportingDept(userDept);
    }
  }, [userDept, isAdmin]);

  // Update category options based on active reporting department
  const availableCategories = isAdmin ? ALL_CATEGORIES : (DEPARTMENT_CATEGORIES[reportingDept] || ALL_CATEGORIES);

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  }, [reportingDept, availableCategories, category]);

  if (!isOpen) return null;

  // Auto-fill title with category if empty
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    if (!title || availableCategories.includes(title)) {
      const roomNum = ROOM_OPTIONS.find((r) => r.id === roomId)?.number;
      setTitle(roomNum && roomNum !== 'General' ? `${newCat} in Room ${roomNum}` : newCat);
    }
  };

  const handleRoomChange = (e) => {
    const newRoomId = e.target.value;
    setRoomId(newRoomId);
    const roomNum = ROOM_OPTIONS.find((r) => r.id === newRoomId)?.number;
    if (roomNum && roomNum !== 'General' && category) {
      setTitle(`${category} in Room ${roomNum}`);
    }
  };

  const isRoomSelected = roomId && roomId !== 'facility-general';
  const showBlockRoomOption = isRoomSelected && ['medium', 'high', 'critical'].includes(severity);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please specify the issue summary.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const selectedRoom = ROOM_OPTIONS.find((r) => r.id === roomId);
      const isActualRoom = roomId !== 'facility-general';

      // Send payload with role-based metadata
      const incidentPayload = {
        title: title.trim(),
        description: description.trim() || `Operational concern logged by ${roleData?.label || 'Staff'}.`,
        category,
        severity,
        status: 'open',
        reporting_department: isAdmin ? reportingDept : userDept,
        affected_department: affectedDept,
        department: affectedDept,
        reported_by: roleData?.email || roleData?.label || `${role} user`,
        room_id: isActualRoom ? roomId : undefined,
        room_number: isActualRoom && selectedRoom ? selectedRoom.number : undefined,
        block_room: blockRoom && isActualRoom,
        source: 'ERP Concern Form',
      };

      const res = await createIncident(incidentPayload);

      // Also ensure room status is updated if requested
      if (blockRoom && isActualRoom && roomId) {
        try {
          await updateRoom(roomId, {
            status: 'maintenance',
            issue: title.trim(),
            notes: `Locked by ${roleData?.label || 'Operator'}: ${title.trim()}`,
          });
        } catch (_) {}
      }

      setSuccessMsg('Concern registered successfully.');
      setTimeout(() => {
        setSuccessMsg('');
        if (onSuccess) onSuccess(res?.data);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to submit concern:', err);
      setErrorMsg(err.message || 'Failed to submit concern. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const severityDot = {
    low: 'bg-slate-400',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    critical: 'bg-rose-500',
  }[severity] || 'bg-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-100 font-sans">
      <div className="relative w-full max-w-lg rounded-xl bg-white border border-slate-300 shadow-xl overflow-hidden text-slate-800 text-xs">
        
        {/* Odoo Style Simple Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Report an Operational Concern
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Register an issue and notify the appropriate operational team.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Department Row: Reporting Department (Read-only for users, select for admin) vs Responsible Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Reporting Department (Role-Enforced) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reporting Department
              </label>
              {isAdmin ? (
                <select
                  value={reportingDept}
                  onChange={(e) => setReportingDept(e.target.value)}
                  className="w-full h-8 px-2.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
                >
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label} (Admin Override)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="h-8 px-2.5 rounded border border-slate-200 bg-slate-100/90 text-xs text-slate-800 flex items-center justify-between font-medium">
                  <span>{DEPARTMENT_OPTIONS.find((d) => d.id === userDept)?.label || 'Front Desk'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">(read-only)</span>
                </div>
              )}
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                Operator: <span className="font-medium text-slate-700">{roleData?.label || 'Operator'}</span>
              </div>
            </div>

            {/* 2. Responsible / Affected Department */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Responsible Department
              </label>
              <select
                value={affectedDept}
                onChange={(e) => setAffectedDept(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
              >
                {DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Team that will receive and execute this task
              </div>
            </div>
          </div>

          {/* Room Selection & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Affected Room
              </label>
              <select
                value={roomId}
                onChange={handleRoomChange}
                className="w-full h-8 px-2.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
              >
                {ROOM_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Severity</span>
                <span className="flex items-center gap-1.5 text-[10px] font-normal text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${severityDot}`} />
                  {severity.toUpperCase()}
                </span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Concern Category (Filtered by department) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Concern Category
            </label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full h-8 px-2.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Field */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Issue / Problem Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AC not cooling, water leak, guest complaint..."
              className="w-full h-8 px-2.5 rounded border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
              required
            />
          </div>

          {/* Details Field */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, timing, guest impact, or relevant operational details."
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          {/* Room Booking Lock Safeguard (Compact ERP Checkbox) */}
          {showBlockRoomOption && (
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="blockRoomCheck"
                checked={blockRoom}
                onChange={(e) => setBlockRoom(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#714B67] focus:ring-[#714B67] cursor-pointer"
              />
              <label htmlFor="blockRoomCheck" className="text-xs text-slate-800 cursor-pointer select-none">
                <span className="font-semibold flex items-center gap-1.5 text-slate-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700 inline" />
                  Block room from booking
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Prevents Front Desk from assigning this room until the issue is cleared.
                </span>
              </label>
            </div>
          )}

          {/* Modal Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-[#714B67] hover:bg-[#5e3d55] text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Concern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
