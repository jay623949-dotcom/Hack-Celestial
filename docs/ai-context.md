# RESORT 360 — AI Operational Context Specification

> **CANONICAL INPUT CONTRACT FOR SPECIALIZED AGENTS**  
> **Location**: `/docs/ai-context.md`

---

## 1. Context Assembly Principle
Future AI agents must never be passed raw database dumps. Dumping 200 rooms and hundreds of transactions into an LLM prompt increases token latency, introduces distractions, and triggers hallucinations.

The **Context Builder Service** (`contextService.js`) transforms raw database state into a compact, highly relevant **Operational Context Snapshot**:

```
DATABASE STATE (All Rooms, All Staff, All Folios)
                     │
                     ▼
         CONTEXT BUILDER FILTER
  - Extract incident trigger
  - Include directly affected rooms & immediate alternatives
  - Include affected guests & VIP tier
  - Include relevant on-duty staff
  - Include active operational constraints
                     │
                     ▼
        CANONICAL OPERATIONAL CONTEXT (JSON)
                     │
                     ▼
   SPECIALIZED AGENTS (Front Desk, Housekeeping, Maint, Revenue)
```

---

## 2. Canonical AI Context Contract

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "context_id": "ctx-8092",
  "schema_version": "1.0",
  "created_at": "2026-09-26T10:40:00+05:30",

  "resort": {
    "id": "resort-001",
    "name": "The Grand Azure Bay Resort & Villas",
    "location": "Goa, India",
    "timezone": "Asia/Kolkata",
    "total_rooms": 20
  },

  "trigger": {
    "type": "vip_early_arrival_with_breakdown",
    "incident_id": "incident-001",
    "severity": "critical",
    "description": "Diamond VIP Alexander Vance arrived 20m early at front desk while assigned Suite 401 HVAC compressor has failed."
  },

  "guests": [
    {
      "id": "guest-001",
      "name": "Alexander Vance",
      "vip": true,
      "vip_tier": "Diamond VIP",
      "room_id": "room-401",
      "check_in": "2026-09-26T10:40:00Z",
      "check_out": "2026-09-30T11:00:00Z",
      "notes": "Arrived early in lobby; expects immediate executive check-in. High lifetime spend."
    }
  ],

  "rooms": [
    {
      "id": "room-401",
      "number": "401",
      "floor": 4,
      "type": "Suite",
      "status": "maintenance",
      "housekeeping_status": "blocked",
      "features": ["Penthouse Wing", "Ocean View", "Private Bar"],
      "operational_issue": "HVAC compressor failed; 75m repair duration required."
    },
    {
      "id": "room-505",
      "number": "505",
      "floor": 5,
      "type": "Suite",
      "status": "dirty",
      "housekeeping_status": "in_progress",
      "features": ["Penthouse Corner", "Panoramic View", "Executive Bar"],
      "last_cleaned": "2026-09-25T18:00:00Z",
      "operational_potential": "Vacated at 10:15 AM; 2 attendants can turn in 25 mins express."
    }
  ],

  "staff": [
    {
      "id": "staff-001",
      "name": "Sarah Jenkins",
      "department": "front_desk",
      "role": "Guest Relations Supervisor",
      "status": "on_duty"
    },
    {
      "id": "staff-003",
      "name": "Maria Santos",
      "department": "housekeeping",
      "role": "Senior Room Attendant",
      "status": "on_duty"
    },
    {
      "id": "staff-004",
      "name": "Elena Gomez",
      "department": "housekeeping",
      "role": "Room Attendant",
      "status": "on_duty"
    },
    {
      "id": "staff-005",
      "name": "Bob Miller",
      "department": "maintenance",
      "role": "Chief HVAC Technician",
      "status": "on_duty"
    },
    {
      "id": "staff-007",
      "name": "Chloe Bennett",
      "department": "revenue",
      "role": "Director of Revenue Management",
      "status": "on_duty"
    }
  ],

  "incidents": [
    {
      "id": "incident-001",
      "title": "HVAC Compressor Failure in Suite 401",
      "severity": "critical",
      "status": "open",
      "department": "maintenance",
      "room_id": "room-401"
    }
  ],

  "tasks": [
    {
      "id": "task-001",
      "title": "Dispatch HVAC Capacitor to Room 401",
      "department": "maintenance",
      "assigned_to": "staff-005",
      "priority": "high",
      "status": "in_progress"
    }
  ],

  "constraints": [
    {
      "id": "const-01",
      "type": "inventory_lock",
      "description": "Rooms 402-415 on Floor 4 are locked for a 50-person wedding block arriving at 2:00 PM."
    },
    {
      "id": "const-02",
      "type": "guest_tolerance",
      "description": "Diamond VIP loyalty guidelines mandate lobby wait times under 10 minutes."
    },
    {
      "id": "const-03",
      "type": "labor_capacity",
      "description": "Housekeeping has exactly 2 attendants available on 3rd floor capable of immediate express dispatch."
    }
  ],

  "upcoming_events": [
    {
      "event_id": "evt-wedding-01",
      "title": "Wedding Party Inbound Group",
      "expected_time": "2026-09-26T14:00:00+05:30",
      "guest_count": 50,
      "room_block": ["402", "403", "404", "405"]
    }
  ]
}
```

---

## 3. Context Metadata & Versioning Rules
1. `context_id`: Deterministically generated session key (e.g. `ctx-8092`) allowing traceability across all agent prompts and manager approval logs.
2. `schema_version`: Semantic version string (`"1.0"`). Any addition of non-backward-compatible fields mandates incrementing this version.
3. `created_at`: ISO 8601 timestamp with explicit timezone offset (`+05:30`).

---

## 4. Operational Data Quality Rules
1. **Never Invent Missing Data**: If an arrival time or room feature is unknown, it must be represented as `null`, never guessed.
2. **Never Treat Null as Zero**: A `null` guest count or `null` repair duration means *unreported*, not 0 minutes.
3. **Always Preserve Timestamps**: All time-based calculations must compare against `created_at`.
4. **Data Minimization for Privacy**: Guest payment details, email addresses, and phone numbers are strictly excluded from the AI context.
5. **Clear Demarcation**: Operational facts belong in `rooms`, `guests`, `staff`, and `constraints`. Agent opinions or recommendations must never leak into the input context.
