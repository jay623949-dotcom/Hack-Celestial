const incidentService = require('../services/incidentService');
const roomService = require('../services/roomService');
const guestService = require('../services/guestService');

/**
 * Controller for Incident resources
 */
function getAllIncidents(req, res, next) {
  try {
    const { status, severity, department, room_id } = req.query;
    const incidents = incidentService.getAll({ status, severity, department, room_id });
    return res.status(200).json({
      success: true,
      data: incidents,
      meta: {
        count: incidents.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

function getIncidentById(req, res, next) {
  try {
    const { id } = req.params;
    const incident = incidentService.getById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Incident with ID '${id}' not found`,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    next(error);
  }
}

function createIncident(req, res, next) {
  try {
    const { title, severity, status, department, description, room_id, guest_id } = req.body;

    // Validation: title, severity, status required
    if (!title || !severity || !status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required incident fields: title, severity, and status are mandatory.',
        },
      });
    }

    // Relationship validation: room_id
    if (room_id) {
      const room = roomService.getById(room_id);
      if (!room) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate incident with non-existent room ID: '${room_id}'.`,
          },
        });
      }
    }

    // Relationship validation: guest_id
    if (guest_id) {
      const guest = guestService.getById(guest_id);
      if (!guest) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate incident with non-existent guest ID: '${guest_id}'.`,
          },
        });
      }
    }

    const incident = incidentService.create({
      title,
      severity,
      status,
      department,
      description,
      room_id,
      guest_id,
    });

    return res.status(201).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    next(error);
  }
}

function updateIncident(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Relationship validation on updates
    if (updates.room_id) {
      const room = roomService.getById(updates.room_id);
      if (!room) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate incident with non-existent room ID: '${updates.room_id}'.`,
          },
        });
      }
    }

    if (updates.guest_id) {
      const guest = guestService.getById(updates.guest_id);
      if (!guest) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate incident with non-existent guest ID: '${updates.guest_id}'.`,
          },
        });
      }
    }

    const updated = incidentService.update(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Incident with ID '${id}' not found`,
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
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
};
