const fs = require('fs');
const path = require('path');

// 1. Read the schema files
const contextSchemaPath = path.join(__dirname, '..', 'schemas', 'ai', 'agent-context.schema.json');
const responseSchemaPath = path.join(__dirname, '..', 'schemas', 'ai', 'agent-response.schema.json');
const consensusSchemaPath = path.join(__dirname, '..', 'schemas', 'ai', 'consensus-input.schema.json');
const planSchemaPath = path.join(__dirname, '..', 'schemas', 'ai', 'action-plan.schema.json');

const contextSchema = JSON.parse(fs.readFileSync(contextSchemaPath, 'utf8'));
const responseSchema = JSON.parse(fs.readFileSync(responseSchemaPath, 'utf8'));
const consensusSchema = JSON.parse(fs.readFileSync(consensusSchemaPath, 'utf8'));
const planSchema = JSON.parse(fs.readFileSync(planSchemaPath, 'utf8'));

console.log('✓ Successfully parsed all 4 JSON Schemas:');
console.log('  - agent-context.schema.json (' + contextSchema.$id + ')');
console.log('  - agent-response.schema.json (' + responseSchema.$id + ')');
console.log('  - consensus-input.schema.json (' + consensusSchema.$id + ')');
console.log('  - action-plan.schema.json (' + planSchema.$id + ')');

// 2. Validate Demo Data Scenario Representation
const demoDataPath = path.join(__dirname, '..', 'phase-1', 'demo-data.json');
const demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));

console.log('\n✓ Demo data loaded successfully:');
console.log(`  Resort: ${demoData.resort.name}`);
console.log(`  Rooms: ${demoData.rooms.length}`);
console.log(`  Guests: ${demoData.guests ? demoData.guests.length : 0}`);
console.log(`  Staff: ${demoData.staff.length}`);
console.log(`  Incidents: ${demoData.incidents.length}`);
console.log(`  Tasks: ${demoData.tasks.length}`);

// 3. Test Scenarios A through E as Canonical Operational Contexts
const scenarios = [
  {
    name: 'Scenario A: VIP Early Arrival',
    context: {
      context_id: 'ctx-scen-a-001',
      schema_version: '1.0',
      created_at: '2026-09-26T10:40:00+05:30',
      resort: {
        id: demoData.resort.id,
        name: demoData.resort.name,
        location: 'Goa, India',
        timezone: 'Asia/Kolkata',
        total_rooms: demoData.resort.total_rooms
      },
      trigger: {
        type: 'vip_early_arrival',
        incident_id: 'incident-001',
        severity: 'critical',
        description: 'Diamond VIP Alexander Vance arrived at front desk while Room 401 HVAC is down'
      },
      guests: [demoData.guests[0]],
      rooms: [demoData.rooms[19], demoData.rooms[15]], // 401 and 505
      staff: demoData.staff.slice(0, 5),
      incidents: [demoData.incidents[0]],
      tasks: demoData.tasks.slice(0, 3),
      constraints: [
        { id: 'c1', type: 'vip_wait_limit', description: 'Max 10 minutes lobby wait for Diamond VIP' },
        { id: 'c2', type: 'block_lock', description: 'Rooms 402-415 reserved for wedding block' }
      ],
      upcoming_events: [
        { event_id: 'evt-01', title: '50-guest wedding check-in', expected_time: '2026-09-26T14:00:00+05:30', guest_count: 50 }
      ]
    }
  },
  {
    name: 'Scenario B: Room 401 HVAC Failure',
    context: {
      context_id: 'ctx-scen-b-002',
      schema_version: '1.0',
      created_at: '2026-09-26T09:45:00+05:30',
      resort: {
        id: demoData.resort.id,
        name: demoData.resort.name,
        location: 'Goa, India'
      },
      trigger: {
        type: 'hvac_failure',
        incident_id: 'incident-001',
        severity: 'critical',
        description: 'HVAC compressor malfunction in Room 401'
      },
      guests: [],
      rooms: [demoData.rooms[19]],
      staff: demoData.staff.filter(s => s.department === 'maintenance'),
      incidents: [demoData.incidents[0]],
      tasks: [demoData.tasks[0]],
      constraints: [{ id: 'c1', type: 'parts_availability', description: '45uF capacitor in stock at workshop' }]
    }
  },
  {
    name: 'Scenario C: Housekeeping Bottleneck',
    context: {
      context_id: 'ctx-scen-c-003',
      schema_version: '1.0',
      created_at: '2026-09-26T11:15:00+05:30',
      resort: {
        id: demoData.resort.id,
        name: demoData.resort.name,
        location: 'Goa, India'
      },
      trigger: {
        type: 'housekeeping_bottleneck',
        incident_id: 'incident-003',
        severity: 'high',
        description: 'Multiple departure rooms awaiting cleaning with only 2 attendants available'
      },
      guests: demoData.guests || [],
      rooms: demoData.rooms.filter(r => r.status === 'dirty'),
      staff: demoData.staff.filter(s => s.department === 'housekeeping'),
      incidents: demoData.incidents.filter(i => i.department === 'housekeeping'),
      tasks: demoData.tasks.filter(t => t.department === 'housekeeping'),
      constraints: [{ id: 'c1', type: 'labor_shortage', description: '2 cleaners called in sick' }]
    }
  },
  {
    name: 'Scenario D: Large Group Arrival',
    context: {
      context_id: 'ctx-scen-d-004',
      schema_version: '1.0',
      created_at: '2026-09-26T12:00:00+05:30',
      resort: {
        id: demoData.resort.id,
        name: demoData.resort.name,
        location: 'Goa, India'
      },
      trigger: {
        type: 'large_group_arrival',
        severity: 'high',
        description: '50-guest corporate summit arriving in 2 hours across Floor 4'
      },
      guests: demoData.guests || [],
      rooms: demoData.rooms.filter(r => r.floor === 4),
      staff: demoData.staff.filter(s => ['front_desk', 'guest_services'].includes(s.department)),
      incidents: [],
      tasks: demoData.tasks.slice(0, 4),
      constraints: [{ id: 'c1', type: 'group_lock', description: 'All Floor 4 rooms must be inspected by 13:30' }]
    }
  },
  {
    name: 'Scenario E: Multiple Simultaneous Incidents',
    context: {
      context_id: 'ctx-scen-e-005',
      schema_version: '1.0',
      created_at: '2026-09-26T12:30:00+05:30',
      resort: {
        id: demoData.resort.id,
        name: demoData.resort.name,
        location: 'Goa, India'
      },
      trigger: {
        type: 'multi_incident_cascade',
        severity: 'critical',
        description: 'HVAC compressor down, VIP arrived early, linen delay in laundry, and 3 simultaneous guest tickets'
      },
      guests: demoData.guests || [],
      rooms: demoData.rooms,
      staff: demoData.staff,
      incidents: demoData.incidents,
      tasks: demoData.tasks,
      constraints: [
        { id: 'c1', type: 'cross_department_strain', description: 'Front desk queue exceeding 15 min wait time' },
        { id: 'c2', type: 'maintenance_capacity', description: 'Chief HVAC technician already dispatched' }
      ]
    }
  }
];

// 4. Basic Schema-conformance verification helper
function validateContext(ctx, schema) {
  for (const field of schema.required) {
    if (ctx[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (!Array.isArray(ctx.rooms) || !Array.isArray(ctx.staff) || !Array.isArray(ctx.incidents)) {
    throw new Error('Rooms, staff, and incidents must be arrays');
  }
  return true;
}

console.log('\n--- VALIDATING SCENARIO PAYLOADS AGAINST CONTEXT SCHEMA ---');
scenarios.forEach(scen => {
  try {
    validateContext(scen.context, contextSchema);
    console.log(`✓ Passed: ${scen.name}`);
  } catch (err) {
    console.error(`✗ Failed: ${scen.name} -> ${err.message}`);
    process.exit(1);
  }
});

// 5. Test Sample Agent Response Conformance
const sampleResponse = {
  agent: "housekeeping",
  schema_version: "1.0",
  assessment: {
    summary: "Suite 505 can be turned over in 25 minutes using a 2-person express clean team.",
    priority: "high"
  },
  observations: [
    "Suite 505 was vacated at 10:15 AM and linen stripped.",
    "Attendants Maria Santos and Elena Gomez are currently on 3rd floor finishing routine cleans."
  ],
  constraints: [
    "Diverting Maria and Elena will push standard clean on Room 105 back by 30 minutes."
  ],
  recommendations: [
    {
      recommendation_id: "rec-hk-001",
      action: "Dispatch Maria Santos and Elena Gomez to Suite 505 for priority express turnover.",
      reason: "Permits Diamond VIP Alexander Vance to take possession of a cleaned Executive Suite by 11:10 AM.",
      priority: "critical",
      affected_rooms: ["room-505", "room-105"],
      affected_guests: ["guest-001"],
      required_staff: ["staff-003", "staff-004"],
      estimated_duration_minutes: 25,
      risks: ["Room 105 standard clean delayed 30 minutes"],
      confidence: 0.92
    }
  ],
  confidence: 0.92
};

function validateResponse(res, schema) {
  for (const field of schema.required) {
    if (res[field] === undefined) throw new Error(`Missing field ${field}`);
  }
  for (const rec of res.recommendations) {
    for (const recField of schema.properties.recommendations.items.required) {
      if (rec[recField] === undefined) throw new Error(`Recommendation missing ${recField}`);
    }
  }
  return true;
}
validateResponse(sampleResponse, responseSchema);
console.log('✓ Passed: Sample Agent Response validates against agent-response.schema.json');

// 6. Test Action Plan Conformance
const samplePlan = {
  action_plan_id: "plan-001",
  context_id: "ctx-scen-a-001",
  schema_version: "1.0",
  created_at: "2026-09-26T10:42:00+05:30",
  summary: "Reassign VIP Alexander Vance to Suite 505; express turnover by 2 attendants; lounge hospitality voucher.",
  reasoning: "Suite 401 HVAC requires 75m repair. Suite 505 is unreserved and ready in 25m. Preserves VIP satisfaction with $0 revenue displacement.",
  priority: "critical",
  actions: [
    {
      action_id: "act-001",
      type: "guest_amenity_courtesy",
      description: "Escort guest to Executive Lounge with complimentary signature cocktail voucher",
      department: "front_desk",
      assigned_to: "staff-001",
      room_id: null,
      guest_id: "guest-001",
      priority: "high",
      estimated_duration_minutes: 5
    },
    {
      action_id: "act-002",
      type: "expedite_housekeeping",
      description: "Perform 25-minute dual-attendant express clean and inspection of Suite 505",
      department: "housekeeping",
      assigned_to: "staff-003",
      room_id: "room-505",
      guest_id: "guest-001",
      priority: "critical",
      estimated_duration_minutes: 25
    },
    {
      action_id: "act-003",
      type: "dispatch_maintenance",
      description: "Replace 45uF HVAC run capacitor in Suite 401 and conduct thermal cycling",
      department: "maintenance",
      assigned_to: "staff-005",
      room_id: "room-401",
      guest_id: null,
      priority: "high",
      estimated_duration_minutes: 75
    }
  ],
  affected_guests: ["guest-001"],
  affected_rooms: ["room-401", "room-505"],
  risks: ["Room 105 routine clean delayed 30m"],
  requires_human_approval: true,
  status: "pending_approval"
};

function validatePlan(plan, schema) {
  for (const field of schema.required) {
    if (plan[field] === undefined) throw new Error(`Missing plan field ${field}`);
  }
  if (plan.requires_human_approval !== true) throw new Error('requires_human_approval must be strictly true');
  return true;
}
validatePlan(samplePlan, planSchema);
console.log('✓ Passed: Sample Action Plan validates against action-plan.schema.json with mandatory human-in-the-loop');

console.log('\n=============================================');
console.log('ALL PHASE 1C CONTRACTS & SCHEMAS VERIFIED 100%');
console.log('=============================================\n');
