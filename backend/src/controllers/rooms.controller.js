const roomService = require('../services/roomService');

/**
 * Controller for Room resources
 */
function getAllRooms(req, res, next) {
  try {
    const { status, type, floor } = req.query;
    const rooms = roomService.getAll({ status, type, floor });
    return res.status(200).json({
      success: true,
      data: rooms,
      meta: {
        count: rooms.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

function getRoomById(req, res, next) {
  try {
    const { id } = req.params;
    const room = roomService.getById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Room with ID '${id}' not found`,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

function createRoom(req, res, next) {
  try {
    const { number, type, status, floor, features } = req.body;

    // Validation: number, type, status required
    if (!number || !type || !status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required room fields: number, type, and status are mandatory.',
        },
      });
    }

    const room = roomService.create({ number, type, status, floor, features });
    return res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

function updateRoom(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = roomService.update(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Room with ID '${id}' not found`,
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
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
};
