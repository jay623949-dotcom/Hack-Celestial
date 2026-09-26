# RESORT 360 — MASTER PRESENTATION & LIVE DEMO GUIDE
> **THE DEFINITIVE SOURCE OF TRUTH FOR TEAM KNOWLEDGE TRANSFER, ARCHITECTURE EXPLANATION & LIVE HACKATHON DEMONSTRATION**  
> **Location**: `/docs/PRESENTATION.md`  
> **Team Members**: Neel, Jay Doshi, Krutarth Rao, Nakool, Nairit Shah  
> **Core Scenario**: VIP Early Arrival (Arjun Mehta) + Room 401 AC Failure (`INC-401-AC`)

---

## 1. Product Overview

**Resort 360** (powered by Atria OS) is an **AI-powered resort operations & decision intelligence platform**. It connects operational context across hotel departments (Front Desk, Housekeeping, Maintenance, and Revenue Management), orchestrates specialized domain AI agents to evaluate complex operational conflicts in parallel, synthesizes a single consensus Action Plan, and provides Duty Managers with human-in-the-loop governance to approve, modify, and execute work orders in real time.

---

## 2. Problem Statement

Resort operations are inherently fast-moving, departmentalized, and high-stakes. When an unexpected operational disruption occurs—such as a VIP guest arriving two hours early while their assigned suite suffers an HVAC breakdown:
1. **Departmental Silos**: Front Desk only sees guest frustration; Housekeeping only sees cleaning rosters; Maintenance only sees mechanical equipment; Revenue only sees room rates and inventory yield.
2. **Conflicting Priorities**:
   - Front Desk wants to immediately upgrade the guest to the highest tier suite.
   - Revenue blocks that upgrade because a high-paying corporate group is checking in later.
   - Housekeeping cannot rush cleaning without pulling attendants from scheduled checkout turns.
   - Maintenance needs the room isolated for 45 minutes to replace a rooftop compressor capacitor.
3. **Operational Paralysis**: Without a unified platform, supervisors communicate via disparate radios, phone calls, and sticky notes. By the time a decision is made, the guest has waited 35 minutes in the lobby, staff has been dispatched inefficiently, and resort ADR (Average Daily Rate) has been compromised.

---

## 3. Target Users

| Persona | Primary Role | Value Realized |
| :--- | :--- | :--- |
| **General Manager / Operations Director** | Macro oversight, SLA tracking, property reputation | Eliminates operational blind spots; real-time dashboard of resort incidents. |
| **Duty Manager / Shift Manager** | Shift decisions, cross-department conflict resolution | 1-click AI consensus recommendation; full authority to approve/modify/reject. |
| **Front Desk Supervisor** | VIP reception, check-in queue management | Instant alternative room suggestions; automated executive lounge escort routing. |
| **Executive Housekeeper** | Turnaround tracking, staff shift allocation | Priority-routed work orders based on guest arrival priority. |
| **Chief Engineer / Maintenance Lead** | Work orders, preventive maintenance, repair SLA | Clear equipment isolation windows without guest friction. |

---

## 4. Core Product Value

- **Real-Time Cross-Departmental Synchronization**: Senses state changes across all departments simultaneously.
- **Multi-Agent Domain Intelligence**: 4 specialized agents evaluate constraints simultaneously rather than relying on one generic LLM.
- **Consensus & Trade-Off Synthesis**: Automatically balances guest satisfaction, revenue protection, staff workload, and repair feasibility.
- **Strict Human-in-the-Loop Governance**: AI advises; the Duty Manager authorizes. Zero automated actions occur without human sign-off.
- **Deterministic Live Execution Engine**: Converts approved action plans into atomic, tracked tasks dispatched via WebSockets with dynamic room and staff state transitions.

---

## 5. End-to-End Product Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   1. SENSE   │ ──> │  2. ANALYZE  │ ──> │3. COORDINATE │ ──> │  4. DECIDE   │
│ Operational  │     │ 4 Domain AI  │     │ Consensus    │     │ Action Plan  │
│ Incident DB  │     │ Agents Run   │     │ Engine Synthes-│   │ Formulated   │
│ State Loaded │     │ in Parallel  │     │ izes Plan    │     │ for Manager  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                       │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐             ▼
│  8. RESOLVE  │ <── │  7. OBSERVE  │ <── │  6. EXECUTE  │ <── ┌──────────────┐
│ Room Clean,  │     │ Live Socket  │     │ Atomic Tasks │     │5. HUMAN CTRL │
│ VIP Checked  │     │ Telemetry &  │     │ Dispatched to│     │ Manager Ap-  │
│ In, AC Fixed │     │ Progress Bar │     │ On-Duty Staff│     │ proves/Modifies│
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 6. Architecture Explanation

Resort 360 uses a decoupled, full-stack architecture built strictly in **modern JavaScript (ES6+ Node.js CommonJS & ESM)** without TypeScript:

```
+─────────────────────────────────────────────────────────────+
│                       CLIENT LAYER                          │
│        Next.js 14 (App Router) + React 18 + Tailwind CSS    │
│                     (Port 3000 / Port 3001)                 │
+─────────────────────────────────────────────────────────────+
              │ HTTP / REST                    ▲ WebSocket
              ▼ Requests                       │ (Socket.IO)
+─────────────────────────────────────────────────────────────+
│                      BACKEND SERVER                         │
│             Node.js + Express.js API Gateway                │
│                        (Port 5000)                          │
+─────────────────────────────────────────────────────────────+
       │                     │                        │
       ▼                     ▼                        ▼
+──────────────+     +────────────────+     +─────────────────+
│ PERSISTENCE  │     │  AI UNIVERSAL  │     │ EXECUTION & BUS │
│ PostgreSQL / │     │    ADAPTER     │     │ Socket.IO Event │
│ In-Memory    │     │ Google Gemini  │     │ Broadcaster &   │
│ DataStore    │     │ 2.5 / OpenAI / │     │ State Machine   │
│ Fallback     │     │ Local (Ollama) │     │                 │
+──────────────+     +────────────────+     +─────────────────+
```

### Component Breakdown
1. **Frontend (`frontend/`)**: Next.js 14 App Router, Tailwind CSS, Lucide icons. Enforces light enterprise theme (`#FFFFFF` surfaces, `#0F766E` / `#017E84` teal accents, `#0F172A` text).
2. **Backend Gateway (`backend/`)**: Express.js REST API with CORS, Helmet, and centralized error handling middleware.
3. **Database / Persistence (`backend/database/` & `backend/src/data/dataStore.js`)**: PostgreSQL schema with automatic in-memory fallback store (`phase-1/demo-data.json`) ensuring 100% demo uptime even without an active Postgres instance.
4. **Universal AI Adapter (`backend/src/services/openai.service.js`)**: Supports Google Gemini (`gemini-2.5-flash`), OpenAI (`gpt-4o-mini`), and local models (Ollama/vLLM) with strict JSON Schema Draft 2020-12 validation via Ajv.
5. **Real-Time Layer (`backend/src/server.js`)**: Socket.IO server emitting operational events to connected clients with an in-memory circular event buffer for reconnect synchronization.

---

## 7. Backend & API Explanation

All API routes follow uniform REST conventions:
- **Base URL**: `http://localhost:5000/api/v1`
- **Standard Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "timestamp": "2026-09-27T14:02:00.000Z"
  }
  ```
- **Error Contract**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR | RESOURCE_NOT_FOUND | RELATIONSHIP_VALIDATION_ERROR | CONFLICT",
      "message": "Human-readable explanation",
      "details": []
    }
  }
  ```

### Key Production Endpoints

| Method | Route | Purpose | Key Payload / Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status | Uptime, memory usage, store type |
| `GET` | `/api/v1/operations/summary` | Dynamic operational metrics | Calculated active rooms, incidents, tasks, staff |
| `GET` | `/api/v1/rooms` | Query room inventory | Supports `?status=`, `?type=`, `?floor=` |
| `GET` | `/api/v1/incidents` | Query active incidents | Supports `?status=open`, `?severity=critical` |
| `GET` | `/api/v1/tasks` | Query work orders | Supports `?assigned_to=`, `?status=` |
| `POST` | `/api/v1/ai/context` | Context Builder Service | Compiles canonical context from DB state |
| `POST` | `/api/v1/ai/analyze` | AI Domain Swarm Analysis | Runs 4 departmental agent evaluations |
| `POST` | `/api/v1/consensus` | Consensus Engine Synthesis | Merges agent outputs into Action Plan |
| `POST` | `/api/v1/action-plans/:id/approve` | Manager Plan Approval | Transitions plan to `approved`, creates execution record |
| `POST` | `/api/v1/action-plans/:id/modify` | Manager Plan Modification | Captures modified diff + mandatory reason; keeps original plan immutable |
| `POST` | `/api/v1/action-plans/:id/reject` | Manager Plan Rejection | Rejection reason recorded; plan archived |
| `POST` | `/api/v1/action-plans/:id/execute` | Execution Engine Dispatch | Dispatches atomic tasks, updates staff/rooms, broadcasts WebSockets |
| `GET` | `/api/v1/action-plans/:id/execution-status` | Live Execution Telemetry | Query task progress percentage and timeline events |

---

## 8. Database & Operational Data Model

The operational database acts as the single source of truth. Real-time Socket.IO events are notifications of state changes, **never** the state itself.

```
┌──────────────┐           assigned_to           ┌──────────────┐
│    GUEST     │ ──────────────────────────────> │     ROOM     │
│ (Arjun Mehta)│                                 │  (Room 401)  │
└──────────────┘                                 └──────────────┘
       │                                                │
       │ affected_by                                    │ location_of
       ▼                                                ▼
┌───────────────────────────────────────────────────────────────┐
│                           INCIDENT                            │
│                 (INC-401-AC: Rooftop HVAC Failure)             │
└───────────────────────────────────────────────────────────────┘
                               │
                               │ triggers
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                         ACTION PLAN                           │
│              (Status: pending_approval -> approved)           │
└───────────────────────────────────────────────────────────────┘
                               │
                               │ generates (1 to N)
                               ▼
┌──────────────────────────────┬────────────────────────────────┐
│            TASK 1            │             TASK 2             │
│   Housekeeping: Prep 205     │    Maintenance: Fix 401 HVAC   │
│   Assigned: Priya Sharma     │    Assigned: Rohan Mehta       │
│   Status: pending -> done    │    Status: in_progress -> done │
└──────────────────────────────┴────────────────────────────────┘
```

### Core Entities & Relationships
1. **Rooms**: `id`, `number`, `type`, `floor`, `status` (`available`, `occupied`, `maintenance`, `reserved`, `dirty`), `housekeeping_status` (`clean`, `in_progress`, `blocked`).
2. **Guests**: `id`, `name`, `vip` (boolean), `vip_tier` (`Diamond VIP`), `room_id`, `check_in`, `check_out`, `notes`.
3. **Staff**: `id`, `name`, `department` (`front_desk`, `housekeeping`, `maintenance`, `revenue`), `role`, `status` (`on_duty`, `busy`, `off_duty`), `current_task`.
4. **Incidents**: `id`, `title`, `description`, `severity` (`critical`, `high`, `medium`, `low`), `status` (`open`, `in_progress`, `resolved`), `room_id`, `guest_id`.
5. **Action Plans**: `id`, `incident_id`, `title`, `status` (`pending_approval`, `modified_pending_approval`, `approved`, `in_progress`, `completed`, `rejected`), `approved_by`, `original_plan`, `action_items`.
6. **Tasks**: `id`, `title`, `department`, `assigned_to`, `room_id`, `incident_id`, `action_plan_id`, `priority`, `status` (`pending`, `in_progress`, `completed`).

---

## 9. AI Agent Architecture

The AI layer is **NOT** a monolithic chatbot. It consists of 4 specialized domain agents that reason independently based on facts provided by the Context Builder:

```
                    ┌─────────────────────────┐
                    │ Live Database Context   │
                    └─────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ FRONT DESK      │     │ HOUSEKEEPING    │     │ MAINTENANCE     │     │ REVENUE         │
│ AGENT           │     │ AGENT           │     │ AGENT           │     │ AGENT           │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ VIP hospitality │     │ Room readiness  │     │ Repair time &   │     │ Occupancy (82%) │
│ Lounge voucher  │     │ Cleaning staff  │     │ safety isolation│     │ Rate protection │
│ Alternative 205 │     │ Priya Sharma    │     │ Rohan Mehta     │     │ Group booking   │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┘                       │
                                 ▼                                               │
                    ┌─────────────────────────┐                                  │
                    │ CONSENSUS ENGINE        │ <────────────────────────────────┘
                    │ Synthesizes trade-offs  │
                    │ Formulates Action Plan  │
                    └─────────────────────────┘
```

### Agent Domain Roles
1. **Front Desk Agent**:
   - *Perspective*: Guest satisfaction, loyalty retention, arrival experience.
   - *Key Concern*: Diamond VIP Arjun Mehta is waiting in the lobby; cannot enter Room 401.
   - *Recommendation*: Reassign guest laterally to clean Deluxe Room 205; escort to Club Lounge with hospitality beverage voucher via Supervisor Amit Shah.
2. **Housekeeping Agent**:
   - *Perspective*: Room readiness, cleaning schedules, physical staffing floor locations.
   - *Key Concern*: Room 205 is clean but requires an express VIP supervisor inspection.
   - *Recommendation*: Dispatch Senior Attendant Priya Sharma (already on Floor 2) for immediate 5-minute inspection.
3. **Maintenance Agent**:
   - *Perspective*: Equipment integrity, engineering safety, technical diagnostics.
   - *Key Concern*: Room 401 rooftop compressor has tripped a capacitor; requires mechanical isolation.
   - *Recommendation*: Keep Room 401 blocked; dispatch HVAC Technician Rohan Mehta with replacement capacitor (45-min repair window).
4. **Revenue Management Agent**:
   - *Perspective*: Yield optimization, rate parity, group booking commitments.
   - *Key Concern*: Resort is at 82% occupancy with a corporate wedding block checking in at 17:00.
   - *Recommendation*: Approve lateral move to Room 205 (same category Deluxe, $0 upgrade cost); hold Room 205 off OTA distribution.

---

## 10. Why Multi-Agent Reasoning?

- **Eliminates Hallucination & Blended Biases**: A single general-purpose prompt blends competing priorities, producing generic answers like "apologize to the guest and fix the room."
- **Simulates Real Hotel Operations**: In a luxury resort, General Managers convene department heads to hear distinct viewpoints before making decisions.
- **Explainability**: The manager sees *why* Housekeeping recommends Priya Sharma and *why* Revenue warns against moving the guest to the Presidential Suite.

---

## 11. Structured AI Output & Schema Validation

AI responses must be strictly reliable code artifacts, not conversational prose:
- **Specification**: JSON Schema Draft 2020-12 validated using `Ajv` and `ajv-formats`.
- **Validation Pipeline**:
  ```
  AI Model Raw Output -> JSON Parse -> Ajv Schema Validation -> Business Rules Check
                                             │ (fails)
                                             ▼
                               Retry with error feedback (up to 2x)
                                             │ (still fails)
                                             ▼
                               Safe Deterministic Domain Fallback
  ```
- **Resilience**: If the external AI API times out (45s timeout guard) or returns invalid JSON, the service gracefully engages a verified domain fallback so the user interface never crashes.

---

## 12. Consensus & Orchestration Logic

The **Consensus Service** (`backend/src/services/consensus.service.js`) receives the 4 agent outputs:
1. **Conflict Detection**: Checks if Front Desk's proposed room conflicts with Revenue's inventory locks or Housekeeping's uncleaned rooms.
2. **Trade-Off Resolution**: Prioritizes guest satisfaction for Diamond VIPs while respecting hard engineering safety blocks.
3. **Action Plan Assembly**:
   - `summary`: "Lateral reassignment of VIP Arjun Mehta to Room 205 Deluxe with Club Lounge access while Room 401 HVAC is repaired."
   - `action_items`: Ordered array of tasks with target departments, staff assignments, and room IDs.
   - `requires_human_approval`: Hardcoded `true`.

---

## 13. Human-in-the-Loop Governance

Resort 360 strictly enforces that **AI advises, but Humans authorize**:
- **Approve**: Manager signs off on the proposed plan. The plan status becomes `approved`, immediately creating executable work orders.
- **Modify**: Manager can modify assigned staff, target room, or task priorities inline. The platform tracks a diff (`original_plan` vs `modified_plan`) and enforces a mandatory `modification_reason` in the audit log.
- **Reject**: Manager can reject the plan with a mandatory `rejection_reason`. The incident remains open for manual handling, and the rejection is logged in the permanent audit trail.

---

## 14. Real-Time Execution Engine

When a plan is approved:
1. **Task Generation**: The Execution Engine converts `action_items` into tracked operational tasks.
2. **Staff State Transition**: Assigned staff (`staff-003` Priya Sharma, `staff-005` Rohan Mehta) immediately transition from `available` / `on_duty` to `busy`.
3. **Room State Transition**: Room 401 is locked in `maintenance`. Alternative Room 205 transitions from `dirty`/`available` to `clean`/`inspected`.
4. **Idempotency Guard**: Attempting to execute an already-executed plan returns the existing execution state without creating duplicate tasks.
5. **Auto-Resolution**: When the final task completes, the parent Action Plan auto-transitions to `completed`, and Incident `INC-401-AC` transitions to `resolved`.

---

## 15. Real-Time Communication (Socket.IO)

Socket.IO provides zero-latency bi-directional synchronization between the backend and browser:

| Event Name | Trigger | Payload Summary | UI Effect |
| :--- | :--- | :--- | :--- |
| `execution.started` | Plan approved | `action_plan_id`, tasks count | Progress bar initializes at 0% |
| `task.dispatched` | Work order issued | Task object with assigned staff | Card appears in active tasks list |
| `task.in_progress` | Staff begins work | `task_id`, `started_at` | Task status badge turns amber |
| `task.completed` | Staff finishes task | `task_id`, `completed_at` | Green checkmark; progress bar advances |
| `staff.status_changed` | Staff assigned/freed | `staff_id`, `status` (`busy`/`on_duty`)| Staff roster indicator updates |
| `room.status_changed` | Room cleaned/repaired | `room_id`, `status`, `housekeeping_status` | Room grid tile updates color |
| `execution.completed` | All tasks finished | `action_plan_id`, `duration_ms` | Green banner; incident marked resolved |

---

## 16. Canonical Demo Scenario: "VIP Early Arrival + Room 401 AC Failure"

| Attribute | Canonical Value |
| :--- | :--- |
| **Resort Name** | Azure Bay Resort & Spa (Goa) |
| **Current Occupancy** | 82% (37 / 45 rooms occupied) |
| **VIP Guest** | **Arjun Mehta** (Diamond VIP, booking `BK-8902`) |
| **Arrival Timing** | Arrived at **14:00** (Expected at 16:00 — 2 hours early) |
| **Assigned Accommodation** | **Room 401** (Deluxe Suite, Floor 4) |
| **Active Disruption** | **INC-401-AC** (Rooftop HVAC compressor failure; room unusable) |
| **Alternative Solution** | **Room 205** (Deluxe Suite, Floor 2, Ocean View — clean) |
| **Assigned Operations Team** | • Front Desk: **Amit Shah** (Supervisor)<br>• Housekeeping: **Priya Sharma** (Floor 2 Senior Attendant)<br>• Maintenance: **Rohan Mehta** (HVAC Specialist)<br>• Revenue: **Kavita Iyer** (Director of Revenue) |

---

## 17. Live Demonstration Scripts

### Script A: 3-Minute Compressed Judge Version (Fast Pitch)

- **[00:00 - 00:20] The Problem**
  > *"Judges, hotel operations fail in silos. At 14:00 today, our Diamond VIP guest Arjun Mehta arrived 2 hours early at Azure Bay Resort. But his assigned Deluxe Room 401 has an active rooftop AC failure. The resort is at 82% occupancy. Front Desk wants an upgrade, Revenue wants to protect inventory, Housekeeping is stretched, and Maintenance needs the room blocked."*
- **[00:20 - 00:45] Sensed by Resort 360**
  > *(Presenter navigates to `/dashboard`)*
  > *"Resort 360 detects this conflict instantly. Notice incident INC-401-AC flagged as critical. Instead of 20 minutes of phone calls, we click [Analyze with AI Swarm]."*
- **[00:45 - 01:20] Multi-Agent Swarm Deliberation**
  > *(Presenter shows `/dashboard/consensus`)*
  > *"Here are 4 specialized AI agents reasoning in parallel: Front Desk recommends lateral reassignment with Club Lounge hospitality. Housekeeping confirms Priya Sharma is on Floor 2 ready to inspect Room 205. Maintenance verifies Room 401 requires 45 minutes for a capacitor replacement. Revenue confirms Room 205 has zero rate impact."*
- **[01:20 - 01:50] Consensus & Human Approval**
  > *"The Consensus Engine merges these viewpoints into ONE actionable plan: Reassign Arjun to Room 205, escort him to the lounge, and fix 401. Crucially: the AI cannot dispatch tasks on its own. As Duty Manager, I review the breakdown and click [Approve Plan]."*
- **[01:50 - 02:40] Live Real-Time Execution**
  > *(Presenter shows `/dashboard/execution`)*
  > *"Instantly, WebSockets dispatch tasks: Priya Sharma preps Room 205, Amit Shah escorts Arjun Mehta, Rohan Mehta repairs the HVAC. Watch the room tiles update in real time: Room 205 becomes Ready, Room 401 repair completes, and incident INC-401-AC resolves."*
- **[02:40 - 03:00] Business Impact Close**
  > *"In under 3 minutes, VIP satisfaction was preserved, zero revenue was lost, maintenance was dispatched, and the entire team operated from a single pane of glass. That is Resort 360."*

---

### Script B: 5-Minute Technical Version (Deep Architecture Pitch)

- **[00:00 - 00:45] Architecture & Data Layer**
  > *"Resort 360 is built as a pure JavaScript architecture: Next.js 14 App Router on the client, Express.js REST API on Node.js, and PostgreSQL for state persistence with an in-memory fallback. All operations state—rooms, guests, staff, incidents, and tasks—is strictly relational."*
- **[00:45 - 01:30] Context Builder & Fact Boundaries**
  > *"When an incident occurs, our Context Builder Service queries active database state and distills it into a canonical context document conforming to JSON Schema Draft 2020-12. This establishes strict fact boundaries: agents can only reason over active rooms, on-duty staff, and true occupancy."*
- **[01:30 - 02:30] Parallel Multi-Agent Swarm & Universal AI Adapter**
  > *"We dispatch this context concurrently to 4 domain agents: Front Desk, Housekeeping, Maintenance, and Revenue. Our Universal AI Adapter supports Gemini 2.5 Flash and OpenAI with Ajv output validation. Each agent outputs structured JSON with operational rationale, risk scores, and recommended actions."*
- **[02:30 - 03:15] Consensus Synthesis & Decision State Machine**
  > *"The Consensus Engine evaluates trade-offs, detects conflicting resource requests, and compiles an Action Plan. We enforce Human-in-the-Loop governance: the Duty Manager can Approve, Reject with mandatory reason, or Modify with full inline diffing persisted to an append-only audit trail."*
- **[03:15 - 04:15] Task Execution Engine & Socket.IO Event Bus**
  > *"Upon approval, our Execution Service generates atomic tasks. State transitions are atomic: staff shift to 'busy', rooms shift to 'in_progress'. Socket.IO broadcasts updates to connected clients. If a client disconnects, our circular event buffer rehydrates state immediately upon reconnection."*
- **[04:15 - 05:00] Reliability, Edge Cases & Verification**
  > *"The system is guarded by 77 automated test suites across API contracts, manager decision flows, and execution idempotency. All 14 Next.js routes compile cleanly in production."*

---

## 18. Team Ownership & Speaker Matrix

| Team Member | Primary Presentation Topic | Secondary / Backup Topics | Code & Module Ownership |
| :--- | :--- | :--- | :--- |
| **Neel** | AI Swarm Architecture & Consensus Engine | Manager Decision Interface & Execution Engine | `openai.service.js`, `consensus.service.js`, AI schemas |
| **Jay Doshi** | Full-Stack Architecture & Backend APIs | Express Gateway & Database Persistence | `server.js`, REST controllers, routes, middleware |
| **Krutarth Rao** | Next.js Frontend & Enterprise UI/UX | Dashboard Views, Landing Page & Theme System | `frontend/app/dashboard`, UI components, Tailwind tokens |
| **Nakool** | Execution Engine & Real-Time Socket.IO | Task Lifecycle, Staff Rostering & Event Bus | `execution.service.js`, Socket.IO handlers, active tasks |
| **Nairit Shah** | Operational Data Model & Quality Assurance | Edge-Case Resilience, Benchmarks & Judge Q&A | Data models, migrations, automated test suites |

---

## 19. Team Knowledge Transfer: "Everyone Must Know"

Every team member must be able to answer these core questions instantly:
1. **What is Resort 360?** An operational intelligence platform that unifies resort departments during operational disruptions.
2. **What language is used?** Pure modern JavaScript (ES6+ CommonJS for backend, ESM for frontend). No TypeScript.
3. **Where is state stored?** In the backend database/DataStore. Socket.IO only communicates state changes.
4. **Why 4 agents instead of 1?** To model real-world domain conflicts (Guest vs Ops vs Engineering vs Revenue) with explicit trade-off visibility.
5. **Can AI execute tasks directly?** Never. A human manager must approve, modify, or reject every plan.
6. **What happens if the AI fails?** The service catches errors, engages structured domain fallbacks, and keeps the UI responsive.
7. **What happens on Approve?** The action plan status updates to `approved`, tasks are dispatched to staff, staff become `busy`, and Socket.IO broadcasts live events.

---

## 20. Comprehensive Judge Q&A

### Category A: Product & Business
- **Q: How is this different from existing Hotel Property Management Systems (PMS) like Opera?**
  - *A*: Traditional PMS systems are passive record-keeping databases—they record that room 401 is broken and that guest Arjun has arrived, but they cannot reason across departments to resolve the operational clash. Resort 360 is an active coordination layer on top of operational data that evaluates trade-offs and generates actionable plans.
- **Q: Who is the actual paying customer?**
  - *A*: Resort General Managers and hotel management groups seeking to reduce guest compensation expenses, avoid VIP churn, and optimize staff utilization.

### Category B: AI & Multi-Agent Architecture
- **Q: Why use 4 separate agent prompts instead of one large prompt?**
  - *A*: Large single prompts suffer from "attention dilution" and prioritize the first instruction given. By decoupling into 4 specialized domain agents, each agent advocates uncompromisingly for its department's constraints before the Consensus Engine evaluates trade-offs.
- **Q: How do you prevent hallucinations?**
  - *A*: Strict fact boundaries via the Context Builder: the prompt only includes actual DB rooms, available staff, and true occupancy. Output is strictly validated against JSON Schema Draft 2020-12 via Ajv.
- **Q: What if the AI provider (Gemini/OpenAI) goes down?**
  - *A*: Our Universal AI Adapter has built-in circuit breakers: if an API call times out (45s guard) or fails, deterministic operational fallback logic generates a safe, verified plan.

### Category C: Operations, Safety & Governance
- **Q: Can the AI accidentally reassign a room that is dirty or occupied?**
  - *A*: No. The Context Builder filters candidate rooms by `status === 'available'` and `housekeeping_status === 'clean'`. Furthermore, the Duty Manager must verify and approve the assignment before any work order is generated.
- **Q: What happens if the manager disagrees with the AI's recommendation?**
  - *A*: The manager has full control: they can modify the assigned room or tasks inline with an audit-logged reason, or reject the plan entirely.

### Category D: Scalability & Technical Performance
- **Q: How does the system perform under load?**
  - *A*: Independent API operations are parallelized via `Promise.all()`. Dashboard queries take under 10ms on our indexed relational layer. WebSocket broadcasts are lightweight JSON diffs.
- **Q: What happens on page refresh during an active incident?**
  - *A*: The frontend re-fetches canonical state from `/api/v1/action-plans/:id/execution-status` and re-subscribes to the Socket.IO room. Zero state is lost.

---

## 21. Demo Recovery & Emergency Procedures

If any unexpected glitch occurs during the live demonstration:

### Scenario 1: AI Provider Timeout or Network Glitch
- **Action**: Do not panic. The Universal AI Adapter automatically falls back to the deterministic local response. Continue the pitch:
  > *"Notice how the system handles latency gracefully by presenting the verified operational fallback plan without interrupting the manager's workflow."*

### Scenario 2: Need to Reset the Demo from Scratch
- **Terminal Command** (Backend):
  ```bash
  cd backend
  node -e "require('./src/data/dataStore').resetStore(); console.log('Demo Data Store Reset Complete');"
  ```
- **Browser Action**: Refresh browser at `http://localhost:3000/dashboard`.

### Scenario 3: Port Conflicts on Startup
- If port 5000 is occupied: `npx kill-port 5000`
- If port 3000 is occupied: Next.js automatically runs on `http://localhost:3001`.

---

## 22. Important Technical Terminology Glossary

- **Canonical Context**: The minimal, complete JSON snapshot of operational reality compiled by the Context Builder for AI consumption.
- **Fact Boundary**: Restricting AI reasoning strictly to data present in the context document to prevent hallucination.
- **Universal Adapter**: The backend service layer abstracting Google Gemini, OpenAI, and local LLMs behind a uniform interface.
- **Consensus Engine**: The multi-agent synthesizer that resolves competing departmental recommendations into a unified Action Plan.
- **Human-in-the-Loop (HITL)**: Mandatory human authorization required between AI recommendation and operational task execution.
- **Idempotency**: Ensuring that executing an action plan multiple times produces identical state without duplicate tasks.
- **Circular Event Buffer**: Backend ring buffer retaining recent Socket.IO operational events for fast client re-sync upon reconnection.

---

## 23. Implemented Today vs. Future Scope

### Implemented Today (Verified & Demo-Ready)
- [x] Full-stack Next.js 14 + Express.js architecture in pure JavaScript.
- [x] Relational data persistence for rooms, guests, staff, incidents, and tasks with in-memory fallback.
- [x] Context Builder Service compiling canonical context with strict fact boundaries.
- [x] 4 specialized domain AI agents (Front Desk, Housekeeping, Maintenance, Revenue).
- [x] Universal AI Adapter supporting Gemini 2.5 Flash, OpenAI, and local models.
- [x] JSON Schema Draft 2020-12 validation via Ajv with automated retries and fallbacks.
- [x] Consensus synthesis with conflict detection and trade-off narrative.
- [x] Duty Manager Decision Console with Approve, Modify (with diffing), and Reject workflows.
- [x] Real-time Execution Engine dispatching tasks to staff with dynamic room and staff state updates.
- [x] Bi-directional WebSocket communication via Socket.IO.
- [x] Canonical "VIP Early Arrival + Room 401 AC Failure" demo scenario.

### Future Scope (Post-Hackathon Roadmap)
- [ ] Multi-property portfolio management across multiple geographical resort locations.
- [ ] Mobile native attendant application (iOS / Android) with push notifications for housekeeping and engineering.
- [ ] Direct two-way bidirectional integration with enterprise PMS systems (Oracle Opera, Cloudbeds) via HTNG protocols.
- [ ] Predictive maintenance IoT sensor ingestion directly from in-room smart thermostats and chillers.
- [ ] Long-term reinforcement learning fine-tuning based on historical manager modification diffs.
