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
    let { title, severity, status, department, description, room_id, guest_id, room_number, source } = req.body;

    // Resolve room_number to room_id if room_id not directly provided
    if (!room_id && room_number) {
      const room = roomService.getAll().find((r) => String(r.number) === String(room_number) || r.id === room_number);
      room_id = room ? room.id : `room-${room_number}`;
    }

    // Default title if description is given
    if (!title && description) {
      title = `Report${room_number ? ` (Room ${room_number})` : ''}: ${description.slice(0, 40)}`;
    }

    // Default severity and status if not provided
    if (!severity) severity = 'medium';
    if (!status) status = 'open';

    // Validation: title required
    if (!title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required incident fields: title or description is mandatory.',
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
            message: `Associated room with ID '${room_id}' does not exist.`,
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
      department: department || 'maintenance',
      description,
      room_id,
      guest_id,
      source: source || 'api',
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

    // Real-Time Socket.IO Synchronization
    const socketService = require('../services/socket.service');
    socketService.emitEvent('incident:updated', updated);
    socketService.emitEvent('incident.status_changed', updated);

    // If incident reached resolved / completed / closed, notify guest via Telegram
    if (updates.status && ['resolved', 'completed', 'closed'].includes(String(updates.status).toLowerCase())) {
      try {
        const telegramBot = require('../services/telegramBot');
        const roomNum = updated.room_number || (updated.room_id ? String(updated.room_id).replace(/^room-/i, '') : null);
        telegramBot.notifyGuestTaskCompleted({
          roomNumber: roomNum,
          title: updated.title || updated.description,
          assignedStaff: updated.assigned_to,
          resolutionNotes: updates.resolution_notes || updates.notes,
          guestId: updated.guest_id,
        });
      } catch (botErr) {
        console.error('[Incidents Controller] Telegram notification trigger failed:', botErr.message);
      }
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
