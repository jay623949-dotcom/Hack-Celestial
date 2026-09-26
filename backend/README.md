# RESORT 360 — Backend API (Phase 1)

Foundational REST API and operational data layer for Resort 360, built with Node.js, Express.js, and pure JavaScript.

---

## 1. Overview
The Phase 1 backend provides an in-memory, relationally consistent operational data layer loaded directly from [`/phase-1/demo-data.json`](file:///c:/Web%20Devlopment/HackathonProject/resort360/phase-1/demo-data.json). It allows the system to answer the central operational question:

> **"What is happening inside the resort right now?"**

### Architectural Pipeline
```
HTTP Request
     │
     ▼
Route (`src/routes/*.routes.js`)
     │
     ▼
Controller (`src/controllers/*.controller.js`)
     │
     ▼
Service Layer (`src/services/*.js`)
     │
     ▼
Data Layer (`src/data/dataStore.js` initialized from `phase-1/demo-data.json`)
```

---

## 2. Installation & Quickstart

### Prerequisites
- Node.js v18+ (tested on Node v22.14.0)
- npm

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy the environment template:
```bash
cp .env.example .env
```
Default environment variables:
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run the Development Server
```bash
npm run dev
# or for production mode:
npm start
```
The server will boot on port `5000` with logging enabled:
```
[DataStore] Loaded 20 rooms, 5 guests, 10 staff, 6 incidents, 15 tasks.
[Resort 360 Backend] Server running on port 5000 in development mode
[Resort 360 Backend] Base API endpoint: http://localhost:5000/api/v1
[Resort 360 Backend] Health check: http://localhost:5000/api/v1/health
[Resort 360 Backend] Operations summary: http://localhost:5000/api/v1/operations/summary
```

---

## 3. API Base URL
All API endpoints are namespaced under:
```
http://localhost:5000/api/v1
```

---

## 4. Endpoints & Filter Reference

### 4.1 System & Health
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Returns health status and service tag. |
| `GET` | `/api/v1/operations/summary` | Real-time dynamically calculated operational summary. |

### 4.2 Rooms (`/api/v1/rooms`)
| Method | Endpoint | Description & Supported Filters |
| :--- | :--- | :--- |
| `GET` | `/api/v1/rooms` | Retrieve all rooms. Filters: `?status=available`, `?type=Suite`, `?floor=4` |
| `GET` | `/api/v1/rooms/:id` | Retrieve single room by ID (e.g., `/api/v1/rooms/room-401`). |
| `POST` | `/api/v1/rooms` | Create a new room. Body requires `number`, `type`, `status`. |
| `PATCH` | `/api/v1/rooms/:id` | Update existing room fields. |

### 4.3 Guests (`/api/v1/guests`)
| Method | Endpoint | Description & Supported Filters |
| :--- | :--- | :--- |
| `GET` | `/api/v1/guests` | Retrieve all guests. Filters: `?vip=true`, `?room_id=room-203` |
| `GET` | `/api/v1/guests/:id` | Retrieve single guest by ID (e.g., `/api/v1/guests/guest-001`). |
| `POST` | `/api/v1/guests` | Register guest. Body requires `name`. Validates `room_id` existence. |
| `PATCH` | `/api/v1/guests/:id` | Update guest information. Validates `room_id` if updated. |

### 4.4 Staff (`/api/v1/staff`)
| Method | Endpoint | Description & Supported Filters |
| :--- | :--- | :--- |
| `GET` | `/api/v1/staff` | Retrieve all staff. Filters: `?department=maintenance`, `?status=on_duty` |
| `GET` | `/api/v1/staff/:id` | Retrieve single staff member by ID (e.g., `/api/v1/staff/staff-005`). |
| `POST` | `/api/v1/staff` | Add staff. Body requires `name`, `department`, `status`. |
| `PATCH` | `/api/v1/staff/:id` | Update staff status or role. |

### 4.5 Incidents (`/api/v1/incidents`)
| Method | Endpoint | Description & Supported Filters |
| :--- | :--- | :--- |
| `GET` | `/api/v1/incidents` | Retrieve all incidents. Filters: `?status=open`, `?severity=critical`, `?department=maintenance`, `?room_id=room-401` |
| `GET` | `/api/v1/incidents/:id` | Retrieve incident details. |
| `POST` | `/api/v1/incidents` | Report an incident. Requires `title`, `severity`, `status`. Validates `room_id` and `guest_id`. |
| `PATCH` | `/api/v1/incidents/:id` | Update incident status (e.g., `resolved`). |

### 4.6 Tasks (`/api/v1/tasks`)
| Method | Endpoint | Description & Supported Filters |
| :--- | :--- | :--- |
| `GET` | `/api/v1/tasks` | Retrieve all tasks. Filters: `?status=pending`, `?department=housekeeping`, `?priority=high`, `?assigned_to=staff-005`, `?incident_id=incident-002` |
| `GET` | `/api/v1/tasks/:id` | Retrieve single task. |
| `POST` | `/api/v1/tasks` | Create task. Requires `title`, `priority`, `status`. Validates `assigned_to`, `incident_id`, `room_id`. |
| `PATCH` | `/api/v1/tasks/:id` | Update task status (`in_progress`, `completed`). |

---

## 5. Standardized Response Format

### Single Resource (Success 200 / 201)
```json
{
  "success": true,
  "data": {
    "id": "room-401",
    "number": "401",
    "floor": 4,
    "type": "Suite",
    "status": "maintenance"
  }
}
```

### Resource List (Success 200)
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "count": 20
  }
}
```

### Error Response (400 / 404 / 500)
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Room with ID 'room-999' not found"
  }
}
```

---

## 6. The "Killer Demo" Scenario Test
To verify the 10:40 AM VIP arrival + AC breakdown operational state:

1. **Check Incidents**:
   ```bash
   curl http://localhost:5000/api/v1/incidents?status=open
   ```
   *Returns incident #001 (AC breakdown in Room 401) and incident #003 (VIP early arrival).*

2. **Check Available Rooms**:
   ```bash
   curl http://localhost:5000/api/v1/rooms?status=available
   ```
   *Returns Room 505 and other available suites.*

3. **Check On-Duty Staff**:
   ```bash
   curl http://localhost:5000/api/v1/staff?status=on_duty
   ```
   *Returns available Housekeeping attendants Maria Santos and Elena Gomez, and Technician Bob Miller.*

4. **Check Real-Time Operational Summary**:
   ```bash
   curl http://localhost:5000/api/v1/operations/summary
   ```

---

## 7. Automated Testing
Run the automated test suite testing all 26 verification requirements (including filtering, validation, and relationship checks):
```bash
npm test
```
All 50 automated assertions should pass with 0 failures.
