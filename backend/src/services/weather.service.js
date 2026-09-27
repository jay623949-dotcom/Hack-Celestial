/**
 * Resort 360 — Weather Service
 * Uses Open-Meteo (free, no API key required) for live weather data.
 * Normalizes weather into Resort 360 operational format.
 */

const https = require('https');

// Resort location: Goa, India (Azure Bay Resort)
const RESORT_LOCATION = {
  name: 'Goa, India',
  latitude: 15.2993,
  longitude: 74.124,
  timezone: 'Asia/Kolkata',
};

// Cache: 10 minutes TTL
let _weatherCache = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * WMO weather code → human condition
 */
function decodeWeatherCode(code) {
  const map = {
    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Icy Fog',
    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
    61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
    80: 'Slight Rain Shower', 81: 'Moderate Rain Shower', 82: 'Violent Rain Shower',
    95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Heavy Thunderstorm with Hail',
  };
  return map[code] || 'Unknown';
}

/**
 * Classify operational severity from weather
 */
function classifyWeatherSeverity(current) {
  const { temperature, windSpeed, precipitation } = current;
  if (precipitation > 30 || windSpeed > 50 || temperature > 42) return 'EXTREME';
  if (precipitation > 10 || windSpeed > 35 || temperature > 38) return 'HIGH';
  if (precipitation > 2 || windSpeed > 20 || temperature > 34) return 'MODERATE';
  return 'LOW';
}

/**
 * Fetch raw data from Open-Meteo
 */
function fetchOpenMeteo() {
  return new Promise((resolve, reject) => {
    const { latitude, longitude, timezone } = RESORT_LOCATION;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&timezone=${encodeURIComponent(timezone)}&forecast_days=3&timeformat=iso8601`;

    const req = https.get(url, { timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse Open-Meteo response')); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Open-Meteo timeout')); });
    req.on('error', reject);
  });
}

/**
 * Normalize Open-Meteo response into Resort 360 weather format
 */
function normalizeWeather(raw) {
  const c = raw.current;
  const h = raw.hourly;

  const current = {
    temperature: Math.round(c.temperature_2m * 10) / 10,
    humidity: c.relative_humidity_2m,
    precipitation: Math.round(c.precipitation * 10) / 10,
    windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
    weatherCode: c.weather_code,
    condition: decodeWeatherCode(c.weather_code),
  };

  // Build 24-hour forecast (hourly, next 24 entries)
  const now = new Date();
  const forecast = [];
  if (h && h.time) {
    for (let i = 0; i < Math.min(h.time.length, 24); i++) {
      const ts = new Date(h.time[i]);
      if (ts >= now) {
        forecast.push({
          timestamp: h.time[i],
          temperature: Math.round(h.temperature_2m[i] * 10) / 10,
          precipitation: Math.round(h.precipitation[i] * 10) / 10,
          windSpeed: Math.round(h.wind_speed_10m[i] * 10) / 10,
          weatherCode: h.weather_code[i],
          condition: decodeWeatherCode(h.weather_code[i]),
        });
        if (forecast.length >= 12) break;
      }
    }
  }

  const severity = classifyWeatherSeverity(current);

  return {
    location: { ...RESORT_LOCATION },
    current,
    forecast,
    severity,
    observedAt: c.time || new Date().toISOString(),
    source: 'Open-Meteo (open-meteo.com)',
    live: true,
  };
}

/**
 * Get current weather — with caching and fallback
 */
async function getCurrentWeather() {
  const now = Date.now();

  // Return cache if fresh
  if (_weatherCache && (now - _cacheTimestamp) < CACHE_TTL_MS) {
    return { ..._weatherCache, cached: true };
  }

  try {
    const raw = await fetchOpenMeteo();
    const normalized = normalizeWeather(raw);
    _weatherCache = normalized;
    _cacheTimestamp = now;
    return { ...normalized, cached: false };
  } catch (err) {
    console.error('[WeatherService] Live fetch failed:', err.message);

    // Fallback — reasonable Goa weather values
    const fallback = {
      location: { ...RESORT_LOCATION },
      current: {
        temperature: 30,
        humidity: 78,
        precipitation: 0,
        windSpeed: 14,
        weatherCode: 2,
        condition: 'Partly Cloudy',
      },
      forecast: [],
      severity: 'LOW',
      observedAt: new Date().toISOString(),
      source: 'Fallback (Open-Meteo unavailable)',
      live: false,
      stale: true,
      error: err.message,
    };

    if (_weatherCache) {
      return { ..._weatherCache, cached: true, stale: true };
    }

    return fallback;
  }
}

/**
 * Force refresh the cache
 */
async function refreshWeather() {
  _cacheTimestamp = 0;
  return getCurrentWeather();
}

module.exports = { getCurrentWeather, refreshWeather, classifyWeatherSeverity, RESORT_LOCATION };
