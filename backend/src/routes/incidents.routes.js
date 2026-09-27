const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidents.controller');

// GET /api/v1/incidents
router.get('/', incidentsController.getAllIncidents);

// GET /api/v1/incidents/:id
router.get('/:id', incidentsController.getIncidentById);

// POST /api/v1/incidents
router.post('/', incidentsController.createIncident);

// PATCH /api/v1/incidents/:id
router.patch('/:id', incidentsController.updateIncident);

module.exports = router;
