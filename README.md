# RESORT 360

> **AI-Powered Resort Operations & Decision Intelligence Platform**  
> Real-time operational coordination across Front Desk, Housekeeping, Maintenance, and Revenue management.

---

## 1. Product Overview

Resort operations frequently suffer from fragmented departmental communication. When a high-tier VIP arrives early and their assigned suite experiences an HVAC breakdown, Front Desk, Housekeeping, Maintenance, and Revenue teams make siloed decisions that create guest friction and operational bottlenecks.

**RESORT 360** solves this with:
- **Unified Operational Command Center**: Real-time room status, staff duty shifts, active incidents, and prioritized work orders.
- **Dynamic Context Builder**: Automatically distills database state into compact, canonical operational snapshots.
- **AI Agent Swarm**: 4 specialized domain perspectives (Front Desk, Housekeeping, Maintenance, Revenue) evaluating situations simultaneously.
- **Human-in-the-Loop Governance**: AI advises; Duty Managers approve, modify, or reject before any action is executed.

---

## 2. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, CORS, Helmet, Morgan
- **Database / Data Layer**: PostgreSQL schema (`backend/database`) with in-memory fallback store (`phase-1/demo-data.json`)
- **AI Integration (Universal Adapter)**: Google Gemini (`gemini-2.5-flash` with free tier API via `@google/genai`), OpenAI (`gpt-4o-mini`), and local self-hosted LLMs (Ollama, LM Studio, vLLM). Output validated with JSON Schema Draft 2020-12 & Ajv.
- **Real-Time**: Socket.IO / WebSocket architecture

---

## 3. High-Level Architecture & Pipeline

```
PostgreSQL / Operational Database State [IMPLEMENTED]
         │
         ▼
Operational Services (RoomService, GuestService, StaffService, IncidentService, TaskService) [IMPLEMENTED]
         │
         ▼
Context Builder Service (context-builder.service.js) [IMPLEMENTED]
         │ (Maps database state into Canonical AI Context matching agent-context.schema.json)
         ▼
Canonical AI Context (POST /api/v1/ai/context & POST /api/v1/ai/analyze) [IMPLEMENTED]
         │
         ▼
AI Analysis Layer (OpenAI Responses API with schema validation) [IMPLEMENTED]
         │
         ▼
Agent Perspectives (Front Desk, Housekeeping, Maintenance, Revenue) [IMPLEMENTED]
         │
         ▼
Consensus Engine (Multi-agent trade-off resolution) [PLANNED - Phase 2.3]
         │
         ▼
Action Plan (Generated with requires_human_approval: true) [PLANNED - Phase 2.3]
         │
         ▼
Human Approval (Approve / Modify / Reject by Duty Manager) [PLANNED - Phase 3]
         │
         ▼
Task Execution & Socket.IO Real-Time Dispatch [PLANNED - Phase 3]
```

---

## 4. Repository Structure

```
resort360/
├── backend/
│   ├── database/                  # Schema migrations & seed scripts
│   ├── src/
│   │   ├── ai/prompts/            # System prompt & fact-boundary instructions
│   │   ├── config/                # Environment variables, DB pool, CORS
│   │   ├── controllers/           # Express controllers (rooms, incidents, tasks, ai)
│   │   ├── data/                  # In-memory database store & JSON loader
│   │   ├── middleware/            # Error handlers & 404 handler
│   │   ├── routes/                # REST endpoints (/api/v1)
│   │   └── services/              # Business logic & ContextBuilderService & OpenAIService
│   ├── test-phase1.js             # API integration test suite (55 tests)
│   ├── test-phase2-1.js           # 5 operational benchmark scenario verification
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/             # Command Center Dashboard
│   │   │   └── agents/            # AI Agent Swarm UI
│   │   ├── sign-in/ & sign-up/    # Auth UI
│   │   └── page.js                # Public landing page
│   ├── components/
│   │   ├── agents/                # AgentCard & ScenarioSelector components
│   │   └── dashboard/             # StatCard, RoomOverview, IncidentOverview, etc.
│   └── lib/                       # REST client with automatic retry
│
├── schemas/ai/                    # JSON Schemas (Draft 2020-12)
│   ├── agent-context.schema.json  # Input schema for Canonical AI Context
│   ├── agent-response.schema.json # Output schema for AI domain analysis
│   ├── consensus-input.schema.json
│   └── action-plan.schema.json
│
├── docs/                          # Source-of-truth documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── RULES.md
│   ├── resort-data-model.md
│   └── incident-scenarios.md
│
└── phase-1/demo-data.json         # 20 rooms, 5 guests, 10 staff, 6 incidents, 15 tasks
```

---

## 5. Prerequisites & Environment Setup

### Prerequisites
- **Node.js**: v18.x or later (tested on Node v20/v24)
- **npm**: v9.x or later

### Step 1: Clone & Navigate to Project
```bash
git clone https://github.com/jay623949-dotcom/Hack-Celestial.git
cd resort360
git checkout feat/phase2neel
```

### Step 2: Configure Environment Variables

1. **Backend Environment** (`backend/.env`):
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # ==================================================
   # AI MODEL CONFIGURATION (Universal Adapter)
   # Providers: 'gemini' (Free tier) | 'openai' | 'local' (Ollama / vLLM)
   # ==================================================
   AI_PROVIDER=gemini

   # Option 1: Google Gemini (FREE TIER - Recommended)
   # Get a free key at: https://aistudio.google.com
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash

   # Option 2: OpenAI API (Optional)
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini

   # Option 3: Local / Self-Hosted Models (Ollama, LM Studio, vLLM)
   # AI_PROVIDER=local
   LOCAL_AI_BASE_URL=http://localhost:11434/v1
   LOCAL_AI_MODEL=llama3.2
   ```
   > **Note**: `backend/.env` is tracked in `.gitignore` and will never be committed to Git. If no AI API key is provided, the backend continues to operate normally and safely notifies the Agent Swarm UI.

2. **Frontend Environment** (`frontend/.env.local` optional):
   Defaults to `http://localhost:5000/api/v1` automatically.

---

## 6. How to Run the System

### Option A: Run Both Backend & Frontend (Two Terminal Windows)

#### Terminal 1 — Backend (Express API on Port 5000):
```bash
cd backend
npm install
npm run dev
```
- Backend starts at: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/v1/health`
- Live Operations Summary: `http://localhost:5000/api/v1/operations/summary`

#### Terminal 2 — Frontend (Next.js Command Center on Port 3000 or 3001):
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

---

## 7. Key Application Pages & Verification

| Page | URL | Description |
| :--- | :--- | :--- |
| **Landing Page** | `http://localhost:3000/` | Public Resort 360 overview |
| **Command Center** | `http://localhost:3000/dashboard` | Live operational dashboard with room grid, staff on duty, active incidents, and attention panel |
| **AI Agent Swarm** | `http://localhost:3000/dashboard/agents` | 4-agent perspective visualizer with 5 benchmark scenario selectors and human approval governance |
| **Sign In / Sign Up** | `http://localhost:3000/sign-in` | Command center authentication screens |

---

## 8. Running Automated Test Suites

All backend tests run independently with self-contained test servers:

```bash
cd backend

# 1. Run Complete API & Error Contract Test Suite (55 tests)
npm test

# 2. Run Context Builder & 5 Benchmark Scenarios Verification
node test-phase2-1.js

# 3. Run JSON Schema Conformance Suite
node test-schemas.js
```

### Production Build Verification
```bash
cd frontend
npm run build
```

---

## 9. Core REST Endpoints (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status |
| `GET` | `/api/v1/operations/summary` | Dynamic room, incident, task, and staff counts |
| `GET` | `/api/v1/rooms` | All rooms with optional `?status=`, `?type=`, `?floor=` |
| `GET` | `/api/v1/incidents` | All incidents with `?status=`, `?severity=`, `?department=` |
| `GET` | `/api/v1/tasks` | Active work orders with `?assigned_to=`, `?priority=` |
| `GET` | `/api/v1/guests` | In-house guest profiles and VIP tier metadata |
| `GET` | `/api/v1/staff` | On-duty staff rosters by department |
| `POST` | `/api/v1/ai/context` | Generates verified Canonical Context from live DB state |
| `POST` | `/api/v1/ai/analyze` | Evaluates operational context via OpenAI Responses API |

---

## 10. Development Guidelines & Safety Rules
- **No TypeScript**: The codebase strictly uses modern JavaScript (ES6+ CommonJS for backend, ESM for frontend).
- **Human-in-the-Loop**: The AI Agent Swarm provides advisory proposals only; operations are never dispatched automatically without Duty Manager approval.
- **Never Commit Secrets**: Never commit `.env` files or API credentials to Git.
