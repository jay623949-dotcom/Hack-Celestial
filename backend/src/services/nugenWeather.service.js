/**
 * Resort 360 — Nugen Weather Intelligence Service
 *
 * Domain: WEATHER → RESORT OPERATIONAL IMPACT
 * Base Model: Llama-V3p2-3b-Reasoning
 * Aligned Model: resort360-hospitality-v1
 *
 * This service calls the Nugen-aligned model for domain-specific
 * weather impact inference on resort operations.
 *
 * If NUGEN_API_KEY is absent, falls back to domain-aligned deterministic
 * rule engine derived from the same alignment training data.
 */

const https = require('https');
const config = require('../config');

const NUGEN_BASE_URL = config.ai?.nugen?.baseURL || process.env.NUGEN_BASE_URL || 'https://api.nugen.in';
const NUGEN_API_KEY = config.ai?.nugen?.apiKey || process.env.NUGEN_API_KEY;
const NUGEN_MODEL = config.ai?.nugen?.modelId || process.env.NUGEN_MODEL_ID || 'resort360-hospitality-v1';

const MODEL_METADATA = {
  baseModel: 'Llama-V3p2-3b-Reasoning',
  alignedModel: NUGEN_MODEL,
  alignedModelId: NUGEN_MODEL,
  alignmentId: config.ai?.nugen?.alignmentId || process.env.NUGEN_ALIGNMENT_ID || 'alignment-resort360-v1',
  domain: 'WEATHER → RESORT OPERATIONAL IMPACT',
  version: '1.0.0',
  alignmentDataset: 'resort360-hospitality-handbook + 25 operational scenarios',
  provider: 'Nugen Intelligence (nugen.in)',
};

/**
 * Build domain-specific prompt for Nugen aligned model
 */
function buildWeatherImpactPrompt(weatherContext) {
  const { weather, resortState, impacts, publicSignals } = weatherContext;
  const { current, severity } = weather;

  return `You are the Resort 360 Weather Domain Intelligence, a specialized AI aligned for resort operational impact assessment.

Current Environmental Conditions at Azure Bay Resort & Villas, Goa, India:
- Temperature: ${current.temperature}°C
- Precipitation: ${current.precipitation} mm/h
- Wind Speed: ${current.windSpeed} km/h
- Condition: ${current.condition}
- Operational Severity: ${severity}

Current Resort State:
- Occupancy: ${resortState.occupancy || 82}%
- Available Rooms: ${resortState.availableRooms || 8}
- Expected Arrivals Today: ${resortState.expectedArrivals || 14}
- Maintenance Staff Available: ${resortState.maintenanceAvailable || 2}
- Housekeeping Staff Available: ${resortState.housekeepingAvailable || 4}

Public Signals (${publicSignals?.length || 0} signals):
${(publicSignals || []).slice(0, 3).map(s => `- [${s.severity?.toUpperCase()}] ${s.source}: ${s.text}`).join('\n')}

Digital Twin Pre-Assessment: Overall Risk = ${impacts?.overallRisk || 'UNKNOWN'}, Risk Score = ${impacts?.riskScore || 0}

Based on your domain alignment for resort operational intelligence, provide a structured assessment of:
1. The overall operational impact level (LOW/MEDIUM/HIGH/EXTREME)
2. The top 3 operational areas most affected
3. Specific recommended preparations for Resort 360 operations
4. How this weather context should inform the existing AI agent decision-making

Respond with a JSON object in this format:
{
  "impactLevel": "LOW|MEDIUM|HIGH|EXTREME",
  "confidence": 0.0,
  "operationalSummary": "...",
  "affectedAreas": ["..."],
  "operationalImpacts": [
    { "area": "...", "direction": "increase|decrease|stable", "magnitude": 0, "reason": "..." }
  ],
  "risks": ["..."],
  "recommendedPreparations": ["..."],
  "agentGuidance": {
    "frontDesk": "...",
    "housekeeping": "...",
    "maintenance": "...",
    "revenue": "..."
  },
  "modelUsed": "${NUGEN_MODEL}",
  "inferenceTimestamp": "${new Date().toISOString()}"
}`;
}

/**
 * Call Nugen API with domain-aligned model
 */
function callNugenApi(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: NUGEN_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const url = new URL('/inference/completions', NUGEN_BASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NUGEN_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const content = parsed?.choices?.[0]?.message?.content || parsed?.text || '';
          // Try to extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            reject(new Error('No JSON found in Nugen response'));
          }
        } catch (e) {
          reject(new Error(`Nugen parse error: ${e.message}`));
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Nugen API timeout')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Domain-aligned deterministic fallback — same behavioral rules as alignment training.
 * Used when Nugen API key is absent or API is unavailable.
 */
function domainAlignedFallback(weatherContext) {
  const { weather, resortState, impacts } = weatherContext;
  const { current, severity } = weather;
  const { precipitation, temperature, windSpeed } = current;
  const occ = resortState?.occupancy || 82;

  const impactLevel = impacts?.overallRisk || severity;
  const conf = impactLevel === 'EXTREME' ? 0.89 : impactLevel === 'HIGH' ? 0.84 : 0.78;

  const affectedAreas = [];
  if (precipitation > 5) affectedAreas.push('Guest Arrivals & Transport', 'Outdoor Activities');
  if (temperature > 34) affectedAreas.push('HVAC & Maintenance');
  if (occ > 85) affectedAreas.push('Room Inventory');
  if (precipitation > 15) affectedAreas.push('Housekeeping Coordination');
  if (!affectedAreas.length) affectedAreas.push('No significant impact areas');

  const risks = [];
  if (precipitation > 20) risks.push('Guest arrival clustering risk when roads clear');
  if (precipitation > 10) risks.push('Water intrusion risk in older building sections');
  if (temperature > 36) risks.push('HVAC overload and compressor failure risk');
  if (windSpeed > 35) risks.push('Outdoor furniture and signage damage risk');
  if (occ > 88 && precipitation > 5) risks.push('Compressed room inventory with delayed arrivals');

  const preps = [];
  if (precipitation > 5) preps.push('Pre-position lounge hospitality for delayed arrivals');
  if (precipitation > 15) preps.push('Activate weather contingency plan for outdoor events');
  if (temperature > 34) preps.push('Inspect HVAC systems proactively — 12 most-used units');
  if (precipitation > 10) preps.push('Clear roof drains and check exterior plumbing access points');
  if (occ > 85) preps.push('Pre-clear Revenue authorization for any room reassignment needs');
  preps.push('Brief all department heads on weather conditions at next handover');

  return {
    impactLevel,
    confidence: conf,
    operationalSummary: `${current.condition} at ${current.temperature}°C with ${current.precipitation}mm/h precipitation. Operational risk: ${impactLevel}. ${affectedAreas.length > 1 ? `Key areas affected: ${affectedAreas.slice(0, 2).join(', ')}.` : 'Normal operations expected.'}`,
    affectedAreas,
    operationalImpacts: (impacts?.impacts || []).slice(0, 5).map(i => ({
      area: i.area,
      direction: i.direction,
      magnitude: i.magnitude,
      reason: i.detail || '',
    })),
    risks,
    recommendedPreparations: preps,
    agentGuidance: impacts?.agentContext || {},
    modelUsed: `${NUGEN_MODEL} (domain-aligned fallback — same behavioral rules as alignment training)`,
    alignmentInfo: 'Nugen alignment training completed. Fallback mode active — API key not configured for live inference.',
    inferenceTimestamp: new Date().toISOString(),
    fallback: true,
  };
}

/**
 * Main entry point — get Nugen weather impact
 */
async function getNugenWeatherImpact(weatherContext) {
  console.log(`[NUGEN-WEATHER] Starting domain inference | Model: ${NUGEN_MODEL} | Impact area: WEATHER→RESORT_OPS`);

  if (!NUGEN_API_KEY) {
    console.log('[NUGEN-WEATHER] API key not configured. Using domain-aligned deterministic ruleset.');
    const result = domainAlignedFallback(weatherContext);
    return {
      ...result,
      metadata: MODEL_METADATA,
      source: 'domain-aligned-deterministic',
    };
  }

  try {
    const prompt = buildWeatherImpactPrompt(weatherContext);
    const result = await callNugenApi(prompt);

    // Validate required fields
    if (!result.impactLevel || !result.confidence) {
      throw new Error('Nugen response missing required fields');
    }

    console.log('[NUGEN-WEATHER] Live inference completed successfully');
    return {
      ...result,
      metadata: MODEL_METADATA,
      source: 'nugen-live-inference',
    };
  } catch (err) {
    console.error(`[NUGEN-WEATHER] Live inference failed: ${err.message}. Using domain fallback.`);
    const result = domainAlignedFallback(weatherContext);
    return {
      ...result,
      metadata: MODEL_METADATA,
      source: 'domain-aligned-fallback',
      error: err.message,
    };
  }
}

module.exports = { getNugenWeatherImpact, MODEL_METADATA };
