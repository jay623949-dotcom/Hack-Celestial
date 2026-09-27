-- ==================================================
-- RESORT 360 - AI Persistence Schema Migration
-- Migration: 002_ai_persistence.sql
-- Phase 3.3 - Persist agent decisions and action plans
--
-- IMPORTANT: Records in these tables are AI-GENERATED.
-- They are explicitly separated from operational source data
-- (resorts, rooms, guests, staff, incidents, tasks).
-- Every table carries a source_type marker = 'ai_generated'.
-- ==================================================

-- ── 1. AI Analysis Runs ──────────────────────────────────────────────────────
-- Tracks each end-to-end orchestration run.
-- One run = one trigger → context → agents → consensus → action plan.
CREATE TABLE IF NOT EXISTS ai_analysis_runs (
    id VARCHAR(64) PRIMARY KEY,                         -- matches context_id pattern
    context_id VARCHAR(64) NOT NULL,
    trigger_type VARCHAR(64) NOT NULL DEFAULT 'manual', -- e.g. vip_arrival, multiple_incidents
    trigger_payload JSONB DEFAULT '{}'::jsonb,          -- full trigger object
    status VARCHAR(32) NOT NULL DEFAULT 'running',      -- running | completed | partial | failed
    agent_count INTEGER DEFAULT 0,
    agents_completed INTEGER DEFAULT 0,
    agents_failed INTEGER DEFAULT 0,
    provider VARCHAR(64) DEFAULT 'local',               -- gemini | openai | local
    duration_ms INTEGER,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    source_type VARCHAR(32) NOT NULL DEFAULT 'ai_generated',
    CONSTRAINT check_run_status CHECK (status IN ('running', 'completed', 'partial', 'failed'))
);

-- ── 2. Agent Decisions ────────────────────────────────────────────────────────
-- Stores each departmental agent's structured output.
-- One row per agent per analysis run.
CREATE TABLE IF NOT EXISTS ai_agent_decisions (
    id VARCHAR(64) PRIMARY KEY,
    analysis_run_id VARCHAR(64) NOT NULL REFERENCES ai_analysis_runs(id) ON DELETE CASCADE,
    agent_type VARCHAR(64) NOT NULL,                    -- front_desk | housekeeping | maintenance | revenue
    status VARCHAR(32) NOT NULL DEFAULT 'completed',    -- completed | failed | skipped
    assessment_summary TEXT,
    assessment_priority VARCHAR(32),
    observations JSONB DEFAULT '[]'::jsonb,             -- array of observation strings
    constraints JSONB DEFAULT '[]'::jsonb,              -- array of constraint strings
    recommendations JSONB DEFAULT '[]'::jsonb,          -- full structured recommendation array
    confidence NUMERIC(4,3) DEFAULT 0,                  -- 0.000 to 1.000
    duration_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(32) NOT NULL DEFAULT 'ai_generated',
    CONSTRAINT check_agent_type CHECK (agent_type IN ('front_desk', 'housekeeping', 'maintenance', 'revenue')),
    CONSTRAINT check_agent_status CHECK (status IN ('completed', 'failed', 'skipped')),
    CONSTRAINT check_agent_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

-- ── 3. Consensus Results ──────────────────────────────────────────────────────
-- Stores the orchestrated consensus output for an analysis run.
-- One row per analysis run (1:1 relationship).
CREATE TABLE IF NOT EXISTS ai_consensus_results (
    id VARCHAR(64) PRIMARY KEY,                         -- matches consensus_id
    analysis_run_id VARCHAR(64) NOT NULL REFERENCES ai_analysis_runs(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',
    agreements JSONB DEFAULT '[]'::jsonb,               -- array of agreement strings/objects
    conflicts JSONB DEFAULT '[]'::jsonb,                -- array of conflict objects
    recommendations JSONB DEFAULT '[]'::jsonb,          -- coordinated recommendations array
    is_fallback BOOLEAN DEFAULT FALSE,                  -- true = deterministic fallback used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(32) NOT NULL DEFAULT 'ai_generated',
    UNIQUE (analysis_run_id)
);

-- ── 4. Action Plans ───────────────────────────────────────────────────────────
-- Top-level action plan attached to a consensus result.
CREATE TABLE IF NOT EXISTS ai_action_plans (
    id VARCHAR(64) PRIMARY KEY,                         -- matches action_plan_id
    analysis_run_id VARCHAR(64) NOT NULL REFERENCES ai_analysis_runs(id) ON DELETE CASCADE,
    consensus_id VARCHAR(64) REFERENCES ai_consensus_results(id) ON DELETE SET NULL,
    context_id VARCHAR(64) NOT NULL,
    summary TEXT,
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',
    requires_human_approval BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending_approval',
    approved_by TEXT,                                   -- free text — manager name or identifier
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(32) NOT NULL DEFAULT 'ai_generated',
    CONSTRAINT check_plan_status CHECK (status IN ('pending_approval', 'approved', 'rejected', 'cancelled'))
);

-- ── 5. Action Plan Items ──────────────────────────────────────────────────────
-- Individual executable steps within an action plan.
CREATE TABLE IF NOT EXISTS ai_action_plan_items (
    id VARCHAR(64) PRIMARY KEY,
    action_plan_id VARCHAR(64) NOT NULL REFERENCES ai_action_plans(id) ON DELETE CASCADE,
    action_type VARCHAR(128),                           -- e.g. dispatch_maintenance, guest_amenity_courtesy
    description TEXT NOT NULL,
    department VARCHAR(64),
    assigned_staff VARCHAR(64),                         -- staff ID — nullable (may not exist in operational tables)
    room_id VARCHAR(64),                                -- room ID — nullable
    guest_id VARCHAR(64),                               -- guest ID — nullable
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',
    status VARCHAR(32) NOT NULL DEFAULT 'pending_approval',
    estimated_duration_minutes INTEGER,
    sequence_order INTEGER NOT NULL DEFAULT 0,          -- ordering within plan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(32) NOT NULL DEFAULT 'ai_generated',
    CONSTRAINT check_item_status CHECK (status IN ('pending_approval', 'approved', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT check_item_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ai_runs_status ON ai_analysis_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_runs_trigger ON ai_analysis_runs(trigger_type);
CREATE INDEX IF NOT EXISTS idx_ai_runs_started ON ai_analysis_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_decisions_run ON ai_agent_decisions(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_agent ON ai_agent_decisions(agent_type);

CREATE INDEX IF NOT EXISTS idx_ai_consensus_run ON ai_consensus_results(analysis_run_id);

CREATE INDEX IF NOT EXISTS idx_ai_plans_run ON ai_action_plans(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_ai_plans_status ON ai_action_plans(status);

CREATE INDEX IF NOT EXISTS idx_ai_items_plan ON ai_action_plan_items(action_plan_id);
CREATE INDEX IF NOT EXISTS idx_ai_items_order ON ai_action_plan_items(action_plan_id, sequence_order);
