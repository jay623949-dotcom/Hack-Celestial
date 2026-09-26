const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');

// GET /api/v1/staff
router.get('/', staffController.getAllStaff);

// GET /api/v1/staff/:id
router.get('/:id', staffController.getStaffById);

// POST /api/v1/staff
router.post('/', staffController.createStaff);

// PATCH /api/v1/staff/:id
router.patch('/:id', staffController.updateStaff);

module.exports = router;
