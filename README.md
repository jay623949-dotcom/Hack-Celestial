# RESORT 360

> **AI-Powered Resort Operations Platform**  
> Unifying guest hospitality, operational task dispatch, and smart resort analytics.

---

## 1. Problem Statement
Resort operations often face fragmented communication across front desk, housekeeping, concierge, and maintenance teams. **RESORT 360** bridges this gap using intelligent orchestration, real-time messaging, and actionable operations dashboards.

---

## 2. Technology Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Node.js, Express.js, CORS, Dotenv
- **Database (Planned)**: PostgreSQL / Supabase
- **AI Automation (Planned)**: OpenAI API
- **Real-Time (Planned)**: Socket.IO / WebSockets

---

## 3. High-Level Architecture

```
Next.js (Port 3000)  <--->  Express.js (Port 5000)  <--->  PostgreSQL / Supabase (Planned)
                                   │
                                   ├──> OpenAI API (Planned)
                                   └──> Socket.IO (Planned)
```

See [docs/architecture.md](docs/architecture.md) for full architectural details and phased expansion roadmap.

---

## 4. Repository Structure (Monorepo)

```
resort360/
├── frontend/                  # Next.js App Router Client
│   ├── app/                   # App Router pages and layout
│   │   ├── globals.css        # Tailwind CSS imports
│   │   ├── layout.js          # Root HTML layout
│   │   └── page.js            # Landing page (Phase 0 proof)
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility helpers and API client
│   ├── public/                # Static assets
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── postcss.config.js      # PostCSS configuration
│   ├── next.config.js         # Next.js configuration
│   └── package.json           # Frontend dependencies
│
├── backend/                   # Express.js REST API Server
│   ├── src/
│   │   ├── config/            # Centralized environment configs
│   │   ├── controllers/       # Request handlers (e.g., healthController.js)
│   │   ├── middleware/        # Error & route handlers
│   │   ├── routes/            # Express routers (e.g., healthRoutes.js)
│   │   ├── services/          # Business logic layer
│   │   └── server.js          # Express app entrypoint
│   └── package.json           # Backend dependencies
│
├── docs/                      # Documentation
│   └── architecture.md        # Architecture specification
│
├── .env.example               # Environment variables template
├── .gitignore                 # Root ignore rules (node_modules, .env, .next, etc.)
├── README.md                  # This file
└── package.json               # Root scripts (concurrent dev runner)
```

---

## 5. Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.x or later (tested on v24.x)
- **npm**: v9.x or later

### Step 1: Clone Repository & Switch to `develop`
```bash
git clone <repository-url>
cd resort360
git checkout develop
```

### Step 2: Install Dependencies
You can install dependencies for all workspaces at once from the root:
```bash
npm run install:all
```
*Or install separately:*
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` into your environment:
```bash
cp .env.example .env
```
*(Optionally copy to `backend/.env` or `frontend/.env.local` as needed).*

---

## 6. Running the Project

### Option A: Run Both Together (Recommended)
From the root directory:
```bash
npm run dev
```
This runs both the backend (`http://localhost:5000`) and frontend (`http://localhost:3000`) concurrently.

### Option B: Run Services Independently

- **Frontend Only**:
  ```bash
  cd frontend
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000).

- **Backend Only**:
  ```bash
  cd backend
  npm run dev
  ```
  Health check is available at [http://localhost:5000/health](http://localhost:5000/health).

---

## 7. Environment Variables Breakdown

| Variable | Target | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL for REST API requests | `http://localhost:5000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Frontend | Base URL for WebSocket connection | `http://localhost:5000` |
| `PORT` | Backend | HTTP Port Express listens on | `5000` |
| `NODE_ENV` | Backend | Environment flag | `development` / `production` |
| `CLIENT_URL` | Backend | Allowed CORS origin | `http://localhost:3000` |
| `DATABASE_URL` | Backend | PostgreSQL connection string | `postgresql://...` |
| `SUPABASE_URL` | Backend | Supabase API endpoint | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Backend | Supabase Public Anon Key | `ey...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Supabase Service Role Key | `ey...` |
| `OPENAI_API_KEY` | Backend | OpenAI Secret API key | `sk-...` |

> **Security Rule**: NEVER commit real credentials or `.env` files to git.

---

## 8. Git Workflow & Branch Strategy

```
main (Production / Demo Ready)
└── develop (Integration branch)
    ├── feature/frontend-dashboard
    ├── feature/backend-api
    ├── feature/database
    ├── feature/ai-agents
    └── feature/realtime
```

### Team Branching Rules:
1. **Never commit directly to `main` or `develop`**.
2. Create a new branch off `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```
3. Keep commits atomic and meaningful.
4. When finished, open a Pull Request against `develop`.

---

## 9. Team Responsibilities

| Member | Focus Area | Initial Feature Branch |
| :--- | :--- | :--- |
| **Neel** | Phase 0 Setup / Core Architecture | `develop` (Foundation) |
| **Jay Doshi** | Frontend Application & Dashboard | `feature/frontend-dashboard` |
| **Krutarth Rao** | Express API & Controllers | `feature/backend-api` |
| **Nakool** | Database & Supabase Schema | `feature/database` |
| **Nairit Shah** | AI Agents & Real-Time Socket | `feature/ai-agents` / `feature/realtime` |

---

## 10. Development Rules
- **No Over-Engineering**: Keep components simple and modular.
- **Consistency**: Follow existing folder conventions (`routes`, `controllers`, `services`, `components`).
- **Security**: Double check that no tokens or connection strings are committed.
