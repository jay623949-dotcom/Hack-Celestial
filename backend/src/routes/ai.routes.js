const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// POST /api/v1/ai/context
router.post('/context', aiController.getOperationalContext);

// POST /api/v1/ai/analyze
router.post('/analyze', aiController.analyzeOperationalContext);

module.exports = router;
