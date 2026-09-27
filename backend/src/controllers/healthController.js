const { checkDatabaseHealth } = require('../config/db');
const config = require('../config');

/**
 * Health Controller
 * Provides status information to verify backend, database, AI, and Socket.IO health.
 */
async function getHealth(req, res) {
  const dbHealth = await checkDatabaseHealth();
  const aiConfigured = Boolean(
    config.ai?.grok?.apiKey || config.ai?.gemma?.apiKey || config.ai?.openai?.apiKey || config.ai?.provider === 'local'
  );

  res.status(200).json({
    success: true,
    service: 'resort360-api',
    status: 'healthy',
    database: dbHealth.connected ? 'connected' : 'disconnected',
    ai: {
      provider: config.ai.provider,
      configured: aiConfigured,
    },
    realtime: {
      socket: 'ready',
    },
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};
