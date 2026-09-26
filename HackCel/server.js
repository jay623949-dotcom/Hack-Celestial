/**
 * Smart Resort 360 Express Server for HackCel standalone runner
 */
const path = require('path');
const express = require('express');
const cors = require('cors');

// Import the converted Smart Resort 360 Express router & services
const { smartResortRouter, performReset } = require('../backend/src/smart-resort/routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Resort 360 API',
    engine: 'Express.js',
    timestamp: new Date().toISOString(),
  });
});

// Demo Reset
app.post(['/demo/reset', '/api/demo/reset'], performReset);

// Mount all Smart Resort 360 routes
app.use('/api', smartResortRouter);
app.use('/', smartResortRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Smart Resort 360 Express] Running on http://0.0.0.0:${PORT}`);
  console.log(`[Smart Resort 360 Express] SSE Stream at http://localhost:${PORT}/api/events/stream`);
  console.log(`[Smart Resort 360 Express] Health at http://localhost:${PORT}/health`);
});
