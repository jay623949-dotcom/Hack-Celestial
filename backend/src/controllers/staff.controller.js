const staffService = require('../services/staffService');

/**
 * Controller for Staff resources
 */
function getAllStaff(req, res, next) {
  try {
    const { department, status } = req.query;
    const staff = staffService.getAll({ department, status });
    return res.status(200).json({
      success: true,
      data: staff,
      meta: {
        count: staff.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

function getStaffById(req, res, next) {
  try {
    const { id } = req.params;
    const member = staffService.getById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Staff member with ID '${id}' not found`,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
}

function createStaff(req, res, next) {
  try {
    const { name, department, status, role, current_task } = req.body;

    // Validation: name, department, status required
    if (!name || !department || !status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required staff fields: name, department, and status are mandatory.',
        },
      });
    }

    const member = staffService.create({ name, department, status, role, current_task });
    return res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
}

function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = staffService.update(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Staff member with ID '${id}' not found`,
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
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
};
