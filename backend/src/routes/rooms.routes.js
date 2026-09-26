const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/rooms.controller');

// GET /api/v1/rooms
router.get('/', roomsController.getAllRooms);

// GET /api/v1/rooms/:id
router.get('/:id', roomsController.getRoomById);

// POST /api/v1/rooms
router.post('/', roomsController.createRoom);

// PATCH /api/v1/rooms/:id
router.patch('/:id', roomsController.updateRoom);

// PUT /api/v1/rooms/:id
router.put('/:id', roomsController.updateRoom);

module.exports = router;
