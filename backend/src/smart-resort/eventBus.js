/**
 * Smart Resort 360 - Event Bus
 * In-memory async pub/sub event bus + Server-Sent Events (SSE) streaming.
 * Provides unified cross-agent communication for Front Desk, Housekeeping,
 * Maintenance, and Revenue agents.
 */

// Event Type Constants
const EVENTS = {
  GUEST_CHECKED_IN: 'GUEST_CHECKED_IN',
  SENTIMENT_ALERT: 'SENTIMENT_ALERT',
  ROOM_READY_ETA_UPDATED: 'ROOM_READY_ETA_UPDATED',
  MAINTENANCE_REQUIRED: 'MAINTENANCE_REQUIRED',
  COST_INCIDENT_LOGGED: 'COST_INCIDENT_LOGGED',
  PERISHABLE_FLASH_SALE: 'PERISHABLE_FLASH_SALE',
  ROOM_STATUS_CHANGED: 'ROOM_STATUS_CHANGED',
  NET_REVPAR_UPDATED: 'NET_REVPAR_UPDATED',
  OCCUPANCY_THRESHOLD_CROSSED: 'OCCUPANCY_THRESHOLD_CROSSED',
  TEST_PING: 'TEST_PING',
};

const _subscribers = new Map();
const _sseClients = new Set();
const _eventHistory = [];

/**
 * Register an async subscriber function for an event type
 */
function subscribe(eventType, handler) {
  if (!_subscribers.has(eventType)) {
    _subscribers.set(eventType, []);
  }
  _subscribers.get(eventType).push(handler);
}

/**
 * Publish an event to all SSE stream clients and registered subscribers
 */
async function publish(eventType, payload) {
  const event = {
    event: eventType,
    event_type: eventType,
    payload,
    timestamp: new Date().toISOString(),
  };

  _eventHistory.push(event);
  if (_eventHistory.length > 200) {
    _eventHistory.shift();
  }

  // Push to SSE connected clients
  const sseData = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of _sseClients) {
    try {
      res.write(sseData);
      if (typeof res.flush === 'function') res.flush();
    } catch (e) {
      _sseClients.delete(res);
    }
  }

  // Execute subscribers sequentially
  const handlers = _subscribers.get(eventType) || [];
  for (const handler of handlers) {
    try {
      await handler(payload);
    } catch (err) {
      console.error(`[EventBus] Error in subscriber for ${eventType}:`, err.message);
    }
  }

  return event;
}

/**
 * SSE Handler for Express
 */
function handleSseStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  // Replay recent history (up to last 20 events)
  const recent = _eventHistory.slice(-20);
  for (const ev of recent) {
    res.write(`data: ${JSON.stringify(ev)}\n\n`);
  }

  _sseClients.add(res);

  // Heartbeat keep-alive every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
      _sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    _sseClients.delete(res);
  });
}

function getEventHistory(limit = 50) {
  return _eventHistory.slice(-limit);
}

function clearHistory() {
  _eventHistory.length = 0;
}

module.exports = {
  EVENTS,
  subscribe,
  publish,
  handleSseStream,
  getEventHistory,
  clearHistory,
};
