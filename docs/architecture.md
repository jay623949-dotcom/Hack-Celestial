# RESORT 360 â€” Technical Architecture

> **CRITICAL LANGUAGE DIRECTIVE**:  
> This project uses **pure JavaScript (ES6+ / Node.js CommonJS & ESM)**.  
> **NO TYPESCRIPT IS ALLOWED**. No `.ts`, no `.tsx`, no interfaces, no types. All code examples below use standard JavaScript and JSON.

---

## 1. Architecture Overview

Resort 360 uses a lightweight, decoupled monorepo architecture consisting of a **Next.js (React + Tailwind CSS)** frontend, an **Express.js (Node.js)** backend API, a **PostgreSQL / Supabase** database, an **OpenAI API Multi-Agent Orchestration Layer**, and a **Socket.IO** real-time event pipeline.

```
+â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+
â”‚                       CLIENT LAYER                          â”‚
â”‚             Next.js 14 (App Router) + Tailwind CSS          â”‚
â”‚                      (Running on :3000)                     â”‚
+â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+
                               â”‚
               HTTP / REST API â”‚ â–²  WebSocket (Socket.IO)
                               â–¼ â”‚
+â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+
â”‚                      BACKEND SERVER                         â”‚
â”‚             Node.js + Express.js API Gateway                â”‚
â”‚                      (Running on :5000)                     â”‚
+â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+
               â”‚                               â”‚
               â–¼                               â–¼
+â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+ +â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+
â”‚      DATA PERSISTENCE        â”‚ â”‚      AI ORCHESTRATION       â”‚
â”‚     Supabase / PostgreSQL    â”‚ â”‚     OpenAI API (GPT-4o)     â”‚
â”‚   - rooms, guests, staff     â”‚ â”‚  - Front Desk Agent         â”‚
â”‚   - incidents, action_plans  â”‚ â”‚  - Housekeeping Agent       â”‚
â”‚   - tasks                    â”‚ â”‚  - Maintenance Agent        â”‚
â”‚                              â”‚ â”‚  - Revenue Agent            â”‚
â”‚                              â”‚ â”‚  - Consensus Engine         â”‚
+â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+ +â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+
```

---

## 2. System Layers & Technologies

| Layer | Technology | Primary Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React 18, Tailwind CSS | Dashboard UI, incident creation modal, multi-agent reasoning visualizer, manager approval interface, live task board. |
| **Backend** | Node.js, Express.js | REST routing, input validation, context assembly, multi-agent dispatch, task generation, WebSocket server. |
| **Database** | PostgreSQL / Supabase | Relational persistence for rooms, guests, staff, active incidents, generated action plans, and tasks. |
| **AI Layer** | **Nugen Intelligence** (Domain-Aligned Model `resort360-hospitality-v1`) + Universal Adapter (OpenAI / Gemini / Local) | Specialized domain reasoning layer producing calibrated confidence-scored evaluations, feeding 4 departmental agents and multi-agent consensus synthesis. |
| **Real-Time** | Socket.IO (Server & Client) | Instant bi-directional event broadcast when incidents are created, plans approved, and tasks updated. |

---

## 3. Repository Structure

```
resort360/
â”œâ”€â”€ frontend/                     # Next.js App Router Client (JavaScript)
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ globals.css           # Tailwind base & utilities
â”‚   â”‚   â”œâ”€â”€ layout.js             # Root HTML layout & providers
â”‚   â”‚   â””â”€â”€ page.js               # Main Operations Dashboard
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ IncidentModal.jsx     # Incident submission trigger
â”‚   â”‚   â”œâ”€â”€ AgentAnalysisCard.jsx # Displays individual agent views
â”‚   â”‚   â”œâ”€â”€ ConsensusPlan.jsx     # Action plan approval/modify/reject
â”‚   â”‚   â”œâ”€â”€ RoomStatusGrid.jsx    # Live room visualizer
â”‚   â”‚   â””â”€â”€ TaskBoard.jsx         # Live real-time task cards
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”œâ”€â”€ api.js                # Fetch wrapper for backend REST APIs
â”‚   â”‚   â””â”€â”€ socket.js             # Socket.IO client singleton
â”‚   â”œâ”€â”€ public/                   # Static assets & icons
â”‚   â”œâ”€â”€ jsconfig.json             # Path alias resolution (@/*)
â”‚   â”œâ”€â”€ tailwind.config.js        # Tailwind styling rules
â”‚   â”œâ”€â”€ postcss.config.js         # PostCSS processor config
â”‚   â”œâ”€â”€ next.config.js            # Next.js runtime config
â”‚   â””â”€â”€ package.json              # Frontend dependencies
â”‚
â”œâ”€â”€ backend/                      # Express.js REST API Server (JavaScript)
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ config/               # Centralized configurations & env loading
â”‚   â”‚   â”‚   â”œâ”€â”€ db.js             # Supabase / Postgres client
â”‚   â”‚   â”‚   â”œâ”€â”€ openai.js         # OpenAI client configuration
â”‚   â”‚   â”‚   â””â”€â”€ index.js          # Port, CORS, env variables
â”‚   â”‚   â”œâ”€â”€ controllers/          # HTTP request handlers
â”‚   â”‚   â”‚   â”œâ”€â”€ incidentController.js
â”‚   â”‚   â”‚   â”œâ”€â”€ actionPlanController.js
â”‚   â”‚   â”‚   â”œâ”€â”€ taskController.js
â”‚   â”‚   â”‚   â”œâ”€â”€ roomController.js
â”‚   â”‚   â”‚   â””â”€â”€ healthController.js
â”‚   â”‚   â”œâ”€â”€ routes/               # Express route declarations
â”‚   â”‚   â”‚   â”œâ”€â”€ incidentRoutes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ actionPlanRoutes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ taskRoutes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ roomRoutes.js
â”‚   â”‚   â”‚   â””â”€â”€ healthRoutes.js
â”‚   â”‚   â”œâ”€â”€ services/             # Core business & AI logic
â”‚   â”‚   â”‚   â”œâ”€â”€ contextService.js # Compiles live operational context
â”‚   â”‚   â”‚   â”œâ”€â”€ agentService.js   # Dispatches prompt runs to OpenAI
â”‚   â”‚   â”‚   â”œâ”€â”€ consensusService.js # Synthesizes agent plans
â”‚   â”‚   â”‚   â”œâ”€â”€ taskService.js    # Converts approved plan into tasks
â”‚   â”‚   â”‚   â””â”€â”€ socketService.js  # Real-time WebSocket emitter
â”‚   â”‚   â”œâ”€â”€ middleware/           # Validation and error handling
â”‚   â”‚   â”‚   â””â”€â”€ errorHandler.js   # Standard JSON error & 404 handler
â”‚   â”‚   â””â”€â”€ server.js             # Express app & HTTP/Socket.IO setup
â”‚   â””â”€â”€ package.json              # Backend dependencies
â”‚
â”œâ”€â”€ docs/                         # Documentation
â”‚   â””â”€â”€ architecture.md           # Supplemental architectural notes
â”‚
â”œâ”€â”€ PRD.md                        # Product Requirements Document
â”œâ”€â”€ ARCHITECTURE.md               # Technical Architecture Document (This file)
â”œâ”€â”€ RULES.md                      # Team Development & Coding Standards
â”œâ”€â”€ README.md                     # Monorepo setup and onboarding guide
â”œâ”€â”€ .env.example                  # Environment variable blueprint
â””â”€â”€ package.json                  # Root orchestration (concurrently dev runner)
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
- `GET /health` â€” Verifies backend availability and timestamp.
- `GET /api/rooms` â€” Retrieves list of all rooms with current statuses (`clean`, `dirty`, `repair`, `occupied`).
- `GET /api/guests` â€” Retrieves active/incoming guests, arrival times, and VIP tiers.
- `GET /api/staff` â€” Retrieves list of staff members with department, status (`available`, `busy`), and current load.

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

### 5.2 Multi-Agent Orchestration & Operational Context Pipeline

```
                  PostgreSQL
                       â†“
                Context Builder
                       â†“
              Operational Context
                       â†“
       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â†“               â†“               â†“
  Front Desk     Housekeeping    Maintenance
     Agent           Agent           Agent
       â”‚               â”‚               â”‚
       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                       â†“
                  Revenue Agent
                       â†“
                Agent Responses
                       â†“
             ORCHESTRATOR [IMPLEMENTED]
                       â†“
              CONSENSUS [IMPLEMENTED]
                       â†“
              ACTION PLAN [IMPLEMENTED]
                       â†“
             CONSENSUS UI [IMPLEMENTED - PHASE 3.2]`n                        ↓`n              HUMAN APPROVAL UI [IMPLEMENTED - PHASE 3.2]
```

#### Implemented Endpoints:
- `POST /api/v1/ai/context`  
  Accepts an operational trigger (`{ trigger: { type: "multiple_incidents" } }`), queries database state via backend services, compiles a compact canonical context, strictly derives operational constraints, and returns a verified context snapshot adhering 100% to `agent-context.schema.json`.

- `POST /api/v1/ai/analyze`  
  Accepts either a `{ trigger: { ... } }` or `{ context: { ... } }`. Dynamically invokes `context-builder.service.js` to extract current database state before querying the Universal AI Adapter. Validates AI response structure against `agent-response.schema.json`.

- `POST /api/v1/ai/agents/analyze`  
  Executes isolated domain agent analyses against shared canonical context for specified agents (`["front_desk", "housekeeping", "maintenance", "revenue"]`). Evaluates each agent using its specialized prompt (`front-desk.prompt.js`, `housekeeping.prompt.js`, `maintenance.prompt.js`, `revenue.prompt.js`) and validates every response against `agent-response.schema.json`. Returns per-agent status and structured outputs.

- `POST /api/v1/ai/consensus` [IMPLEMENTED - PHASE 3.1]  
  Coordinates end-to-end multi-agent orchestration. Takes an operational trigger, compiles canonical context from database state, executes requested departmental agents with error boundary isolation, handles partial agent failures, performs multi-agent arbitration, detects explicit inter-departmental conflicts, and generates a structured actionable operational plan strictly requiring human approval (`requires_human_approval: true`). Validated against `/schemas/ai/consensus-response.schema.json`.


#### Planned Endpoints (Phase 2.4 Consensus & Phase 3 Execution - NOT YET IMPLEMENTED):
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
          â”‚                            â”‚
          â–¼                            â–¼
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
                         â”‚
                         â–¼
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
                         â”‚
                         â–¼
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
+â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+                 +â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+
|   Next.js (Browser)    |                 |   Express.js Server    |
+â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+                 +â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€+
            â”‚                                           â”‚
            â”‚â”€â”€â”€ connect (ws://localhost:5000) â”€â”€â”€â”€â”€â”€â”€â”€>â”‚
            â”‚<â”€â”€ connection established â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
            â”‚                                           â”‚
            â”‚           [ Manager Approves Plan ]       â”‚
            â”‚<â”€â”€ emit("PLAN_APPROVED", planData) â”€â”€â”€â”€â”€â”€â”€â”‚
            â”‚<â”€â”€ emit("TASK_CREATED", taskList) â”€â”€â”€â”€â”€â”€â”€â”€â”‚
            â”‚<â”€â”€ emit("ROOM_UPDATED", roomStatus) â”€â”€â”€â”€â”€â”€â”‚
            â”‚                                           â”‚
            â”‚           [ Staff Completes Task ]        â”‚
            â”‚â”€â”€â”€ emit("TASK_STATUS_CHANGE", payload) â”€â”€>â”‚
            â”‚<â”€â”€ broadcast("TASK_UPDATED", payload) â”€â”€â”€â”€â”‚
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
      â”‚
2. Backend contextService queries Supabase for live Room/Guest/Staff data
      â”‚
3. agentService runs Front Desk, Housekeeping, Maintenance & Revenue Agents in parallel
      â”‚
4. consensusService merges agent outputs into a unified Action Plan
      â”‚
5. Plan stored in DB with status "PENDING_APPROVAL" & sent to Frontend
      â”‚
6. Resort Manager reviews Plan on UI -> Clicks "APPROVE"
      â”‚
7. taskService generates individual tasks in DB & updates Room statuses
      â”‚
8. socketService broadcasts "PLAN_APPROVED" & "TASK_CREATED" to all clients
      â”‚
9. UI displays live real-time status updates across all dashboard widgets
```

---

## 11. Deployment Strategy

The deployment architecture is optimized for low friction and zero devops overhead:
- **AI**: Managed **OpenAI API** endpoint.

---

## 12. Human-in-the-Loop Decision Governance Architecture

```
                 Database (PostgreSQL / In-Memory)
                                │
                                ▼
                     Operational Context Builder
                                │
                                ▼
                 Departmental Agents (x4 Parallel)
              [Front Desk, Housekeeping, Maint, Rev]
                                │
                                ▼
                    Orchestrated Swarm Consensus
                                │
                                ▼
                   Explainable Action Plan (AI)
                                │
                                ▼
                  ┌───────────────────────────┐
                  │    HUMAN MANAGER REVIEW   │
                  └─────────────┬─────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
    [ APPROVE ]            [ MODIFY ]             [ REJECT ]
         │                      │                      │
         │             (Preserves Original)            │
         │             (Diff & Reason Logged)          │
         │                      │                      │
         │                      ▼                      │
         │             modified_pending_approval       │
         │                      │                      │
         ▼                      ▼                      ▼
     approved                approved               rejected
         │                                             │
         ▼                                             ▼
    in_progress                                    cancelled
         │
         ▼
     completed
                                │
                                ▼
                  Append-Only Audit Trail Log
                 (ai_action_plan_decisions)
```

### Decision Lifecycle & State Transitions
- **`pending_review`**: Initial state generated by AI consensus. Awaiting manager action.
- **`modified_pending_approval`**: Manager modified one or more operational parameters (room, staff, priority). The original AI recommendation remains preserved.
- **`approved`**: Authorized manager endorsed execution. Actions transition to dispatch.
- **`rejected`**: Manager rejected the proposal with a mandatory justification.
- **`in_progress`**: One or more assigned action items are actively being executed.
- **`completed`**: All dispatched action items have been marked complete.

---

## 13. Operational Execution & Real-Time Dispatch Architecture (Phase 5)

```
                 APPROVED ACTION PLAN
                          │
                          ▼
                  EXECUTION SERVICE
                          │
                          ▼
                  EXECUTABLE TASKS
                          │
                          ▼
                   TASK DISPATCHER
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
      STAFF              ROOM             INCIDENT
      STATE              STATE              STATE
        └─────────────────┼─────────────────┘
                          │
                          ▼
                      SOCKET.IO
                          │
                          ▼
                    LIVE DASHBOARD
                          │
                          ▼
                  EXECUTION TIMELINE
```

### Architectural Separation: AI Decision Layer vs. Execution Layer

1. **AI Decision Layer (Advisory Only)**:
   - Senses resort telemetry and multi-department operational constraints.
   - 4 departmental agents (Front Desk, Housekeeping, Maintenance, Revenue) deliberate.
   - Consensus engine synthesizes recommendations into an explainable Action Plan.
   - **CRITICAL SAFETY RULE**: AI NEVER executes operational tasks autonomously.

2. **Manager Approval Gate**:
   - Authorized manager reviews, modifies, or rejects the AI recommendations.
   - Pending or rejected plans are strictly prevented from generating tasks.

3. **Execution Service (`backend/src/services/execution.service.js`)**:
   - Source of truth for operational task generation and dispatch.
   - **Idempotency Guard**: Prevents duplicate executions if approval is called multiple times.
   - **Task Instantiation**: Converts approved items into concrete tasks preserving backwards traceability (`action_plan_id`, `action_plan_item_id`, `analysis_run_id`).
   - **State Cascading**:
     - **Staff Workload**: Transitions staff to `busy` when assigned, and dynamically recalculates active workload on task completion (`busy` → `available` only when active tasks reach 0).
     - **Room Turnover**: Changes room housekeeping status (`dirty` → `in_progress` → `clean`/`available`).
     - **Incident Resolution**: Resolves linked maintenance incidents when all associated work orders complete.
     - **Execution Progress**: Computes `completed_tasks / total_tasks` from real database records.

4. **Real-Time Broadcast Pipeline (`backend/src/services/socket.service.js`)**:
   - Express server integrated with Socket.IO.
   - Broadcasts events (`execution.started`, `task.dispatched`, `task.accepted`, `task.in_progress`, `task.completed`, `staff.status_changed`, `room.status_changed`, `execution.completed`).
   - Maintains an in-memory circular history buffer and enables live timeline updates across multiple browser sessions without full page reloads.

5. **Manager Execution Console (`/dashboard/execution/:actionPlanId`)**:
   - Enterprise light-theme operational control screen.
   - Real-time task board with interactive status progression controls.
   - Database-backed execution timeline that survives page refreshes and socket disconnections.

---

## 11. Complete End-to-End Incident Lifecycle & Data Flow

The complete end-to-end loop operates as an integrated, deterministic pipeline:

```
INCIDENT DETECTED (Room 401 AC Failure + VIP Early Arrival Arjun Mehta)
        │
        ▼
CANONICAL CONTEXT BUILDER (Filters relevant rooms 401 & 205, staff, guests, 82% occupancy)
        │
        ▼
4 DOMAIN AGENTS DELIBERATE (Front Desk, Housekeeping, Maintenance, Revenue)
        │
        ▼
CONSENSUS SYNTHESIS (Synthesizes Action Plan in ai_action_plans with status: "pending_review")
        │
        ▼
DUTY MANAGER REVIEWS (/dashboard/consensus — Approve, Modify, or Reject)
        │
        ▼ [MANAGER APPROVES]
EXECUTION ENGINE (execution.service.js — Converts approved items into tasks)
        │
        ▼
REAL-TIME SOCKET.IO EVENT FANOUT (task.dispatched, room.status_changed, staff.status_changed)
        │
        ▼
STAFF DASHBOARDS & REAL STATE UPDATES:
   - Priya Sharma prepares Room 205 (Room 205: available → cleaning → clean/ready)
   - Rohan Mehta inspects Room 401 AC (Room 401: maintenance → repair completed)
   - Amit Shah escorts VIP Arjun Mehta (Guest status: checked-in to Room 205)
   - Staff workloads return to available
        │
        ▼
INCIDENT RESOLVED (INC-401-AC: open → in_progress → resolved)
        │
        ▼
EXECUTION COMPLETE (Progress: 100%, timeline closed, full audit trail persisted)
```

---

## 12. Failure Handling, Resilience & Demo Safety Architecture

Resort 360 is engineered to maintain operational integrity under common failure conditions:

### 12.1 Standardized API Error Handling
All backend endpoints funnel through centralized middleware (`errorHandler.js`), guaranteeing a deterministic JSON error contract:
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_UNAVAILABLE | VALIDATION_ERROR | AI_TIMEOUT | STATE_CONFLICT",
    "message": "Human-readable failure explanation without leaked credentials",
    "details": [...],
    "timestamp": "2026-09-27T01:30:00.000Z",
    "path": "/api/v1/..."
  }
}
```

### 12.2 Multi-Agent AI Timeout & Error Isolation
- External AI calls (Gemini / OpenAI / Local) are guarded by a 45-second `Promise.race` timeout, preventing connection hangs.
- Each domain agent executes inside an isolated error boundary. If a single agent (e.g. Maintenance) encounters a timeout or rate limit, its status is tagged as `unavailable`.
- The remaining active agents continue deliberation, and the `ConsensusService` synthesizes a valid operational consensus with explicit notification of missing inputs.

### 12.3 Deterministic Rule-Based Consensus Fallback
If the entire AI synthesis engine encounters a network partition, `ConsensusService.buildFallbackConsensus()` engages deterministic operational rules to produce a schema-valid action plan that prioritizes VIP guest recovery and marks `requires_human_approval: true`.

### 12.4 Frontend React Error Boundary & Multi-Endpoint Resilience
- Component crashes are intercepted by `<ErrorBoundary>`, rendering an isolated error card with `[Try Again]` and `[Reload Page]` actions while keeping global navigation and the header intact.
- The Executive Dashboard fetches resources using `Promise.allSettled`, preventing a single degraded endpoint from crashing the entire operational console.
- `fetchFromApi` enforces a 25-second `AbortController` timeout and validates JSON content types.

### 12.5 Real-Time Socket.IO Reconnection & State Reconciliation
- The header displays a live connection status pill (`Live` vs. `Reconnecting...`).
- When network reconnects, clients immediately resynchronize with the authoritative REST endpoints and re-subscribe to their active action plan execution rooms.




