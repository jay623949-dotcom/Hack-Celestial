const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// POST /api/v1/ai/context
router.post('/context', aiController.getOperationalContext);

// POST /api/v1/ai/analyze
router.post('/analyze', aiController.analyzeOperationalContext);

// POST /api/v1/ai/agents/analyze
router.post('/agents/analyze', aiController.analyzeDepartmentalAgents);

// POST /api/v1/ai/consensus
router.post('/consensus', aiController.getConsensus);

// GET  /api/v1/ai/runs         — list recent analysis runs
router.get('/runs', aiController.listAnalysisRuns);

// GET  /api/v1/ai/runs/:id     — single run with agents + consensus + action plan
router.get('/runs/:id', aiController.getAnalysisRun);

// PATCH /api/v1/ai/runs/:runId/plan/status  — approve / reject action plan
router.patch('/runs/:runId/plan/status', aiController.updatePlanStatus);

module.exports = router;


