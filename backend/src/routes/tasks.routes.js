const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');

// GET /api/v1/tasks
router.get('/', tasksController.getAllTasks);

// GET /api/v1/tasks/:id
router.get('/:id', tasksController.getTaskById);

// POST /api/v1/tasks
router.post('/', tasksController.createTask);

// PATCH /api/v1/tasks/:id
router.patch('/:id', tasksController.updateTask);

module.exports = router;
