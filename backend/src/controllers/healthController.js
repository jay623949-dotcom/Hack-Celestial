const { pool, checkDatabaseHealth } = require('../config/db');

/**
 * Health Controller
 * Provides status information to verify backend and database health.
 */
async function getHealth(req, res) {
  const dbHealth = await checkDatabaseHealth();

  res.status(200).json({
    success: true,
    service: 'resort360-api',
    status: 'healthy',
    database: dbHealth.connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};
