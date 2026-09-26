-- ==================================================
-- RESORT 360 - Manager Decision & Audit Trail Schema
-- Migration: 003_action_plan_decisions.sql
-- Human-in-the-Loop Decision Control & Explainability
-- ==================================================

-- ── 1. Update ai_action_plans Table Constraints & Columns ────────────────────
-- Ensure action plans support the full manager lifecycle:
-- pending_review | pending_approval | modified_pending_approval | approved | rejected | in_progress | completed | cancelled

ALTER TABLE ai_action_plans 
    ADD COLUMN IF NOT EXISTS original_plan JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS modified_plan JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS modification_reason TEXT,
    ADD COLUMN IF NOT EXISTS rejected_by TEXT,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Drop old check constraint if it exists and add expanded lifecycle constraint
ALTER TABLE ai_action_plans DROP CONSTRAINT IF EXISTS check_plan_status;
ALTER TABLE ai_action_plans ADD CONSTRAINT check_plan_status 
    CHECK (status IN (
        'pending_review',
        'pending_approval',
        'modified_pending_approval',
        'approved',
        'rejected',
        'in_progress',
        'completed',
        'cancelled'
    ));

-- ── 2. Update ai_action_plan_items Table ─────────────────────────────────────
ALTER TABLE ai_action_plan_items DROP CONSTRAINT IF EXISTS check_item_status;
ALTER TABLE ai_action_plan_items ADD CONSTRAINT check_item_status
    CHECK (status IN (
        'pending_review',
        'pending_approval',
        'approved',
        'in_progress',
        'completed',
        'cancelled'
    ));

-- ── 3. Action Plan Decisions & Audit Trail ───────────────────────────────────
-- Records every human manager interaction (approve, reject, modify, progress update).
-- Immutable append-only log.
CREATE TABLE IF NOT EXISTS ai_action_plan_decisions (
    id VARCHAR(64) PRIMARY KEY,
    action_plan_id VARCHAR(64) NOT NULL REFERENCES ai_action_plans(id) ON DELETE CASCADE,
    actor_id VARCHAR(64) NOT NULL,                      -- e.g. admin@resort360.demo
    actor_role VARCHAR(64) NOT NULL DEFAULT 'admin',    -- admin | front_desk_manager | etc.
    decision VARCHAR(32) NOT NULL,                      -- approve | reject | modify | status_change
    reason TEXT,                                        -- mandatory for reject & modify
    previous_status VARCHAR(32) NOT NULL,
    new_status VARCHAR(32) NOT NULL,
    changes JSONB DEFAULT '{}'::jsonb,                  -- stores original vs modified diffs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(32) NOT NULL DEFAULT 'human_decision',
    CONSTRAINT check_decision_type CHECK (decision IN ('approve', 'reject', 'modify', 'status_change'))
);

CREATE INDEX IF NOT EXISTS idx_ai_decisions_plan ON ai_action_plan_decisions(action_plan_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_actor ON ai_action_plan_decisions(actor_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created ON ai_action_plan_decisions(created_at DESC);
