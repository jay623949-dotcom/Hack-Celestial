const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`[Resort 360 Backend] Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`[Resort 360 Backend] Base API endpoint: http://localhost:${config.port}/api/v1`);
  console.log(`[Resort 360 Backend] Health check: http://localhost:${config.port}/api/v1/health`);
  console.log(`[Resort 360 Backend] Operations summary: http://localhost:${config.port}/api/v1/operations/summary`);
});

module.exports = { app, server };
