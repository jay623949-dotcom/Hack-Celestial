# Resort 360 — Production Deployment & Configuration Guide

This guide details the complete productionization and deployment architecture for **Resort 360: The Autonomous Multi-Agent Hospitality Operating System**.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   Vercel Deployment         |
                      |   (Next.js Frontend)        |
                      +--------------+--------------+
                                     |
               HTTPS REST API        |   WSS Realtime Socket.IO
                     +---------------+---------------+
                     |                               |
                     v                               v
        +----------------------------+  +----------------------------+
        |  Render Web Service        |  |  Render PostgreSQL        |
        |  (Express.js Backend API)  +->|  (Relational Database)     |
        +--------------+-------------+  +----------------------------+
                       |
                       v
        +----------------------------+
        |   Grok AI (xAI API)        |
        |   model: grok-2-latest     |
        |   (Backend Only)           |
        +----------------------------+
```

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Socket.IO Client $\rightarrow$ Deployed on **Vercel**
- **Backend**: Express.js 4, Node.js 18+, Socket.IO Server $\rightarrow$ Deployed on **Render** (Web Service)
- **Database**: PostgreSQL with connection pooling & automated SSL handling $\rightarrow$ Deployed on **Render PostgreSQL** (or Supabase/Neon)
- **AI Intelligence**: Grok-2 (`grok-2-latest` via xAI API) with Gemma 2 local fallback and deterministic domain fallback $\rightarrow$ Strictly backend-contained

---

## A. Local Development

### Prerequisites
- Node.js 18.x or 20.x
- npm 9+
- (Optional) Local PostgreSQL 14+ or Docker PostgreSQL

### 1. Clone & Install Dependencies
```bash
# In project root
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Local Environment Variables
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/resort360
DATABASE_SSL=false
XAI_API_KEY=xai-your-api-key-here
AI_PROVIDER=grok
GROK_MODEL=grok-2-latest
JWT_SECRET=dev-jwt-secret-key-360
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 3. Run Locally
**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## B. Database Setup

### 1. Provision PostgreSQL
Create a PostgreSQL instance on **Render** (New $\rightarrow$ PostgreSQL) or use an existing PostgreSQL database.
- Database Name: `resort360`
- User: `resort360_user`

### 2. Set Connection String
Copy the **External Connection String** (or internal connection string if deploying backend within the same Render private network):
```
postgres://resort360_user:password@dpg-xxxxx-a.oregon-postgres.render.com/resort360
```

### 3. Run Schema Migrations
From your local environment or Render build step:
```bash
cd backend
DATABASE_URL="postgres://..." npm run db:migrate
```
*Applies:*
1. `001_initial_schema.sql` (resorts, rooms, guests, staff, incidents, tasks)
2. `002_ai_persistence.sql` (orchestration runs & consensus history)
3. `003_action_plan_decisions.sql` (human review & manager approvals)
4. `004_action_plan_executions.sql` (real-time task telemetry)

### 4. Seed Canonical Demo Dataset
```bash
cd backend
DATABASE_URL="postgres://..." npm run db:seed
```
*Seeds:* 20 rooms, Diamond VIP guests, multi-department staff, Room 401 HVAC compressor incident, and pre-scheduled tasks.

---

## C. Backend Deployment to Render

### 1. Create a New Web Service
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `resort360-backend`
   - **Root Directory**: `backend` (or leave blank if running from root with `cd backend`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js` (or `npm start`)
   - **Plan**: Free or Starter

### 2. Configure Environment Variables on Render
Add the following in the **Environment** tab:

| Variable | Recommended Value | Note |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security & logging |
| `PORT` | `10000` | Render injects this automatically |
| `FRONTEND_URL` | `https://your-resort360.vercel.app` | Vercel production frontend domain |
| `DATABASE_URL` | `postgres://user:pass@host/resort360` | Render PostgreSQL connection string |
| `DATABASE_SSL` | `true` | Enforces SSL with rejectUnauthorized: false |
| `XAI_API_KEY` | `xai-xxxxxxxxxxxx` | Grok API Key (Backend only) |
| `AI_PROVIDER` | `grok` | Primary model route |
| `GROK_MODEL` | `grok-2-latest` | Grok LLM model tag |
| `JWT_SECRET` | `generate-a-strong-random-32-byte-hex` | Session / token signing secret |
| `ALLOW_VERCEL_PREVIEWS` | `true` | Allows preview pull request branches |

### 3. Health Check Path
- In Render service settings, set **Health Check Path** to: `/health`

---

## D. Frontend Deployment to Vercel

### 1. Import Project to Vercel
1. In Vercel Dashboard, click **Add New...** $\rightarrow$ **Project**.
2. Select your repository.
3. Configure the project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 2. Configure Environment Variables on Vercel
Add the following in Vercel **Project Settings $\rightarrow$ Environment Variables**:

| Variable | Value | Scope |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://resort360-backend.onrender.com/api/v1` | Production, Preview, Dev |
| `NEXT_PUBLIC_WS_URL` | `https://resort360-backend.onrender.com` | Production, Preview, Dev |

*(Replace `https://resort360-backend.onrender.com` with your actual Render service URL).*

### 3. Deploy
Click **Deploy**. Vercel will build and assign your production URL (e.g., `https://resort360.vercel.app`).

---

## E. CORS Configuration

The backend dynamically checks origins against `FRONTEND_URL` and `CLIENT_URL`.
- **Development**: Permits `localhost` on any port (`3000`, `3001`, `5000`, `5173`).
- **Production**: Strictly permits configured `FRONTEND_URL` and `*.vercel.app` if `ALLOW_VERCEL_PREVIEWS=true`.
- **Credentials**: Allowed (`credentials: true`), using explicit origins (never `*`).

---

## F. WebSocket / Socket.IO Configuration

- **Client Configuration** (`frontend/lib/config.js`):
  Uses `process.env.NEXT_PUBLIC_WS_URL || BACKEND_URL`. Connects with WebSocket transport fallback to long-polling.
- **Server Configuration** (`backend/src/services/socket.service.js`):
  CORS origin matching allows the Vercel domain to establish WebSocket handshakes with credentials.
- **Real-Time Execution Pipeline**:
  ```
  Manager approves plan
          ↓
  POST /api/v1/action-plans/:id/approve
          ↓
  Backend triggers execution loop
          ↓
  Socket.IO emits 'task:start', 'task:progress', 'task:complete'
          ↓
  Frontend execution view updates live in real-time
  ```

---

## G. Grok API Security

- The Grok API key (`XAI_API_KEY`) is stored strictly in the backend `.env` on Render.
- No `NEXT_PUBLIC_XAI_API_KEY` exists in the frontend code or build bundle.
- If Grok API credits are depleted or the service is temporarily unreachable:
  - The backend catches the error.
  - Tries local Gemma 2 if configured.
  - Automatically falls back to deterministic hospitality domain intelligence rules.
  - The dashboard, multi-agent view, and consensus engines remain 100% stable and operational.

---

## H. Production Verification Checklist

1. **Backend Health Check**:
   ```bash
   curl https://your-backend.onrender.com/health
   # Expected: {"status":"ok","service":"resort360-backend","environment":"production","database":"connected",...}
   ```
2. **Operations Summary**:
   ```bash
   curl https://your-backend.onrender.com/api/v1/operations/summary
   # Expected: HTTP 200 with resort counts, rooms, staff, incidents
   ```
3. **Frontend Application**:
   - Navigate to `https://your-resort360.vercel.app/login`
   - Sign in as **General Manager (Admin)**
   - Dashboard loads with live room grid and KPI counters
   - Navigate to `/dashboard/consensus`
   - Trigger Multi-Agent Swarm Analysis
   - Click "Approve & Execute Action Plan"
   - Execution timeline streams real-time updates via Socket.IO
