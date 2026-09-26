-- ==================================================
-- RESORT 360 - PostgreSQL Schema Migration
-- Migration: 001_initial_schema.sql
-- ==================================================

-- 1. Resorts Table
CREATE TABLE IF NOT EXISTS resorts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
    total_rooms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    resort_id VARCHAR(64) REFERENCES resorts(id) ON DELETE CASCADE,
    number VARCHAR(32) NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    type VARCHAR(128) NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'reserved', 'dirty'
    housekeeping_status VARCHAR(64) DEFAULT 'clean', -- 'clean', 'in_progress', 'blocked'
    features JSONB DEFAULT '[]'::jsonb,
    guest_id VARCHAR(64),
    last_cleaned TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_room_status CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'dirty')),
    CONSTRAINT check_housekeeping_status CHECK (housekeeping_status IN ('clean', 'in_progress', 'blocked'))
);

-- 3. Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id VARCHAR(64) PRIMARY KEY,
    resort_id VARCHAR(64) REFERENCES resorts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    vip BOOLEAN DEFAULT FALSE,
    vip_tier VARCHAR(64) DEFAULT 'Standard',
    room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    arrival_type VARCHAR(64) DEFAULT 'standard',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add guest_id foreign key to rooms now that guests table exists
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS fk_rooms_guest;
ALTER TABLE rooms ADD CONSTRAINT fk_rooms_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL;

-- 4. Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(64) PRIMARY KEY,
    resort_id VARCHAR(64) REFERENCES resorts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(64) NOT NULL, -- 'front_desk', 'housekeeping', 'maintenance', 'revenue', 'guest_services', 'security'
    role VARCHAR(128) NOT NULL,
    shift VARCHAR(64) DEFAULT 'morning',
    status VARCHAR(64) NOT NULL DEFAULT 'on_duty', -- 'on_duty', 'busy', 'off_duty'
    current_task TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_staff_status CHECK (status IN ('on_duty', 'busy', 'off_duty'))
);

-- 5. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    resort_id VARCHAR(64) REFERENCES resorts(id) ON DELETE CASCADE,
    type VARCHAR(64) DEFAULT 'operational',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(32) NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'in_progress', 'resolved', 'closed'
    department VARCHAR(64) DEFAULT 'general',
    room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
    guest_id VARCHAR(64) REFERENCES guests(id) ON DELETE SET NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_incident_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT check_incident_status CHECK (status IN ('open', 'investigating', 'in_progress', 'resolved', 'closed'))
);

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    resort_id VARCHAR(64) REFERENCES resorts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(64) DEFAULT 'general',
    assigned_to VARCHAR(64) REFERENCES staff(id) ON DELETE SET NULL,
    room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    due_at TIMESTAMP WITH TIME ZONE,
    due_time VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_task_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT check_task_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- ==================================================
-- INDEXES FOR OPERATIONAL TELEMETRY & QUERIES
-- ==================================================

-- Rooms Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_resort_id ON rooms(resort_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor);

-- Guests Indexes
CREATE INDEX IF NOT EXISTS idx_guests_room_id ON guests(room_id);
CREATE INDEX IF NOT EXISTS idx_guests_resort_id ON guests(resort_id);
CREATE INDEX IF NOT EXISTS idx_guests_vip ON guests(vip);

-- Staff Indexes
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_resort_id ON staff(resort_id);

-- Incidents Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_department ON incidents(department);
CREATE INDEX IF NOT EXISTS idx_incidents_room_id ON incidents(room_id);
CREATE INDEX IF NOT EXISTS idx_incidents_resort_id ON incidents(resort_id);

-- Tasks Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_incident_id ON tasks(incident_id);
CREATE INDEX IF NOT EXISTS idx_tasks_resort_id ON tasks(resort_id);
