const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');

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

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  config.clientUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        (config.nodeEnv !== 'production' && /^http:\/\/localhost:[0-9]+$/.test(origin))
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev so all ports work
    },
    credentials: true,
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

// Health check endpoints
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Resort 360 API',
    system: 'Autonomous Multi-Agent Resort Operating System',
    timestamp: new Date().toISOString(),
  });
});

// Mount Smart Resort 360 routes directly on /api and /api/v1
app.use('/api', smartResortRouter);

// API v1 Mounting
const apiV1Router = express.Router();

apiV1Router.use('/health', healthRoutes);
apiV1Router.use('/rooms', roomsRoutes);
apiV1Router.use('/guests', guestsRoutes);
apiV1Router.use('/staff', staffRoutes);
apiV1Router.use('/incidents', incidentsRoutes);
apiV1Router.use('/tasks', tasksRoutes);
apiV1Router.use('/operations', operationsRoutes);
apiV1Router.use('/ai', aiRoutes);
apiV1Router.use('/action-plans', actionPlansRoutes);
apiV1Router.use('/', smartResortRouter);

app.use('/api/v1', apiV1Router);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

