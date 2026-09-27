/**
 * Centralized Frontend Environment & API Configuration
 * Supports local development and production deployment (Vercel -> Render).
 */

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Normalize API base URL: ensure no trailing slash
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

// Derive base backend root (strip /api/v1 or /api)
export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '')
).replace(/\/+$/, '');

// WebSocket / Socket.IO connection URL
export const SOCKET_URL = (
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  BACKEND_URL ||
  'http://localhost:5000'
).replace(/\/+$/, '');

const config = {
  API_BASE_URL,
  BACKEND_URL,
  SOCKET_URL,
};

export default config;
