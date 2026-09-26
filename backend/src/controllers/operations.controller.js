const operationsService = require('../services/operationsService');

/**
 * Controller for Real-Time Operations Summary
 */
function getOperationsSummary(req, res, next) {
  try {
    const summary = operationsService.getSummary();
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOperationsSummary,
};
