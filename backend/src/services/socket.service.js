const config = require('../config');

let ioInstance = null;
const eventHistoryBuffer = [];
const MAX_HISTORY = 100;

/**
 * Socket.IO Real-time Central Service for Resort 360
 */
function init(server) {
  try {
    const { Server } = require('socket.io');

    const allowedOrigins = [config.clientUrl, config.frontendUrl].filter(Boolean).map((u) => u.replace(/\/+$/, ''));

    ioInstance = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          const normalized = origin.replace(/\/+$/, '');
          if (
            allowedOrigins.includes(normalized) ||
            config.nodeEnv !== 'production' ||
            (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && /^https:\/\/[a-z0-9-]+.*\.vercel\.app$/.test(normalized))
          ) {
            return callback(null, true);
          }
          console.warn(`[SOCKET] Blocked connection from origin: ${origin}`);
          return callback(new Error(`[SOCKET] Origin ${origin} not allowed by CORS policy`));
        },
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    ioInstance.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id}`);

      // Support subscribing to specific action plans or execution runs
      const handleJoin = (planId) => {
        socket.join(`plan:${planId}`);
        console.log(`[SOCKET] ${socket.id} joined room plan:${planId}`);
      };

      socket.on('subscribe:plan', handleJoin);
      socket.on('join:plan', handleJoin);

      socket.on('unsubscribe:plan', (planId) => {
        socket.leave(`plan:${planId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
      });
    });

    console.log('[SOCKET] Service initialized successfully.');
    return ioInstance;
  } catch (error) {
    console.warn('[SOCKET] Warning: Failed to initialize socket.io:', error.message);
    return null;
  }
}

function getIO() {
  return ioInstance;
}

/**
 * Emit an operational event to all connected clients and room subscribers.
 * Automatically saves event to circular history buffer.
 */
function emitEvent(eventName, payload) {
  const eventRecord = {
    event: eventName,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  // Keep in circular buffer
  eventHistoryBuffer.push(eventRecord);
  if (eventHistoryBuffer.length > MAX_HISTORY) {
    eventHistoryBuffer.shift();
  }

  if (ioInstance) {
    try {
      // 1. Broadcast globally
      ioInstance.emit(eventName, eventRecord);

      // 2. Also emit to specific action-plan room if action_plan_id exists in payload
      const planId = payload?.action_plan_id || payload?.plan_id;
      if (planId) {
        ioInstance.to(`plan:${planId}`).emit(eventName, eventRecord);
      }
      console.log(`[SOCKET] Execution event dispatched: ${eventName} -> ${planId || 'global'}`);
    } catch (err) {
      console.warn(`[SOCKET] Emit failed for ${eventName}:`, err.message);
    }
  } else {
    // In headless test mode or when socket.io is offline
    console.log(`[SOCKET] Event logged (offline): ${eventName}:`, payload?.task_id || payload?.title || '');
  }

  return eventRecord;
}

function getRecentEvents(limit = 50) {
  return eventHistoryBuffer.slice(-limit).reverse();
}

module.exports = {
  init,
  getIO,
  emit: emitEvent,
  emitEvent,
  getRecentEvents,
};
