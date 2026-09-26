const express = require('express');
const cors = require('cors');
const config = require('./config');
const healthRoutes = require('./routes/healthRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check (Available both at root /health and /api/health)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Root fallback route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Resort 360 API',
    healthCheck: '/health',
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`[Resort 360 Backend] Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`[Resort 360 Backend] Health check endpoint: http://localhost:${config.port}/health`);
});

module.exports = { app, server };
