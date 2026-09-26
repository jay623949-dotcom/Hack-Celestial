# RESORT 360 — PostgreSQL Database Architecture (Phase 1B)

> **SINGLE SOURCE OF TRUTH (PERSISTENCE LAYER)**  
> **Location**: `/docs/database.md`

---

## 1. Overview
The Resort 360 persistence layer is designed to model hotel and resort operations with strong relational integrity. It supports real-time operational querying across departments while remaining decoupled from the Express API controllers.

---

## 2. Entity-Relationship Diagram

```
+───────────────────────+
│        resorts        │
+───────────────────────+
│ id (PK)               │
│ name                  │
│ location              │
│ timezone              │
│ total_rooms           │
│ created_at            │
│ updated_at            │
+───────────────────────+
   │      │      │      │      │
   │      │      │      │      ▼
   │      │      │      │   +───────────────────────+
   │      │      │      │   │         staff         │
   │      │      │      │   +───────────────────────+
   │      │      │      │   │ id (PK)               │
   │      │      │      │   │ resort_id (FK)        │
   │      │      │      │   │ name                  │
   │      │      │      │   │ department            │
   │      │      │      │   │ role                  │
   │      │      │      │   │ status                │
   │      │      │      │   +───────────────────────+
   │      │      │      │               │
   │      │      │      ▼               │
   │      │      │   +───────────────────────+
   │      │      │   │       incidents       │
   │      │      │   +───────────────────────+
   │      │      │   │ id (PK)               │
   │      │      │   │ resort_id (FK)        │
   │      │      │   │ title                 │
   │      │      │   │ severity              │
   │      │      │   │ status                │
   │      │      │   │ room_id (FK)          │
   │      │      │   │ guest_id (FK)         │
   │      │      │   +───────────────────────+
   │      │      │               │
   │      │      ▼               ▼
   │      │   +───────────────────────+
   │      │   │         tasks         │
   │      │   +───────────────────────+
   │      │   │ id (PK)               │
   │      │   │ resort_id (FK)        │
   │      │   │ title                 │
   │      │   │ priority              │
   │      │   │ status                │
   │      │   │ assigned_to (FK)      │
   │      │   │ room_id (FK)          │
   │      │   │ incident_id (FK)      │
   │      │   +───────────────────────+
   │      │
   ▼      ▼
+───────────────────────+        +───────────────────────+
│         rooms         │◀───────│        guests         │
+───────────────────────+        +───────────────────────+
│ id (PK)               │        │ id (PK)               │
│ resort_id (FK)        │        │ resort_id (FK)        │
│ number                │        │ name                  │
│ floor                 │        │ vip (BOOLEAN)         │
│ type                  │        │ vip_tier              │
│ status                │        │ room_id (FK)          │
│ guest_id (FK)─────────┼───────▶│ check_in / check_out  │
│ features (JSONB)      │        +───────────────────────+
+───────────────────────+
```

---

## 3. Core Tables

### 3.1 `resorts`
- `id` (VARCHAR(64), Primary Key)
- `name` (VARCHAR(255), Not Null)
- `location` (VARCHAR(255), Not Null)
- `timezone` (VARCHAR(64), Default `'Asia/Kolkata'`)
- `total_rooms` (INTEGER, Default 0)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 3.2 `rooms`
- `id` (VARCHAR(64), Primary Key)
- `resort_id` (VARCHAR(64), Foreign Key -> `resorts.id` ON DELETE CASCADE)
- `number` (VARCHAR(32), Not Null)
- `floor` (INTEGER, Not Null Default 1)
- `type` (VARCHAR(128), Not Null)
- `status` (VARCHAR(64), CHECK IN (`'available'`, `'occupied'`, `'maintenance'`, `'reserved'`, `'dirty'`))
- `housekeeping_status` (VARCHAR(64), CHECK IN (`'clean'`, `'in_progress'`, `'blocked'`))
- `features` (JSONB, Default `'[]'::jsonb`)
- `guest_id` (VARCHAR(64), Foreign Key -> `guests.id` ON DELETE SET NULL)
- `last_cleaned` (TIMESTAMPTZ)

### 3.3 `guests`
- `id` (VARCHAR(64), Primary Key)
- `resort_id` (VARCHAR(64), Foreign Key -> `resorts.id` ON DELETE CASCADE)
- `name` (VARCHAR(255), Not Null)
- `vip` (BOOLEAN, Default FALSE)
- `vip_tier` (VARCHAR(64), Default `'Standard'`)
- `room_id` (VARCHAR(64), Foreign Key -> `rooms.id` ON DELETE SET NULL)
- `check_in`, `check_out` (TIMESTAMPTZ)
- `arrival_type` (VARCHAR(64), Default `'standard'`)
- `notes` (TEXT)

### 3.4 `staff`
- `id` (VARCHAR(64), Primary Key)
- `resort_id` (VARCHAR(64), Foreign Key -> `resorts.id` ON DELETE CASCADE)
- `name` (VARCHAR(255), Not Null)
- `department` (VARCHAR(64), Not Null)
- `role` (VARCHAR(128), Not Null)
- `shift` (VARCHAR(64), Default `'morning'`)
- `status` (VARCHAR(64), CHECK IN (`'on_duty'`, `'busy'`, `'off_duty'`))
- `current_task` (TEXT)

### 3.5 `incidents`
- `id` (VARCHAR(64), Primary Key)
- `resort_id` (VARCHAR(64), Foreign Key -> `resorts.id` ON DELETE CASCADE)
- `title` (VARCHAR(255), Not Null)
- `description` (TEXT)
- `severity` (VARCHAR(32), CHECK IN (`'low'`, `'medium'`, `'high'`, `'critical'`))
- `status` (VARCHAR(32), CHECK IN (`'open'`, `'investigating'`, `'in_progress'`, `'resolved'`, `'closed'`))
- `department` (VARCHAR(64), Default `'general'`)
- `room_id` (VARCHAR(64), Foreign Key -> `rooms.id` ON DELETE SET NULL)
- `guest_id` (VARCHAR(64), Foreign Key -> `guests.id` ON DELETE SET NULL)
- `reported_at` (TIMESTAMPTZ)

### 3.6 `tasks`
- `id` (VARCHAR(64), Primary Key)
- `resort_id` (VARCHAR(64), Foreign Key -> `resorts.id` ON DELETE CASCADE)
- `title` (VARCHAR(255), Not Null)
- `description` (TEXT)
- `department` (VARCHAR(64), Default `'general'`)
- `assigned_to` (VARCHAR(64), Foreign Key -> `staff.id` ON DELETE SET NULL)
- `room_id` (VARCHAR(64), Foreign Key -> `rooms.id` ON DELETE SET NULL)
- `incident_id` (VARCHAR(64), Foreign Key -> `incidents.id` ON DELETE SET NULL)
- `priority` (VARCHAR(32), CHECK IN (`'low'`, `'medium'`, `'high'`, `'critical'`))
- `status` (VARCHAR(32), CHECK IN (`'pending'`, `'in_progress'`, `'completed'`, `'cancelled'`))
- `due_time` (VARCHAR(64))

---

## 4. Operational Indexes
To support high-frequency filtering and dashboard aggregation, the following indexes are defined:
- `rooms`: `idx_rooms_status`, `idx_rooms_resort_id`, `idx_rooms_floor`
- `guests`: `idx_guests_room_id`, `idx_guests_resort_id`, `idx_guests_vip`
- `staff`: `idx_staff_department`, `idx_staff_status`, `idx_staff_resort_id`
- `incidents`: `idx_incidents_status`, `idx_incidents_severity`, `idx_incidents_department`, `idx_incidents_room_id`
- `tasks`: `idx_tasks_status`, `idx_tasks_priority`, `idx_tasks_assigned_to`, `idx_tasks_incident_id`

---

## 5. Migration & Seed Commands

### Run Schema Migrations:
```bash
cd backend
npm run db:migrate
```
*Executes `database/migrations/001_initial_schema.sql` inside a safe transaction.*

### Seed Database:
```bash
cd backend
npm run db:seed
```
*Populates the database from `/phase-1/demo-data.json` preserving relational integrity across 20 rooms, guests, staff, incidents, and tasks.*

### Reset Database (Development Only):
```bash
cd backend
npm run db:reset
npm run db:migrate
npm run db:seed
```
