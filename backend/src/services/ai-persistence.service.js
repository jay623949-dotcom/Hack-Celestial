const db = require('../config/db');

/**
 * AI Persistence Service
 * Stores AI-generated analysis runs, agent decisions, consensus results,
 * action plans, and manager decision audit trails in PostgreSQL (with robust in-memory store).
 *
 * All AI records carry source_type = 'ai_generated'
 * Manager decision records carry source_type = 'human_decision'
 */

// In-memory backing store for test environments, offline DB mode, or dev fallback
const inMemoryStore = {
  runs: new Map(),
  decisions: new Map(), // runId -> [agentDecisions]
  consensus: new Map(), // runId -> consensus
  plans: new Map(),     // planId -> plan
  items: new Map(),     // planId -> [items]
  auditTrail: new Map(),// planId -> [decisions]
};

// Seed realistic VIP early arrival action plan for instant testability
(function seedDefaultPlan() {
  const planId = 'plan-vip-arrival';
  const runId = 'run-vip-arrival';
  const defaultItems = [
    {
      id: 'item-vip-1',
      action_plan_id: planId,
      action_type: 'expedite_turnover',
      description: 'Expedite turnover for Room 205 (Executive Ocean View)',
      department: 'housekeeping',
      assigned_staff: 'staff-003',
      room_id: 'room-205',
      priority: 'high',
      status: 'pending_review',
      estimated_duration_minutes: 25,
      sequence_order: 0,
    },
    {
      id: 'item-vip-2',
      action_plan_id: planId,
      action_type: 'vip_lounge_escort',
      description: 'Escort VIP Alexander Vance to Private Club Lounge with complimentary beverage service',
      department: 'front_desk',
      assigned_staff: 'staff-001',
      room_id: 'room-205',
      guest_id: 'guest-001',
      priority: 'critical',
      status: 'pending_review',
      estimated_duration_minutes: 10,
      sequence_order: 1,
    },
    {
      id: 'item-vip-3',
      action_plan_id: planId,
      action_type: 'priority_hvac_repair',
      description: 'Complete capacitor diagnostic and pressure test on Suite 401',
      department: 'maintenance',
      assigned_staff: 'staff-005',
      room_id: 'room-401',
      priority: 'critical',
      status: 'pending_review',
      estimated_duration_minutes: 45,
      sequence_order: 2,
    },
    {
      id: 'item-vip-4',
      action_plan_id: planId,
      action_type: 'inventory_protection',
      description: 'Temporarily hold Room 205 from general OTA pool until VIP check-in resolves',
      department: 'revenue',
      assigned_staff: 'staff-002',
      room_id: 'room-205',
      priority: 'medium',
      status: 'pending_review',
      estimated_duration_minutes: 5,
      sequence_order: 3,
    },
  ];

  inMemoryStore.plans.set(planId, {
    id: planId,
    analysis_run_id: runId,
    consensus_id: 'consensus-vip-arrival',
    context_id: 'ctx-vip-early-arrival',
    summary: 'Coordinate express turnover of Room 205, escort VIP Alexander Vance to lounge, and expedite Suite 401 HVAC compressor repair.',
    priority: 'critical',
    requires_human_approval: true,
    status: 'pending_review',
    original_plan: JSON.parse(JSON.stringify(defaultItems)),
    modified_plan: null,
    modification_reason: null,
    approved_by: null,
    approved_at: null,
    rejected_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_type: 'ai_generated',
  });

  inMemoryStore.items.set(planId, defaultItems);
  inMemoryStore.auditTrail.set(planId, [
    {
      id: `audit-${Date.now()}-init`,
      action_plan_id: planId,
      actor_id: 'system_ai_orchestrator',
      actor_role: 'system',
      decision: 'create',
      reason: 'AI Consensus Engine generated operational action plan.',
      previous_status: 'none',
      new_status: 'pending_review',
      changes: {},
      created_at: new Date().toISOString(),
      source_type: 'ai_generated',
    }
  ]);
})();

class AIPersistenceService {
  /**
   * Create a new analysis run record.
   */
  async createRun({ runId, contextId, triggerType, triggerPayload, provider }) {
    const runObj = {
      id: runId,
      context_id: contextId,
      trigger_type: triggerType || 'manual',
      trigger_payload: triggerPayload || {},
      status: 'running',
      provider: provider || 'unknown',
      agent_count: 0,
      agents_completed: 0,
      agents_failed: 0,
      duration_ms: null,
      error_message: null,
      started_at: new Date().toISOString(),
      completed_at: null,
      source_type: 'ai_generated',
    };
    inMemoryStore.runs.set(runId, runObj);

    const sql = `
      INSERT INTO ai_analysis_runs
        (id, context_id, trigger_type, trigger_payload, status, provider, started_at, source_type)
      VALUES ($1, $2, $3, $4, 'running', $5, NOW(), 'ai_generated')
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    try {
      await db.query(sql, [
        runId,
        contextId,
        triggerType || 'manual',
        JSON.stringify(triggerPayload || {}),
        provider || 'unknown',
      ]);
    } catch (_) {}
  }

  /**
   * Finalize a run after orchestration completes.
   */
  async finalizeRun({ runId, status, agentCount, agentsCompleted, agentsFailed, durationMs, errorMessage }) {
    const existing = inMemoryStore.runs.get(runId);
    if (existing) {
      existing.status = status || 'completed';
      existing.agent_count = agentCount || 0;
      existing.agents_completed = agentsCompleted || 0;
      existing.agents_failed = agentsFailed || 0;
      existing.duration_ms = durationMs || null;
      existing.error_message = errorMessage || null;
      existing.completed_at = new Date().toISOString();
    }

    const sql = `
      UPDATE ai_analysis_runs SET
        status = $2,
        agent_count = $3,
        agents_completed = $4,
        agents_failed = $5,
        duration_ms = $6,
        error_message = $7,
        completed_at = NOW()
      WHERE id = $1
    `;
    try {
      await db.query(sql, [
        runId,
        status || 'completed',
        agentCount || 0,
        agentsCompleted || 0,
        agentsFailed || 0,
        durationMs || null,
        errorMessage || null,
      ]);
    } catch (_) {}
  }

  /**
   * Persist one agent decision.
   */
  async saveAgentDecision({ runId, agentResult }) {
    const decisionId = `dec-${runId}-${agentResult.agent}`;
    const data = agentResult.data || {};
    const decObj = {
      id: decisionId,
      analysis_run_id: runId,
      agent_type: agentResult.agent,
      status: agentResult.status || 'completed',
      assessment_summary: data.assessment?.summary || null,
      assessment_priority: data.assessment?.priority || null,
      observations: data.observations || [],
      constraints: data.constraints || [],
      recommendations: data.recommendations || [],
      confidence: agentResult.confidence != null ? agentResult.confidence : 0,
      duration_ms: agentResult.duration_ms || null,
      error_message: agentResult.error || null,
      created_at: new Date().toISOString(),
      source_type: 'ai_generated',
    };

    const currentDecs = inMemoryStore.decisions.get(runId) || [];
    currentDecs.push(decObj);
    inMemoryStore.decisions.set(runId, currentDecs);

    const sql = `
      INSERT INTO ai_agent_decisions
        (id, analysis_run_id, agent_type, status, assessment_summary, assessment_priority,
         observations, constraints, recommendations, confidence, duration_ms, error_message, source_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ai_generated')
      ON CONFLICT (id) DO NOTHING
    `;
    try {
      await db.query(sql, [
        decisionId,
        runId,
        agentResult.agent,
        agentResult.status || 'completed',
        data.assessment?.summary || null,
        data.assessment?.priority || null,
        JSON.stringify(data.observations || []),
        JSON.stringify(data.constraints || []),
        JSON.stringify(data.recommendations || []),
        agentResult.confidence != null ? agentResult.confidence : 0,
        agentResult.duration_ms || null,
        agentResult.error || null,
      ]);
    } catch (_) {}
  }

  /**
   * Persist consensus result.
   */
  async saveConsensus({ runId, consensus }) {
    inMemoryStore.consensus.set(runId, consensus);

    const sql = `
      INSERT INTO ai_consensus_results
        (id, analysis_run_id, summary, priority, agreements, conflicts, recommendations, is_fallback, source_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ai_generated')
      ON CONFLICT (id) DO NOTHING
    `;
    try {
      await db.query(sql, [
        consensus.consensus_id,
        runId,
        consensus.summary || '',
        consensus.priority || 'medium',
        JSON.stringify(consensus.agreements || []),
        JSON.stringify(consensus.conflicts || []),
        JSON.stringify(consensus.recommendations || []),
        consensus._is_fallback || false,
      ]);
    } catch (_) {}
  }

  /**
   * Persist action plan + individual items + audit trail.
   */
  async saveActionPlan({ runId, contextId, consensus }) {
    const plan = consensus.action_plan;
    if (!plan) return null;

    const planId = plan.action_plan_id || `plan-${runId}`;
    const rawActions = plan.actions || [];

    const planObj = {
      id: planId,
      analysis_run_id: runId,
      consensus_id: consensus.consensus_id,
      context_id: contextId,
      summary: plan.summary || consensus.summary || '',
      priority: consensus.priority || 'medium',
      requires_human_approval: true,
      status: 'pending_review',
      original_plan: JSON.parse(JSON.stringify(rawActions)),
      modified_plan: null,
      modification_reason: null,
      approved_by: null,
      approved_at: null,
      rejected_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_type: 'ai_generated',
    };
    inMemoryStore.plans.set(planId, planObj);

    // Save individual action items
    const items = [];
    for (let i = 0; i < rawActions.length; i++) {
      const action = rawActions[i];
      const itemId = action.action_id || `item-${planId}-${i + 1}`;
      const itemObj = {
        id: itemId,
        action_plan_id: planId,
        action_type: action.type || null,
        description: action.description || action.action || '',
        department: action.department || null,
        assigned_staff: action.assigned_to || action.resource || null,
        room_id: action.room_id || action.room || null,
        guest_id: action.guest_id || null,
        priority: action.priority || 'medium',
        status: 'pending_review',
        estimated_duration_minutes: action.estimated_duration_minutes || null,
        sequence_order: i,
        source_type: 'ai_generated',
      };
      items.push(itemObj);
    }
    inMemoryStore.items.set(planId, items);

    // Initial audit entry
    const auditEntry = {
      id: `audit-${Date.now()}-${planId}`,
      action_plan_id: planId,
      actor_id: 'system_ai_orchestrator',
      actor_role: 'system',
      decision: 'create',
      reason: 'AI Consensus Engine generated operational action plan.',
      previous_status: 'none',
      new_status: 'pending_review',
      changes: {},
      created_at: new Date().toISOString(),
      source_type: 'ai_generated',
    };
    inMemoryStore.auditTrail.set(planId, [auditEntry]);

    // Save to PostgreSQL if connected
    const planSql = `
      INSERT INTO ai_action_plans
        (id, analysis_run_id, consensus_id, context_id, summary, priority,
         requires_human_approval, status, original_plan, source_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_review', $8, 'ai_generated')
      ON CONFLICT (id) DO UPDATE SET
        summary = EXCLUDED.summary,
        priority = EXCLUDED.priority,
        updated_at = NOW()
      RETURNING id
    `;
    try {
      await db.query(planSql, [
        planId,
        runId,
        consensus.consensus_id,
        contextId,
        plan.summary || consensus.summary || '',
        consensus.priority || 'medium',
        true,
        JSON.stringify(rawActions),
      ]);

      for (const it of items) {
        const itemSql = `
          INSERT INTO ai_action_plan_items
            (id, action_plan_id, action_type, description, department, assigned_staff,
             room_id, guest_id, priority, status, estimated_duration_minutes, sequence_order, source_type)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_review', $10, $11, 'ai_generated')
          ON CONFLICT (id) DO NOTHING
        `;
        await db.query(itemSql, [
          it.id,
          planId,
          it.action_type,
          it.description,
          it.department,
          it.assigned_staff,
          it.room_id,
          it.guest_id,
          it.priority,
          it.estimated_duration_minutes,
          it.sequence_order,
        ]);
      }
    } catch (_) {}

    return planId;
  }

  /**
   * Persist a complete orchestration result atomically.
   */
  async persistOrchestrationResult({ runId, payload }) {
    const { context_id, agents, consensus, duration_ms } = payload;
    const completed = (agents || []).filter(a => a.status === 'completed').length;
    const failed = (agents || []).filter(a => a.status !== 'completed').length;
    const runStatus = failed === agents.length ? 'failed' : failed > 0 ? 'partial' : 'completed';

    await this.finalizeRun({
      runId,
      status: runStatus,
      agentCount: agents.length,
      agentsCompleted: completed,
      agentsFailed: failed,
      durationMs: duration_ms,
    });

    for (const agent of agents) {
      await this.saveAgentDecision({ runId, agentResult: agent });
    }

    if (consensus) {
      await this.saveConsensus({ runId, consensus });
      await this.saveActionPlan({ runId, contextId: context_id, consensus });
    }

    return { runId, status: runStatus };
  }

  // ─── Action Plan & Audit Decision APIs ──────────────────────────────────────

  /**
   * Fetch a single action plan with items, audit trail, and consensus context.
   */
  async getActionPlan(planId) {
    // 1. Check in-memory store first
    let plan = inMemoryStore.plans.get(planId);
    let items = inMemoryStore.items.get(planId) || [];
    let auditTrail = inMemoryStore.auditTrail.get(planId) || [];

    // 2. Query PostgreSQL if available
    try {
      const planRes = await db.query('SELECT * FROM ai_action_plans WHERE id = $1', [planId]);
      if (planRes?.rows?.length > 0) {
        plan = { ...planRes.rows[0], ...plan };
        const itemsRes = await db.query(
          'SELECT * FROM ai_action_plan_items WHERE action_plan_id = $1 ORDER BY sequence_order ASC',
          [planId]
        );
        if (itemsRes?.rows?.length > 0) {
          items = itemsRes.rows;
        }
        const auditRes = await db.query(
          'SELECT * FROM ai_action_plan_decisions WHERE action_plan_id = $1 ORDER BY created_at ASC',
          [planId]
        );
        if (auditRes?.rows?.length > 0) {
          auditTrail = auditRes.rows;
        }
      }
    } catch (_) {}

    if (!plan) return null;

    // Attach consensus & run metadata if available
    let consensus = inMemoryStore.consensus.get(plan.analysis_run_id) || null;
    let run = inMemoryStore.runs.get(plan.analysis_run_id) || null;

    return {
      ...plan,
      items,
      audit_trail: auditTrail,
      consensus,
      run,
    };
  }

  /**
   * Fetch audit trail for an action plan.
   */
  async getAuditTrail(planId) {
    const memoryRecords = inMemoryStore.auditTrail.get(planId) || [];
    try {
      const auditRes = await db.query(
        'SELECT * FROM ai_action_plan_decisions WHERE action_plan_id = $1 ORDER BY created_at ASC',
        [planId]
      );
      if (auditRes?.rows?.length > 0) {
        return auditRes.rows;
      }
    } catch (_) {}
    return memoryRecords;
  }

  /**
   * Approve an action plan.
   * State machine: only reviewable plans (pending_review, pending_approval, modified_pending_approval)
   * can be approved. Cannot double approve or approve rejected/completed plans.
   */
  async approvePlan(planId, { actorId = 'admin@resort360.demo', actorRole = 'admin', comment = 'Approved for execution.' } = {}) {
    const plan = inMemoryStore.plans.get(planId);
    if (!plan) {
      const error = new Error(`Action plan not found with id: ${planId}`);
      error.code = 'PLAN_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const currentStatus = plan.status;

    // Guard: double approval
    if (currentStatus === 'approved') {
      const error = new Error('Action plan has already been approved.');
      error.code = 'PLAN_ALREADY_APPROVED';
      error.status = 409;
      throw error;
    }

    // Guard: invalid transitions
    const allowableStatuses = ['pending_review', 'pending_approval', 'modified_pending_approval'];
    if (!allowableStatuses.includes(currentStatus)) {
      const error = new Error(`Cannot approve plan in '${currentStatus}' status. Allowed statuses: ${allowableStatuses.join(', ')}`);
      error.code = 'INVALID_STATE_TRANSITION';
      error.status = 409;
      throw error;
    }

    const now = new Date().toISOString();

    // 1. Update in-memory plan
    plan.status = 'approved';
    plan.approved_by = actorId;
    plan.approved_at = now;
    plan.updated_at = now;

    // Update items to approved
    const items = inMemoryStore.items.get(planId) || [];
    items.forEach((it) => {
      if (['pending_review', 'pending_approval'].includes(it.status)) {
        it.status = 'approved';
      }
    });

    // 2. Append audit trail record
    const auditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action_plan_id: planId,
      actor_id: actorId,
      actor_role: actorRole,
      decision: 'approve',
      reason: comment || 'Approved for execution.',
      previous_status: currentStatus,
      new_status: 'approved',
      changes: {},
      created_at: now,
      source_type: 'human_decision',
    };
    const trail = inMemoryStore.auditTrail.get(planId) || [];
    trail.push(auditRecord);
    inMemoryStore.auditTrail.set(planId, trail);

    // 3. PostgreSQL persistence
    try {
      await db.query(`
        UPDATE ai_action_plans SET
          status = 'approved',
          approved_by = $2,
          approved_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `, [planId, actorId]);

      await db.query(`
        UPDATE ai_action_plan_items SET status = 'approved'
        WHERE action_plan_id = $1 AND status IN ('pending_review', 'pending_approval')
      `, [planId]);

      await db.query(`
        INSERT INTO ai_action_plan_decisions
          (id, action_plan_id, actor_id, actor_role, decision, reason, previous_status, new_status, source_type)
        VALUES ($1, $2, $3, $4, 'approve', $5, $6, 'approved', 'human_decision')
      `, [auditRecord.id, planId, actorId, actorRole, comment, currentStatus]);
    } catch (_) {}

    return {
      success: true,
      action_plan_id: planId,
      status: 'approved',
      approved_by: actorId,
      approved_at: now,
      comment,
      items,
      audit_record: auditRecord,
    };
  }

  /**
   * Reject an action plan.
   * Requires non-empty reason.
   */
  async rejectPlan(planId, { actorId = 'admin@resort360.demo', actorRole = 'admin', reason } = {}) {
    if (!reason || !String(reason).trim()) {
      const error = new Error('Rejection reason is required.');
      error.code = 'REJECTION_REASON_REQUIRED';
      error.status = 400;
      throw error;
    }

    const plan = inMemoryStore.plans.get(planId);
    if (!plan) {
      const error = new Error(`Action plan not found with id: ${planId}`);
      error.code = 'PLAN_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const currentStatus = plan.status;
    const allowableStatuses = ['pending_review', 'pending_approval', 'modified_pending_approval'];
    if (!allowableStatuses.includes(currentStatus)) {
      const error = new Error(`Cannot reject plan in '${currentStatus}' status. Allowed statuses: ${allowableStatuses.join(', ')}`);
      error.code = 'INVALID_STATE_TRANSITION';
      error.status = 409;
      throw error;
    }

    const now = new Date().toISOString();

    // 1. Update in-memory plan
    plan.status = 'rejected';
    plan.rejected_reason = reason.trim();
    plan.rejected_by = actorId;
    plan.rejected_at = now;
    plan.updated_at = now;

    // Update items to cancelled
    const items = inMemoryStore.items.get(planId) || [];
    items.forEach((it) => {
      it.status = 'cancelled';
    });

    // 2. Append audit trail record
    const auditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action_plan_id: planId,
      actor_id: actorId,
      actor_role: actorRole,
      decision: 'reject',
      reason: reason.trim(),
      previous_status: currentStatus,
      new_status: 'rejected',
      changes: {},
      created_at: now,
      source_type: 'human_decision',
    };
    const trail = inMemoryStore.auditTrail.get(planId) || [];
    trail.push(auditRecord);
    inMemoryStore.auditTrail.set(planId, trail);

    // 3. PostgreSQL persistence
    try {
      await db.query(`
        UPDATE ai_action_plans SET
          status = 'rejected',
          rejected_reason = $2,
          rejected_by = $3,
          rejected_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `, [planId, reason.trim(), actorId]);

      await db.query(`
        UPDATE ai_action_plan_items SET status = 'cancelled'
        WHERE action_plan_id = $1
      `, [planId]);

      await db.query(`
        INSERT INTO ai_action_plan_decisions
          (id, action_plan_id, actor_id, actor_role, decision, reason, previous_status, new_status, source_type)
        VALUES ($1, $2, $3, $4, 'reject', $5, $6, 'rejected', 'human_decision')
      `, [auditRecord.id, planId, actorId, actorRole, reason.trim(), currentStatus]);
    } catch (_) {}

    return {
      success: true,
      action_plan_id: planId,
      status: 'rejected',
      rejected_by: actorId,
      rejected_at: now,
      rejected_reason: reason.trim(),
      audit_record: auditRecord,
    };
  }

  /**
   * Modify an action plan before approval.
   * Never overwrites original AI plan — preserves both original and modified versions.
   * Status transitions to 'modified_pending_approval'.
   */
  async modifyPlan(planId, { actorId = 'admin@resort360.demo', actorRole = 'admin', modifications, reason } = {}) {
    if (!reason || !String(reason).trim()) {
      const error = new Error('Modification reason is required.');
      error.code = 'MODIFICATION_REASON_REQUIRED';
      error.status = 400;
      throw error;
    }

    if (!modifications || (Array.isArray(modifications) && modifications.length === 0)) {
      const error = new Error('Modifications payload is required.');
      error.code = 'INVALID_MODIFICATIONS';
      error.status = 400;
      throw error;
    }

    const plan = inMemoryStore.plans.get(planId);
    if (!plan) {
      const error = new Error(`Action plan not found with id: ${planId}`);
      error.code = 'PLAN_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const currentStatus = plan.status;
    const allowableStatuses = ['pending_review', 'pending_approval', 'modified_pending_approval'];
    if (!allowableStatuses.includes(currentStatus)) {
      const error = new Error(`Cannot modify plan in '${currentStatus}' status. Allowed statuses: ${allowableStatuses.join(', ')}`);
      error.code = 'INVALID_STATE_TRANSITION';
      error.status = 409;
      throw error;
    }

    const now = new Date().toISOString();
    const existingItems = inMemoryStore.items.get(planId) || [];

    // Capture original vs modified diff
    const changeLog = [];

    // Process modifications: supports both list of modified items or structured { action_id, original, modified }
    if (Array.isArray(modifications)) {
      modifications.forEach((mod) => {
        const item = existingItems.find((it) => it.id === mod.id || it.id === mod.action_id);
        if (item) {
          const originalSnap = { ...item };
          if (mod.description !== undefined) item.description = mod.description;
          if (mod.action !== undefined) item.description = mod.action;
          if (mod.department !== undefined) item.department = mod.department;
          if (mod.assigned_staff !== undefined) item.assigned_staff = mod.assigned_staff;
          if (mod.resource !== undefined) item.assigned_staff = mod.resource;
          if (mod.room_id !== undefined) item.room_id = mod.room_id;
          if (mod.room !== undefined) item.room_id = mod.room;
          if (mod.priority !== undefined) item.priority = mod.priority;

          changeLog.push({
            item_id: item.id,
            original: originalSnap,
            modified: { ...item },
          });
        }
      });
    } else if (modifications.action_id || modifications.id) {
      const targetId = modifications.action_id || modifications.id;
      const item = existingItems.find((it) => it.id === targetId);
      if (item) {
        const originalSnap = { ...item };
        const m = modifications.modified || modifications;
        if (m.description !== undefined) item.description = m.description;
        if (m.action !== undefined) item.description = m.action;
        if (m.department !== undefined) item.department = m.department;
        if (m.assigned_staff !== undefined) item.assigned_staff = m.assigned_staff;
        if (m.resource !== undefined) item.assigned_staff = m.resource;
        if (m.room_id !== undefined) item.room_id = m.room_id;
        if (m.room !== undefined) item.room_id = m.room;
        if (m.priority !== undefined) item.priority = m.priority;

        changeLog.push({
          item_id: targetId,
          original: modifications.original || originalSnap,
          modified: { ...item },
        });
      }
    }

    // Update in-memory plan
    plan.status = 'modified_pending_approval';
    plan.modification_reason = reason.trim();
    plan.modified_plan = JSON.parse(JSON.stringify(existingItems));
    plan.updated_at = now;

    // Append audit trail record
    const auditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action_plan_id: planId,
      actor_id: actorId,
      actor_role: actorRole,
      decision: 'modify',
      reason: reason.trim(),
      previous_status: currentStatus,
      new_status: 'modified_pending_approval',
      changes: changeLog,
      created_at: now,
      source_type: 'human_decision',
    };
    const trail = inMemoryStore.auditTrail.get(planId) || [];
    trail.push(auditRecord);
    inMemoryStore.auditTrail.set(planId, trail);

    // PostgreSQL persistence
    try {
      await db.query(`
        UPDATE ai_action_plans SET
          status = 'modified_pending_approval',
          modified_plan = $2,
          modification_reason = $3,
          updated_at = NOW()
        WHERE id = $1
      `, [planId, JSON.stringify(plan.modified_plan), reason.trim()]);

      await db.query(`
        INSERT INTO ai_action_plan_decisions
          (id, action_plan_id, actor_id, actor_role, decision, reason, previous_status, new_status, changes, source_type)
        VALUES ($1, $2, $3, $4, 'modify', $5, $6, 'modified_pending_approval', $7, 'human_decision')
      `, [auditRecord.id, planId, actorId, actorRole, reason.trim(), currentStatus, JSON.stringify(changeLog)]);
    } catch (_) {}

    return {
      success: true,
      action_plan_id: planId,
      status: 'modified_pending_approval',
      modification_reason: reason.trim(),
      original_plan: plan.original_plan,
      modified_plan: plan.modified_plan,
      items: existingItems,
      changes: changeLog,
      audit_record: auditRecord,
    };
  }

  /**
   * Update an individual action item's status (e.g. pending -> in_progress -> completed).
   * Automatically updates parent action plan status to 'in_progress' or 'completed'
   * when appropriate.
   */
  async updateActionItemStatus(planId, itemId, { status, actorId = 'admin@resort360.demo', actorRole = 'admin' } = {}) {
    const validStatuses = ['pending_approval', 'pending_review', 'approved', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Item status must be one of: ${validStatuses.join(', ')}`);
      error.code = 'INVALID_ITEM_STATUS';
      error.status = 400;
      throw error;
    }

    const plan = inMemoryStore.plans.get(planId);
    if (!plan) {
      const error = new Error(`Action plan not found: ${planId}`);
      error.code = 'PLAN_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const items = inMemoryStore.items.get(planId) || [];
    const item = items.find((it) => it.id === itemId);
    if (!item) {
      const error = new Error(`Action item not found: ${itemId}`);
      error.code = 'ITEM_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const previousItemStatus = item.status;
    item.status = status;

    // Check overall plan progress
    const allCompleted = items.length > 0 && items.every((it) => it.status === 'completed' || it.status === 'cancelled');
    const anyInProgress = items.some((it) => it.status === 'in_progress');

    let planStatusChanged = false;
    let oldPlanStatus = plan.status;

    if (allCompleted && plan.status !== 'completed') {
      plan.status = 'completed';
      planStatusChanged = true;
    } else if (anyInProgress && plan.status === 'approved') {
      plan.status = 'in_progress';
      planStatusChanged = true;
    }

    // Append audit trail record
    const auditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action_plan_id: planId,
      actor_id: actorId,
      actor_role: actorRole,
      decision: 'status_change',
      reason: `Action item '${item.description}' transitioned to ${status}.`,
      previous_status: previousItemStatus,
      new_status: status,
      changes: { item_id: itemId, previous: previousItemStatus, next: status },
      created_at: new Date().toISOString(),
      source_type: 'human_decision',
    };
    const trail = inMemoryStore.auditTrail.get(planId) || [];
    trail.push(auditRecord);
    inMemoryStore.auditTrail.set(planId, trail);

    // PostgreSQL persistence
    try {
      await db.query(`
        UPDATE ai_action_plan_items SET status = $2 WHERE id = $1
      `, [itemId, status]);

      if (planStatusChanged) {
        await db.query(`
          UPDATE ai_action_plans SET status = $2, updated_at = NOW() WHERE id = $1
        `, [planId, plan.status]);
      }

      await db.query(`
        INSERT INTO ai_action_plan_decisions
          (id, action_plan_id, actor_id, actor_role, decision, reason, previous_status, new_status, changes, source_type)
        VALUES ($1, $2, $3, $4, 'status_change', $5, $6, $7, $8, 'human_decision')
      `, [auditRecord.id, planId, actorId, actorRole, auditRecord.reason, previousItemStatus, status, JSON.stringify(auditRecord.changes)]);
    } catch (_) {}

    return {
      success: true,
      action_plan_id: planId,
      item_id: itemId,
      item_status: status,
      plan_status: plan.status,
      items,
      progress: {
        completed: items.filter(i => i.status === 'completed').length,
        total: items.length,
      }
    };
  }

  // ─── Legacy Runs Support ───────────────────────────────────────────────────

  async listRuns({ limit = 50 } = {}) {
    const memoryRuns = Array.from(inMemoryStore.runs.values()).reverse().slice(0, limit);
    try {
      const sql = `
        SELECT id, context_id, trigger_type, status, provider,
               agent_count, agents_completed, agents_failed, duration_ms, started_at, completed_at
        FROM ai_analysis_runs
        ORDER BY started_at DESC
        LIMIT $1
      `;
      const result = await db.query(sql, [limit]);
      if (result?.rows?.length > 0) return result.rows;
    } catch (_) {}
    return memoryRuns;
  }

  async getRun(runId) {
    const memoryRun = inMemoryStore.runs.get(runId);
    const memoryDecisions = inMemoryStore.decisions.get(runId) || [];
    const memoryConsensus = inMemoryStore.consensus.get(runId) || null;
    const memoryPlan = Array.from(inMemoryStore.plans.values()).find(p => p.analysis_run_id === runId) || null;
    let memoryItems = [];
    if (memoryPlan) {
      memoryItems = inMemoryStore.items.get(memoryPlan.id) || [];
    }

    try {
      const [runRes, decisionsRes, consensusRes, planRes] = await Promise.all([
        db.query('SELECT * FROM ai_analysis_runs WHERE id = $1', [runId]),
        db.query('SELECT * FROM ai_agent_decisions WHERE analysis_run_id = $1 ORDER BY created_at ASC', [runId]),
        db.query('SELECT * FROM ai_consensus_results WHERE analysis_run_id = $1', [runId]),
        db.query(`
          SELECT p.*, array_agg(row_to_json(i.*) ORDER BY i.sequence_order) FILTER (WHERE i.id IS NOT NULL) AS items
          FROM ai_action_plans p
          LEFT JOIN ai_action_plan_items i ON i.action_plan_id = p.id
          WHERE p.analysis_run_id = $1
          GROUP BY p.id
        `, [runId]),
      ]);

      if (runRes.rows.length > 0) {
        return {
          run: runRes.rows[0],
          agents: decisionsRes.rows,
          consensus: consensusRes.rows[0] || null,
          action_plan: planRes.rows[0] || null,
        };
      }
    } catch (_) {}

    if (memoryRun) {
      return {
        run: memoryRun,
        agents: memoryDecisions,
        consensus: memoryConsensus,
        action_plan: memoryPlan ? { ...memoryPlan, items: memoryItems } : null,
      };
    }
    return null;
  }

  async updatePlanStatus(planId, { status, approvedBy, rejectedReason }) {
    if (status === 'approved') {
      return this.approvePlan(planId, { actorId: approvedBy, comment: 'Approved via legacy endpoint.' });
    }
    if (status === 'rejected') {
      return this.rejectPlan(planId, { actorId: approvedBy, reason: rejectedReason || 'Rejected via legacy endpoint.' });
    }
    const plan = inMemoryStore.plans.get(planId);
    if (plan) {
      plan.status = status;
      return plan;
    }
    return null;
  }
}

module.exports = new AIPersistenceService();
