# RESORT 360 — Technical Architecture

> **CRITICAL LANGUAGE DIRECTIVE**:  
> This project uses **pure JavaScript (ES6+ / Node.js CommonJS & ESM)**.  
> **NO TYPESCRIPT IS ALLOWED**. No `.ts`, no `.tsx`, no interfaces, no types. All code examples below use standard JavaScript and JSON.

---

## 1. Architecture Overview

Resort 360 uses a lightweight, decoupled monorepo architecture consisting of a **Next.js (React + Tailwind CSS)** frontend, an **Express.js (Node.js)** backend API, a **PostgreSQL / Supabase** database, an **OpenAI API Multi-Agent Orchestration Layer**, and a **Socket.IO** real-time event pipeline.

```
+─────────────────────────────────────────────────────────────+
│                       CLIENT LAYER                          │
│             Next.js 14 (App Router) + Tailwind CSS          │
│                      (Running on :3000)                     │
+──────────────────────────────┬──────────────────────────────+
                               │
               HTTP / REST API │ ▲  WebSocket (Socket.IO)
                               ▼ │
+─────────────────────────────────────────────────────────────+
│                      BACKEND SERVER                         │
│             Node.js + Express.js API Gateway                │
│                      (Running on :5000)                     │
+──────────────┬───────────────────────────────┬──────────────+
               │                               │
               ▼                               ▼
+──────────────────────────────+ +─────────────────────────────+
│      DATA PERSISTENCE        │ │      AI ORCHESTRATION       │
│     Supabase / PostgreSQL    │ │     OpenAI API (GPT-4o)     │
│   - rooms, guests, staff     │ │  - Front Desk Agent         │
│   - incidents, action_plans  │ │  - Housekeeping Agent       │
│   - tasks                    │ │  - Maintenance Agent        │
│                              │ │  - Revenue Agent            │
│                              │ │  - Consensus Engine         │
+──────────────────────────────+ +─────────────────────────────+
```

---

## 2. System Layers & Technologies

| Layer | Technology | Primary Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React 18, Tailwind CSS | Dashboard UI, incident creation modal, multi-agent reasoning visualizer, manager approval interface, live task board. |
| **Backend** | Node.js, Express.js | REST routing, input validation, context assembly, multi-agent dispatch, task generation, WebSocket server. |
| **Database** | PostgreSQL / Supabase | Relational persistence for rooms, guests, staff, active incidents, generated action plans, and tasks. |
| **AI Layer** | OpenAI API (`gpt-4o` or `gpt-4o-mini`) | 4 specialized agent prompts + 1 consensus orchestrator prompt producing strict structured JSON. |
| **Real-Time** | Socket.IO (Server & Client) | Instant bi-directional event broadcast when incidents are created, plans approved, and tasks updated. |

---

## 3. Repository Structure

```
resort360/
├── frontend/                     # Next.js App Router Client (JavaScript)
│   ├── app/
│   │   ├── globals.css           # Tailwind base & utilities
│   │   ├── layout.js             # Root HTML layout & providers
│   │   └── page.js               # Main Operations Dashboard
│   ├── components/
│   │   ├── IncidentModal.jsx     # Incident submission trigger
│   │   ├── AgentAnalysisCard.jsx # Displays individual agent views
│   │   ├── ConsensusPlan.jsx     # Action plan approval/modify/reject
│   │   ├── RoomStatusGrid.jsx    # Live room visualizer
│   │   └── TaskBoard.jsx         # Live real-time task cards
│   ├── lib/
│   │   ├── api.js                # Fetch wrapper for backend REST APIs
│   │   └── socket.js             # Socket.IO client singleton
│   ├── public/                   # Static assets & icons
│   ├── jsconfig.json             # Path alias resolution (@/*)
│   ├── tailwind.config.js        # Tailwind styling rules
│   ├── postcss.config.js         # PostCSS processor config
│   ├── next.config.js            # Next.js runtime config
│   └── package.json              # Frontend dependencies
│
├── backend/                      # Express.js REST API Server (JavaScript)
│   ├── src/
│   │   ├── config/               # Centralized configurations & env loading
│   │   │   ├── db.js             # Supabase / Postgres client
│   │   │   ├── openai.js         # OpenAI client configuration
│   │   │   └── index.js          # Port, CORS, env variables
│   │   ├── controllers/          # HTTP request handlers
│   │   │   ├── incidentController.js
│   │   │   ├── actionPlanController.js
│   │   │   ├── taskController.js
│   │   │   ├── roomController.js
│   │   │   └── healthController.js
│   │   ├── routes/               # Express route declarations
│   │   │   ├── incidentRoutes.js
│   │   │   ├── actionPlanRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── roomRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── services/             # Core business & AI logic
│   │   │   ├── contextService.js # Compiles live operational context
│   │   │   ├── agentService.js   # Dispatches prompt runs to OpenAI
│   │   │   ├── consensusService.js # Synthesizes agent plans
│   │   │   ├── taskService.js    # Converts approved plan into tasks
│   │   │   └── socketService.js  # Real-time WebSocket emitter
│   │   ├── middleware/           # Validation and error handling
│   │   │   └── errorHandler.js   # Standard JSON error & 404 handler
│   │   └── server.js             # Express app & HTTP/Socket.IO setup
│   └── package.json              # Backend dependencies
│
├── docs/                         # Documentation
│   └── architecture.md           # Supplemental architectural notes
│
├── PRD.md                        # Product Requirements Document
├── ARCHITECTURE.md               # Technical Architecture Document (This file)
├── RULES.md                      # Team Development & Coding Standards
├── README.md                     # Monorepo setup and onboarding guide
├── .env.example                  # Environment variable blueprint
└── package.json                  # Root orchestration (concurrently dev runner)
```

---

## 4. Backend Modular Responsibilities

1. **`routes/`**: Pure route mappings with URL parameters and HTTP methods. Delegates all execution directly to controllers.
2. **`controllers/`**: Extracts parameters (`req.params`, `req.body`), invokes appropriate service methods, and formats standardized HTTP responses.
3. **`services/`**: Houses all business logic, database queries, OpenAI prompt assembly, consensus calculation, and event emissions.
4. **`middleware/`**: Handles authentication stubs, payload validation, and centralized error logging/formatting.
5. **`config/`**: Reads and validates environment variables from `process.env` once during application bootstrap.

---

## 5. API Architecture & Endpoint Specification

### 5.1 System & Reference Data
- `GET /health` — Verifies backend availability and timestamp.
- `GET /api/rooms` — Retrieves list of all rooms with current statuses (`clean`, `dirty`, `repair`, `occupied`).
- `GET /api/guests` — Retrieves active/incoming guests, arrival times, and VIP tiers.
- `GET /api/staff` — Retrieves list of staff members with department, status (`available`, `busy`), and current load.

### 5.2 Incidents & Multi-Agent Pipeline
- `POST /api/incidents`  
  **Request Body**:
  ```json
  {
    "type": "AC_FAILURE_EARLY_VIP",
    "description": "VIP guest Alexander Vance arrived 20m early. Suite 401 AC failed.",
    "roomId": "401",
    "guestId": "guest-vance",
    "priority": "HIGH"
  }
  ```
  **Response (201 Created)**: Returns saved incident record with ID and timestamp.

- `POST /api/incidents/:id/analyze`  
  Runs the **Context Builder** and invokes all 4 specialized departmental AI agents concurrently (`Promise.all`).  
  **Response (200 OK)**:
  ```json
  {
    "incidentId": "inc-101",
    "agentRecommendations": {
      "frontDesk": {
        "perspective": "Guest is Diamond VIP. Cannot wait in lobby during maintenance.",
        "action": "Escort to Executive Lounge, provide welcome refreshments.",
        "urgency": "HIGH"
      },
      "housekeeping": {
        "perspective": "Suite 505 checkout completed at 10:15. Two staff available on floor 3.",
        "action": "Reassign 2 attendants to express-clean 505 in 25 minutes.",
        "urgency": "HIGH"
      },
      "maintenance": {
        "perspective": "Suite 401 HVAC requires capacitor replacement. Estimated 75 min repair.",
        "action": "De-assign room from inventory; dispatch Technician Bob immediately.",
        "urgency": "HIGH"
      },
      "revenue": {
        "perspective": "Suite 505 unreserved until tomorrow. Room 402-415 reserved for wedding party at 2 PM.",
        "action": "Approve upgrade to 505 with $0 revenue displacement. Do not touch floor 4.",
        "urgency": "MEDIUM"
      }
    }
  }
  ```

- `POST /api/incidents/:id/consensus`  
  Passes the 4 agent recommendations into the Consensus Orchestrator to generate the unified Action Plan.  
  **Response (200 OK)**:
  ```json
  {
    "actionPlanId": "plan-901",
    "incidentId": "inc-101",
    "decision": "Upgrade VIP Vance to Suite 505; Express Clean 505; Escort to Lounge; Repair 401 AC",
    "reasoning": "Suite 401 repair takes 75m, exceeding VIP patience window. Upgrading to 505 protects the 2 PM wedding group block on floor 4 and incurs zero revenue loss.",
    "priority": "CRITICAL",
    "operationalImpact": "Housekeeping diverts 2 cleaners to 505; Maintenance takes 401 offline; Front Desk offers lounge access.",
    "guestAction": "Greet Mr. Vance with welcome cocktail in Executive Lounge; deliver keys to 505 at 11:05 AM.",
    "departments": ["Front Desk", "Housekeeping", "Maintenance", "Revenue"],
    "status": "PENDING_APPROVAL",
    "tasks": [
      {
        "title": "Welcome VIP to Executive Lounge",
        "department": "Front Desk",
        "assignedTo": "Sarah Jenkins",
        "estimatedMinutes": 10
      },
      {
        "title": "Express clean Suite 505",
        "department": "Housekeeping",
        "assignedTo": "Maria Santos & Elena Gomez",
        "estimatedMinutes": 25
      },
      {
        "title": "Replace AC capacitor in Room 401",
        "department": "Maintenance",
        "assignedTo": "Bob Miller",
        "estimatedMinutes": 75
      }
    ]
  }
  ```

### 5.3 Human Approval & Execution
- `POST /api/action-plans/:id/approve`  
  Approves the plan. Instantly creates executable records in the `tasks` table and emits the `PLAN_APPROVED` and `TASK_CREATED` WebSocket events.
- `POST /api/action-plans/:id/modify`  
  Accepts user modifications (e.g., changes staff assignee or task priority) and then activates the plan.
- `POST /api/action-plans/:id/reject`  
  Rejects the recommendation and records manager feedback.
- `PATCH /api/tasks/:id`  
  Updates task state (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`) and broadcasts `TASK_UPDATED` via WebSocket.

---

## 6. Database Architecture (PostgreSQL / Supabase)

Minimal, high-efficiency schema designed to support all Phase 1-4 requirements without over-normalization:

```
+--------------------+       +--------------------+       +--------------------+
|       rooms        |       |       guests       |       |       staff        |
+--------------------+       +--------------------+       +--------------------+
| id (PK)            |       | id (PK)            |       | id (PK)            |
| room_number        |       | name               |       | name               |
| category           |       | vip_tier           |       | department         |
| status             |       | check_in_date      |       | status             |
| assigned_guest_id  |       | arrival_time       |       | current_task_id    |
+--------------------+       +--------------------+       +--------------------+
          │                            │
          ▼                            ▼
+-------------------------------------------------+
|                    incidents                    |
+-------------------------------------------------+
| id (PK)                                         |
| type                                            |
| description                                     |
| room_id (FK -> rooms.id)                        |
| guest_id (FK -> guests.id)                      |
| priority                                        |
| status ('OPEN', 'ANALYZING', 'RESOLVED')        |
| created_at                                      |
+-------------------------------------------------+
                         │
                         ▼
+-------------------------------------------------+
|                  action_plans                   |
+-------------------------------------------------+
| id (PK)                                         |
| incident_id (FK -> incidents.id)                |
| decision                                        |
| reasoning                                       |
| priority                                        |
| status ('PENDING_APPROVAL', 'APPROVED', etc.)   |
| raw_agent_recommendations (JSONB)              |
| manager_notes                                   |
| created_at                                      |
+-------------------------------------------------+
                         │
                         ▼
+-------------------------------------------------+
|                      tasks                      |
+-------------------------------------------------+
| id (PK)                                         |
| action_plan_id (FK -> action_plans.id)          |
| title                                           |
| department                                      |
| assigned_to_staff_id (FK -> staff.id)           |
| status ('PENDING', 'IN_PROGRESS', 'COMPLETED')  |
| estimated_minutes                               |
| created_at                                      |
+-------------------------------------------------+
```

---

## 7. AI Multi-Agent & Orchestration Design

### 7.1 Context Builder Service
Before calling the LLM, `contextService.js` compiles a lean operational snapshot:
```javascript
// Example assembled context object passed into Agent prompts
const operationalContext = {
  timestamp: "10:40 AM",
  incident: {
    type: "AC_FAILURE_EARLY_VIP",
    targetRoom: "401",
    reportedBy: "Housekeeping Supervisor",
    severity: "CRITICAL"
  },
  guest: {
    name: "Alexander Vance",
    vipTier: "DIAMOND",
    status: "Arrived (Lobby)",
    scheduledArrival: "11:00 AM"
  },
  targetRoomStatus: {
    room: "401",
    category: "Deluxe Suite",
    issue: "HVAC failed (82F), capacitor repair ETA 75m"
  },
  alternativeRooms: [
    { room: "505", category: "Executive Suite", status: "DIRTY", checkoutTime: "10:15 AM", nextBooking: "Tomorrow 3:00 PM" }
  ],
  operationalConstraints: {
    floor4GroupBlock: "50-person wedding arriving 2:00 PM (Rooms 402-415 locked)",
    housekeepingCapacity: "2 attendants available on 3rd floor"
  }
};
```

### 7.2 Structured Output Enforcement
All OpenAI API calls use JSON mode (`response_format: { type: "json_object" }`) with explicit schemas embedded directly in the system prompts.

```javascript
// backend/src/services/agentService.js (JavaScript)
const OpenAI = require('openai');
const config = require('../config');

const openai = new OpenAI({ apiKey: config.openai.apiKey });

async function runFrontDeskAgent(context) {
  const prompt = `
You are the Front Desk AI Agent for Resort 360.
Analyze the following operational context and recommend an optimal guest experience response.
Context: ${JSON.stringify(context)}

Respond strictly in valid JSON matching this structure:
{
  "perspective": "Detailed analysis of guest situation",
  "action": "Immediate recommendation for front desk",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAmenities": ["Amenity 1", "Amenity 2"]
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { runFrontDeskAgent };
```

---

## 8. AI Safety, Reliability & Fallback Strategy

1. **No Hallucinated Rooms or Assets**: System prompts strictly forbid inventing room numbers, staff names, or inventory items not present in the provided operational context.
2. **Deterministic Fallbacks**: If the OpenAI API encounters a timeout or rate limit, `consensusService.js` intercepts the error and returns a pre-configured rule-based fallback plan for the demo scenario.
3. **JSON Validation & Sanitization**: Responses are wrapped in standard `try/catch` JSON parsers with required property checks before propagation.
4. **Mandatory Human Approval**: No autonomous database writes to room assignment or work order dispatch can occur without an explicit `POST /api/action-plans/:id/approve` action by a human manager.

---

## 9. Real-Time Architecture (Socket.IO)

Bi-directional WebSocket communication connects the Express server and Next.js client to provide instant dashboard feedback.

```
+────────────────────────+                 +────────────────────────+
|   Next.js (Browser)    |                 |   Express.js Server    |
+────────────────────────+                 +────────────────────────+
            │                                           │
            │─── connect (ws://localhost:5000) ────────>│
            │<── connection established ────────────────│
            │                                           │
            │           [ Manager Approves Plan ]       │
            │<── emit("PLAN_APPROVED", planData) ───────│
            │<── emit("TASK_CREATED", taskList) ────────│
            │<── emit("ROOM_UPDATED", roomStatus) ──────│
            │                                           │
            │           [ Staff Completes Task ]        │
            │─── emit("TASK_STATUS_CHANGE", payload) ──>│
            │<── broadcast("TASK_UPDATED", payload) ────│
```

### Event Names
- `INCIDENT_DETECTED`: Dispatched when an incident is logged.
- `ANALYSIS_READY`: Dispatched when all 4 agents have completed their evaluation.
- `PLAN_APPROVED`: Dispatched when manager clicks Approve.
- `TASK_CREATED`: Broadcasted to operational staff task feeds.
- `TASK_UPDATED`: Broadcasted when task status changes (`IN_PROGRESS`, `COMPLETED`).
- `ROOM_UPDATED`: Triggered when room status shifts (`DIRTY` -> `CLEANING` -> `INSPECTED`).

---

## 10. End-to-End Data Flow

```
1. Incident Created via Frontend UI or API
      │
2. Backend contextService queries Supabase for live Room/Guest/Staff data
      │
3. agentService runs Front Desk, Housekeeping, Maintenance & Revenue Agents in parallel
      │
4. consensusService merges agent outputs into a unified Action Plan
      │
5. Plan stored in DB with status "PENDING_APPROVAL" & sent to Frontend
      │
6. Resort Manager reviews Plan on UI -> Clicks "APPROVE"
      │
7. taskService generates individual tasks in DB & updates Room statuses
      │
8. socketService broadcasts "PLAN_APPROVED" & "TASK_CREATED" to all clients
      │
9. UI displays live real-time status updates across all dashboard widgets
```

---

## 11. Deployment Strategy

The deployment architecture is optimized for low friction and zero devops overhead:
- **Frontend**: Deployed to **Vercel** with continuous deployment from the `main` branch.
- **Backend**: Deployed to **Render** or **Railway** as a persistent Node.js service.
- **Database**: Hosted managed **Supabase (PostgreSQL)** instance.
- **AI**: Managed **OpenAI API** endpoint.
