# RESORT 360 — Operational Data Model Specification

> **SINGLE SOURCE OF TRUTH (DATA ENTITIES & VALIDATION RULES)**  
> **Location**: `/docs/resort-data-model.md`

---

## 1. Overview & Architectural Principle
Resort 360 operates as an intelligent orchestration layer directly above hospitality operations. For AI agents to reason accurately without hallucinations, all data entities must adhere to strict typing, relational integrity, and deterministic validation rules.

```
REAL RESORT DATA (DB / API)
        │
        ▼
OPERATIONAL CONTEXT BUILDER
        │
        ▼
SPECIALIZED AGENTS (Input Schema)
        │
        ▼
AGENT EVALUATIONS & RECOMMENDATIONS (Output Schema)
        │
        ▼
CONSENSUS ENGINE (Consensus Schema)
        │
        ▼
ACTION PLAN (Human-in-the-Loop Schema)
        │
        ▼
EXECUTIVE APPROVAL & TASK DISPATCH
```

---

## 2. Entity Status: Current vs Future

| Entity | Status in Phase 1 / 1C | Role in Architecture |
| :--- | :--- | :--- |
| **Resort** | CURRENTLY IMPLEMENTED | Root property container, timezone & room scale definition. |
| **Room** | CURRENTLY IMPLEMENTED | Physical space, occupancy state, housekeeping readiness. |
| **Guest** | CURRENTLY IMPLEMENTED | Guest profile, VIP loyalty tier, check-in window, reservation link. |
| **Staff** | CURRENTLY IMPLEMENTED | Operational staff, department, shift, availability status. |
| **Incident** | CURRENTLY IMPLEMENTED | Operational disruption, severity, department ownership. |
| **Task** | CURRENTLY IMPLEMENTED | Actionable work order dispatched to staff. |
| *Reservation* | FUTURE EXTENSION | Group booking contracts, corporate ADR locks, deposit tracking. |
| *Maintenance Asset* | FUTURE EXTENSION | Equipment serial numbers, HVAC warranty, replacement parts inventory. |
| *Inventory* | FUTURE EXTENSION | Linen bundles, minibar stock, guest amenity counts. |
| *Department* | FUTURE EXTENSION | Budget limits, shift supervisor hierarchies. |
| *Guest Request* | FUTURE EXTENSION | Concierge requests, dining reservations, spa bookings. |

---

## 3. Core Entity Specifications

### 3.1 Resort
Defines the resort property context for operational calculations.

| Field | Data Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Yes | Unique resort identifier | `"resort-001"` |
| `name` | String | Yes | Official hotel/resort trade name | `"Azure Bay Resort & Spa"` |
| `location` | String | Yes | Physical geographic location | `"Goa, India"` |
| `timezone` | String | Yes | Standard IANA timezone identifier | `"Asia/Kolkata"` |
| `total_rooms` | Integer | Yes | Total physical room keys | `20` |

```json
{
  "id": "resort-001",
  "name": "Azure Bay Resort & Spa",
  "location": "Goa, India",
  "timezone": "Asia/Kolkata",
  "total_rooms": 20
}
```

---

### 3.2 Room
Represents physical guest accommodation units and their current real-time readiness.

| Field | Data Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Yes | Unique room identifier | `"room-401"` |
| `resort_id` | String | Yes | Foreign key to parent resort | `"resort-001"` |
| `number` | String | Yes | Door / PMS room number string | `"401"` |
| `floor` | Integer | Yes | Physical building floor level | `4` |
| `type` | String | Yes | Room category/tier | `"Deluxe Ocean View"` |
| `status` | String (Enum) | Yes | Real-time physical occupancy state | `"maintenance"` |
| `housekeeping_status` | String (Enum) | Yes | Housekeeping cleaning state | `"blocked"` |
| `features` | Array of Strings | No | Notable room amenities/locks | `["Ocean View", "Private Bar"]` |
| `guest_id` | String / Null | No | ID of currently assigned guest | `"guest-001"` |
| `last_cleaned` | ISO 8601 String | No | Timestamp of last verified inspection | `"2026-09-25T18:00:00Z"` |

#### Valid Room Enums:
- `status`:
  - `available`: Cleaned, inspected, and unassigned.
  - `occupied`: Guest has active key packets and folio.
  - `maintenance`: Physical asset or safety defect prevents occupancy.
  - `reserved`: Pre-locked for incoming VIP or group block.
  - `dirty`: Vacated by checkout, awaiting cleaning.
- `housekeeping_status`:
  - `clean`: Inspected and guest-ready.
  - `in_progress`: Housekeeper currently inside turning room.
  - `blocked`: Physical room lockout due to repairs or deep cleaning.

```json
{
  "id": "room-401",
  "resort_id": "resort-001",
  "number": "401",
  "floor": 4,
  "type": "Suite",
  "status": "maintenance",
  "housekeeping_status": "blocked",
  "features": ["Penthouse Wing", "Ocean View", "Private Bar"],
  "guest_id": null,
  "last_cleaned": "2026-09-25T18:00:00Z"
}
```

---

### 3.3 Guest
Represents inbound or in-house hospitality guests without storing unnecessary PII.

| Field | Data Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Yes | Unique guest identity | `"guest-001"` |
| `resort_id` | String | Yes | Foreign key to resort | `"resort-001"` |
| `name` | String | Yes | Guest full name | `"Alexander Vance"` |
| `vip` | Boolean | Yes | Flag indicating high-value status | `true` |
| `vip_tier` | String | Yes | Loyalty level | `"Diamond VIP"` |
| `room_id` | String / Null | No | Linked room assignment | `"room-401"` |
| `check_in` | ISO 8601 String | Yes | Scheduled or actual arrival time | `"2026-09-26T10:40:00Z"` |
| `check_out` | ISO 8601 String | Yes | Scheduled departure time | `"2026-09-30T11:00:00Z"` |
| `arrival_type` | String | No | Early arrival, standard, or late | `"early"` |
| `notes` | String | No | Operational preferences | `"Arrived early; expects lounge check-in."` |

```json
{
  "id": "guest-001",
  "resort_id": "resort-001",
  "name": "Alexander Vance",
  "vip": true,
  "vip_tier": "Diamond VIP",
  "room_id": "room-401",
  "check_in": "2026-09-26T10:40:00Z",
  "check_out": "2026-09-30T11:00:00Z",
  "arrival_type": "early",
  "notes": "Arrived early in lobby; expects immediate executive check-in. High lifetime spend."
}
```

---

### 3.4 Staff
Represents on-property staff available for work order assignment.

| Field | Data Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Yes | Staff member identity | `"staff-005"` |
| `resort_id` | String | Yes | Foreign key to resort | `"resort-001"` |
| `name` | String | Yes | Staff full name | `"Bob Miller"` |
| `department` | String (Enum) | Yes | Operating department | `"maintenance"` |
| `role` | String | Yes | Job position | `"Chief HVAC Technician"` |
| `shift` | String | No | Shift schedule | `"morning"` |
| `status` | String (Enum) | Yes | Work dispatch availability | `"on_duty"` |
| `current_task` | String | No | Description of ongoing work | `"Evaluating AC breakdown in Room 401"` |

#### Valid Staff Enums:
- `department`: `front_desk`, `housekeeping`, `maintenance`, `revenue`, `guest_services`, `security`
- `status`:
  - `on_duty`: Available for new work order dispatch.
  - `busy`: Currently executing a high-priority task.
  - `off_duty`: Not present on property.

```json
{
  "id": "staff-005",
  "resort_id": "resort-001",
  "name": "Bob Miller",
  "department": "maintenance",
  "role": "Chief HVAC Technician",
  "shift": "morning",
  "status": "on_duty",
  "current_task": "Evaluating AC breakdown in Room 401"
}
```

---

### 3.5 Incident
Represents an unexpected operational problem requiring cross-departmental response.

| Field | Data Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Yes | Incident unique tracking code | `"incident-001"` |
| `resort_id` | String | Yes | Foreign key to resort | `"resort-001"` |
| `type` | String | Yes | Incident category tag | `"hvac_failure"` |
| `title` | String | Yes | Short operational title | `"HVAC Compressor Failure in Suite 401"` |
| `description` | String | Yes | Detailed telemetry & symptoms | `"Room 401 air conditioner failed with capacitor error. Room temp 82°F."` |
| `severity` | String (Enum) | Yes | Operational impact tier | `"critical"` |
| `status` | String (Enum) | Yes | Incident lifecycle status | `"open"` |
| `department` | String (Enum) | Yes | Department accountable for resolution | `"maintenance"` |
| `room_id` | String / Null | No | Associated physical room | `"room-401"` |
| `guest_id` | String / Null | No | Associated guest affected | `"guest-001"` |
| `reported_at` | ISO 8601 String | Yes | Incident logging timestamp | `"2026-09-26T10:41:00Z"` |

#### Valid Incident Enums:
- `severity`: `critical`, `high`, `medium`, `low`
- `status`: `open`, `investigating`, `in_progress`, `resolved`, `closed`

```json
{
  "id": "incident-001",
  "resort_id": "resort-001",
  "type": "hvac_failure",
  "title": "HVAC Compressor Failure in Suite 401",
  "description": "Room 401 air conditioner failed with capacitor error. Room temp 82°F. 75-minute repair required.",
  "severity": "critical",
  "status": "open",
  "department": "maintenance",
  "room_id": "room-401",
  "guest_id": "guest-001",
  "reported_at": "2026-09-26T10:41:00Z"
}
```

---

### 3.6 Task
Represents an actionable work order generated as part of a manager-approved action plan.

| Field | Data Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Yes | Task identifier | `"task-001"` |
| `resort_id` | String | Yes | Foreign key to resort | `"resort-001"` |
| `title` | String | Yes | Task action title | `"Dispatch HVAC Capacitor to Room 401"` |
| `description` | String | No | Concrete execution instructions | `"Acquire 45uF replacement capacitor from inventory."` |
| `department` | String (Enum) | Yes | Assigned department | `"maintenance"` |
| `assigned_to` | String / Null | No | Staff ID assigned to perform work | `"staff-005"` |
| `room_id` | String / Null | No | Target room location | `"room-401"` |
| `incident_id` | String / Null | No | Parent incident triggering task | `"incident-001"` |
| `priority` | String (Enum) | Yes | Execution urgency | `"high"` |
| `status` | String (Enum) | Yes | Task execution state | `"in_progress"` |
| `due_time` | String | No | Target resolution deadline | `"11:55 AM"` |

#### Valid Task Enums:
- `priority`: `critical`, `high`, `medium`, `low`
- `status`: `pending`, `in_progress`, `completed`, `cancelled`

```json
{
  "id": "task-001",
  "resort_id": "resort-001",
  "title": "Dispatch HVAC Capacitor to Room 401",
  "description": "Acquire 45uF replacement capacitor from engineering inventory and replace on rooftop unit.",
  "department": "maintenance",
  "assigned_to": "staff-005",
  "room_id": "room-401",
  "incident_id": "incident-001",
  "priority": "high",
  "status": "in_progress",
  "due_time": "11:55 AM"
}
```

---

## 4. Relational Integrity Rules
1. **Resort Hierarchy**: Every room, guest, staff member, incident, and task must reference a valid `resort_id`.
2. **Room Assignment Integrity**: A guest cannot be assigned to a room that does not exist in the resort inventory.
3. **Task Assignment Integrity**: A task cannot be assigned to an invalid `assigned_to` staff ID.
4. **Cascade Safety**: Deleting a resort record cascades to its child entities, whereas deleting an incident or task leaves physical rooms and staff records intact (`ON DELETE SET NULL`).
