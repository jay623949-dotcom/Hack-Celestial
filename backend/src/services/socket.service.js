let ioInstance = null;
const eventHistoryBuffer = [];
const MAX_HISTORY = 100;

/**
 * Socket.IO Real-time Central Service for Resort 360
 */
function init(server) {
  try {
    const { Server } = require('socket.io');
    ioInstance = new Server(server, {
      cors: {
        origin: '*', // Allow all origins in dev environment
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: false,
      },
      transports: ['websocket', 'polling'],
    });

    ioInstance.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      // Support subscribing to specific action plans or execution runs
      const handleJoin = (planId) => {
        socket.join(`plan:${planId}`);
        console.log(`[Socket.IO] ${socket.id} joined room plan:${planId}`);
      };

      socket.on('subscribe:plan', handleJoin);
      socket.on('join:plan', handleJoin);

      socket.on('unsubscribe:plan', (planId) => {
        socket.leave(`plan:${planId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    console.log('[Socket.IO] Service initialized successfully.');
    return ioInstance;
  } catch (error) {
    console.warn('[Socket.IO] Warning: Failed to initialize socket.io:', error.message);
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
      console.log(`[Socket.IO Emit] ${eventName} -> ${planId || 'global'}`);
    } catch (err) {
      console.warn(`[Socket.IO] Emit failed for ${eventName}:`, err.message);
    }
  } else {
    // In headless test mode or when socket.io is offline
    console.log(`[Socket.IO Local Log] ${eventName}:`, payload?.task_id || payload?.title || '');
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
