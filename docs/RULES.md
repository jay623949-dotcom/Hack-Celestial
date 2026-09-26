# RESORT 360 — Development & Engineering Rules

> **MANDATORY READING**:  
> Every engineer (Neel, Jay, Krutarth, Nakool, Nairit) and every AI coding assistant working on this repository **MUST** strictly adhere to the rules below.

---

## 1. Absolute Technology Invariants

1. **JAVASCRIPT ONLY**:
   - The entire codebase is written in pure **JavaScript** (ES6+ / Node.js CommonJS & ESM).
   - **DO NOT INTRODUCE TYPESCRIPT**.
   - No `.ts`, `.tsx`, `tsconfig.json`, `@types/*` dependencies, interfaces, or type annotations.
   - Use standard `.js` and `.jsx` extensions only.
2. **STACK BOUNDARIES**:
   - Frontend: **Next.js 14 (App Router)**, **React 18**, **Tailwind CSS**.
   - Backend: **Node.js**, **Express.js**, **CORS**, **dotenv**.
   - Database: **PostgreSQL / Supabase**.
   - AI Engine: **OpenAI API** (`gpt-4o` / `gpt-4o-mini`).
   - Real-Time: **Socket.IO**.
3. **NO PREMATURE ARCHITECTURAL COMPLEXITY**:
   - **DO NOT INTRODUCE**: Microservices, Kafka, Redis, RabbitMQ, Celery, Kubernetes, Docker Compose orchestrations, complex GraphQL engines, or custom ML model training pipelines.
   - **Hackathon Cardinal Rule**:
     > **WORKING PRODUCT > ARCHITECTURAL COMPLEXITY**

---

## 2. Git Workflow & Branch Hygiene

```
main (Production & Demo-Ready only)
  ▲
  │ (Pull Request merge when stable)
develop (Active Integration Branch)
  ▲
  ├── feature/frontend-dashboard  (Jay)
  ├── feature/backend-api         (Krutarth / Neel)
  ├── feature/database            (Krutarth)
  ├── feature/ai-agents           (Nairit)
  └── feature/realtime            (Nairit / Neel)
```

1. **NEVER COMMIT DIRECTLY TO `main`**:
   - `main` is strictly reserved for tagged, stable release checkpoints.
2. **`develop` IS THE INTEGRATION TRUNK**:
   - All feature branches branch off `develop`.
   - Feature branches merge back into `develop` via PR or clean fast-forward merge after verification.
3. **PULL BEFORE CODING**:
   - Always run `git checkout develop && git pull origin develop` before starting work on a branch.
4. **NO FORCE PUSHING**:
   - `git push --force` is strictly forbidden on `main` and `develop`.
5. **ATOMIC & MEANINGFUL COMMITS**:
   - Format: `<type>(<scope>): <short description>`
   - Examples:
     - `feat(agents): add prompt template for housekeeping agent`
     - `fix(routes): correct incident id param extraction`
     - `docs(prd): update killer demo timeline`

---

## 3. Team Ownership & Responsibilities

| Team Member | Primary Domain | Core Responsibilities |
| :--- | :--- | :--- |
| **Neel** | Backend & Foundation Lead | Phase 0 setup, Express architecture, core APIs, execution dispatch, backend integration. |
| **Jay Doshi** | Frontend Lead | Next.js layout, React components, Tailwind styling, dashboard UI, agent visualization, manager approval workflow. |
| **Krutarth Rao** | Database & Persistence Lead | PostgreSQL / Supabase schema, connection pooling, seed scripts, database migrations, data integrity. |
| **Nakool** | Operational Scenarios & QA | Mock data generation, demo scenario calibration, edge case testing, workflow validation. |
| **Nairit Shah** | AI & Real-Time Lead | OpenAI agent prompts, structured output validation, consensus orchestration, Socket.IO pipelines. |

### Cross-Cutting Collaboration Protocol
If you need to edit a file outside your primary domain:
1. Notify the primary owner in group chat.
2. Explain the architectural necessity.
3. Keep changes minimal and isolated.

---

## 4. Code & Architecture Standards

### 4.1 General Principles
- **Keep it Simple & Modular**: Functions should do one thing well. Avoid 500-line monolithic files.
- **Explicit Error Handling**: Always wrap async operations in `try/catch` and pass errors to Express `next(err)` or return clean HTTP error objects.
- **Meaningful Naming**:
  - Functions: verb-first camelCase (`calculateRoomPriority`, `fetchActiveIncidents`).
  - Components: PascalCase (`AgentCard.jsx`, `IncidentModal.jsx`).
  - Constants: UPPER_SNAKE_CASE (`MAX_REPAIR_MINUTES`).

### 4.2 Backend Conventions
- **Separation of Concerns**:
  - `routes/` -> only URL mapping.
  - `controllers/` -> only request parsing & response delivery.
  - `services/` -> only business logic, DB queries, and external APIs.
- **Standard Controller Response Pattern**:
  ```javascript
  // Good Express Controller Pattern (backend/src/controllers/incidentController.js)
  const incidentService = require('../services/incidentService');

  async function createIncident(req, res, next) {
    try {
      const { type, description, roomId, guestId, priority } = req.body;
      if (!type || !description) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
      }

      const incident = await incidentService.create({ type, description, roomId, guestId, priority });
      return res.status(201).json({ status: 'success', data: incident });
    } catch (error) {
      next(error);
    }
  }

  module.exports = { createIncident };
  ```

### 4.3 Frontend Conventions
- **No Direct DB Calls**: Frontend components MUST NEVER import database libraries or execute SQL. Everything goes through `lib/api.js` to the Express backend.
- **Loading & Empty States**: Every UI view that fetches data must handle `isLoading`, `error`, and empty states (`data.length === 0`).
- **Tailwind Consistency**: Use predefined Tailwind utility classes. Do not write inline CSS `style={{ ... }}` unless calculating dynamic pixel transforms.

---

## 5. AI Engineering & Prompting Rules

1. **NO MODEL TRAINING**: Use existing foundation models (`gpt-4o` or `gpt-4o-mini`) through the official OpenAI SDK.
2. **STRICT JSON OUTPUT**: Always specify `response_format: { type: "json_object" }` on chat completions and instruct the model on the exact expected keys.
3. **NEVER BLINDLY TRUST LLM OUTPUT**: Always parse responses inside a `try/catch` block and validate that mandatory fields exist before saving to the database.
4. **NO HALLUCINATED ASSETS**:
   - Prompts must explicitly instruct agents: *"You may ONLY reference room numbers, guest names, and staff members explicitly provided in the Operational Context."*
5. **DETERMINISTIC FALLBACKS**: If the OpenAI API throws a 429 (rate limit) or 500 error, the system must cleanly degrade to pre-configured fallback rules for the demo scenario without crashing the server.
6. **HUMAN APPROVAL REQUIRED**: The AI suggests; the human decides. No action plan may execute without explicit manager approval.

---

## 6. Database & Persistence Rules

1. **LEAN RELATIONAL SCHEMA**: Do not design dozens of tables. We only require:
   - `rooms`, `guests`, `staff`, `incidents`, `action_plans`, `tasks`.
2. **CENTRALIZED CLIENT**: Initialize the Supabase / PostgreSQL client once in `backend/src/config/db.js`. Never create random connection instances in individual route files.
3. **ZERO CREDENTIAL LEAKS**: Never hardcode connection strings or API keys in migration files or seed scripts. Always read from `process.env`.

---

## 7. Security & Secrets Management

1. **NEVER COMMIT `.env` FILES**:
   - The `.gitignore` file strictly blocks all `.env` variations.
   - If you accidentally commit a key, immediately revoke it and notify the team.
2. **USE `.env.example` AS THE BLUEPRINT**:
   - If you introduce a new environment variable, immediately add its placeholder to [.env.example](file:///c:/Web%20Devlopment/HackathonProject/resort360/.env.example) and update the table in [README.md](file:///c:/Web%20Devlopment/HackathonProject/resort360/README.md).
3. **CORS RESTRICTION**:
   - Express server CORS must only allow the frontend development origin (`http://localhost:3000` or production domain).

---

## 8. Dependency Management Rules

Before installing any new package via `npm install`:
1. Ask: **Can this be achieved with vanilla JavaScript or our existing dependencies?**
2. Ask: **Will this introduce native compilation issues on Windows or Mac for teammates?**
3. Ask: **Does the entire team understand why this library is needed?**
4. If in doubt, discuss with the team lead (Neel) before installing.

---

## 9. Rules for AI Coding Assistants (Copilot, Cursor, Gemini, Claude)

Any AI assistant generating code in this repository **MUST follow this execution protocol**:

1. **Read Core Docs First**:
   - First: [PRD.md](file:///c:/Web%20Devlopment/HackathonProject/resort360/PRD.md)
   - Second: [ARCHITECTURE.md](file:///c:/Web%20Devlopment/HackathonProject/resort360/ARCHITECTURE.md)
   - Third: [RULES.md](file:///c:/Web%20Devlopment/HackathonProject/resort360/RULES.md) (This file)
2. **Never Switch to TypeScript**:
   - Under no circumstances convert `.js` to `.ts` or `.jsx` to `.tsx`.
   - If generating code, use standard JavaScript syntax.
3. **Respect File Ownership & Boundaries**:
   - Do not edit files outside the assigned task scope.
   - Do not touch existing working foundation files unless explicitly requested.
4. **Self-Audit**:
   - Before completing any task, check:
     - Did I write pure JavaScript?
     - Did I avoid hardcoding secrets?
     - Did I handle errors?
     - Did I avoid creating duplicate implementations?

---

## 10. Definition of Done (DoD)

A feature or task is **DONE** only when:
- [x] Code is written in pure JavaScript matching project conventions.
- [x] Code executes locally without runtime errors or unhandled promises.
- [x] Backend routes return proper HTTP status codes and structured JSON.
- [x] Frontend UI handles loading, error, and empty states.
- [x] Zero sensitive secrets or `.env` files are tracked by Git.
- [x] The feature works cleanly when running the full stack (`npm run dev`).
- [x] Git diff is clean and ready for integration into `develop`.

---

## 11. Human-in-the-Loop Decision Governance Rules

1. **AI Never Autonomously Executes**:
   - The AI swarms synthesize and recommend; hotel managers review, decide, and execute.
2. **AI Cannot Approve Its Own Recommendation**:
   - Automated self-approval is strictly forbidden.
3. **Manager Approval Required for Execution**:
   - Only authorized manager/admin roles can approve, modify, or reject action plans.
4. **Original AI Plan Remains Immutable**:
   - When a manager modifies a plan, the original AI recommendation is preserved verbatim in `original_plan`.
5. **Modifications Must Be Fully Auditable**:
   - Every modified field, original value, modified value, and reason is recorded in the append-only audit trail (`ai_action_plan_decisions`).
6. **Rejections Require Explicit Reason**:
   - Plans cannot be rejected without a meaningful justification recorded in the audit trail.
7. **Invalid State Transitions Blocked**:
   - Transition validations must be enforced at the API level (e.g. approving a rejected or completed plan returns 409 Conflict).
8. **Action Execution Separate From Recommendation**:
   - Operational tasks are only dispatched upon explicit human approval.

---

## 12. Operational Execution & Task Dispatch Rules (Phase 5)

1. **Only Approved Action Plans Can Execute**:
   - Plans in `pending_review`, `pending_approval`, `modified_pending_approval`, or `rejected` state must NEVER generate executable tasks. Any attempt returns 409 Conflict.
2. **AI Cannot Directly Execute Tasks**:
   - The AI layer recommends; the manager approves. The execution engine converts approved actions into operational tasks only after explicit manager confirmation.
3. **Execution Must Be Backend-Controlled**:
   - Execution logic and state transitions must reside strictly in backend services (`execution.service.js`), never calculated client-side in the browser.
4. **Duplicate Execution Must Be Prevented (Idempotency)**:
   - Repeated calls to approve or execute an already dispatched action plan must return the existing execution state without creating duplicate tasks or double-assigning staff.
5. **Database is the Source of Truth**:
   - WebSockets provide live notifications, but every screen must load its initial state from and resynchronize against the database / REST API.
6. **WebSocket Events Represent Persisted State Changes**:
   - Socket.IO events (`execution.started`, `task.dispatched`, `staff.status_changed`, `room.status_changed`, etc.) are only broadcast AFTER database/datastore updates succeed.
7. **Failed Tasks Must Never Be Presented as Completed**:
   - If an operational task fails or cannot be dispatched (e.g. missing staff or room), the system must flag `failed` or `partial` execution with clear visibility to managers.
8. **Room / Staff / Task State Must Remain Consistent**:
   - State cascading is bidirectional and verified: starting a cleaning task transitions room to `in_progress` and staff to `busy`; completing a task marks the room `clean`/`ready` and recalculates staff workload (`available` only when active task count reaches 0).
9. **Execution Must Be Auditable**:
   - All execution timeline events are permanently logged in `ai_action_plan_execution_events` and traceable backwards from Task -> Action Item -> Action Plan -> Manager Decision -> AI Consensus.
10. **Frontend Must Not Fabricate Execution State**:
    - Progress bars (`completed_tasks / total_tasks`), timeline logs, and status badges must be derived entirely from genuine backend execution records.

---

## 13. Fixed Demo Integrity & Deterministic Scenario Rules

1. **Deterministic Single Story**:
   - The primary judge-facing demonstration is fixed: VIP Early Arrival (Arjun Mehta, RES-VIP-401, expected 16:00, actual 14:00) with Room 401 AC Failure and alternative Room 205 (Deluxe).
2. **Never Fake Final State**:
   - Do not hardcode "Resolved" in UI components. Every state shift (`open` → `in_progress` → `resolved`, Room 401 `maintenance` → `ready`, staff `available` → `busy` → `available`) must be backed by genuine REST/WebSocket transitions.
3. **Deterministic Reset Guarantee**:
   - Running `npm run seed:demo` or triggering `POST /demo/reset` must restore the database and in-memory store to the exact initial scenario without requiring application restarts.
4. **No Premature Feature Creep**:
   - Focus exclusively on the end-to-end loop: Incident → Context → 4 Agents → Consensus → Manager Approval → Task Dispatch → Real-time Execution → Incident Resolution.

---

## 14. Failure Handling, Resilience & Demo Safety Rules

1. **Never Show False Success**:
   - State changes in the UI must represent confirmed backend transitions, not optimistic user intent. Never mark a task or incident as completed if the backend or database mutation failed.
2. **Backend Confirmation Required Before State Changes**:
   - Only update local UI and operational dashboards upon receiving a 2xx HTTP response or confirmed Socket.IO broadcast event.
3. **Database is the Single Source of Truth**:
   - Frontend and in-memory caches must resynchronize against authoritative database state on load, tab switch, and socket reconnect.
4. **Strict AI Schema Validation**:
   - Every AI response must pass AJV JSON schema validation before entering operational state. Invalid JSON or missing required fields must be rejected immediately.
5. **Invalid AI Output Must Never Reach Execution**:
   - If an AI model outputs unparseable text or violates schema contracts, the system must trigger deterministic fallback consensus or flag for manual manager review.
6. **AI Failure Must Never Crash the Application**:
   - Network timeouts, rate limits (429), or capacity spikes (503) must be caught by per-agent error boundaries and timeout guards (`Promise.race`), keeping the server and frontend running.
7. **Retry Transient Failures Only**:
   - Automatically retry transient network or capacity errors once or twice with exponential backoff. Never automatically retry validation errors (400), authentication failures (401/403), or not found errors (404).
8. **Socket Reconnect Must Reconcile with Backend State**:
   - When a client reconnects after network disconnection or server restart, it must immediately fetch fresh operational records via REST API to ensure no missed events leave the UI stale.
9. **Distinguish EMPTY from ERROR**:
   - Components must render clear, friendly empty states when zero records match a query, rather than throwing or displaying generic error banners.
10. **Global React Error Boundaries**:
    - Unexpected rendering exceptions in dashboard sections must be caught by an `ErrorBoundary`, rendering an isolated section error card with `[Try Again]` and `[Reload Page]` actions while keeping global navigation fully functional.




