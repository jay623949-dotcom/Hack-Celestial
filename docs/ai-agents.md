# RESORT 360 — Specialized AI Agents Specification

> **AGENT DOMAINS, ROLES, CONTRACTS & BOUNDARIES**  
> **Location**: `/docs/ai-agents.md`

---

## 1. Multi-Agent Architectural Philosophy
In Resort 360, AI agents are **domain specialists**, not generic chatbots. Each agent acts as an advocate for its department's operational health, assessing the canonical operational context through a specific operational lens.

```
                         CANONICAL CONTEXT
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
 [ FRONT DESK AGENT ]   [ HOUSEKEEPING AGENT ]  [ MAINTENANCE AGENT ]
  - Guest Experience     - Room Hygiene          - Asset Safety
  - VIP Recovery         - Turnover Labor        - Repair Feasibility
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                        [ REVENUE AGENT ]
                         - Inventory Yield
                         - Group Block Locks
                                │
                                ▼
                     CONSENSUS ORCHESTRATOR
```

---

## 2. Agent Definitions & Scope

### 2.1 Front Desk Agent
- **Prompt Identifier**: `front_desk`
- **Prompt Version**: `front_desk_v1`
- **Core Domain**: Guest hospitality, VIP loyalty recovery, check-in coordination, and lobby congestion.
- **Allowed Reasoning Scope**:
  - Evaluates guest arrival timing and delay tolerance based on VIP status.
  - Formulates hospitality recovery strategies (e.g. Executive Lounge access, signature beverages).
  - Assesses guest experience impact of proposed room reassignment.
  - Flags need for revenue clearance on locked suites.
- **Prohibited Assumptions**:
  - ❌ Must **NOT** estimate mechanical repair durations or technician safety.
  - ❌ Must **NOT** force housekeepers to violate minimum cleaning duration guidelines.
  - ❌ Must **NOT** reassign rooms locked for revenue group blocks without Revenue approval.
  - ❌ Must **NOT** invent staff names, guest tiers, or check-in policies not in context.

### 2.2 Housekeeping Agent
- **Prompt Identifier**: `housekeeping`
- **Prompt Version**: `housekeeping_v1`
- **Core Domain**: Room turnover feasibility, physical attendant workload, and hygiene standards.
- **Allowed Reasoning Scope**:
  - Calculates true time-to-clean based on current room status (`dirty`, `in_progress`).
  - Evaluates attendant capacity and active floor coverage across on-duty staff.
  - Assesses whether an express 2-person clean is operationally realistic without burning out staff.
  - Prioritizes VIP departure/arrival turnarounds and upcoming group inspections.
- **Prohibited Assumptions**:
  - ❌ Must **NOT** diagnose electrical or mechanical compressor issues.
  - ❌ Must **NOT** determine whether a guest is allowed a complimentary room upgrade.
  - ❌ Must **NOT** invent cleaning durations ungrounded in context constraints.

### 2.3 Maintenance Agent
- **Prompt Identifier**: `maintenance`
- **Prompt Version**: `maintenance_v1`
- **Core Domain**: Engineering diagnostics, equipment failure triage, parts availability, and safety compliance.
- **Allowed Reasoning Scope**:
  - Evaluates equipment failure criticality (e.g. HVAC breakdown, plumbing leaks, lock latch defects).
  - Estimates repair duration (ETA) based strictly on context evidence.
  - Determines room habitability and enforces maintenance isolation locks in PMS.
  - Sequences technician work orders when labor is constrained.
- **Prohibited Assumptions**:
  - ❌ Must **NOT** interact directly with guests or offer hospitality vouchers.
  - ❌ Must **NOT** prioritize equipment repairs based solely on guest tier without considering physical safety.
  - ❌ Must **NOT** reassign housekeeping staff or invent unverified tools/parts.

### 2.4 Revenue Agent
- **Prompt Identifier**: `revenue`
- **Prompt Version**: `revenue_v1`
- **Core Domain**: Inventory yield, group reservation protection, ADR preservation, and displacement cost.
- **Allowed Reasoning Scope**:
  - Evaluates rate differentials between room categories.
  - Verifies that proposed room reassignments do not cannibalize upcoming group locks (e.g. 50-person wedding on Floor 4: Rooms 402–415).
  - Evaluates net revenue displacement ($0 if room unreserved until next day).
- **Prohibited Assumptions**:
  - ❌ Must **NOT** invent room prices, dollar amounts, ADR, RevPAR, or financial projections unless explicitly present in context.
  - ❌ Must **NOT** override safety or habitability determinations made by Maintenance.
  - ❌ Must **NOT** assign cleaning or engineering tasks.

---

## 3. Fact vs Recommendation Separation
Agents must strictly separate verified operational facts from analytical recommendations:

| Category | Example Statement | Allowed Location |
| :--- | :--- | :--- |
| **Observed Fact** | *"Suite 401 AC is offline with capacitor error; ambient temperature is 82°F."* | `observations` array |
| **Operational Constraint** | *"Floor 4 is restricted for 2:00 PM wedding arrival."* | `constraints` array |
| **Agent Recommendation** | *"Move VIP Alexander Vance to Suite 505 and authorize lounge escort."* | `recommendations` array |

---

## 4. Confidence Scoring
Every agent evaluation must return a `confidence` float score between `0.0` and `1.0`:
- `0.90 - 1.00`: Verified by high-certainty operational facts (e.g. room empty, parts in stock).
- `0.70 - 0.89`: Standard operational heuristic (e.g. 2 attendants typically clean in 25 mins).
- `< 0.70`: High operational uncertainty; consensus engine will flag for mandatory executive review.

---

## 5. Verified Output Example (Scenario 005 / Multi-Agent)

```json
{
  "agent": "front_desk",
  "schema_version": "1.0",
  "assessment": {
    "summary": "Diamond VIP Alexander Vance has arrived early expecting immediate check-in, but assigned Suite 401 is out of service due to an HVAC compressor breakdown. Immediate lobby de-escalation and Executive Lounge hospitality management are required.",
    "priority": "critical"
  },
  "observations": [
    "Guest Alexander Vance (guest-001) is a Diamond VIP currently waiting in the lobby.",
    "Assigned room room-401 is currently in 'maintenance' status due to incident-001."
  ],
  "constraints": [
    "Room 401 and Room 404 are currently unavailable due to active maintenance defects.",
    "Floor 4 inventory (room-402, room-403) is locked for incoming wedding party block."
  ],
  "recommendations": [
    {
      "recommendation_id": "rec-fd-001",
      "action": "Complete executive lounge escort and provide immediate dedicated VIP hospitality recovery service for guest-001.",
      "reason": "Mitigates public lobby friction and provides dedicated care via VIP Concierge Priya Patel.",
      "priority": "critical",
      "affected_rooms": ["room-401"],
      "affected_guests": ["guest-001"],
      "required_staff": ["staff-001", "staff-009"],
      "estimated_duration_minutes": 15,
      "risks": ["Potential guest impatience if repair duration exceeds 30 minutes"],
      "confidence": 0.95
    }
  ],
  "confidence": 0.92
}
```
