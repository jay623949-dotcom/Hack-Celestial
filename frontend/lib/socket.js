import { io } from 'socket.io-client';

let socket = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '')
    : 'http://localhost:5000');

/**
 * Get or initialize the singleton Socket.IO client instance
 */
export function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log(`[Socket.IO] Connected to ${SOCKET_URL} (ID: ${socket.id})`);
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Socket.IO] Disconnected:`, reason);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket.IO] Connection error:`, error.message);
    });
  }

  return socket;
}

/**
 * Join an action plan's execution room for targeted broadcasts
 */
export function joinExecutionRoom(planId) {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('join:plan', planId);
  } else if (s) {
    s.once('connect', () => {
      s.emit('join:plan', planId);
    });
  }
}
