# RESORT 360 — Live Hackathon Demo Guide

## The Killer Demo: "VIP Early Arrival — Room 401 AC Failure"

> **One Incident. Four Departments. One Coordinated Decision.**

---

### 1. The Operational Story

- **Hotel**: Resort 360 Demo Resort (Azure Bay, Goa)
- **Guest**: **Arjun Mehta** (VIP Loyalty Guest)
- **Reservation**: `RES-VIP-401`
- **Expected Arrival**: 16:00
- **Actual Arrival**: 14:00 (Arrived 2 hours early)
- **Assigned Room**: **Room 401 (Deluxe)**
- **The Breakdown**: Room 401 has an active rooftop air-conditioning compressor breakdown (`INC-401-AC`). Room status is **Maintenance Required** and cannot be handed over.
- **Resort Status**: High occupancy (**82%**). Alternative Deluxe inventory is strictly limited.
- **The Operational Challenge**: 
  - Front Desk faces severe VIP dissatisfaction.
  - Housekeeping needs to turn around whichever room is assigned.
  - Maintenance needs to inspect and repair Room 401.
  - Revenue needs to protect remaining Deluxe inventory.

---

### 2. Fixed Deterministic Demo Data

| Entity | Details | Initial State |
| :--- | :--- | :--- |
| **Guest** | Arjun Mehta (`guest-001`), VIP Tier, 2-night stay, 2 guests | Waiting in Lobby at 14:00 |
| **Room 401** | Deluxe, 4th Floor | `maintenance` (AC Failure) |
| **Alternative Room 205** | Deluxe, 2nd Floor, Ocean View | `available` / `clean` |
| **Maintenance Tech** | Rohan Mehta (`staff-005`), HVAC Specialist | `available` (Standby) |
| **Housekeeping Attendant** | Priya Sharma (`staff-003`), Senior Attendant | `available` (Floor 2) |
| **Front Desk Host** | Amit Shah (`staff-001`), Supervisor | `on_duty` (Lobby Reception) |
| **Incident** | `INC-401-AC` ("Room 401 AC Failure") | `open` (Critical Priority) |
| **Hotel Occupancy** | 37 / 45 Rooms Occupied | **82% Occupancy** |

---

### 3. Demo Roles & Credentials

- **Primary Presenter Role**: `Resort Admin` / `Duty Manager` (Selectable from role dropdown or default)
- **URL**: `http://localhost:3000/dashboard`
- **Staff Views**:
  - Front Desk: `/dashboard/frontdesk`
  - Housekeeping: `/dashboard/housekeeping`
  - Maintenance: `/dashboard/maintenance`
  - Revenue: `/dashboard/revenue-mgr`

---

### 4. 5–7 Minute Judge Presentation Script

#### **00:00 — 00:30 | The Operational Problem**
1. Open `http://localhost:3000/dashboard`.
2. Point to the top operational card:
   > *"Judges, welcome to Resort 360. In hotel operations, problems don't happen in silos. Today at 14:00, our VIP guest Arjun Mehta arrived 2 hours early. But his assigned Deluxe Room 401 just suffered a rooftop AC failure. The property is running at 82% occupancy."*
3. Click **[Review Incident]**.

#### **00:30 — 01:15 | Multi-Department Coordination**
1. Show the Incident Modal:
   > *"Look at the cross-departmental impact: Front Desk has a VIP waiting in the lobby. Housekeeping needs to prep a room immediately. Maintenance technician Rohan Mehta needs to repair the compressor. And Revenue is guarding limited inventory."*
2. Click **[Analyze with AI Swarm →]**.

#### **01:15 — 02:30 | The AI Deliberation & Consensus**
1. Lands on `/dashboard/consensus`.
2. Show the **Departmental Perspectives**:
   - Front Desk advises lounge hospitality & lateral reassignment to Room 205.
   - Housekeeping confirms Priya Sharma is on Floor 2 ready to inspect Room 205.
   - Maintenance advises keeping Room 401 blocked during repair.
   - Revenue flags 82% occupancy and recommends holding Room 205 from OTA channels.
3. Show the **Coordinated Action Plan**:
   > *"Instead of departments fighting or guest waiting, the AI synthesizes ONE coordinated plan: Keep 401 blocked, prep 205, dispatch Priya, escort Arjun to the lounge via Amit, and send Rohan to repair the AC."*

#### **02:30 — 03:15 | Human-in-the-Loop Approval**
1. Highlight the Manager Governance Console:
   > *"The AI recommends, but the Human Manager stays in full control. The AI can NEVER autonomously dispatch tasks."*
2. Click **[Approve Action Plan]**.
3. Manager decision is signed off and logged in the immutable PostgreSQL audit trail.

#### **03:15 — 04:30 | Real-Time Execution Engine**
1. Automatically navigates to `/dashboard/execution/plan-vip-arrival`.
2. Notice the live Socket.IO connection badge.
3. Show the live task board:
   - Task 1: Housekeeping — Prepare Room 205 (Priya Sharma)
   - Task 2: Front Desk — Escort Arjun Mehta to Club Lounge (Amit Shah)
   - Task 3: Maintenance — Inspect Room 401 AC Compressor (Rohan Mehta)
   - Task 4: Revenue — Protect Deluxe Inventory
4. Progress each task (or click status toggle):
   - Watch Room 205 transition: `cleaning` → `ready`.
   - Watch Room 401 transition: `repair completed`.
   - Watch staff return to `available`.
   - Watch progress bar advance from `0%` to `100%`.
   - Watch Incident `INC-401-AC` transition to `RESOLVED`.

#### **04:30 — 05:00 | Conclusion & Impact**
1. Show the completed execution timeline.
   > *"In under 5 minutes, cross-departmental conflict was avoided, our VIP was accommodated with zero churn, technicians were dispatched, and the resort state synchronized in real-time."*

---

### 5. Rehearsal & Deterministic Reset

To reset the scenario before each presentation run:
- **In UI**: Click the **[Reset Demo Scenario]** button in the dashboard header.
- **In Terminal**: Run `npm run seed:demo` from the `backend/` directory.

---

### 6. Troubleshooting
- If backend isn't responding: Verify `http://localhost:5000/api/v1/health` returns `{"status":"ok"}`.
- If Socket.IO shows disconnected: Ensure both frontend (3000) and backend (5000) are running.
