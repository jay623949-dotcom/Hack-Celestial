const express = require('express');
const router = express.Router();
const actionPlansController = require('../controllers/actionPlans.controller');

// GET /api/v1/action-plans/:id
router.get('/:id', actionPlansController.getActionPlan);

// GET /api/v1/action-plans/:id/audit-trail
router.get('/:id/audit-trail', actionPlansController.getAuditTrail);

// GET /api/v1/action-plans/:id/execution
router.get('/:id/execution', actionPlansController.getExecutionState);

// GET /api/v1/action-plans/:id/timeline
router.get('/:id/timeline', actionPlansController.getExecutionTimeline);

// POST /api/v1/action-plans/:id/approve
router.post('/:id/approve', actionPlansController.approvePlan);

// POST /api/v1/action-plans/:id/execute
router.post('/:id/execute', actionPlansController.executePlan);

// POST /api/v1/action-plans/:id/reject
router.post('/:id/reject', actionPlansController.rejectPlan);

// POST /api/v1/action-plans/:id/modify
router.post('/:id/modify', actionPlansController.modifyPlan);

// PATCH /api/v1/action-plans/:id/items/:itemId/status
router.patch('/:id/items/:itemId/status', actionPlansController.updateItemStatus);

module.exports = router;

