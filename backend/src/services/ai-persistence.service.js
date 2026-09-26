const db = require('../config/db');

/**
 * AI Persistence Service
 * Stores AI-generated analysis runs, agent decisions, consensus results,
 * and action plans in PostgreSQL.
 *
 * IMPORTANT: All records written by this service carry source_type = 'ai_generated'
 * to explicitly distinguish them from operational source data.
 */
class AIPersistenceService {
  /**
   * Create a new analysis run record at the start of orchestration.
   */
  async createRun({ runId, contextId, triggerType, triggerPayload, provider }) {
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
      console.log(`[AIPersistence] Run created: ${runId}`);
    } catch (err) {
      console.warn('[AIPersistence] createRun failed:', err.message);
    }
  }

  /**
   * Finalize a run after orchestration completes.
   */
  async finalizeRun({ runId, status, agentCount, agentsCompleted, agentsFailed, durationMs, errorMessage }) {
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
    } catch (err) {
      console.warn('[AIPersistence] finalizeRun failed:', err.message);
    }
  }

  /**
   * Persist one agent decision.
   */
  async saveAgentDecision({ runId, agentResult }) {
    const decisionId = `dec-${runId}-${agentResult.agent}`;
    const data = agentResult.data || {};
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
    } catch (err) {
      console.warn(`[AIPersistence] saveAgentDecision failed for ${agentResult.agent}:`, err.message);
    }
  }

  /**
   * Persist consensus result.
   */
  async saveConsensus({ runId, consensus }) {
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
      console.log(`[AIPersistence] Consensus saved: ${consensus.consensus_id}`);
    } catch (err) {
      console.warn('[AIPersistence] saveConsensus failed:', err.message);
    }
  }

  /**
   * Persist action plan + its individual items.
   */
  async saveActionPlan({ runId, contextId, consensus }) {
    const plan = consensus.action_plan;
    if (!plan) return null;

    const planId = plan.action_plan_id || `plan-${runId}`;

    // Save action plan header
    const planSql = `
      INSERT INTO ai_action_plans
        (id, analysis_run_id, consensus_id, context_id, summary, priority,
         requires_human_approval, status, source_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_approval', 'ai_generated')
      ON CONFLICT (id) DO NOTHING
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
      ]);
      console.log(`[AIPersistence] Action plan saved: ${planId}`);
    } catch (err) {
      console.warn('[AIPersistence] saveActionPlan (header) failed:', err.message);
      return null;
    }

    // Save individual action items
    const actions = plan.actions || [];
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const itemId = action.action_id || `item-${planId}-${i + 1}`;
      const itemSql = `
        INSERT INTO ai_action_plan_items
          (id, action_plan_id, action_type, description, department, assigned_staff,
           room_id, guest_id, priority, estimated_duration_minutes, sequence_order, source_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ai_generated')
        ON CONFLICT (id) DO NOTHING
      `;
      try {
        await db.query(itemSql, [
          itemId,
          planId,
          action.type || null,
          action.description || '',
          action.department || null,
          action.assigned_to || null,
          action.room_id || null,
          action.guest_id || null,
          action.priority || 'medium',
          action.estimated_duration_minutes || null,
          i,
        ]);
      } catch (err) {
        console.warn(`[AIPersistence] saveActionItem failed for item ${i}:`, err.message);
      }
    }

    return planId;
  }

  /**
   * Persist a complete orchestration result atomically.
   * Called after orchestrateConsensus() completes successfully.
   */
  async persistOrchestrationResult({ runId, payload }) {
    const { context_id, trigger, duration_ms, agents, consensus } = payload;

    const completed = (agents || []).filter(a => a.status === 'completed').length;
    const failed = (agents || []).filter(a => a.status !== 'completed').length;
    const runStatus = failed === agents.length ? 'failed' : failed > 0 ? 'partial' : 'completed';

    // 1. Finalize run
    await this.finalizeRun({
      runId,
      status: runStatus,
      agentCount: agents.length,
      agentsCompleted: completed,
      agentsFailed: failed,
      durationMs: duration_ms,
    });

    // 2. Save agent decisions
    for (const agent of agents) {
      await this.saveAgentDecision({ runId, agentResult: agent });
    }

    // 3. Save consensus
    if (consensus) {
      await this.saveConsensus({ runId, consensus });
      await this.saveActionPlan({ runId, contextId: context_id, consensus });
    }

    console.log(`[AIPersistence] Orchestration persisted — run ${runId} (${runStatus}, ${completed}/${agents.length} agents)`);
    return { runId, status: runStatus };
  }

  // ─── History Queries ────────────────────────────────────────────────────────

  /**
   * Fetch all analysis runs (most recent first, limit 50).
   */
  async listRuns({ limit = 50 } = {}) {
    const sql = `
      SELECT id, context_id, trigger_type, status, provider,
             agent_count, agents_completed, agents_failed, duration_ms, started_at, completed_at
      FROM ai_analysis_runs
      ORDER BY started_at DESC
      LIMIT $1
    `;
    try {
      const result = await db.query(sql, [limit]);
      return result.rows;
    } catch (err) {
      console.warn('[AIPersistence] listRuns failed:', err.message);
      return [];
    }
  }

  /**
   * Fetch a single analysis run with all related data.
   */
  async getRun(runId) {
    try {
      const [runRes, decisionsRes, consensusRes, planRes] = await Promise.all([
        db.query(
          'SELECT * FROM ai_analysis_runs WHERE id = $1',
          [runId]
        ),
        db.query(
          'SELECT * FROM ai_agent_decisions WHERE analysis_run_id = $1 ORDER BY created_at ASC',
          [runId]
        ),
        db.query(
          'SELECT * FROM ai_consensus_results WHERE analysis_run_id = $1',
          [runId]
        ),
        db.query(
          `SELECT p.*, array_agg(row_to_json(i.*) ORDER BY i.sequence_order) FILTER (WHERE i.id IS NOT NULL) AS items
           FROM ai_action_plans p
           LEFT JOIN ai_action_plan_items i ON i.action_plan_id = p.id
           WHERE p.analysis_run_id = $1
           GROUP BY p.id`,
          [runId]
        ),
      ]);

      if (runRes.rows.length === 0) return null;

      return {
        run: runRes.rows[0],
        agents: decisionsRes.rows,
        consensus: consensusRes.rows[0] || null,
        action_plan: planRes.rows[0] || null,
      };
    } catch (err) {
      console.warn('[AIPersistence] getRun failed:', err.message);
      return null;
    }
  }

  /**
   * Update action plan approval status.
   */
  async updatePlanStatus(planId, { status, approvedBy, rejectedReason }) {
    const sql = `
      UPDATE ai_action_plans SET
        status = $2,
        approved_by = $3,
        rejected_reason = $4,
        approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE NULL END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, status
    `;
    try {
      const result = await db.query(sql, [planId, status, approvedBy || null, rejectedReason || null]);
      return result.rows[0];
    } catch (err) {
      console.warn('[AIPersistence] updatePlanStatus failed:', err.message);
      return null;
    }
  }
}

module.exports = new AIPersistenceService();
