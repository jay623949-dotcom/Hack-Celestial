const express = require('express');
const router = express.Router();
const guestsController = require('../controllers/guests.controller');

// GET /api/v1/guests
router.get('/', guestsController.getAllGuests);

// GET /api/v1/guests/:id
router.get('/:id', guestsController.getGuestById);

// POST /api/v1/guests
router.post('/', guestsController.createGuest);

// PATCH /api/v1/guests/:id
router.patch('/:id', guestsController.updateGuest);

module.exports = router;
