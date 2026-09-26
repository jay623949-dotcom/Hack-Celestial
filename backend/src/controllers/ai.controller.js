const openAIService = require('../services/openai.service');
const contextBuilder = require('../services/context-builder.service');
const aiPersistence = require('../services/ai-persistence.service');

/**
 * Controller for Generating Canonical AI Context from Database State
 * POST /api/v1/ai/context
 */
async function getOperationalContext(req, res, next) {
  try {
    const trigger = req.body.trigger || req.body || { type: 'multiple_incidents' };
    const context = await contextBuilder.buildContext(trigger);

    // Validate context against schema before returning
    const validation = openAIService.validateInputContext(context);
    if (!validation.valid) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'CONTEXT_BUILDER_VALIDATION_ERROR',
          message: 'Generated context does not adhere to canonical schema.',
          details: validation.errors,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        context,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for AI Operations Analysis
 * POST /api/v1/ai/analyze
 * Accepts either { trigger: { ... } } (builds from DB) or direct { context: { ... } }
 */
async function analyzeOperationalContext(req, res, next) {
  try {
    let context = req.body.context;

    // If trigger is provided instead of full context, build canonical context from database state
    if (!context) {
      const trigger = req.body.trigger || (req.body.type ? req.body : null);
      if (trigger) {
        context = await contextBuilder.buildContext(trigger);
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_TRIGGER_OR_CONTEXT',
            message: 'Request body must include either a "trigger" object (e.g. { type: "multiple_incidents" }) or a "context" object.',
          },
        });
      }
    }

    const analysisResult = await openAIService.analyzeContext(context);

    return res.status(200).json({
      success: true,
      data: {
        analysis: analysisResult,
        context,
      },
    });
  } catch (error) {
    if (error.code === 'INVALID_CONTEXT') {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    if (error.code === 'AI_KEY_MISSING') {
      return res.status(503).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    if (error.code === 'AI_INVALID_RESPONSE') {
      return res.status(502).json({
        success: false,
        error: {
          code: error.code,
          message: 'AI returned an invalid analysis response.',
          details: error.message,
        },
      });
    }

    // Default API error handling
    return res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || 'AI_SERVICE_ERROR',
        message: error.message || 'An unexpected error occurred during AI analysis.',
      },
    });
  }
}

/**
 * Controller for Batch / Single Departmental AI Agents Analysis
 * POST /api/v1/ai/agents/analyze
 * Request Body:
 * {
 *   "trigger": { "type": "multiple_incidents" },
 *   "agents": ["front_desk", "housekeeping", "maintenance", "revenue"]
 * }
 */
async function analyzeDepartmentalAgents(req, res, next) {
  const agentService = require('../services/agent.service');

  try {
    let context = req.body.context;

    // If trigger is provided instead of full context, build canonical context from database state
    if (!context) {
      const trigger = req.body.trigger || (req.body.type ? req.body : { type: 'multiple_incidents' });
      context = await contextBuilder.buildContext(trigger);
    }

    // Validate context input
    const validation = openAIService.validateInputContext(context);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTEXT',
          message: `Invalid operational context: ${validation.errors.join(', ')}`,
        },
      });
    }

    const requestedAgents = Array.isArray(req.body.agents) && req.body.agents.length > 0
      ? req.body.agents
      : agentService.getSupportedAgents();

    // Check for unknown agents
    const supported = agentService.getSupportedAgents();
    const unknown = requestedAgents.filter((a) => !supported.includes(String(a).toLowerCase().trim()));
    if (unknown.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNKNOWN_AGENT',
          message: `Unknown agent type(s): ${unknown.join(', ')}. Supported types: ${supported.join(', ')}`,
        },
      });
    }

    // Run batch analysis across requested domain agents
    const agentResults = await agentService.runBatchAgents(requestedAgents, context);

    return res.status(200).json({
      success: true,
      data: {
        context_id: context.context_id,
        trigger: context.trigger,
        agents: agentResults,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || 'AGENT_SERVICE_ERROR',
        message: error.message || 'An unexpected error occurred during agent analysis.',
      },
    });
  }
}

/**
 * Controller for Multi-Agent Orchestration & Coordinated Consensus
 * POST /api/v1/ai/consensus
 * Request Body:
 * {
 *   "trigger": { "type": "multiple_incidents" },
 *   "agents": ["front_desk", "housekeeping", "maintenance", "revenue"]
 * }
 */
async function getConsensus(req, res, next) {
  const orchestratorService = require('../services/orchestrator.service');

  try {
    const trigger = req.body.trigger || (req.body.type ? req.body : { type: 'multiple_incidents' });
    const agents = req.body.agents;
    const context = req.body.context;

    const result = await orchestratorService.orchestrateConsensus({
      trigger,
      context,
      agents,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.code === 'INVALID_CONTEXT' || error.code === 'UNKNOWN_AGENT') {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details || null,
        },
      });
    }

    return res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || 'ORCHESTRATION_ERROR',
        message: error.message || 'An error occurred during multi-agent consensus orchestration.',
      },
    });
  }
}

/**
 * GET /api/v1/ai/runs
 * List recent AI analysis runs (most recent first, limit 50)
 */
async function listAnalysisRuns(req, res, next) {
  try {
    const runs = await aiPersistence.listRuns({ limit: 50 });
    return res.status(200).json({
      success: true,
      data: { runs, count: runs.length },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/ai/runs/:id
 * Fetch a single analysis run with all agent decisions, consensus, and action plan
 */
async function getAnalysisRun(req, res, next) {
  try {
    const { id } = req.params;
    const run = await aiPersistence.getRun(id);
    if (!run) {
      return res.status(404).json({
        success: false,
        error: { code: 'RUN_NOT_FOUND', message: `No analysis run found with id: ${id}` },
      });
    }
    return res.status(200).json({ success: true, data: run });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/ai/runs/:runId/plan/status
 * Update action plan approval status
 */
async function updatePlanStatus(req, res, next) {
  try {
    const { runId } = req.params;
    const { status, approved_by, rejected_reason } = req.body;
    const validStatuses = ['pending_approval', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `status must be one of: ${validStatuses.join(', ')}` },
      });
    }
    // Find the plan id for this run
    const run = await aiPersistence.getRun(runId);
    if (!run || !run.action_plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'PLAN_NOT_FOUND', message: `No action plan found for run: ${runId}` },
      });
    }
    const updated = await aiPersistence.updatePlanStatus(run.action_plan.id, { status, approvedBy: approved_by, rejectedReason: rejected_reason });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeOperationalContext,
  getOperationalContext,
  analyzeDepartmentalAgents,
  getConsensus,
  listAnalysisRuns,
  getAnalysisRun,
  updatePlanStatus,
};
