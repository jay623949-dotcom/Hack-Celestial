const guestService = require('../services/guestService');
const roomService = require('../services/roomService');

/**
 * Controller for Guest resources
 */
function getAllGuests(req, res, next) {
  try {
    const { vip, room_id } = req.query;
    const guests = guestService.getAll({ vip, room_id });
    return res.status(200).json({
      success: true,
      data: guests,
      meta: {
        count: guests.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

function getGuestById(req, res, next) {
  try {
    const { id } = req.params;
    const guest = guestService.getById(id);
    if (!guest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Guest with ID '${id}' not found`,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: guest,
    });
  } catch (error) {
    next(error);
  }
}

function createGuest(req, res, next) {
  try {
    const { name, vip, vip_tier, room_id, check_in, check_out, notes } = req.body;

    // Validation: name required
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required guest field: name is mandatory.',
        },
      });
    }

    // Relationship Validation: If room_id exists, verify that room exists
    if (room_id) {
      const room = roomService.getById(room_id);
      if (!room) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate guest with non-existent room ID: '${room_id}'.`,
          },
        });
      }
    }

    const guest = guestService.create({ name: name.trim(), vip, vip_tier, room_id, check_in, check_out, notes });
    return res.status(201).json({
      success: true,
      data: guest,
    });
  } catch (error) {
    next(error);
  }
}

function updateGuest(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Relationship Validation if room_id is being updated
    if (updates.room_id) {
      const room = roomService.getById(updates.room_id);
      if (!room) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate guest with non-existent room ID: '${updates.room_id}'.`,
          },
        });
      }
    }

    const updated = guestService.update(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Guest with ID '${id}' not found`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
};
