# RESORT 360 — Product Requirements Document (PRD)

---

## 1. Product Overview

### 1.1 What is Resort 360?
**Resort 360** is an AI-powered operational decision and orchestration layer built specifically for hospitality properties (resorts, hotels, and luxury estates). It aggregates operational context across traditionally siloed departments—Front Desk, Housekeeping, Maintenance, and Revenue Management—and synthesizes competing priorities into clear, explainable, and coordinated action plans for managers.

### 1.2 Who is it for?
Resort 360 is built for hospitality leadership and operational managers:
- General Managers / Resort Directors
- Front Desk & Guest Relations Managers
- Executive Housekeepers & Housekeeping Supervisors
- Chief Engineers & Maintenance Supervisors
- Revenue & Reservation Directors

### 1.3 What Problem Does It Solve?
Hotels and resorts operate in high-friction, real-time environments where multiple unrelated incidents frequently collide:
- A VIP guest arrives hours ahead of schedule.
- An assigned suite suffers an unexpected equipment breakdown (e.g., HVAC failure).
- Housekeeping staff is stretched thin due to peak checkout turnovers.
- An incoming group or high-yield booking restricts room reassignment options.

Currently, resolving such a situation requires 5 to 10 frantic phone calls, radio calls, WhatsApp messages, and manual PMS lookup across separate screens. By the time a decision is made, the guest is waiting in the lobby, rooms are cleaned out of order, and revenue-critical inventory is misallocated.

### 1.4 Core Positioning
> **"Hotels don't have a data shortage. They have a coordination problem."**

Resort 360 **does not replace** the hotel's Property Management System (PMS), work order software, or Computerized Maintenance Management System (CMMS). Instead, it sits directly above existing operational data as an intelligent coordination and decision layer, translating isolated data points into unified operational decisions.

---

## 2. Problem Statement

### 2.1 The Operational Fragmentation Problem
1. **Departmental Silos**: Front Desk lives in the PMS guest folio view; Housekeeping works off room cleaning boards; Maintenance tracks asset repairs in an engineering log; Revenue monitors ADR (Average Daily Rate) and booking constraints in yield software.
2. **Fragmented Information**: No single team member has real-time visibility into the full operational picture.
3. **Simultaneous Incidents**: Routine issues become major crises when they happen at the exact same moment.
4. **Manual & Slow Decision-Making**: Managers make high-stakes trade-offs under stress with incomplete information.
5. **No Unified Decision Layer**: Until now, there was no software layer capable of evaluating competing departmental trade-offs (e.g., "Do we rush Housekeeping with overtime, move the VIP to a higher-category room, or offer an amenity credit?").

---

## 3. Target Users & Stakeholders

| Role | Core Pain Point | How Resort 360 Solves It |
| :--- | :--- | :--- |
| **Resort / Hotel Manager** | Carries ultimate responsibility for guest satisfaction (CSAT) and operational margin, but lacks real-time situational awareness. | Receives a single unified dashboard showing live incidents, multi-department recommendations, and one-click action plans. |
| **Front Desk Manager** | Absorbs guest frustration when rooms are delayed or broken; has to plead with Housekeeping and Engineering for updates. | Real-time visibility into prioritized room readiness, automated guest recovery options, and proactive arrival preparation. |
| **Housekeeping Manager** | Constant priority shifts from Front Desk disrupt balanced room cleaning sequences and stress room attendants. | Clear operational reasoning on why a specific room must be prioritized over others, with realistic ETAs and workload balance. |
| **Maintenance Manager** | Overwhelmed by reactive "urgent" tickets without knowing the real business impact or guest profile tied to each room. | Clear triage showing equipment failure criticality linked to guest arrival times and room allocations. |
| **Revenue Manager** | Front desk upgrades or room changes frequently cannibalize high-paying upcoming bookings or groups without their knowledge. | Revenue AI Agent automatically protects high-yield inventory and evaluates financial trade-offs before rooms are reallocated. |

---

## 4. Product Goal (Hackathon MVP)

The MVP must conclusively prove:
> **Can Resort 360 take a complex, multi-incident resort crisis, ingest the operational context, combine multiple departmental perspectives via specialized AI agents, generate an explainable and coordinated action plan, obtain manager approval, and dispatch actionable tasks in real time?**

---

## 5. Core Product Loop

```
[ INCIDENT OCCURS / DETECTED ]
              │
              ▼
[ RESORT CONTEXT AGGREGATION ]
 (Rooms, Guests, Staff, Reservations, Workload)
              │
              ▼
[ SPECIALIZED AI AGENTS ANALYSIS ]
 ├── Front Desk Agent
 ├── Housekeeping Agent
 ├── Maintenance Agent
 └── Revenue Agent
              │
              ▼
[ MULTI-AGENT CONSENSUS & SYNTHESIS ]
              │
              ▼
[ ONE COORDINATED ACTION PLAN ]
 (Explainable Trade-Offs & Impact Analysis)
              │
              ▼
[ HUMAN-IN-THE-LOOP MANAGER APPROVAL ]
 (Approve / Modify / Reject)
              │
              ▼
[ AUTOMATED TASK GENERATION & DISPATCH ]
 (Assigned to Staff Across Departments)
              │
              ▼
[ REAL-TIME UPDATES VIA WEBSOCKETS ]
 (Live Status Dashboard Updated Instantly)
```

---

## 6. AI Agent Roles & Responsibilities

Each agent acts as a specialized department advocate. **Agents provide recommendations—they never autonomously execute destructive or critical actions.**

```
+-----------------------------------------------------------------------------------+
|                            MULTI-AGENT ARCHITECTURE                               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ FRONT DESK AGENT ]        [ HOUSEKEEPING AGENT ]      [ MAINTENANCE AGENT ]   |
|  - VIP & guest tier analysis - Room readiness status     - Asset failure severity |
|  - Arrival times & requests  - Attendant workload       - Part & tech availability|
|  - Guest experience & CSAT   - Priority cleaning ETAs    - Fix duration & safety  |
|                                                                                   |
|                                [ REVENUE AGENT ]                                  |
|                                - Room category value                              |
|                                - Group booking protection                         |
|                                - Upsell & downgrade cost                          |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
                     +---------------------------------------+
                     |         ORCHESTRATOR / CONSENSUS      |
                     |  - Reconciles trade-offs              |
                     |  - Selects optimal global path        |
                     |  - Builds unified Action Plan         |
                     +---------------------------------------+
```

### 6.1 Front Desk AI Agent
- **Focus**: Guest experience, arrival timing, loyalty status, and service recovery.
- **Responsibilities**:
  - Detects early arrivals and VIP profiles.
  - Formulates guest hospitality strategies (e.g., lounge welcome, complimentary beverage, early baggage storage).
  - Assesses guest tolerance for delays based on loyalty tier and booking notes.

### 6.2 Housekeeping AI Agent
- **Focus**: Turnover feasibility, team physical workload, and cleaning accuracy.
- **Responsibilities**:
  - Calculates true time-to-clean based on current room status (Dirty, In-Progress, Inspected).
  - Evaluates attendant capacity and active floor assignments.
  - Determines if expediting a room is operationally realistic without burning out staff.

### 6.3 Maintenance AI Agent
- **Focus**: Engineering diagnosis, repair feasibility, safety, and equipment triage.
- **Responsibilities**:
  - Evaluates equipment failure reports (e.g., HVAC failure, plumbing leak, lock failure).
  - Estimates minimum repair time (ETA) and tool/technician requirements.
  - Determines whether a room is legally or practically inhabitable during repair.

### 6.4 Revenue AI Agent
- **Focus**: Financial risk mitigation, inventory preservation, and revenue protection.
- **Responsibilities**:
  - Evaluates room rate differentials and category displacement.
  - Flags conflicts with incoming high-value group reservations (e.g., wedding room blocks).
  - Prevents casual upgrades that destroy booked revenue for evening arrivals.

---

## 7. Multi-Agent Consensus & Action Plan Synthesis

When individual agents submit their recommendations, the **Consensus Orchestrator** reconciles conflicts and generates **One Coordinated Action Plan**.

### Plan Structure
Every generated action plan must contain:
1. **Decision Summary**: The clear operational direction (e.g., *"Reassign VIP to Suite 505; Expedite 505 cleaning; Welcome guest in Executive Lounge; Schedule emergency HVAC repair on Room 401"*).
2. **Reasoning & Trade-Offs**: Transparent explanation of why this path was chosen over alternatives (e.g., *"Upgrading to 505 avoids a 90-minute wait for 401 HVAC repair, protects the incoming wedding block in 402-410, and incurs $0 displacement cost"*).
3. **Priority Level**: `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`.
4. **Operational Impact**: Departmental impacts across Front Desk, Housekeeping, Maintenance, and Revenue.
5. **Guest Action**: Immediate front desk instructions (e.g., greeting protocol, key handover, courtesy vouchers).
6. **Executable Tasks**: Array of concrete, assignable work orders for staff with clear priorities and estimated completion times.

---

## 8. Human-in-the-Loop Workflow

Under no circumstance does Resort 360 execute operational changes without supervisory oversight.

```
       [ Generated Action Plan ]
                   │
                   ▼
       [ Manager Review Screen ]
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   [APPROVE]   [MODIFY]    [REJECT]
       │           │           │
       │           ▼           ▼
       │      Edit tasks,    Log reason;
       │      reassign,      return to manual
       │      then approve   handling
       │           │
       └─────┬─────┘
             ▼
    [ TASK DISPATCH ]
(Tasks saved to DB & broadcast via WebSocket)
```

1. **APPROVE**: The manager accepts the consensus plan with a single click. All associated tasks are created, assigned, and broadcasted immediately.
2. **MODIFY**: The manager adjusts room assignments, task priorities, or assigned personnel directly in the UI before confirming execution.
3. **REJECT**: The manager dismisses the AI plan, inputting a brief rejection reason for operational auditing and prompt refinement.

---

## 9. The "Killer Demo" Scenario (Hackathon Benchmark)

To prove Resort 360's value to judges and teammates, the system is calibrated around this specific, high-stress scenario:

### Timeline & Situation:
- **10:40 AM**: Mr. Alexander Vance, a **Diamond VIP Guest**, arrives at the front desk 20 minutes earlier than expected. His assigned suite is **Room 401**.
- **10:41 AM**: Housekeeping reports that the **Air Conditioning system in Room 401 has completely failed** (ambient temperature 82°F / 28°C).
- **Resort Context**:
  - Maintenance assesses Room 401 AC: requires a capacitor replacement; minimum repair time is **75 minutes**.
  - Alternate Suite **Room 505** is vacant but marked `DIRTY` (checkout occurred at 10:15 AM).
  - A **50-guest wedding party** has booked the entire 4th-floor room wing arriving at 2:00 PM; rooms 402–415 cannot be touched.
  - Housekeeping has **2 attendants** currently finishing 3rd-floor rooms.

### The System Workflow:
1. **Incident Trigger**: Front desk logs guest arrival + Room 401 AC failure via UI or quick incident submission.
2. **Context Assembly**: The system pulls room states (401, 505), VIP profile (Vance), maintenance status, and wedding group block.
3. **Agent Recommendations**:
   - *Front Desk Agent*: "VIP cannot wait 75 minutes. Escort to Executive Lounge; deliver signature welcome amenity."
   - *Maintenance Agent*: "Room 401 is uninhabitable. Discontinue occupancy; dispatch Technician Bob with replacement part (ETA 75m)."
   - *Housekeeping Agent*: "Reassign Attendant Maria from Room 302 to Room 505 for a priority 2-person express clean (ETA 25m)."
   - *Revenue Agent*: "Room 505 is unreserved until tomorrow afternoon. Reassignment has $0 revenue cannibalization and avoids displacing the wedding block."
4. **Consensus Action Plan**: The orchestrator produces a unified 4-point plan with reasoning and 3 executable tasks.
5. **Manager Review**: Manager reviews the plan and clicks **APPROVE**.
6. **Real-Time Execution**:
   - Task 1: "Escort Mr. Vance to Lounge & serve welcome drinks" -> Assigned to Front Desk Agent Sarah.
   - Task 2: "Priority express clean on Suite 505" -> Assigned to Maria & Elena (Housekeeping).
   - Task 3: "Replace AC capacitor in Room 401" -> Assigned to Bob (Engineering).
   - Dashboard indicators instantly turn yellow/green via WebSockets.

---

## 10. MVP Scope Matrix

### In Scope (MUST BE BUILT for Hackathon)
- [x] Monorepo structure (Next.js frontend + Express.js backend + shared configs).
- [x] Incident creation and mock resort operational context builder.
- [x] Four specialized AI agent prompts and logic (Front Desk, Housekeeping, Maintenance, Revenue).
- [x] Consensus orchestrator generating structured, explainable action plans.
- [x] Human-in-the-loop review interface (Approve, Modify, Reject).
- [x] Task generation and staff assignment model.
- [x] Real-time communication layer using Socket.IO (broadcasting status updates).
- [x] Live operational dashboard showing room status, active incidents, and tasks.
- [x] Seed data script for the "Killer Demo" scenario.

### Out of Scope (INTENTIONALLY OMITTED)
- Full-scale Property Management System (PMS) functionality.
- Real booking engine, payment gateways, or credit card processing.
- Real Twilio / WhatsApp / SMS telecommunications infrastructure.
- Complex multi-tenant authentication, RBAC hierarchies, or OAuth.
- Custom machine learning model training or fine-tuning (existing OpenAI models are used via structured prompting).
- Unnecessary microservices, Redis queues, or complex infrastructure.

---

## 11. Success Criteria (Demo Evaluation)
1. **Speed to Consensus**: From incident submission to full multi-agent plan generation in **under 10 seconds**.
2. **Explainability**: Every recommendation includes clear, human-readable trade-off reasoning that convinces hotel managers.
3. **Real-Time Sync**: Instant dashboard updates across separate browser tabs via Socket.IO upon manager approval.
5. **Stability & Usability**: End-to-end demo completes smoothly without crashes, console errors, or unhandled promise rejections.

---

## 12. Human-in-the-Loop Decision Control Workflow

The core philosophy of Resort 360 is **"AI Recommends, Manager Understands, Manager Decides, System Tracks."**

### Manager Decision Operations
1. **Approve Action Plan**:
   - Authorized manager endorses the AI proposal.
   - Status updates to `approved`, individual task items are dispatched, and approval timestamp is recorded.
2. **Modify Action Plan**:
   - Manager adjusts operational allocations (room, staff, priority) prior to execution.
   - The original AI proposal is preserved immutably.
   - Manager provides an explicit modification reason.
   - Status transitions to `modified_pending_approval`, requiring final manager authorization.
3. **Reject Action Plan**:
   - Manager rejects the recommendation with a mandatory justification.
   - Status updates to `rejected` and all associated action items are cancelled.
4. **Task Execution & Status Tracking**:
   - Individual task items advance through `pending` → `in_progress` → `completed`.
   - The parent action plan status dynamically reflects task progress.
5. **Decision Audit Trail**:
   - An immutable, append-only log records all AI generations, manager reviews, modifications, and status transitions with timestamps and actor identities.

---

## 13. Phase 5: Real-Time Operational Execution Engine

"Once a manager approves the AI plan, Resort 360 converts the approved recommendations into real operational tasks and dispatches them to the appropriate departments in real time."

### Operational Execution Core Capabilities
1. **Approval to Execution Trigger**:
   - Backend-enforced state machine: only plans in `approved` state trigger task creation.
   - Pending or rejected plans are strictly prevented from generating tasks.
2. **Idempotent Task Generation**:
   - Duplicate calls return existing execution state without creating duplicate tasks or double assignments.
3. **Multi-Department Dispatch**:
   - Approved actions instantiate concrete operational tasks for Housekeeping, Maintenance, and Front Desk.
   - Tasks maintain backward traceability to `action_plan_id`, `action_plan_item_id`, and `analysis_run_id`.
4. **Dynamic Operational State Cascades**:
   - **Staff Workload**: Transitions assigned staff to `busy`; recalculates active workload on task completion (`busy` → `available` only when active workload reaches 0).
   - **Room Readiness**: Shifts room housekeeping status (`dirty` → `in_progress` → `clean`/`ready`).
   - **Incident Lifecycle**: Resolves active incident when all linked work orders complete.
5. **Real-Time Broadcast & Live Execution Console**:
   - Centralized Socket.IO event architecture (`task.dispatched`, `staff.status_changed`, `room.status_changed`, etc.).
   - Manager execution console (`/dashboard/execution/:id`) with live task board and persistent execution timeline that survives page refreshes and socket disconnections.


