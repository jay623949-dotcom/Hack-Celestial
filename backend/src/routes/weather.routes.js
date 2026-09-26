/**
 * Resort 360 — Weather & Digital Twin Routes
 * Prefix: /api/v1/weather and /api/v1/digital-twin
 */

const express = require('express');
const router = express.Router();

const { getCurrentWeather, refreshWeather } = require('../services/weather.service');
const { computeWeatherImpact, buildPublicSignals, runSimulation } = require('../services/digitalTwin.service');
const { getNugenWeatherImpact } = require('../services/nugenWeather.service');

// Helper to get current resort operational state from data store
function getResortState(req) {
  try {
    const dataStore = require('../data/dataStore');
    const rooms = dataStore.findAll('rooms') || [];
    const staff = dataStore.findAll('staff') || [];
    const guests = dataStore.findAll('guests') || [];
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'available' || r.status === 'clean').length;
    const occupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 82;
    const maintenanceAvailable = staff.filter(s => s.department === 'Maintenance' && s.availability !== 'off_duty').length;
    const housekeepingAvailable = staff.filter(s => s.department === 'Housekeeping' && s.availability !== 'off_duty').length;
    const todayGuests = guests.filter(g => g.checkIn && new Date(g.checkIn).toDateString() === new Date().toDateString()).length;

    return { occupancy, availableRooms, maintenanceAvailable, housekeepingAvailable, expectedArrivals: todayGuests || 14, totalRooms };
  } catch {
    return { occupancy: 82, availableRooms: 8, maintenanceAvailable: 2, housekeepingAvailable: 4, expectedArrivals: 14, totalRooms: 45 };
  }
}

// ─────────────────────────────────────────────────────────
// GET /weather/current
// ─────────────────────────────────────────────────────────
router.get('/weather/current', async (req, res) => {
  try {
    const weather = await getCurrentWeather();
    res.json({ success: true, data: weather });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─────────────────────────────────────────────────────────
// GET /weather/refresh
// ─────────────────────────────────────────────────────────
router.get('/weather/refresh', async (req, res) => {
  try {
    const weather = await refreshWeather();
    res.json({ success: true, data: weather });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─────────────────────────────────────────────────────────
// GET /digital-twin/weather/context
// Full weather + impact + signals + resort state
// ─────────────────────────────────────────────────────────
router.get('/digital-twin/weather/context', async (req, res) => {
  try {
    const weather = await getCurrentWeather();
    const resortState = getResortState(req);
    const impacts = computeWeatherImpact(weather, resortState);
    const publicSignals = buildPublicSignals(weather.severity);

    res.json({
      success: true,
      data: {
        weather,
        resortState,
        impacts,
        publicSignals,
        createdAt: new Date().toISOString(),
        isSimulation: false,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─────────────────────────────────────────────────────────
// GET /digital-twin/weather/signals
// Public signals only
// ─────────────────────────────────────────────────────────
router.get('/digital-twin/weather/signals', async (req, res) => {
  try {
    const weather = await getCurrentWeather();
    const signals = buildPublicSignals(weather.severity);
    res.json({ success: true, data: signals });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─────────────────────────────────────────────────────────
// POST /digital-twin/weather/simulate
// What-if simulation — never mutates production state
// Body: { temperature, precipitation, windSpeed, duration }
// ─────────────────────────────────────────────────────────
router.post('/digital-twin/weather/simulate', async (req, res) => {
  try {
    const { temperature, precipitation, windSpeed } = req.body;

    // Validate inputs
    const simulatedWeather = {};
    if (temperature !== undefined && typeof temperature === 'number') simulatedWeather.temperature = Math.max(-10, Math.min(55, temperature));
    if (precipitation !== undefined && typeof precipitation === 'number') simulatedWeather.precipitation = Math.max(0, Math.min(200, precipitation));
    if (windSpeed !== undefined && typeof windSpeed === 'number') simulatedWeather.windSpeed = Math.max(0, Math.min(150, windSpeed));

    const baseWeather = await getCurrentWeather();
    const resortState = getResortState(req);
    const result = await runSimulation(baseWeather, simulatedWeather, resortState);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─────────────────────────────────────────────────────────
// POST /nugen/weather-impact
// Nugen-aligned model inference for weather operational impact
// ─────────────────────────────────────────────────────────
router.post('/nugen/weather-impact', async (req, res) => {
  try {
    const weather = await getCurrentWeather();
    const resortState = getResortState(req);
    const impacts = computeWeatherImpact(weather, resortState);
    const publicSignals = buildPublicSignals(weather.severity);

    // Allow override from body (for simulation)
    const customWeather = req.body?.weather ? { ...weather, current: { ...weather.current, ...req.body.weather } } : weather;

    const weatherContext = { weather: customWeather, resortState, impacts, publicSignals };
    const nugenResult = await getNugenWeatherImpact(weatherContext);

    res.json({
      success: true,
      data: {
        nugen: nugenResult,
        context: weatherContext,
        agentContext: impacts.agentContext,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

module.exports = router;
