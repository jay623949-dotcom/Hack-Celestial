'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  HelpCircle,
  X,
  BookOpen,
  Sparkles,
  Bot,
  CloudSun,
  BedDouble,
  Users,
  UserCheck,
  TrendingUp,
  Zap,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const DOCS_CATALOG = {
  '/dashboard': {
    title: 'Operations Console (Overview)',
    category: 'Operations Command',
    icon: Sparkles,
    badge: 'Phase 1–10 Core',
    summary: 'Central command deck synthesizing real-time hotel KPIs, active incidents, pending task queues, and critical operational alerts across all 45 rooms.',
    workflows: [
      {
        step: '1. Monitor Room 401 Critical Alert',
        detail: 'The red banner at the top flags the Diamond VIP Alexander Vance / Arjun Mehta AC breakdown. Click "Review Incident" to inspect diagnostics.',
      },
      {
        step: '2. Trigger Multi-Agent Swarm Analysis',
        detail: 'Click "Analyze with AI" to pass live room inventory, VIP arrival status, and staff availability to Front Desk, Housekeeping, Maintenance, and Revenue agents.',
      },
      {
        step: '3. Filter Room Inventory',
        detail: 'Use the quick stat cards or click "Rooms Hub" to inspect floor plans, available suites (e.g. 505, 205), and rooms currently undergoing turnover.',
      },
      {
        step: '4. Instant Demo Reset',
        detail: 'Click "Reset Demo Scenario" at any time to restore the deterministic VIP early arrival and Suite 401 AC failure state.',
      },
    ],
    buttonGuides: [
      { label: 'Review Incident', action: 'Opens the Suite 401 incident triage modal with root cause details and AI dispatch options.' },
      { label: 'Analyze with AI', action: 'Engages the multi-agent swarm to formulate an optimal cross-departmental resolution plan.' },
      { label: 'Reset Demo Scenario', action: 'Calls backend demo reset endpoint, restoring initial 45 rooms and seed incidents.' },
      { label: 'Refresh Data', action: 'Re-syncs live data across rooms, guests, staff, incidents, and tasks.' },
    ],
  },

  '/dashboard/weather-digital-twin': {
    title: 'Weather Digital Twin & Nugen AI',
    category: 'Intelligence & Simulation',
    icon: CloudSun,
    badge: 'Phase 11 Compulsory',
    summary: 'Environmental predictive Digital Twin modeling how microclimates, monsoon cloudbursts, and gale squalls propagate across South Goa transit corridors and resort operations.',
    workflows: [
      {
        step: '1. Ingest Live Telemetry',
        detail: 'Open-Meteo numerical model streams live South Goa weather. Operational severity is automatically calibrated (LOW to EXTREME).',
      },
      {
        step: '2. Inspect Geospatial Corridor Map',
        detail: 'Click on Azure Bay Resort, Dabolim Airport (GOI), Panaji Corridor, or Colva Beach to inspect travel delay risks and infrastructure vulnerability.',
      },
      {
        step: '3. Run What-If Simulations',
        detail: 'Adjust Rainfall (0-100 mm/h), Temperature (20-45°C), or Wind (0-80 km/h) sliders, or click scenario presets (Monsoon, Heatwave, Squall). Click "Run What-If Simulation".',
      },
      {
        step: '4. Verify Production State Isolation',
        detail: 'Notice the amber "SIMULATION MODE" banner. What-if experiments predict operational bottlenecks without altering live database records.',
      },
      {
        step: '5. Inject Environmental Context into Swarm',
        detail: 'Click "Inject Context to Autonomous Swarm" so the 4 reasoning agents factor rainfall delays and HVAC load into incident resolution plans.',
      },
      {
        step: '6. Inspect Nugen Domain Proof',
        detail: 'Click "Nugen Proof" to view technical alignment verification (Base model Llama-V3p2-3b-Reasoning -> resort360-hospitality-v1).',
      },
    ],
    buttonGuides: [
      { label: 'Run What-If Simulation', action: 'Calculates predicted arrival delays, housekeeping turnover, and alternative room pressure.' },
      { label: 'Scenario Presets (Monsoon/Heat/Squall)', action: 'Instantly populates realistic microclimate stress parameters.' },
      { label: 'Inject Context to Autonomous Swarm', action: 'Transfers simulated meteorological constraints to Front Desk, Housekeeping, Maintenance, and Revenue agents.' },
      { label: 'Nugen Proof', action: 'Displays formal domain alignment dataset and model verification metadata.' },
      { label: 'Exit Simulation / Sync Sensors', action: 'Restores real-time Open-Meteo sensor telemetry and clears simulation sandbox.' },
    ],
  },

  '/dashboard/agents': {
    title: 'Autonomous 360 OS & Swarm Consensus',
    category: 'Autonomous Multi-Agent AI',
    icon: Bot,
    badge: 'Dual AI Architecture',
    summary: 'Autonomous multi-agent system orchestrating 4 departmental specialists (Front Desk, Housekeeping, Maintenance, Revenue) communicating over live Socket.IO pub/sub.',
    workflows: [
      {
        step: '1. Run Rehearsal Cascade',
        detail: 'Click "Run Rehearsal Cascade" on the Overview tab to execute the automated 3-step synchronization sequence across check-in, maintenance triage, and revenue yield.',
      },
      {
        step: '2. Test Departmental Studios',
        detail: 'Switch tabs to Front Desk, Housekeeping, Maintenance, or Revenue to test individual agent prompts, priority queues, and diagnostic image triage.',
      },
      {
        step: '3. Switch to Swarm Consensus Tab',
        detail: 'Click the "Swarm Consensus" tab to trigger multi-agent voting on the Room 401 incident and generate unanimous agreement on alternative Suite 505.',
      },
    ],
    buttonGuides: [
      { label: 'Run Rehearsal Cascade', action: 'Executes Front Desk check-in -> Suite 401 lockout -> Revenue flash sale cascade.' },
      { label: 'Smoke Ping', action: 'Publishes a synthetic heartbeat event across the live Socket.IO Event Bus.' },
      { label: 'Autonomous / Consensus Switcher', action: 'Toggles between standalone agent execution studios and collaborative multi-agent consensus voting.' },
    ],
  },

  '/dashboard/rooms': {
    title: 'Rooms Hub & Live Floor Plan',
    category: 'Inventory Management',
    icon: BedDouble,
    badge: 'Physical Infrastructure',
    summary: 'Interactive inventory management across 45 physical room keys spanning 6 floors, including Standard Deluxe keys, Club Suites, and Beach Villas.',
    workflows: [
      {
        step: '1. Filter by Condition',
        detail: 'Click "Available", "Occupied", "Dirty", or "Maintenance" tabs to inspect room readiness across floors 1 through 6.',
      },
      {
        step: '2. Click Any Room to Edit',
        detail: 'Click any room tile (e.g. Room 401 or Room 505) to open the Edit Room Modal. You can toggle cleanliness, mark for maintenance, or change status.',
      },
      {
        step: '3. Identify Alternative Safe Rooms',
        detail: 'Check Floor 5 (Suite 505) which remains available and clean as the primary candidate for VIP service recovery.',
      },
    ],
    buttonGuides: [
      { label: 'Status Filter Tabs (Available/Occupied/etc)', action: 'Filters visible inventory tiles by operational status.' },
      { label: 'Room Tiles (Clickable)', action: 'Opens room management drawer to edit status, cleanliness, and maintenance notes.' },
      { label: 'Sync Button', action: 'Fetches latest room status from PostgreSQL/DataStore.' },
    ],
  },

  '/dashboard/guests': {
    title: 'Guests Hub & In-House Registry',
    category: 'Guest Experience',
    icon: Users,
    badge: 'VIP Operations',
    summary: 'Resident guest directory managing Diamond, Platinum, Gold VIPs, stay itineraries, and front desk intake.',
    workflows: [
      {
        step: '1. Inspect VIP Early Arrivals',
        detail: 'Review Diamond VIP Alexander Vance and other high-priority arrivals flagged for expedited check-in.',
      },
      {
        step: '2. Register New Guest',
        detail: 'Click "New Guest Entry" to register an inbound guest, assign available rooms, and tag VIP loyalty tier.',
      },
      {
        step: '3. Click Any Guest Row',
        detail: 'Click any guest in the table to view their complete itinerary, room assignment, and service recovery actions.',
      },
    ],
    buttonGuides: [
      { label: 'New Guest Entry', action: 'Opens quick intake modal to check in a guest and assign a room.' },
      { label: 'Guest Table Rows (Clickable)', action: 'Opens guest profile details and service recovery triggers.' },
      { label: 'Sync Button', action: 'Refreshes guest registry and arrival rosters.' },
    ],
  },

  '/dashboard/staff': {
    title: 'Staff Hub & Duty Rostering',
    category: 'Workforce Allocation',
    icon: UserCheck,
    badge: 'Team Deployment',
    summary: 'Rostering and workload distribution across Front Desk, Housekeeping, and Maintenance teams.',
    workflows: [
      {
        step: '1. Filter by Department',
        detail: 'Use tabs to view Front Desk agents, Housekeeping room attendants, or Maintenance technicians.',
      },
      {
        step: '2. Toggle Staff Availability',
        detail: 'Click any staff member row to toggle duty status between Available, Busy, and On Duty, or dispatch tasks.',
      },
      {
        step: '3. Balance Active Workload',
        detail: 'Monitor task counts to avoid overloading technicians during major maintenance incidents.',
      },
    ],
    buttonGuides: [
      { label: 'Department Tabs (All/Front Desk/Housekeeping/etc)', action: 'Filters staff roster by operational specialty.' },
      { label: 'Staff Rows (Clickable)', action: 'Opens staff management modal to toggle status and reassign tasks.' },
    ],
  },

  '/dashboard/revenue': {
    title: 'Revenue Hub & Dynamic Yield',
    category: 'Financial Yield',
    icon: TrendingUp,
    badge: 'RevPAR Optimization',
    summary: 'Real-time Net RevPAR calculation, average daily rate (ADR) performance, group block locks, and flash sale generation.',
    workflows: [
      {
        step: '1. Monitor Daily Yield',
        detail: 'Review estimated daily room revenue (₹6.8L+), RevPAR, and booking channel mix (Direct, OTA, Groups, VIP).',
      },
      {
        step: '2. Verify Group Block Protection',
        detail: 'Inspect Floor 4 wedding group block protection ensuring suites are not accidentally reassigned.',
      },
      {
        step: '3. Trigger Dynamic Recalculation',
        detail: 'Click "Recalculate Yield" or "Launch Flash Sale" to optimize margins in real-time.',
      },
    ],
    buttonGuides: [
      { label: 'Recalculate Yield', action: 'Re-evaluates ADR and Net RevPAR based on current occupancy and incident costs.' },
      { label: 'Launch Flash Sale', action: 'Creates an ephemeral discounted bundle for unreserved cabanas/spa.' },
    ],
  },

  '/dashboard/execution': {
    title: 'Live Execution Stepper & Dispatch',
    category: 'Operational Execution',
    icon: Zap,
    badge: 'Socket.IO Live',
    summary: 'Live action plan dispatcher executing multi-step operational dispatches with real-time WebSocket state synchronization.',
    workflows: [
      {
        step: '1. Review Approved Action Plan',
        detail: 'Inspect the 5-step consensus plan: Reassign Vance -> Suite 505 -> Express Clean -> Technician dispatch -> Lounge escort.',
      },
      {
        step: '2. Execute Step-by-Step',
        detail: 'Click "Execute Next Step" or "Execute All" to trigger real database mutations and Socket.IO broadcasts.',
      },
      {
        step: '3. Verify Resolution',
        detail: 'Confirm all tasks finish, Room 401 is flagged under repair, and Alexander Vance is checked into Suite 505.',
      },
    ],
    buttonGuides: [
      { label: 'Execute Next Step', action: 'Executes the active step in the approved plan sequence.' },
      { label: 'Approve Plan / Reject Plan', action: 'Manager governance actions to accept or modify proposed swarm solutions.' },
    ],
  },

  '/dashboard/consensus': {
    title: 'Swarm Consensus Report',
    category: 'Multi-Agent Governance',
    icon: Layers,
    badge: 'Consensus Decision',
    summary: 'Consolidated report detailing individual agent proposals, cross-departmental debate arguments, and manager sign-off.',
    workflows: [
      {
        step: '1. Review Agent Arguments',
        detail: 'Inspect Front Desk VIP urgency vs Maintenance repair feasibility vs Revenue group block protection.',
      },
      {
        step: '2. Examine Unanimous Agreement',
        detail: 'Verify how all 4 agents settled on reassigning VIP to Suite 505 while locking Room 401.',
      },
      {
        step: '3. Sign Off & Dispatch',
        detail: 'Click "Approve & Dispatch Plan" to transition directly to Live Execution.',
      },
    ],
    buttonGuides: [
      { label: 'Approve & Dispatch Plan', action: 'Commits manager sign-off and opens the Live Execution engine.' },
      { label: 'Request Plan Modification', action: 'Instructs agents to re-evaluate with custom manager constraints.' },
    ],
  },
};

export default function HelpDocsModal({ isOpen, onClose, currentPath = '' }) {
  const pathname = usePathname();
  const effectivePath = currentPath || pathname || '/dashboard';

  // Normalize path to base route
  const getDocKey = () => {
    for (const key of Object.keys(DOCS_CATALOG)) {
      if (effectivePath.startsWith(key) && (key !== '/dashboard' || effectivePath === '/dashboard')) {
        return key;
      }
    }
    return '/dashboard';
  };

  const [selectedKey, setSelectedKey] = useState(getDocKey());

  useEffect(() => {
    setSelectedKey(getDocKey());
  }, [effectivePath, isOpen]);

  if (!isOpen) return null;

  const currentDoc = DOCS_CATALOG[selectedKey] || DOCS_CATALOG['/dashboard'];
  const Icon = currentDoc.icon || Sparkles;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Resort 360 Interactive Documentation</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {currentDoc.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Operational guides, button actions, and end-to-end demo workflows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close Documentation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Page Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-50 border-b border-gray-200/80 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-gray-400 mr-1 uppercase tracking-wider shrink-0">Topics:</span>
          {Object.entries(DOCS_CATALOG).map(([key, doc]) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedKey === key
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {doc.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-700">
          {/* Main Title & Summary Banner */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 flex items-start gap-3.5">
            <div className="p-2.5 bg-white text-teal-700 rounded-xl shadow-xs shrink-0 border border-teal-100">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                {currentDoc.category}
              </div>
              <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                {currentDoc.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {currentDoc.summary}
              </p>
            </div>
          </div>

          {/* Workflow Steps */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              Standard Operating Procedures &amp; Workflow Steps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentDoc.workflows.map((wf, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                  <div className="font-bold text-gray-900 text-xs mb-1">{wf.step}</div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{wf.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Button & Click Actions Guide */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              Interactive Button &amp; Click Guide
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-mono uppercase text-gray-500">
                  <tr>
                    <th className="py-2 px-3 font-bold w-1/3">Button / Element</th>
                    <th className="py-2 px-3 font-bold">What Happens on Click</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {currentDoc.buttonGuides.map((bg, bIdx) => (
                    <tr key={bIdx} className="hover:bg-gray-50/70">
                      <td className="py-2.5 px-3 font-bold text-gray-900 font-mono">
                        <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 inline-block">
                          {bg.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{bg.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Resort 360 · Autonomous Hospitality Intelligence Console
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
