/**
 * Smart Resort 360 - Express API Router
 * Comprehensive Express routes replacing the FastAPI python backend.
 */
const express = require('express');
const eventBus = require('./eventBus');
const frontDeskService = require('./frontdesk.service');
const housekeepingService = require('./housekeeping.service');
const maintenanceService = require('./maintenance.service');
const revenueService = require('./revenue.service');
const engineService = require('./engine.service');
const calendarService = require('../services/calendar.service');
const { state, resetState } = require('./smartResortStore');

const router = express.Router();

// ─── Initialize Cross-Agent Subscribers & Background Tasks ───────────────────
frontDeskService.registerSubscribers();
housekeepingService.registerSubscribers();
maintenanceService.registerSubscribers();
revenueService.registerSubscribers();
maintenanceService.startMeterSimulator();

// ─── Event Bus & Streaming ──────────────────────────────────────────────────
router.get('/events/stream', (req, res) => {
  eventBus.handleSseStream(req, res);
});

router.get('/events/history', (req, res) => {
  res.json({ events: eventBus.getEventHistory() });
});

// ─── Front Desk Endpoints ───────────────────────────────────────────────────
router.post('/frontdesk/checkin', async (req, res, next) => {
  try {
    const result = await frontDeskService.checkIn(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/frontdesk/guests', (req, res) => {
  res.json(frontDeskService.getGuests());
});

router.post('/frontdesk/service-recovery', (req, res, next) => {
  try {
    const { guest_id, action } = req.body;
    const result = frontDeskService.serviceRecovery(guest_id, action);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/frontdesk/priority-queue', (req, res) => {
  res.json(frontDeskService.getPriorityQueue());
});

// ─── Housekeeping Endpoints ─────────────────────────────────────────────────
router.get('/housekeeping/tasks', (req, res) => {
  res.json(housekeepingService.getTasks());
});

router.post('/housekeeping/reorder', async (req, res, next) => {
  try {
    const { task_ids_in_order = [] } = req.body;
    const result = await housekeepingService.reorder(task_ids_in_order);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post(['/housekeeping/complete', '/housekeeping/complete-task'], async (req, res, next) => {
  try {
    const { task_id, room_id } = req.body;
    const result = await housekeepingService.completeTask(task_id || room_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── Maintenance Endpoints ──────────────────────────────────────────────────
router.post('/maintenance/upload-ticket', async (req, res, next) => {
  try {
    const result = await maintenanceService.uploadTicket(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/maintenance/resolve', async (req, res, next) => {
  try {
    const result = await maintenanceService.resolveWorkOrder(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/maintenance/rooms/available-safe', (req, res) => {
  res.json(maintenanceService.getAvailableSafeRooms());
});

router.post('/maintenance/diagnostics/image-triage', async (req, res, next) => {
  try {
    const result = await maintenanceService.imageTriage(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/maintenance/anomaly/scan', async (req, res, next) => {
  try {
    const result = await maintenanceService.anomalyScan();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/maintenance/anomaly/active', (req, res) => {
  res.json(maintenanceService.getActiveAnomalies());
});

// ─── Revenue Endpoints ──────────────────────────────────────────────────────
router.post('/revenue/pricing', async (req, res, next) => {
  try {
    const result = await revenueService.recalculatePricing(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/revenue/pricing/current/:room_category', (req, res, next) => {
  try {
    const result = revenueService.getCurrentPricing(req.params.room_category);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/revenue/net-revpar', (req, res) => {
  res.json(revenueService.getNetRevPar());
});

router.post('/revenue/flash-sale', async (req, res, next) => {
  try {
    const result = await revenueService.createFlashSale(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post(['/revenue/wing-shutdown', '/revenue/wing-shutdown-simulate'], (req, res, next) => {
  try {
    const { wing_id } = req.body;
    const result = revenueService.simulateWingShutdown(wing_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── Calendar / Demand Endpoints ────────────────────────────────────────────
router.get('/calendar/month', (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) !== undefined && !isNaN(parseInt(req.query.month)) ? parseInt(req.query.month) : new Date().getMonth();
    const data = calendarService.getCalendarDataForMonth(year, month);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/calendar/annual', (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const overview = calendarService.getAnnualOverview(year);
    res.json(overview);
  } catch (err) {
    next(err);
  }
});

router.get('/calendar/events', (req, res, next) => {
  try {
    const events = calendarService.getCalendarEvents();
    res.json(events);
  } catch (err) {
    next(err);
  }
});

router.get('/calendar/date/:date', (req, res, next) => {
  try {
    const data = calendarService.getSeasonalDemand(req.params.date);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Intelligence Engine Endpoints (Frontend Server Compatibility) ─────────
router.post('/engine/guest-intake', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const result = await engineService.processGuestIntake(req.body);
    res.json({ result, latencyMs: Date.now() - startTime });
  } catch (err) {
    next(err);
  }
});

router.post('/engine/maintenance-cv', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const result = await engineService.processMaintenanceCv(req.body);
    res.json({ result, latencyMs: Date.now() - startTime });
  } catch (err) {
    next(err);
  }
});

router.post('/engine/cost-incident', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const result = await engineService.processCostIncident(req.body);
    res.json({ result, latencyMs: Date.now() - startTime });
  } catch (err) {
    next(err);
  }
});

router.post('/engine/flash-sale', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const result = await engineService.processFlashSale(req.body);
    res.json({ result, latencyMs: Date.now() - startTime });
  } catch (err) {
    next(err);
  }
});

router.post('/engine/housekeeping-reorder', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const result = await engineService.processHousekeepingReorder(req.body);
    res.json({ result, latencyMs: Date.now() - startTime });
  } catch (err) {
    next(err);
  }
});

// ─── System, Smoke Test, Demo, & Guardrails ──────────────────────────────────
router.post('/test/ping', async (req, res) => {
  const payload = {
    message: 'Express Smart Resort 360 backend is alive',
    timestamp: new Date().toISOString(),
  };
  await eventBus.publish(eventBus.EVENTS.TEST_PING, payload);
  res.json({ status: 'published', event: 'TEST_PING', payload });
});

router.get('/guardrails', (req, res) => {
  res.json({
    guardrails: {
      rate_change_cap_pct: 15,
      rate_change_cap_description: 'Maximum ±15% pricing change per /api/revenue/pricing call',
      cv_confidence_cutoff: 0.6,
      cv_confidence_description: 'CV triage confidence below 0.6 sets requires_human_review=true and does NOT auto-assign parts',
      anomaly_baseline_vacant_water_litres: 0.0,
      anomaly_baseline_vacant_power_kwh: 0.5,
      anomaly_unit_cost_water_per_litre: 0.004,
      anomaly_unit_cost_power_per_kwh: 0.15,
      anomaly_days_undetected_default: 3,
      fault_free_rule: 'Room.fault_free ONLY flips to True via explicit /api/maintenance/resolve call — defaults to unsafe when uncertain',
      ai_fallback: 'All AI client calls wrapped in try/except with rule-based fallback — demo never hard-fails on AI timeout',
      occupancy_flash_sale_threshold_pct: 60,
      sentiment_priority_weights: { VIP: 100, Premium: 60, Standard: 20 },
      sentiment_weights: { 'At-Risk': 80, Neutral: 0, Positive: -10 },
    },
    event_types: Object.values(eventBus.EVENTS),
  });
});

router.get('/debug/revenue-state', (req, res) => {
  res.json({
    total_active_cost_incidents: state.totalActiveCostIncidents,
  });
});

// Reset Demo Environment
function performReset(req, res) {
  eventBus.clearHistory();
  resetState();

  try {
    const dataStore = require('../data/dataStore');
    dataStore.resetStore();
    const executionService = require('../services/execution.service');
    executionService.resetExecution();
  } catch (e) {
    console.warn('[DemoReset] Warning during in-memory reset:', e.message);
  }

  res.json({
    ok: true,
    success: true,
    message: 'Demo environment reset successfully. VIP scenario initialized with Room 401 AC failure and alternative Room 205.',
    scenario: {
      guest: 'Arjun Mehta (VIP)',
      room_401: 'Maintenance (AC failure)',
      room_205: 'Deluxe (Available)',
      incident: 'INC-401-AC',
    },
  });
}

router.post(['/demo/reset', '/reset', '/operations/demo-reset'], performReset);

module.exports = {
  smartResortRouter: router,
  performReset,
};
