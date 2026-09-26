import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  processCostIncident,
  processFlashSale,
  processGuestIntake,
  processHousekeepingReorder,
  processMaintenanceCv,
} from './src/services/intelligenceEngineService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Resort 360 - Intelligence Engine',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// 1. Guest Intake (Front Desk Ambient Voice)
app.post('/api/engine/guest-intake', async (req, res) => {
  try {
    const startTime = Date.now();
    const { transcript, guest_id, reservation_context } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Missing transcript in request body' });
    }
    const result = await processGuestIntake({
      transcript,
      guest_id,
      reservation_context,
    });
    const latencyMs = Date.now() - startTime;
    return res.json({ result, latencyMs });
  } catch (error: any) {
    console.error('Error in /api/engine/guest-intake:', error);
    return res.status(500).json({ error: error.message || 'Intake processing error' });
  }
});

// 2. Maintenance CV Triage (Image Recognition)
app.post('/api/engine/maintenance-cv', async (req, res) => {
  try {
    const startTime = Date.now();
    const { image_data, room_id, fixture_hint, override_confidence } = req.body;
    const result = await processMaintenanceCv({
      image_data,
      room_id,
      fixture_hint,
      override_confidence,
    });
    const latencyMs = Date.now() - startTime;
    return res.json({ result, latencyMs });
  } catch (error: any) {
    console.error('Error in /api/engine/maintenance-cv:', error);
    return res.status(500).json({ error: error.message || 'CV processing error' });
  }
});

// 3. Cost Incident Summary (feeds Revenue Net RevPAR)
app.post('/api/engine/cost-incident', async (req, res) => {
  try {
    const startTime = Date.now();
    const { source_work_order_id, anomaly_data, affects_room_ids } = req.body;
    const result = await processCostIncident({
      source_work_order_id,
      anomaly_data,
      affects_room_ids,
    });
    const latencyMs = Date.now() - startTime;
    return res.json({ result, latencyMs });
  } catch (error: any) {
    console.error('Error in /api/engine/cost-incident:', error);
    return res.status(500).json({ error: error.message || 'Cost incident error' });
  }
});

// 4. Flash Sale Offer (Perishable Asset Micro-Sales)
app.post('/api/engine/flash-sale', async (req, res) => {
  try {
    const startTime = Date.now();
    const { asset, expires_in_minutes, checked_in_guests, discounted_price } = req.body;
    if (!asset || !checked_in_guests) {
      return res.status(400).json({ error: 'Missing asset or checked_in_guests' });
    }
    const result = await processFlashSale({
      asset,
      expires_in_minutes: expires_in_minutes || 30,
      checked_in_guests,
      discounted_price,
    });
    const latencyMs = Date.now() - startTime;
    return res.json({ result, latencyMs });
  } catch (error: any) {
    console.error('Error in /api/engine/flash-sale:', error);
    return res.status(500).json({ error: error.message || 'Flash sale error' });
  }
});

// 5. Housekeeping Reorder
app.post('/api/engine/housekeeping-reorder', async (req, res) => {
  try {
    const startTime = Date.now();
    const { trigger_reason, current_queue } = req.body;
    if (!trigger_reason) {
      return res.status(400).json({ error: 'Missing trigger_reason' });
    }
    const result = await processHousekeepingReorder({
      trigger_reason,
      current_queue: current_queue || [],
    });
    const latencyMs = Date.now() - startTime;
    return res.json({ result, latencyMs });
  } catch (error: any) {
    console.error('Error in /api/engine/housekeeping-reorder:', error);
    return res.status(500).json({ error: error.message || 'Housekeeping reorder error' });
  }
});

async function startServer() {
  if (!isProduction) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve pre-built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Resort 360] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
