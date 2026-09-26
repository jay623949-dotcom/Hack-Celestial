/**
 * Health Controller
 * Provides status information to verify backend health.
 */
function getHealth(req, res) {
  res.status(200).json({
    success: true,
    service: 'resort360-api',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};
