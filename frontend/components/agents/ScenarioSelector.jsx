'use client';

import React from 'react';
import { Layers, ChevronDown, Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const SCENARIO_CATALOG = [
  {
    id: 'SCENARIO-001',
    name: 'VIP Early Arrival + Room Breakdown',
    tag: 'Primary Demo',
    description: 'Diamond VIP arrives early at front desk while assigned Suite 401 HVAC compressor is down.',
    context: {
      context_id: 'ctx-scen-001',
      schema_version: '1.0',
      created_at: '2026-09-26T10:40:00+05:30',
      resort: {
        id: 'resort-001',
        name: 'The Grand Azure Bay Resort & Villas',
        location: 'Goa, India',
        timezone: 'Asia/Kolkata',
        total_rooms: 20
      },
      trigger: {
        type: 'vip_early_arrival_with_breakdown',
        incident_id: 'incident-001',
        severity: 'critical',
        description: 'Diamond VIP Alexander Vance arrived at front desk while Room 401 HVAC compressor has failed.'
      },
      guests: [
        {
          id: 'guest-001',
          name: 'Alexander Vance',
          vip: true,
          room_id: 'room-401',
          check_in: '2026-09-26T10:40:00Z',
          check_out: '2026-09-30T11:00:00Z',
          arrival_type: 'early',
          notes: 'Diamond VIP member. Arrived 20m early in lobby.'
        }
      ],
      rooms: [
        {
          id: 'room-401',
          number: '401',
          floor: 4,
          type: 'Suite',
          status: 'maintenance',
          housekeeping_status: 'blocked',
          features: ['Ocean View', 'Penthouse Wing']
        },
        {
          id: 'room-505',
          number: '505',
          floor: 5,
          type: 'Suite',
          status: 'dirty',
          housekeeping_status: 'in_progress',
          features: ['Ocean View', 'Executive Bar']
        }
      ],
      staff: [
        { id: 'staff-001', name: 'Sarah Jenkins', department: 'front_desk', role: 'Guest Relations Supervisor', status: 'on_duty' },
        { id: 'staff-003', name: 'Maria Santos', department: 'housekeeping', role: 'Senior Room Attendant', status: 'on_duty' },
        { id: 'staff-004', name: 'Elena Gomez', department: 'housekeeping', role: 'Room Attendant', status: 'on_duty' },
        { id: 'staff-005', name: 'Bob Miller', department: 'maintenance', role: 'Chief HVAC Technician', status: 'on_duty' },
        { id: 'staff-007', name: 'Chloe Bennett', department: 'revenue', role: 'Director of Revenue', status: 'on_duty' }
      ],
      incidents: [
        {
          id: 'incident-001',
          title: 'HVAC Compressor Failure in Suite 401',
          severity: 'critical',
          status: 'open',
          department: 'maintenance',
          room_id: 'room-401'
        }
      ],
      tasks: [
        { id: 'task-001', title: 'Replace 45uF capacitor in 401', department: 'maintenance', priority: 'critical', status: 'in_progress' }
      ],
      constraints: [
        { id: 'c1', type: 'vip_wait_limit', description: 'Max 10 minutes lobby wait tolerated for Diamond VIP' },
        { id: 'c2', type: 'block_lock', description: 'Rooms 402-415 on Floor 4 locked for 50-person wedding arrival at 2:00 PM' }
      ],
      upcoming_events: [
        { event_id: 'evt-01', title: '50-Guest Wedding Party Check-In', expected_time: '2026-09-26T14:00:00+05:30', guest_count: 50 }
      ]
    }
  },
  {
    id: 'SCENARIO-002',
    name: 'Room 401 HVAC Failure',
    tag: 'Engineering',
    description: 'Compressor breakdown in occupied VIP guest room during peak afternoon heat.',
    context: {
      context_id: 'ctx-scen-002',
      schema_version: '1.0',
      created_at: '2026-09-26T14:15:00+05:30',
      resort: {
        id: 'resort-001',
        name: 'The Grand Azure Bay Resort & Villas',
        location: 'Goa, India',
        total_rooms: 20
      },
      trigger: {
        type: 'hvac_failure',
        incident_id: 'incident-002',
        severity: 'critical',
        description: 'Room 401 AC stopped cooling; ambient temp reached 84F.'
      },
      guests: [
        { id: 'guest-001', name: 'Alexander Vance', vip: true, room_id: 'room-401', check_in: '2026-09-26T10:40:00Z', check_out: '2026-09-30T11:00:00Z', notes: 'Diamond VIP in residence.' }
      ],
      rooms: [
        { id: 'room-401', number: '401', floor: 4, type: 'Suite', status: 'occupied', housekeeping_status: 'clean' },
        { id: 'room-402', number: '402', floor: 4, type: 'Suite', status: 'available', housekeeping_status: 'clean' }
      ],
      staff: [
        { id: 'staff-005', name: 'Bob Miller', department: 'maintenance', role: 'HVAC Lead', status: 'on_duty' },
        { id: 'staff-001', name: 'Sarah Jenkins', department: 'front_desk', role: 'Supervisor', status: 'on_duty' }
      ],
      incidents: [
        { id: 'incident-002', title: 'Complete AC Failure Room 401', severity: 'critical', status: 'open', department: 'maintenance', room_id: 'room-401' }
      ],
      tasks: [],
      constraints: [
        { id: 'c1', type: 'habitability_limit', description: 'Repairs exceeding 30 minutes require immediate guest relocation.' }
      ]
    }
  },
  {
    id: 'SCENARIO-003',
    name: 'Housekeeping Bottleneck',
    tag: 'Operations',
    description: '7 departure suites dirty with only 2 attendants available before the 2:00 PM check-in surge.',
    context: {
      context_id: 'ctx-scen-003',
      schema_version: '1.0',
      created_at: '2026-09-26T11:30:00+05:30',
      resort: {
        id: 'resort-001',
        name: 'The Grand Azure Bay Resort & Villas',
        location: 'Goa, India',
        total_rooms: 20
      },
      trigger: {
        type: 'housekeeping_bottleneck',
        incident_id: 'incident-003',
        severity: 'high',
        description: '7 departure suites requiring turnover with only 2 room attendants on floor.'
      },
      guests: [],
      rooms: [
        { id: 'room-105', number: '105', floor: 1, type: 'Deluxe Ocean View', status: 'dirty', housekeeping_status: 'dirty' },
        { id: 'room-203', number: '203', floor: 2, type: 'Deluxe Ocean View', status: 'dirty', housekeeping_status: 'dirty' },
        { id: 'room-301', number: '301', floor: 3, type: 'Suite', status: 'dirty', housekeeping_status: 'dirty' }
      ],
      staff: [
        { id: 'staff-003', name: 'Maria Santos', department: 'housekeeping', role: 'Attendant', status: 'on_duty' },
        { id: 'staff-004', name: 'Elena Gomez', department: 'housekeeping', role: 'Attendant', status: 'on_duty' }
      ],
      incidents: [
        { id: 'incident-003', title: 'Turnover Backlog Prior to 2:00 PM Surge', severity: 'high', status: 'open', department: 'housekeeping' }
      ],
      tasks: [],
      constraints: [
        { id: 'c1', type: 'labor_capacity', description: 'Average clean duration: 35 mins per room; 7 rooms require 245 total labor minutes.' }
      ]
    }
  },
  {
    id: 'SCENARIO-004',
    name: 'Large Group Arrival',
    tag: 'Logistics',
    description: '50-guest corporate summit arriving across 12 Floor 4 rooms requiring batch check-in.',
    context: {
      context_id: 'ctx-scen-004',
      schema_version: '1.0',
      created_at: '2026-09-26T12:00:00+05:30',
      resort: {
        id: 'resort-001',
        name: 'The Grand Azure Bay Resort & Villas',
        location: 'Goa, India',
        total_rooms: 20
      },
      trigger: {
        type: 'large_group_arrival',
        severity: 'high',
        description: '50-guest corporate group arriving in 2 hours across Floor 4 inventory.'
      },
      guests: [],
      rooms: [
        { id: 'room-402', number: '402', floor: 4, type: 'Deluxe', status: 'reserved', housekeeping_status: 'clean' },
        { id: 'room-403', number: '403', floor: 4, type: 'Deluxe', status: 'reserved', housekeeping_status: 'clean' },
        { id: 'room-404', number: '404', floor: 4, type: 'Deluxe', status: 'reserved', housekeeping_status: 'in_progress' }
      ],
      staff: [
        { id: 'staff-001', name: 'Sarah Jenkins', department: 'front_desk', role: 'Supervisor', status: 'on_duty' },
        { id: 'staff-002', name: 'James Wilson', department: 'front_desk', role: 'Agent', status: 'on_duty' }
      ],
      incidents: [],
      tasks: [],
      constraints: [
        { id: 'c1', type: 'batch_arrival', description: 'Front desk queue capacity is 4 simultaneous check-ins.' }
      ]
    }
  },
  {
    id: 'SCENARIO-006',
    name: 'Multiple Simultaneous Incidents',
    tag: 'Crisis Cascade',
    description: 'VIP early arrival + Room 401 HVAC failure + Housekeeping backlog + Upcoming group check-in.',
    context: {
      context_id: 'ctx-scen-006',
      schema_version: '1.0',
      created_at: '2026-09-26T12:30:00+05:30',
      resort: {
        id: 'resort-001',
        name: 'The Grand Azure Bay Resort & Villas',
        location: 'Goa, India',
        total_rooms: 20
      },
      trigger: {
        type: 'multiple_simultaneous_incidents',
        incident_id: 'incident-001',
        severity: 'critical',
        description: 'Simultaneous VIP arrival, HVAC compressor fault in Suite 401, dirty alternative Suite 505, and 2:00 PM wedding arrival lock.'
      },
      guests: [
        { id: 'guest-001', name: 'Alexander Vance', vip: true, room_id: 'room-401', check_in: '2026-09-26T10:40:00Z', check_out: '2026-09-30T11:00:00Z', notes: 'Diamond VIP member in lobby.' }
      ],
      rooms: [
        { id: 'room-401', number: '401', floor: 4, type: 'Suite', status: 'maintenance', housekeeping_status: 'blocked' },
        { id: 'room-505', number: '505', floor: 5, type: 'Suite', status: 'dirty', housekeeping_status: 'in_progress' },
        { id: 'room-105', number: '105', floor: 1, type: 'Deluxe Ocean View', status: 'dirty', housekeeping_status: 'dirty' }
      ],
      staff: [
        { id: 'staff-001', name: 'Sarah Jenkins', department: 'front_desk', role: 'Supervisor', status: 'on_duty' },
        { id: 'staff-003', name: 'Maria Santos', department: 'housekeeping', role: 'Attendant', status: 'on_duty' },
        { id: 'staff-004', name: 'Elena Gomez', department: 'housekeeping', role: 'Attendant', status: 'on_duty' },
        { id: 'staff-005', name: 'Bob Miller', department: 'maintenance', role: 'Chief HVAC Tech', status: 'on_duty' },
        { id: 'staff-007', name: 'Chloe Bennett', department: 'revenue', role: 'Director of Revenue', status: 'on_duty' }
      ],
      incidents: [
        { id: 'incident-001', title: 'HVAC Failure in Suite 401', severity: 'critical', status: 'open', department: 'maintenance', room_id: 'room-401' },
        { id: 'incident-003', title: 'Linen Delivery Delay from Commercial Laundry', severity: 'medium', status: 'in_progress', department: 'housekeeping' }
      ],
      tasks: [
        { id: 'task-001', title: 'Inspect HVAC 401', department: 'maintenance', priority: 'critical', status: 'in_progress' }
      ],
      constraints: [
        { id: 'c1', type: 'inventory_lock', description: 'Floor 4 locked for 50-person wedding arriving at 2:00 PM' },
        { id: 'c2', type: 'labor_capacity', description: 'Only 2 attendants on duty for simultaneous 505 express clean and 105 standard clean' },
        { id: 'c3', type: 'vip_tolerance', description: 'Alexander Vance tolerance threshold is 10 minutes in lobby' }
      ],
      upcoming_events: [
        { event_id: 'evt-01', title: '50-Guest Wedding Arrival', expected_time: '2026-09-26T14:00:00+05:30', guest_count: 50 }
      ]
    }
  }
];

export default function ScenarioSelector({
  selectedId,
  selectedScenario,
  onSelect,
  onSelectScenario,
  onRunAnalysis,
  disabled = false,
}) {
  const currentSelectedId = selectedScenario?.id || selectedId || 'SCENARIO-001';
  const currentScenario = SCENARIO_CATALOG.find((s) => s.id === currentSelectedId) || SCENARIO_CATALOG[0];

  const handleSelectScenario = (scen) => {
    if (onSelectScenario) onSelectScenario(scen);
    if (onSelect) onSelect(scen);
  };

  const handleRun = (e, scen) => {
    e.stopPropagation();
    handleSelectScenario(scen);
    if (onRunAnalysis) {
      onRunAnalysis(scen);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface shadow-soft space-y-4">
      {/* Header with Title and Active Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-foreground">
                Operational Problem &amp; Incident Scenarios
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                5 Benchmark Scenarios
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Click any operational crisis below to inspect and trigger multi-agent consensus deliberation.
            </p>
          </div>
        </div>

        {/* Global Run Deliberation Button for Current Active Scenario */}
        {onRunAnalysis && (
          <button
            onClick={(e) => handleRun(e, currentScenario)}
            disabled={disabled}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Swarm Deliberation ({currentScenario.tag})</span>
          </button>
        )}
      </div>

      {/* Scenario Grid: All 5 Scenarios are Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SCENARIO_CATALOG.map((scen) => {
          const isSelected = scen.id === currentSelectedId;
          return (
            <div
              key={scen.id}
              onClick={() => handleSelectScenario(scen)}
              className={`group p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer select-none ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/60 shadow-md ring-2 ring-teal-500/20'
                  : 'border-border bg-surface hover:bg-surface-secondary/70 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-surface text-primary border-primary/20 group-hover:border-primary/40'
                  }`}>
                    {scen.tag}
                  </span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground opacity-60 group-hover:opacity-100">
                      {scen.id}
                    </span>
                  )}
                </div>

                <div className={`text-xs font-bold transition-colors ${
                  isSelected ? 'text-teal-950 font-extrabold' : 'text-foreground group-hover:text-primary'
                }`}>
                  {scen.name}
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                  {scen.description}
                </p>
              </div>

              {/* Quick Action Trigger Button for This Specific Scenario */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">
                  {scen.context?.trigger?.severity ? `${scen.context.trigger.severity.toUpperCase()} Priority` : 'Operations'}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleRun(e, scen)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                    isSelected
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-800'
                  }`}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{isSelected ? 'Deliberate' : 'Run'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
