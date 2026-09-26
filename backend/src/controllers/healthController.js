/**
 * Health Controller
 * Provides status information to verify backend health.
 */
function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'resort-360-backend',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};
