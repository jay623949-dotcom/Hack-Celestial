const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { checkDatabaseHealth } = require('./config/db');

// Routes
const healthRoutes = require('./routes/healthRoutes');
const roomsRoutes = require('./routes/rooms.routes');
const guestsRoutes = require('./routes/guests.routes');
const staffRoutes = require('./routes/staff.routes');
const incidentsRoutes = require('./routes/incidents.routes');
const tasksRoutes = require('./routes/tasks.routes');
const operationsRoutes = require('./routes/operations.routes');
const aiRoutes = require('./routes/ai.routes');
const actionPlansRoutes = require('./routes/action-plans.routes');
const weatherRoutes = require('./routes/weather.routes');

// Smart Resort 360 Autonomous Multi-Agent OS Router
const { smartResortRouter, performReset } = require('./smart-resort/routes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Request Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// ─────────────────────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────────────────────
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

const configuredOrigins = [
  config.frontendUrl,
  config.clientUrl,
  ...extraOrigins,
].filter(Boolean).map((u) => u.replace(/\/+$/, ''));

const devOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173',
];

function isAllowedOrigin(origin) {
  // Allow requests without origin (curl, mobile apps, server-to-server)
  if (!origin) return true;

  const normalized = origin.replace(/\/+$/, '');

  // Exact match against configured frontend URLs
  if (configuredOrigins.includes(normalized)) {
    return true;
  }

  // Allow local development ports in non-production
  if (config.nodeEnv !== 'production') {
    if (
      devOrigins.includes(normalized) ||
      /^http:\/\/localhost:[0-9]+$/.test(normalized) ||
      /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(normalized)
    ) {
      return true;
    }
  }

  // Allow Vercel preview or production deployments
  if (
    process.env.ALLOW_VERCEL_PREVIEWS === 'true' ||
    config.frontendUrl.includes('vercel.app')
  ) {
    if (/^https:\/\/[a-z0-9-]+(\.vercel\.app)$/.test(normalized) || /^https:\/\/[a-z0-9-]+-.*\.vercel\.app$/.test(normalized)) {
      return true;
    }
  }

  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      if (config.nodeEnv !== 'production') {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-role', 'x-user-role', 'Accept'],
  })
);

// Body Parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Root welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Resort 360 Operational Intelligence & Multi-Agent OS API',
    version: 'v1',
    docs: '/api/v1/operations/summary',
    healthCheck: '/health',
  });
});

// Demo reset endpoint
app.post(['/demo/reset', '/api/demo/reset'], performReset);

// Health check endpoint (for Render and uptime monitors)
app.get(['/health', '/api/health'], async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.status(200).json({
    status: 'ok',
    service: 'resort360-backend',
    environment: config.nodeEnv,
    database: dbHealth.connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Mount Smart Resort 360 routes directly on /api and /api/v1
app.use(['/api/incidents', '/api/concerns', '/concerns'], incidentsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api', smartResortRouter);
app.use('/api', weatherRoutes);

// API v1 Mounting
const apiV1Router = express.Router();

apiV1Router.use('/health', healthRoutes);
apiV1Router.use('/rooms', roomsRoutes);
apiV1Router.use('/guests', guestsRoutes);
apiV1Router.use('/staff', staffRoutes);
apiV1Router.use(['/incidents', '/concerns'], incidentsRoutes);
apiV1Router.use('/tasks', tasksRoutes);
apiV1Router.use('/operations', operationsRoutes);
apiV1Router.use('/ai', aiRoutes);
apiV1Router.use('/action-plans', actionPlansRoutes);
apiV1Router.use('/', weatherRoutes);
apiV1Router.use('/', smartResortRouter);

app.use('/api/v1', apiV1Router);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
module.exports.isAllowedOrigin = isAllowedOrigin;
