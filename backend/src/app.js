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

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security Headers
app.use(helmet());

// Request Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
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
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Resort 360 Operational Intelligence API',
    version: 'v1',
    docs: '/api/v1/operations/summary',
    healthCheck: '/api/v1/health',
  });
});

// API v1 Mounting
const apiV1Router = express.Router();

apiV1Router.use('/health', healthRoutes);
apiV1Router.use('/rooms', roomsRoutes);
apiV1Router.use('/guests', guestsRoutes);
apiV1Router.use('/staff', staffRoutes);
apiV1Router.use('/incidents', incidentsRoutes);
apiV1Router.use('/tasks', tasksRoutes);
apiV1Router.use('/operations', operationsRoutes);

app.use('/api/v1', apiV1Router);

// Backward-compatibility health check aliases
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
