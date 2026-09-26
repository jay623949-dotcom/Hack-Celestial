/**
 * Resort 360 — Digital Twin Service
 * Simulates how weather conditions affect resort operational state.
 * Production state is NEVER mutated. All changes are isolated to simulation.
 */

const { classifyWeatherSeverity } = require('./weather.service');

/**
 * Curated public signals dataset (fallback when live sources unavailable).
 * Represents realistic traveler/public reports for Goa monsoon conditions.
 */
const PUBLIC_SIGNALS_DATASET = [
  { source: 'TravelAlert-India', timestamp: null, location: 'NH-66 Goa', text: 'Heavy waterlogging reported on National Highway 66 near Panaji', signalType: 'transport_disruption', severity: 'high', confidence: 0.82 },
  { source: 'AirportStatus', timestamp: null, location: 'Goa International Airport', text: 'Flight delays up to 45 minutes due to reduced visibility in morning fog', signalType: 'airport_delay', severity: 'medium', confidence: 0.90 },
  { source: 'GoaTourism', timestamp: null, location: 'Calangute Beach', text: 'Red flag alert on beaches. Swimming not permitted. High surf advisory.', signalType: 'outdoor_activity_restricted', severity: 'high', confidence: 0.95 },
  { source: 'PublicWeatherBoard', timestamp: null, location: 'South Goa', text: 'IMD issues orange alert for heavy to very heavy rainfall in next 6 hours', signalType: 'weather_alert', severity: 'high', confidence: 0.88 },
  { source: 'GuestReview', timestamp: null, location: 'Goa Airport Road', text: 'Taxi wait times tripled at airport. Roads flooded near Santa Cruz.', signalType: 'transport_disruption', severity: 'medium', confidence: 0.75 },
  { source: 'LocalAlert', timestamp: null, location: 'Panjim', text: 'Power fluctuations reported in North Goa due to storm. Backup generators advised.', signalType: 'infrastructure_risk', severity: 'medium', confidence: 0.70 },
  { source: 'IndianMet', timestamp: null, location: 'Goa', text: 'Sea conditions: rough. Wave height 3-4 meters. Fishermen advised not to venture.', signalType: 'sea_conditions', severity: 'high', confidence: 0.93 },
];

/**
 * Build public signals with current timestamps (spread 0-4h ago)
 */
function buildPublicSignals(weatherSeverity) {
  const now = Date.now();
  const relevant = weatherSeverity === 'LOW' || weatherSeverity === 'MODERATE'
    ? PUBLIC_SIGNALS_DATASET.filter(s => s.severity !== 'high').slice(0, 3)
    : PUBLIC_SIGNALS_DATASET;

  return relevant.map((s, i) => ({
    ...s,
    operationalSignal: {
      type: s.signalType,
      severity: s.severity,
      location: s.location,
    },
    timestamp: new Date(now - (i * 35 + 10) * 60000).toISOString(),
    id: `SIG-${String(i + 1).padStart(3, '0')}`,
  }));
}

/**
 * Compute weather operational impact model.
 * Returns structured impact predictions for each department + entity.
 */
function computeWeatherImpact(weather, resortState) {
  const { current, severity } = weather;
  const { precipitation, temperature, windSpeed } = current;
  const { occupancy = 82, availableRooms = 8, maintenanceAvailable = 2, housekeepingAvailable = 4, expectedArrivals = 14 } = resortState;

  // --- Transport/Arrival Impact ---
  const arrivalDelayRisk = Math.min(0.95,
    (precipitation > 30 ? 0.80 : precipitation > 10 ? 0.55 : precipitation > 2 ? 0.25 : 0.05) +
    (windSpeed > 40 ? 0.15 : windSpeed > 25 ? 0.07 : 0)
  );
  const arrivalClusteringRisk = arrivalDelayRisk > 0.5 ? 'HIGH' : arrivalDelayRisk > 0.25 ? 'MEDIUM' : 'LOW';
  const delayedArrivals = Math.round(expectedArrivals * arrivalDelayRisk * 0.6);

  // --- Outdoor Activity ---
  const outdoorActivityReduction = Math.min(1,
    (precipitation > 20 ? 0.85 : precipitation > 5 ? 0.50 : precipitation > 0 ? 0.20 : 0) +
    (windSpeed > 35 ? 0.20 : 0)
  );
  const indoorDemandIncrease = outdoorActivityReduction * 0.8;

  // --- Room Pressure ---
  const roomPressureIncrease = arrivalDelayRisk * 0.4 + indoorDemandIncrease * 0.2;

  // --- Maintenance Risk ---
  const hvacRisk = temperature > 38 ? 0.75 : temperature > 34 ? 0.50 : temperature > 30 ? 0.25 : 0.10;
  const waterLeakRisk = precipitation > 25 ? 0.65 : precipitation > 10 ? 0.35 : 0.05;
  const maintenanceLoadIncrease = (hvacRisk * 0.5 + waterLeakRisk * 0.5) * (3 - Math.min(maintenanceAvailable, 2));

  // --- Housekeeping Pressure ---
  const housekeepingPressure = (indoorDemandIncrease * 0.4 + arrivalDelayRisk * 0.3) * (4 / Math.max(housekeepingAvailable, 1));

  // --- Staff Movement ---
  const staffMovementRisk = precipitation > 15 ? 'HIGH' : precipitation > 5 ? 'MEDIUM' : 'LOW';

  // --- Overall Operational Risk ---
  const riskScore = (arrivalDelayRisk + maintenanceLoadIncrease + housekeepingPressure + outdoorActivityReduction) / 4;
  const overallRisk = riskScore > 0.65 ? 'EXTREME' : riskScore > 0.45 ? 'HIGH' : riskScore > 0.25 ? 'MEDIUM' : 'LOW';
  const confidence = severity === 'LOW' ? 0.72 : severity === 'MODERATE' ? 0.80 : 0.87;

  return {
    overallRisk,
    confidence: Math.round(confidence * 100) / 100,
    riskScore: Math.round(riskScore * 100) / 100,
    impacts: [
      {
        area: 'Guest Arrivals',
        direction: arrivalDelayRisk > 0.1 ? 'increase' : 'stable',
        magnitude: Math.round(arrivalDelayRisk * 100),
        label: `${Math.round(arrivalDelayRisk * 100)}% delay risk`,
        detail: `${delayedArrivals} of ${expectedArrivals} expected arrivals may be delayed`,
        confidence: Math.round(confidence * 100),
      },
      {
        area: 'Arrival Clustering',
        direction: arrivalDelayRisk > 0.4 ? 'increase' : 'stable',
        magnitude: arrivalDelayRisk > 0.6 ? 85 : arrivalDelayRisk > 0.3 ? 50 : 20,
        label: arrivalClusteringRisk,
        detail: 'Delayed arrivals tend to cluster at Front Desk once roads clear',
        confidence: Math.round(confidence * 90),
      },
      {
        area: 'Outdoor Activities',
        direction: outdoorActivityReduction > 0.1 ? 'decrease' : 'stable',
        magnitude: Math.round(outdoorActivityReduction * 100),
        label: `${Math.round(outdoorActivityReduction * 100)}% reduction`,
        detail: 'Beach, pool, and outdoor recreation demand reduced',
        confidence: Math.round(confidence * 100),
      },
      {
        area: 'Indoor Facility Demand',
        direction: indoorDemandIncrease > 0.1 ? 'increase' : 'stable',
        magnitude: Math.round(indoorDemandIncrease * 100),
        label: `+${Math.round(indoorDemandIncrease * 100)}% demand`,
        detail: 'Spa, restaurant, indoor lounges, and recreation centers see increased load',
        confidence: Math.round(confidence * 95),
      },
      {
        area: 'Maintenance Load',
        direction: maintenanceLoadIncrease > 0.2 ? 'increase' : 'stable',
        magnitude: Math.round(maintenanceLoadIncrease * 100),
        label: maintenanceLoadIncrease > 0.5 ? 'HIGH' : maintenanceLoadIncrease > 0.25 ? 'MEDIUM' : 'LOW',
        detail: `HVAC risk: ${Math.round(hvacRisk * 100)}% | Leak risk: ${Math.round(waterLeakRisk * 100)}%`,
        confidence: Math.round(confidence * 85),
      },
      {
        area: 'Housekeeping Pressure',
        direction: housekeepingPressure > 0.2 ? 'increase' : 'stable',
        magnitude: Math.round(housekeepingPressure * 100),
        label: housekeepingPressure > 0.6 ? 'HIGH' : housekeepingPressure > 0.3 ? 'MEDIUM' : 'LOW',
        detail: 'Delayed turnovers + indoor demand increase housekeeping coordination needs',
        confidence: Math.round(confidence * 80),
      },
      {
        area: 'Staff Movement',
        direction: staffMovementRisk !== 'LOW' ? 'increase' : 'stable',
        magnitude: staffMovementRisk === 'HIGH' ? 75 : staffMovementRisk === 'MEDIUM' ? 40 : 10,
        label: staffMovementRisk,
        detail: 'Rain affects off-duty staff transport and on-site movement between buildings',
        confidence: Math.round(confidence * 75),
      },
      {
        area: 'Room Inventory Pressure',
        direction: roomPressureIncrease > 0.1 ? 'increase' : 'stable',
        magnitude: Math.round(roomPressureIncrease * 100),
        label: occupancy > 88 ? 'CRITICAL' : occupancy > 78 ? 'HIGH' : 'MEDIUM',
        detail: `${availableRooms} rooms available. Delayed guest clustering may compress inventory.`,
        confidence: Math.round(confidence * 90),
      },
    ],
    causalChain: buildCausalChain(weather, resortState),
    agentContext: buildAgentContext(weather, { arrivalDelayRisk, indoorDemandIncrease, maintenanceLoadIncrease, housekeepingPressure, overallRisk }),
  };
}

/**
 * Build causal propagation chain for UI display
 */
function buildCausalChain(weather, resortState) {
  const { precipitation, temperature } = weather.current;
  const chains = [];

  if (precipitation > 5) {
    chains.push({
      id: 'rain-travel',
      title: 'Rainfall → Guest Arrival Impact',
      steps: [
        { label: 'Heavy Rainfall', icon: '🌧️', severity: weather.severity },
        { label: 'Transport Delays', icon: '🚗', severity: 'HIGH' },
        { label: 'Guest Arrival Delay', icon: '🏨', severity: 'MEDIUM' },
        { label: 'Front Desk Arrival Clustering', icon: '👥', severity: 'HIGH' },
        { label: 'Housekeeping Turnover Pressure', icon: '🛏️', severity: 'MEDIUM' },
        { label: 'Room Availability Pressure', icon: '🔑', severity: 'MEDIUM' },
      ],
    });
    chains.push({
      id: 'rain-outdoor',
      title: 'Rainfall → Indoor Demand Shift',
      steps: [
        { label: 'Beach/Pool Closures', icon: '🏖️', severity: 'HIGH' },
        { label: 'Outdoor Activity Cancellation', icon: '⛔', severity: 'HIGH' },
        { label: 'Indoor Facility Surge', icon: '🍽️', severity: 'MEDIUM' },
        { label: 'Staff Allocation Pressure', icon: '👷', severity: 'MEDIUM' },
      ],
    });
  }

  if (temperature > 34) {
    chains.push({
      id: 'heat-hvac',
      title: 'Extreme Heat → HVAC Risk',
      steps: [
        { label: 'Extreme Heat', icon: '🌡️', severity: weather.severity },
        { label: 'High AC Usage', icon: '❄️', severity: 'HIGH' },
        { label: 'Maintenance Load Increase', icon: '🔧', severity: 'HIGH' },
        { label: 'HVAC Incident Risk', icon: '⚠️', severity: 'HIGH' },
        { label: 'Maintenance Response Pressure', icon: '👷', severity: 'HIGH' },
      ],
    });
  }

  return chains;
}

/**
 * Weather context designed to flow into existing AI agents
 */
function buildAgentContext(weather, impacts) {
  const { overallRisk, arrivalDelayRisk, indoorDemandIncrease, maintenanceLoadIncrease, housekeepingPressure } = impacts;
  const { current, severity } = weather;

  return {
    weatherSummary: `Current conditions: ${current.condition}, ${current.temperature}°C, ${current.precipitation}mm/h rain, ${current.windSpeed}km/h wind. Operational severity: ${severity}.`,
    frontDesk: arrivalDelayRisk > 0.3
      ? `Weather alert: ${Math.round(arrivalDelayRisk * 100)}% arrival delay risk. Expect ${overallRisk === 'HIGH' || overallRisk === 'EXTREME' ? 'significant' : 'moderate'} clustering at check-in. Proactive lounge pre-positioning recommended.`
      : 'Weather conditions are favorable for normal arrival operations.',
    housekeeping: housekeepingPressure > 0.25
      ? `Weather impact on housekeeping: Delayed arrivals will create turnover pressure when roads clear. Indoor demand surge increases room refresh frequency. Pre-position express clean teams.`
      : 'Weather conditions have minimal housekeeping impact.',
    maintenance: maintenanceLoadIncrease > 0.3
      ? `Weather alert: Elevated ${current.precipitation > 10 ? 'water intrusion' : ''} ${current.temperature > 34 ? 'HVAC load' : ''} risk. Recommend proactive inspection of roof drains, HVAC units, and outdoor electrical systems.`
      : 'Weather conditions present standard maintenance workload.',
    revenue: `Weather severity ${severity}: ${indoorDemandIncrease > 0.4 ? 'Outdoor inventory (beach villas, pool cabanas) demand will decrease. Indoor premium rooms and spa packages may see demand increase.' : 'No significant revenue impact expected from current conditions.'}`,
    overallContext: `Environmental risk level: ${overallRisk}. Confidence: ${Math.round(impacts.overallRisk === 'EXTREME' ? 0.87 : 0.80 * 100)}%.`,
  };
}

/**
 * Run a what-if simulation with modified weather parameters.
 * Does NOT touch the real database.
 */
async function runSimulation(baseWeather, simulatedWeather, resortState) {
  const simulatedImpact = computeWeatherImpact(
    {
      current: { ...baseWeather.current, ...simulatedWeather },
      severity: classifyWeatherSeverity({ ...baseWeather.current, ...simulatedWeather }),
    },
    resortState
  );

  const baseImpact = computeWeatherImpact(baseWeather, resortState);

  // Compute delta vs base
  const deltas = simulatedImpact.impacts.map((si, i) => {
    const bi = baseImpact.impacts[i];
    return {
      ...si,
      delta: si.magnitude - (bi?.magnitude || 0),
      deltaLabel: si.magnitude > (bi?.magnitude || 0) ? 'increased' : si.magnitude < (bi?.magnitude || 0) ? 'decreased' : 'unchanged',
    };
  });

  return {
    simulationId: `SIM-${Date.now()}`,
    isSimulation: true,
    productionStateUnchanged: true,
    baseWeather: baseWeather.current,
    simulatedWeather: { ...baseWeather.current, ...simulatedWeather },
    simulatedSeverity: simulatedImpact.overallRisk,
    confidence: simulatedImpact.confidence,
    riskScore: simulatedImpact.riskScore,
    impacts: deltas,
    causalChain: simulatedImpact.causalChain,
    agentContext: simulatedImpact.agentContext,
    createdAt: new Date().toISOString(),
    note: 'This is a simulation. No production operational state was modified.',
  };
}

module.exports = { computeWeatherImpact, buildPublicSignals, runSimulation };
