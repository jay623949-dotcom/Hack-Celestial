const express = require('express');
const router = express.Router();
const operationsController = require('../controllers/operations.controller');

// GET /api/v1/operations/summary
router.get('/summary', operationsController.getOperationsSummary);

module.exports = router;
