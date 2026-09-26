const taskService = require('../services/taskService');
const staffService = require('../services/staffService');
const incidentService = require('../services/incidentService');
const roomService = require('../services/roomService');

/**
 * Controller for Task resources
 */
function getAllTasks(req, res, next) {
  try {
    const { status, priority, department, assigned_to, incident_id, room_id } = req.query;
    const tasks = taskService.getAll({ status, priority, department, assigned_to, incident_id, room_id });
    return res.status(200).json({
      success: true,
      data: tasks,
      meta: {
        count: tasks.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

function getTaskById(req, res, next) {
  try {
    const { id } = req.params;
    const task = taskService.getById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Task with ID '${id}' not found`,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

function createTask(req, res, next) {
  try {
    const { title, priority, status, department, description, assigned_to, room_id, incident_id, due_time } = req.body;

    // Validation: title, priority, status required
    if (!title || !priority || !status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required task fields: title, priority, and status are mandatory.',
        },
      });
    }

    // Relationship validation: assigned_to -> staff
    if (assigned_to) {
      const staffMember = staffService.getById(assigned_to);
      if (!staffMember) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot assign task to non-existent staff ID: '${assigned_to}'.`,
          },
        });
      }
    }

    // Relationship validation: incident_id -> incident
    if (incident_id) {
      const incident = incidentService.getById(incident_id);
      if (!incident) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate task with non-existent incident ID: '${incident_id}'.`,
          },
        });
      }
    }

    // Relationship validation: room_id -> room
    if (room_id) {
      const room = roomService.getById(room_id);
      if (!room) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate task with non-existent room ID: '${room_id}'.`,
          },
        });
      }
    }

    const task = taskService.create({
      title,
      priority,
      status,
      department,
      description,
      assigned_to,
      room_id,
      incident_id,
      due_time,
    });

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Relationship validation on updates
    if (updates.assigned_to) {
      const staffMember = staffService.getById(updates.assigned_to);
      if (!staffMember) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot assign task to non-existent staff ID: '${updates.assigned_to}'.`,
          },
        });
      }
    }

    if (updates.incident_id) {
      const incident = incidentService.getById(updates.incident_id);
      if (!incident) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate task with non-existent incident ID: '${updates.incident_id}'.`,
          },
        });
      }
    }

    if (updates.room_id) {
      const room = roomService.getById(updates.room_id);
      if (!room) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_VALIDATION_ERROR',
            message: `Cannot associate task with non-existent room ID: '${updates.room_id}'.`,
          },
        });
      }
    }

    const updated = taskService.update(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Task with ID '${id}' not found`,
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
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
};
