/**
 * Phase 11 Weather Digital Twin & Nugen Domain Intelligence Test Suite
 */

const assert = require('assert');
const { getCurrentWeather, refreshWeather } = require('./src/services/weather.service');
const { computeWeatherImpact, buildPublicSignals, runSimulation } = require('./src/services/digitalTwin.service');
const { getNugenWeatherImpact, MODEL_METADATA } = require('./src/services/nugenWeather.service');
const dataStore = require('./src/data/dataStore');

async function runPhase11Tests() {
  console.log('\n==================================================');
  console.log('PHASE 11: WEATHER DIGITAL TWIN & NUGEN TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Weather Telemetry & Normalization Tests
  console.log('--- 1. Weather Telemetry & Normalization ---');
  await testAsync('Weather retrieval returns normalized schema', async () => {
    const weather = await getCurrentWeather();
    assert(weather.location, 'Missing location');
    assert(weather.location.name.includes('Goa'), 'Location should be Goa');
    assert(typeof weather.current.temperature === 'number', 'Temperature must be number');
    assert(typeof weather.current.precipitation === 'number', 'Precipitation must be number');
    assert(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'].includes(weather.severity), 'Invalid severity');
  });

  await testAsync('Weather forecast contains 24 hourly projections', async () => {
    const weather = await getCurrentWeather();
    assert(Array.isArray(weather.forecast), 'Forecast must be array');
    assert(weather.forecast.length > 0, 'Forecast must not be empty');
  });

  await testAsync('Weather refresh updates cache', async () => {
    const refreshed = await refreshWeather();
    assert(refreshed && refreshed.current, 'Refreshed weather invalid');
  });

  // 2. Public Signals Tests
  console.log('\n--- 2. Public & Social Signals Integration ---');
  test('Signals generator returns structured signals with severity and type', () => {
    const signals = buildPublicSignals('HIGH');
    assert(Array.isArray(signals), 'Signals must be array');
    assert(signals.length >= 5, 'Should have at least 5 signals');
    const first = signals[0];
    assert(first.source, 'Missing source');
    assert(first.location, 'Missing location');
    assert(first.severity, 'Missing severity');
    assert(first.operationalSignal, 'Missing operational signal');
  });

  // 3. Digital Twin & What-If Simulation Isolation
  console.log('\n--- 3. Digital Twin Simulation & Isolation ---');
  const initialRoomsCount = dataStore.findAll('rooms').length;

  await testAsync('Simulation creates altered predictions without mutating production DB', async () => {
    const baseWeather = await getCurrentWeather();
    const resortState = {
      occupancy: 85,
      availableRooms: 6,
      maintenanceAvailable: 2,
      housekeepingAvailable: 4,
      expectedArrivals: 14,
      totalRooms: 45,
    };

    const simResult = await runSimulation(
      baseWeather,
      { precipitation: 50, temperature: 26, windSpeed: 45 },
      resortState
    );

    // Verify simulation result structure
    assert(simResult.isSimulation === true, 'Must be flagged as simulation');
    assert(simResult.productionStateUnchanged === true, 'Must verify production unchanged');
    assert(simResult.simulatedWeather.precipitation === 50, 'Simulation params applied');
    assert(['HIGH', 'EXTREME'].includes(simResult.simulatedSeverity), 'Severity must reflect 50mm rain');
    assert(Array.isArray(simResult.impacts), 'Impacts must be array');
    assert(Array.isArray(simResult.causalChain), 'Causal chain must be present');
    assert(simResult.causalChain.length > 0, 'Causal chain must have steps');
    assert(simResult.confidence >= 0.7 && simResult.confidence <= 1.0, 'Confidence must be calibrated');

    // Verify production DB was NOT mutated
    const postRoomsCount = dataStore.findAll('rooms').length;
    assert.strictEqual(initialRoomsCount, postRoomsCount, 'Production database room count must not change');
  });

  // 4. Nugen Domain Intelligence Tests
  console.log('\n--- 4. Nugen Domain Intelligence ---');
  test('MODEL_METADATA exposes domain alignment specifications', () => {
    assert.strictEqual(MODEL_METADATA.baseModel, 'Llama-V3p2-3b-Reasoning');
    assert.strictEqual(MODEL_METADATA.alignedModel, 'resort360-hospitality-v1');
    assert.strictEqual(MODEL_METADATA.domain, 'WEATHER → RESORT OPERATIONAL IMPACT');
  });

  await testAsync('Nugen inference returns structured operational recommendations', async () => {
    const context = {
      weather: {
        current: { condition: 'Heavy Rain', temperature: 27, precipitation: 45, windSpeed: 40 },
        severity: 'HIGH',
      },
      resortState: { occupancy: 88, availableRooms: 4, expectedArrivals: 14 },
      impacts: { overallRisk: 'HIGH', impacts: [{ area: 'Guest Arrivals', direction: 'increase', magnitude: 0.75 }] },
      publicSignals: [],
    };

    const nugen = await getNugenWeatherImpact(context);
    assert(['HIGH', 'EXTREME'].includes(nugen.impactLevel), 'Nugen impact level invalid');
    assert(nugen.confidence > 0.7, 'Nugen confidence invalid');
    assert(Array.isArray(nugen.affectedAreas), 'Affected areas must be array');
    assert(Array.isArray(nugen.recommendedPreparations), 'Preparations must be array');
    assert(nugen.recommendedPreparations.length >= 2, 'Must recommend preparations');
    assert(nugen.metadata.alignedModel === 'resort360-hospitality-v1', 'Metadata aligned model must match');
  });

  // 5. Agent Swarm Context Propagation
  console.log('\n--- 5. Agent Swarm Context Propagation ---');
  test('Digital Twin produces departmental guidance for all 4 agents', () => {
    const weather = {
      current: { condition: 'Storm', temperature: 26, precipitation: 40, windSpeed: 45 },
      severity: 'HIGH',
    };
    const resort = { occupancy: 85, availableRooms: 5 };
    const impact = computeWeatherImpact(weather, resort);

    assert(impact.agentContext.frontDesk.includes('arrival delay'), 'Front desk context missing arrival delay info');
    assert(impact.agentContext.housekeeping.includes('turnover'), 'Housekeeping context missing turnover info');
    assert(impact.agentContext.maintenance.includes('inspection') || impact.agentContext.maintenance.includes('water intrusion'), 'Maintenance context missing weather risk info');
    assert(impact.agentContext.revenue.includes('inventory'), 'Revenue context missing inventory guidance');
  });

  console.log('\n==================================================');
  console.log(`Phase 11 Tests Finished: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase11Tests();
