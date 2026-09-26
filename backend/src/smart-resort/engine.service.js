/**
 * Smart Resort 360 - Intelligence Engine Service
 * Implements /api/engine/* endpoints with AI parsing & fallback logic.
 */
const { classifyPersonaSentiment, cvTriage, generateOfferCopy } = require('./aiClassifier');
const { state } = require('./smartResortStore');

async function processGuestIntake(params) {
  const { transcript, guest_id = 'G-7041', reservation_context = {} } = params;
  const classification = await classifyPersonaSentiment(transcript);

  const perks = {
    'At-Risk': 'Executive Quiet Suite Reassignment + Complimentary 4 PM Late Check-out',
    Positive: 'Welcome Champagne & Resort Credit Voucher',
    Neutral: 'Complimentary High-Floor Room Allocation',
  };

  const perk = perks[classification.sentiment_state] || perks.Neutral;

  return {
    event_type: 'GUEST_INTAKE_RESULT',
    guest_id,
    persona_label: classification.persona_label,
    value_sentiment_cell: {
      value_tier: classification.value_tier,
      sentiment: classification.sentiment_state,
    },
    extracted_preferences: {
      room_type: reservation_context.room_tier || 'Executive Bayfront Suite',
      noise_tolerance: classification.sentiment_state === 'At-Risk' ? 'quiet' : 'standard',
      explicit_requests: [transcript],
    },
    ui_actions: [
      {
        component: 'service_recovery_panel',
        action: classification.sentiment_state === 'At-Risk' ? 'trigger' : 'none',
        payload: { suggested_perk: perk },
      },
    ],
    reasoning: classification.reasoning,
  };
}

async function processMaintenanceCv(params) {
  const { image_data, room_id = 'Suite 502', fixture_hint = '', override_confidence } = params;
  const triage = await cvTriage(fixture_hint);

  const confidence = override_confidence !== undefined ? override_confidence : triage.confidence_score;
  const isSafety = triage.priority === 'safety';

  return {
    event_type: 'MAINTENANCE_CV_RESULT',
    room_id: room_id || 'Suite 502',
    confidence_score: confidence,
    requires_human_review: confidence < 0.6,
    identified_asset: {
      asset_type: triage.identified_asset_type || 'plumbing',
      likely_model: 'Commercial Grade Fitting',
    },
    visible_issue: triage.visible_issue,
    severity: isSafety ? 'safety' : 'guest-facing',
    ui_actions: [
      {
        component: 'room_lockout',
        action: isSafety ? 'lock' : 'none',
        payload: { room_id: room_id || 'Suite 502', reason: triage.reasoning },
      },
    ],
    reasoning: triage.reasoning,
  };
}

async function processCostIncident(params) {
  const { source_work_order_id = 'WO-1001', anomaly_data = {}, affects_room_ids = ['Suite 502'] } = params;
  const estimatedCost = anomaly_data.estimated_cost_impact || 1850.0;

  return {
    event_type: 'COST_INCIDENT_SUMMARY',
    source_work_order_id,
    estimated_cost_impact: estimatedCost,
    affects_room_ids,
    ui_actions: [
      {
        component: 'net_revpar_ticker',
        action: 'recalculate',
        payload: { cost_delta: -estimatedCost, reasoning: 'Cost incident deducted from Net RevPAR.' },
      },
    ],
    reasoning: `Cost impact of $${estimatedCost.toLocaleString()} logged. Operating margin adjusted in real-time.`,
  };
}

async function processFlashSale(params) {
  const { asset = 'Sunset Spa & Cabana Package', expires_in_minutes = 30, checked_in_guests = [], discounted_price = 79 } = params;

  const targetIds = checked_in_guests.map((g) => g.id || g.guest_id);
  const copyRes = await generateOfferCopy('Business', asset);

  return {
    event_type: 'FLASH_SALE_OFFER',
    asset,
    expires_in_minutes,
    target_guest_ids: targetIds,
    persona_framing: {
      Business: '⚡ 2 PM express spa slot open — tailored for your break before evening calls.',
      Luxury: '✨ Exclusive private cabana & chilled champagne available for your afternoon.',
      Family: "🌟 40% off family cabana bundle — kids' activity passes included!",
      Frugal: '💰 Flash discount: 40% off spa access for the next 30 minutes.',
    },
    ui_actions: [
      {
        component: 'flash_sale_banner',
        action: 'display',
        payload: { asset, price: discounted_price },
      },
    ],
    reasoning: `Flash sale dynamically created for '${asset}' targeting ${targetIds.length} checked-in guests.`,
  };
}

async function processHousekeepingReorder(params) {
  const { trigger_reason = 'VIP Check-In Priority Bump', current_queue = [] } = params;

  const reordered = current_queue.map((item, idx) => ({
    room_id: item.room_id,
    new_priority_rank: idx + 1,
    reason: trigger_reason,
  }));

  return {
    event_type: 'HOUSEKEEPING_REORDER',
    trigger_reason,
    reordered_queue: reordered,
    ui_actions: [
      {
        component: 'housekeeping_queue',
        action: 'reorder',
        payload: { count: current_queue.length },
      },
    ],
    reasoning: `Turnaround queue adjusted for ${trigger_reason}. Priority 1 accelerated.`,
  };
}

module.exports = {
  processGuestIntake,
  processMaintenanceCv,
  processCostIncident,
  processFlashSale,
  processHousekeepingReorder,
};
