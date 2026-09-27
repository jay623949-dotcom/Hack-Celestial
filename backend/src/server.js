const app = require('./app');
const config = require('./config');

const socketService = require('./services/socket.service');

const server = app.listen(config.port, () => {
  console.log(`[SERVER] Resort 360 Backend running on port ${config.port} (${config.nodeEnv} mode)`);
  console.log(`[SERVER] Health endpoint: /health`);
  console.log(`[SERVER] API v1 base: /api/v1`);
  console.log(`[SERVER] Allowed Frontend: ${config.clientUrl}`);
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

