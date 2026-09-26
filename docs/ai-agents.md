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
- **Core Domain**: Guest hospitality, VIP loyalty recovery, check-in coordination, and lobby congestion.
- **Responsibilities**:
  - Evaluates guest arrival timing and delay tolerance based on VIP status.
  - Formulates hospitality recovery strategies (e.g. Executive Lounge access, signature beverages).
  - Assesses guest experience impact of proposed room reassignment.
- **Strict Out-of-Scope Boundaries**:
  - ❌ Must **NOT** estimate mechanical repair durations or technician safety.
  - ❌ Must **NOT** force housekeepers to violate minimum cleaning duration guidelines.
  - ❌ Must **NOT** reassign rooms locked for revenue group blocks without Revenue approval.

---

### 2.2 Housekeeping Agent
- **Core Domain**: Room turnover feasibility, physical attendant workload, and hygiene standards.
- **Responsibilities**:
  - Calculates true time-to-clean based on current room status (`dirty`, `in_progress`).
  - Evaluates attendant capacity and active floor coverage.
  - Assesses whether an express 2-person clean is operationally realistic without burning out staff.
- **Strict Out-of-Scope Boundaries**:
  - ❌ Must **NOT** diagnose electrical or mechanical compressor issues.
  - ❌ Must **NOT** determine whether a guest is allowed a complimentary room upgrade.

---

### 2.3 Maintenance Agent
- **Core Domain**: Engineering diagnostics, equipment failure triage, parts availability, and safety compliance.
- **Responsibilities**:
  - Evaluates equipment failure criticality (e.g. HVAC breakdown, plumbing leaks).
  - Estimates minimum repair duration (ETA) and tool/part requirements.
  - Determines whether an affected room is habitable during or after repairs.
- **Strict Out-of-Scope Boundaries**:
  - ❌ Must **NOT** interact directly with guests or offer hospitality vouchers.
  - ❌ Must **NOT** prioritize equipment repairs based solely on guest tier without considering physical safety.

---

### 2.4 Revenue Agent
- **Core Domain**: Inventory yield, group reservation protection, ADR preservation, and displacement cost.
- **Responsibilities**:
  - Evaluates rate differentials between room categories.
  - Verifies that proposed room reassignments do not cannibalize upcoming group locks (e.g. 50-person wedding).
  - Calculates the net revenue displacement ($0 if room unreserved until next day).
- **Strict Out-of-Scope Boundaries**:
  - ❌ Must **NOT** override safety or habitability determinations made by Maintenance.
  - ❌ Must **NOT** reassign staff to cleaning duties.

---

## 3. Fact vs Recommendation Separation
Agents must strictly separate verified operational facts from analytical recommendations:

| Category | Example Statement | Allowed Location |
| :--- | :--- | :--- |
| **Observed Fact** | *"Suite 401 AC is offline with capacitor error; ambient temperature is 82°F."* | `observations` array |
| **Operational Constraint** | *"Floor 4 is restricted for 2:00 PM wedding arrival."* | `constraints` array |
| **Agent Recommendation** | *"Move VIP Alexander Vance to Suite 505 and authorize $25 lounge credit."* | `recommendations` array |

---

## 4. Confidence Scoring
Every agent evaluation must return a `confidence` float score between `0.0` and `1.0`:
- `0.90 - 1.00`: Verified by high-certainty operational facts (e.g. room empty, parts in stock).
- `0.70 - 0.89`: Standard operational heuristic (e.g. 2 attendants typically clean in 25 mins).
- `< 0.70`: High operational uncertainty; consensus engine will flag for mandatory executive review.
