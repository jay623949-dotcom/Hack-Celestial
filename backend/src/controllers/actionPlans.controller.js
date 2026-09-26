const aiPersistence = require('../services/ai-persistence.service');
const executionService = require('../services/execution.service');

// Helper to check role authorization
function authorizeManager(req) {
  // Check headers, body, or default demo role
  const role = (
    req.headers['x-user-role'] ||
    req.headers['x-role'] ||
    req.body.actor_role ||
    req.body.role ||
    'admin'
  ).toLowerCase().trim();

  const allowedRoles = [
    'admin',
    'resort_admin',
    'manager',
    'general_manager',
    'front_desk_manager',
    'housekeeping_manager',
    'maintenance_manager',
    'revenue_manager',
    'duty_manager',
    'front_desk',
    'housekeeping',
    'maintenance',
    'revenue',
  ];

  const isAuthorized = allowedRoles.includes(role);
  return {
    isAuthorized,
    role,
    actorId: req.headers['x-user-email'] || req.body.actor_id || req.body.actor || `${role}@resort360.demo`,
  };
}

/**
 * GET /api/v1/action-plans/:id
 */
async function getActionPlan(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await aiPersistence.getActionPlan(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'PLAN_NOT_FOUND', message: `No action plan found with id: ${id}` },
      });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/action-plans/:id/audit-trail
 */
async function getAuditTrail(req, res, next) {
  try {
    const { id } = req.params;
    const trail = await aiPersistence.getAuditTrail(id);
    return res.status(200).json({
      success: true,
      data: { action_plan_id: id, count: trail.length, audit_trail: trail },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/action-plans/:id/approve
 */
async function approvePlan(req, res, next) {
  try {
    const { id } = req.params;
    const auth = authorizeManager(req);

    if (!auth.isAuthorized) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ROLE',
          message: `Role '${auth.role}' is not authorized to approve AI operational action plans. Manager role required.`,
        },
      });
    }

    const comment = req.body.comment || req.body.reason || 'Approved for execution.';
    const result = await aiPersistence.approvePlan(id, {
      actorId: auth.actorId,
      actorRole: auth.role,
      comment,
    });

    // Automatically trigger execution unless explicitly disabled
    let execution = null;
    if (req.body.auto_execute !== false) {
      try {
        execution = await executionService.executePlan(id);
      } catch (execErr) {
        console.warn(`[ActionPlansController] Auto-execution notice for ${id}:`, execErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Action plan approved and dispatched for execution.',
      data: {
        ...result,
        execution,
      },
    });
  } catch (error) {
    if (error.code === 'PLAN_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: error.code, message: error.message } });
    }
    if (error.code === 'PLAN_ALREADY_APPROVED' || error.code === 'INVALID_STATE_TRANSITION') {
      return res.status(409).json({ success: false, error: { code: error.code, message: error.message } });
    }
    next(error);
  }
}

/**
 * POST /api/v1/action-plans/:id/execute
 */
async function executePlan(req, res, next) {
  try {
    const { id } = req.params;
    const auth = authorizeManager(req);

    if (!auth.isAuthorized) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ROLE',
          message: `Role '${auth.role}' is not authorized to execute operational action plans. Manager role required.`,
        },
      });
    }

    const execution = await executionService.executePlan(id);
    return res.status(200).json({
      success: true,
      message: 'Operational plan execution initiated successfully.',
      data: execution,
    });
  } catch (error) {
    if (error.code === 'PLAN_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: error.code, message: error.message } });
    }
    if (error.code === 'PLAN_NOT_APPROVED' || error.code === 'PLAN_REJECTED') {
      return res.status(409).json({ success: false, error: { code: error.code, message: error.message } });
    }
    next(error);
  }
}

/**
 * GET /api/v1/action-plans/:id/execution
 */
async function getExecutionState(req, res, next) {
  try {
    const { id } = req.params;
    const execution = executionService.getExecutionState(id);
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EXECUTION_NOT_FOUND',
          message: `No active or completed execution found for action plan: ${id}`,
        },
      });
    }
    return res.status(200).json({ success: true, data: execution });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/action-plans/:id/timeline
 */
async function getExecutionTimeline(req, res, next) {
  try {
    const { id } = req.params;
    const timeline = executionService.getExecutionTimeline(id);
    return res.status(200).json({
      success: true,
      data: {
        action_plan_id: id,
        count: timeline.length,
        timeline,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/action-plans/:id/reject
 */
async function rejectPlan(req, res, next) {
  try {
    const { id } = req.params;
    const auth = authorizeManager(req);

    if (!auth.isAuthorized) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ROLE',
          message: `Role '${auth.role}' is not authorized to reject AI operational action plans. Manager role required.`,
        },
      });
    }

    const reason = req.body.reason;
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REJECTION_REASON_REQUIRED',
          message: 'A meaningful rejection reason must be provided to reject an AI action plan.',
        },
      });
    }

    const result = await aiPersistence.rejectPlan(id, {
      actorId: auth.actorId,
      actorRole: auth.role,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: 'Action plan rejected.',
      data: result,
    });
  } catch (error) {
    if (error.code === 'PLAN_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: error.code, message: error.message } });
    }
    if (error.code === 'INVALID_STATE_TRANSITION') {
      return res.status(409).json({ success: false, error: { code: error.code, message: error.message } });
    }
    next(error);
  }
}

/**
 * POST /api/v1/action-plans/:id/modify
 */
async function modifyPlan(req, res, next) {
  try {
    const { id } = req.params;
    const auth = authorizeManager(req);

    if (!auth.isAuthorized) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ROLE',
          message: `Role '${auth.role}' is not authorized to modify AI operational action plans. Manager role required.`,
        },
      });
    }

    const reason = req.body.reason || req.body.modification_reason;
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MODIFICATION_REASON_REQUIRED',
          message: 'A meaningful reason must be provided when modifying proposed AI actions.',
        },
      });
    }

    const modifications = req.body.modifications || req.body.actions || req.body;
    const result = await aiPersistence.modifyPlan(id, {
      actorId: auth.actorId,
      actorRole: auth.role,
      modifications,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: 'Action plan modified. Plan is now modified_pending_approval.',
      data: result,
    });
  } catch (error) {
    if (error.code === 'PLAN_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: error.code, message: error.message } });
    }
    if (error.code === 'MODIFICATION_REASON_REQUIRED' || error.code === 'INVALID_MODIFICATIONS') {
      return res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
    }
    if (error.code === 'INVALID_STATE_TRANSITION') {
      return res.status(409).json({ success: false, error: { code: error.code, message: error.message } });
    }
    next(error);
  }
}

/**
 * PATCH /api/v1/action-plans/:id/items/:itemId/status
 */
async function updateItemStatus(req, res, next) {
  try {
    const { id, itemId } = req.params;
    const { status } = req.body;
    const auth = authorizeManager(req);

    if (!status) {
      return res.status(400).json({
        success: false,
        error: { code: 'STATUS_REQUIRED', message: 'Item status is required.' },
      });
    }

    const result = await aiPersistence.updateActionItemStatus(id, itemId, {
      status,
      actorId: auth.actorId,
      actorRole: auth.role,
    });

    return res.status(200).json({
      success: true,
      message: `Action item status updated to ${status}.`,
      data: result,
    });
  } catch (error) {
    if (error.code === 'PLAN_NOT_FOUND' || error.code === 'ITEM_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: error.code, message: error.message } });
    }
    if (error.code === 'INVALID_ITEM_STATUS') {
      return res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
    }
    next(error);
  }
}

module.exports = {
  getActionPlan,
  getAuditTrail,
  approvePlan,
  executePlan,
  getExecutionState,
  getExecutionTimeline,
  rejectPlan,
  modifyPlan,
  updateItemStatus,
};

