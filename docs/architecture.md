# Resort 360 - Architecture Documentation

## 1. Overview
**Resort 360** is an AI-powered resort operations platform designed to streamline guest requests, staff workflows, inventory tracking, and operational intelligence.

This document describes the high-level architecture across project phases.

> **Important**: In **Phase 0 (Foundation)**, only the baseline web services (Next.js frontend and Express.js backend with health checks) are established. AI agents, database persistence, and real-time streaming are intentionally **NOT** implemented in this phase.

---

## 2. Phase 0 Architecture (Current Foundation)

```
[ Web Browser ]
      │
      ├─── HTTP (Port 3000) ───> [ Next.js App Router (Frontend) ]
      │                                   │
      │                                   │ REST (HTTP)
      │                                   ▼
      └─── HTTP (Port 5000) ───> [ Express.js (Backend API) ]
                                          │
                                    [ /health OK ]
```

- **Frontend**: Next.js (App Router), React, Tailwind CSS. Provides client layout and UI foundation.
- **Backend**: Express.js server providing centralized routing, error handling, CORS configuration, and a `/health` verification endpoint.

---

## 3. Full System Architecture (Phases 1 - 4 Planned)

```
+-------------------------------------------------------+
|                    Client Layer                       |
|           Next.js / React / Tailwind CSS              |
+---------------------------┬---------------------------+
                            │
               HTTP / REST  │  WebSocket / Socket.IO
                            ▼
+-------------------------------------------------------+
|                 Backend Gateway Layer                 |
|                   Express.js Server                   |
+-------------┬---------------------------┬-------------+
              │                           │
              ▼                           ▼
+---------------------------+ +---------------------------+
|      Data Persistence     | |      AI & Automation      |
|    PostgreSQL / Supabase  | |         OpenAI API        |
| - Reservations            | | - Guest Assistant Agent   |
| - Guest & Staff Profiles  | | - Task Dispatch Agent     |
| - Inventory & Rooms       | | - Operational Insights    |
+---------------------------+ +---------------------------+
```

---

## 4. Architectural Evolution by Phase

### Phase 1: Core Data & Realtime Setup
- **PostgreSQL / Supabase Integration**:
  - Connection pooling via Supabase client / PostgreSQL driver.
  - Relational schema for guests, bookings, rooms, and resort staff tickets.
- **Real-Time Layer**:
  - Socket.IO server initialization attached to the Express HTTP server.
  - WebSocket event channels for real-time dispatch alerts and guest notifications.

### Phase 2: AI & LLM Automation Layer
- **OpenAI API Integration**:
  - OpenAI Assistants / Chat Completion integration in backend service layer (`backend/src/services/ai/`).
  - Automated task classification, sentiment detection on guest messages, and triage.

### Phase 3: Dashboard & Operations UI
- Staff dispatch dashboard, room status boards, and guest interaction portals built within `frontend/app/`.

---

## 5. Security & Isolation Principles
1. **Secrets Isolation**: No database connection strings or OpenAI secret keys are exposed to the client. All 3rd party secrets remain strictly within server-side environments.
2. **Environment Variables**: Managed uniformly via `.env` configured from `.env.example`.
3. **CORS Isolation**: The Express backend restricts cross-origin resource sharing to the configured `CLIENT_URL`.
