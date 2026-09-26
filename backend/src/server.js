const app = require('./app');
const config = require('./config');

const socketService = require('./services/socket.service');

const server = app.listen(config.port, () => {
  console.log(`[Resort 360 Backend] Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`[Resort 360 Backend] Base API endpoint: http://localhost:${config.port}/api/v1`);
  console.log(`[Resort 360 Backend] Health check: http://localhost:${config.port}/api/v1/health`);
  console.log(`[Resort 360 Backend] Operations summary: http://localhost:${config.port}/api/v1/operations/summary`);
});

// Attach Socket.IO
socketService.init(server);

// Start Telegram Bot if TELEGRAM_BOT_TOKEN is configured
if (process.env.TELEGRAM_BOT_TOKEN) {
  require('./services/telegramBot');
} else {
  console.log('[Telegram Bot] TELEGRAM_BOT_TOKEN not configured. Skipping bot initialization.');
}

module.exports = { app, server };

