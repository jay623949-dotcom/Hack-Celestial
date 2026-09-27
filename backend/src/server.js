const app = require('./app');
const config = require('./config');

const socketService = require('./services/socket.service');

const server = app.listen(config.port, () => {
  console.log(`[SERVER] Resort 360 Backend running on port ${config.port} (${config.nodeEnv} mode)`);
  console.log(`[SERVER] Health endpoint: /health`);
  console.log(`[SERVER] API v1 base: /api/v1`);
  console.log(`[SERVER] Allowed Frontend: ${config.clientUrl}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER] Port ${config.port} is already in use by another process.`);
    process.exit(1);
  } else {
    console.error('[SERVER] Server error:', err.message);
  }
});

// Attach Socket.IO
socketService.init(server);

// Start Telegram Bot if TELEGRAM_BOT_TOKEN is configured
if (process.env.TELEGRAM_BOT_TOKEN) {
  require('./services/telegramBot');
} else {
  console.log('[Telegram Bot] TELEGRAM_BOT_TOKEN not configured. Skipping bot initialization.');
}

const gracefulShutdown = () => {
  try {
    server.close(() => {
      process.exit(0);
    });
  } catch (_) {
    process.exit(0);
  }
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { app, server };

