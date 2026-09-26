-- ==================================================
-- RESORT 360 - Action Plan Execution Schema Migration
-- Migration: 004_action_plan_executions.sql
-- Phase 5: Approved Plan -> Execution Engine -> Dispatched Tasks
-- ==================================================

-- ── 1. Action Plan Executions Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_action_plan_executions (
    id VARCHAR(64) PRIMARY KEY,                         -- e.g. exec-plan-vip-arrival
    action_plan_id VARCHAR(64) NOT NULL REFERENCES ai_action_plans(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'running',      -- running | completed | partial | failed
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    failed_tasks INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(32) NOT NULL DEFAULT 'execution_engine',
    CONSTRAINT check_exec_status CHECK (status IN ('pending', 'running', 'completed', 'partial', 'failed'))
);

-- ── 2. Add Traceability to Operational Tasks Table ───────────────────────────
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS action_plan_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS action_plan_item_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- ── 3. Action Plan Execution Events Timeline ─────────────────────────────────
-- Persists live timeline entries so they survive page refresh and provide auditability
CREATE TABLE IF NOT EXISTS ai_action_plan_execution_events (
    id VARCHAR(64) PRIMARY KEY,
    execution_id VARCHAR(64) NOT NULL REFERENCES ai_action_plan_executions(id) ON DELETE CASCADE,
    action_plan_id VARCHAR(64) NOT NULL,
    task_id VARCHAR(64),
    event_type VARCHAR(64) NOT NULL,                    -- execution.started, task.dispatched, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(64),
    staff_id VARCHAR(64),
    room_id VARCHAR(64),
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exec_plan ON ai_action_plan_executions(action_plan_id);
CREATE INDEX IF NOT EXISTS idx_exec_status ON ai_action_plan_executions(status);
CREATE INDEX IF NOT EXISTS idx_exec_events_exec ON ai_action_plan_execution_events(execution_id);
CREATE INDEX IF NOT EXISTS idx_exec_events_created ON ai_action_plan_execution_events(created_at ASC);
