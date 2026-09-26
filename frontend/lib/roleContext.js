'use client';

/**
 * Resort 360 — Role Context
 * Lightweight localStorage-backed role context for demo mode.
 * No real authentication — this is explicitly a demo mechanism.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const DEMO_ROLES = {
  admin: {
    id: 'admin',
    label: 'Resort Admin',
    shortLabel: 'RESORT ADMIN',
    dept: 'Management',
    email: 'admin@resort360.demo',
    desc: 'Full resort operations, staff, guests, incidents, and AI intelligence.',
    avatar: 'RA',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  front_desk: {
    id: 'front_desk',
    label: 'Front Desk Manager',
    shortLabel: 'FRONT DESK',
    dept: 'Front Desk',
    email: 'frontdesk@resort360.demo',
    desc: 'Guest arrivals, departures, check-ins, room assignments, and guest issues.',
    avatar: 'FD',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  housekeeping: {
    id: 'housekeeping',
    label: 'Housekeeping Manager',
    shortLabel: 'HOUSEKEEPING',
    dept: 'Housekeeping',
    email: 'housekeeping@resort360.demo',
    desc: 'Room readiness queue, cleaning assignments, turnover scheduling.',
    avatar: 'HK',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  maintenance: {
    id: 'maintenance',
    label: 'Maintenance Manager',
    shortLabel: 'MAINTENANCE',
    dept: 'Engineering',
    email: 'maintenance@resort360.demo',
    desc: 'Active incidents, critical repairs, room maintenance status, technician assignments.',
    avatar: 'MM',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  revenue: {
    id: 'revenue',
    label: 'Revenue Manager',
    shortLabel: 'REVENUE',
    dept: 'Revenue',
    email: 'revenue@resort360.demo',
    desc: 'Occupancy, room inventory, group bookings, revenue-sensitive decisions.',
    avatar: 'RM',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const STORAGE_KEY = 'resort360_demo_role';

const RoleContext = createContext({
  role: null,
  roleData: null,
  setRole: () => {},
  clearRole: () => {},
});

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && DEMO_ROLES[saved]) setRoleState(saved);
    } catch (_) {}
  }, []);

  const setRole = useCallback((roleId) => {
    if (!DEMO_ROLES[roleId]) return;
    setRoleState(roleId);
    try { localStorage.setItem(STORAGE_KEY, roleId); } catch (_) {}
  }, []);

  const clearRole = useCallback(() => {
    setRoleState(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }, []);

  return (
    <RoleContext.Provider value={{ role, roleData: DEMO_ROLES[role] || null, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}