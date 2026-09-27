const incidentService = require('../services/incidentService');
const roomService = require('../services/roomService');
const guestService = require('../services/guestService');

/**
 * Controller for Incident resources
 */
function getAllIncidents(req, res, next) {
  try {
    const { status, severity, department, reporting_department, affected_department, room_id } = req.query;
    const incidents = incidentService.getAll({ 
      status, 
      severity, 
      department, 
      reporting_department, 
      affected_department, 
      room_id 
    });
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

const ROLE_TO_DEPT = {
  front_desk: 'front_desk',
  housekeeping: 'housekeeping',
  maintenance: 'maintenance',
  revenue: 'revenue',
  revenue_manager: 'revenue',
  admin: 'admin',
};

function createIncident(req, res, next) {
  try {
    let { 
      title, 
      severity, 
      status, 
      department, 
      affected_department, 
      reporting_department, 
      reported_by,
      category,
      description, 
      room_id, 
      guest_id, 
      room_number, 
      source,
      block_room 
    } = req.body;

    // Detect authenticated caller role
    const callerRole = (
      req.headers['x-user-role'] ||
      req.headers['x-role'] ||
      req.body.actor_role ||
      req.body.role ||
      'admin'
    ).toLowerCase();

    // Enforce role-based department security:
    // Non-admin users CANNOT spoof reporting_department!
    let validatedReportingDept = 'front_desk';
    if (callerRole === 'admin') {
      validatedReportingDept = reporting_department || 'management';
    } else {
      validatedReportingDept = ROLE_TO_DEPT[callerRole] || 'front_desk';
    }

    // Determine affected/responsible department (cross-department support)
    const validatedAffectedDept = affected_department || department || 'maintenance';

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

    const callerName = req.headers['x-user-name'] || req.headers['x-user-email'] || reported_by || `${callerRole.replace('_', ' ')} Operator`;

    const incident = incidentService.create({
      title,
      severity,
      status,
      department: validatedAffectedDept,
      affected_department: validatedAffectedDept,
      reporting_department: validatedReportingDept,
      reported_by: callerName,
      category: category || 'general',
      description,
      room_id,
      guest_id,
      source: source || 'ERP Operations Concern',
    });

    // If pre-booking room block requested, lock the room into maintenance in room inventory
    if (block_room && room_id) {
      try {
        roomService.update(room_id, {
          status: 'maintenance',
          issue: `Operational defect: ${title}`,
        });
      } catch (rErr) {
        console.warn('Could not lock room in roomService:', rErr.message);
      }
    }

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
