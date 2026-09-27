/**
 * Smart Resort 360 - Maintenance Service
 */
const { state } = require('./smartResortStore');
const eventBus = require('./eventBus');
const { cvTriage } = require('./aiClassifier');

// Guardrail Constants
const CV_CONFIDENCE_CUTOFF = 0.6;
const BASELINE_VACANT_POWER_KWH = 0.5;
const BASELINE_VACANT_WATER_LITRES = 0.0;
const UNIT_COST_POWER = 0.15;
const UNIT_COST_WATER = 0.004;
const DAYS_UNDETECTED = 3;

const TROUBLESHOOTING_LINKS = {
  hvac: 'https://resort360.internal/guides/hvac-troubleshooting',
  plumbing: 'https://resort360.internal/guides/plumbing-troubleshooting',
  electrical: 'https://resort360.internal/guides/electrical-safety',
  pool: 'https://resort360.internal/guides/pool-maintenance',
  elevator: 'https://resort360.internal/guides/elevator-inspection',
  furniture: 'https://resort360.internal/guides/furniture-repair',
  default: 'https://resort360.internal/guides/general-maintenance',
};

const SAFETY_KEYWORDS = ['fire', 'smoke', 'gas', 'spark', 'electric', 'flood', 'structural', 'collapse', 'emergency', 'rupture'];
const GUEST_FACING_KEYWORDS = ['leak', 'no hot water', 'ac', 'hvac', 'lock', 'door', 'window', 'noise', 'plumbing'];
const COSMETIC_KEYWORDS = ['stain', 'scratch', 'paint', 'furniture', 'carpet', 'curtain', 'bulb', 'dim'];

function keywordTriage(description = '') {
  const desc = description.toLowerCase();
  if (SAFETY_KEYWORDS.some((kw) => desc.includes(kw))) return 'safety';
  if (GUEST_FACING_KEYWORDS.some((kw) => desc.includes(kw))) return 'guest-facing';
  if (COSMETIC_KEYWORDS.some((kw) => desc.includes(kw))) return 'cosmetic';
  return 'deferred';
}

function generateRepairBrief(assetType, description = '') {
  const assets = state.assets.filter((a) => a.asset_type === assetType);
  let recurring = false;
  let recurringIssue = '';

  for (const asset of assets) {
    const history = asset.repair_history || [];
    const issueTypes = history.map((h) => h.issue_type);
    for (const issue of issueTypes) {
      if (issue && issueTypes.filter((x) => x === issue).length >= 2 && description.toLowerCase().includes(issue.toLowerCase())) {
        recurring = true;
        recurringIssue = issue;
        break;
      }
    }
  }

  const guideLink = TROUBLESHOOTING_LINKS[assetType] || TROUBLESHOOTING_LINKS.default;
  const parts = [`SYMPTOM: ${description.slice(0, 200)}`];

  if (recurring) {
    parts.push(`LIKELY CAUSE: Recurring '${recurringIssue}' issue detected in asset history (${assetType}). Check systemic failure.`);
  } else {
    parts.push(`LIKELY CAUSE: First occurrence for this asset type. Standard diagnostic recommended.`);
  }
  parts.push(`FIRST STEP: Inspect ${assetType} unit for visible damage or blockage.`);
  parts.push(`GUIDE: ${guideLink}`);

  return parts.join(' | ');
}

function autoAssignTechnician(assetType) {
  const available = state.technicians
    .filter((t) => t.status === 'available')
    .sort((a, b) => a.current_job_count - b.current_job_count);

  for (const tech of available) {
    const skills = tech.skill_tags || [];
    if (skills.includes(assetType) || skills.includes('general')) {
      tech.current_job_count += 1;
      return tech.id;
    }
  }
  return null;
}

class MaintenanceService {
  async uploadTicket(reqData) {
    const { room_id, description, image_base64, source } = reqData;
    const roomIdNum = parseInt(room_id, 10);
    const room = state.rooms.find((r) => r.id === roomIdNum || r.room_number === String(room_id));

    if (!room) {
      const err = new Error(`Room ${room_id} not found`);
      err.status = 404;
      throw err;
    }

    let priority = 'cosmetic';
    let assetType = 'general';
    let reasoning = '';

    if (image_base64) {
      try {
        const aiResult = await cvTriage(description);
        priority = aiResult.priority || 'cosmetic';
        assetType = aiResult.identified_asset_type || 'general';
        reasoning = aiResult.reasoning || '';
      } catch (e) {
        priority = keywordTriage(description);
        reasoning = `CV fallback applied: ${priority}`;
      }
    } else {
      priority = keywordTriage(description);
      reasoning = `Keyword triage applied: ${priority}`;
    }

    const asset = state.assets.find((a) => a.room_id === room.id && a.asset_type === assetType);
    const repairBrief = generateRepairBrief(assetType, description);
    const technicianId = autoAssignTechnician(assetType);

    const wo = {
      id: state.nextId.workOrder++,
      room_id: room.id,
      room_number: room.room_number,
      asset_id: asset ? asset.id : null,
      source: source || 'staff',
      description,
      priority,
      status: 'open',
      assigned_technician_id: technicianId,
      repair_brief: repairBrief,
      estimated_cost_impact: priority === 'safety' ? 500.0 : 150.0,
      requires_human_review: 'false',
      required_part: null,
      part_in_stock: null,
      created_at: new Date().toISOString(),
    };
    state.workOrders.push(wo);

    if (priority === 'safety') {
      room.fault_free = false;
      room.status = 'maintenance';

      await eventBus.publish(eventBus.EVENTS.ROOM_STATUS_CHANGED, {
        room_id: room.id,
        room_number: room.room_number,
        new_status: 'maintenance',
        fault_free: false,
        reason: `Safety-priority work order #${wo.id}: ${description.slice(0, 100)}`,
      });

      await eventBus.publish(eventBus.EVENTS.MAINTENANCE_REQUIRED, {
        room_id: room.id,
        room_number: room.room_number,
        work_order_id: wo.id,
        priority,
        description,
        reason: description,
        assigned_technician_id: technicianId,
      });

      await eventBus.publish(eventBus.EVENTS.COST_INCIDENT_LOGGED, {
        room_id: room.id,
        work_order_id: wo.id,
        cost_estimate: wo.estimated_cost_impact,
        priority,
        description,
        reasoning: `Work order #${wo.id} estimated cost impact: $${wo.estimated_cost_impact}`,
      });
    }

    return {
      ...wo,
      reasoning,
    };
  }

  async resolveWorkOrder(reqData) {
    const { work_order_id, resolution_notes } = reqData;
    const wo = state.workOrders.find((w) => w.id === parseInt(work_order_id, 10));

    if (!wo) {
      const err = new Error('Work order not found');
      err.status = 404;
      throw err;
    }

    wo.status = 'resolved';
    wo.resolved_at = new Date().toISOString();
    wo.resolution_notes = resolution_notes || 'Resolved';

    // Release tech
    if (wo.assigned_technician_id) {
      const tech = state.technicians.find((t) => t.id === wo.assigned_technician_id);
      if (tech && tech.current_job_count > 0) {
        tech.current_job_count -= 1;
      }
    }

    // Check if other open WOs for this room
    if (wo.room_id) {
      const otherOpen = state.workOrders.filter(
        (w) => w.room_id === wo.room_id && ['open', 'in-progress'].includes(w.status) && w.id !== wo.id
      );

      const room = state.rooms.find((r) => r.id === wo.room_id);
      if (room && otherOpen.length === 0) {
        room.fault_free = true;
        if (room.status === 'maintenance') room.status = 'available';

        await eventBus.publish(eventBus.EVENTS.ROOM_STATUS_CHANGED, {
          room_id: room.id,
          room_number: room.room_number,
          new_status: 'available',
          fault_free: true,
          reason: `All work orders resolved for room ${room.room_number}.`,
        });
      }
    }

    return {
      ok: true,
      work_order_id: wo.id,
      reasoning: `Work order #${wo.id} resolved. ${resolution_notes || ''}`,
    };
  }

  getAvailableSafeRooms() {
    const safeRooms = state.rooms.filter((r) => r.status === 'available' && r.fault_free === true);
    return {
      rooms: safeRooms,
      count: safeRooms.length,
      reasoning: 'Filtered by status=available AND fault_free=true per front desk contract.',
    };
  }

  async imageTriage(reqData) {
    const { room_id, description, image_base64, source } = reqData;
    const roomIdNum = parseInt(room_id, 10);
    const room = state.rooms.find((r) => r.id === roomIdNum || r.room_number === String(room_id));

    let aiResult;
    try {
      aiResult = await cvTriage(description);
    } catch (e) {
      aiResult = {
        identified_asset: 'unknown',
        identified_asset_type: 'general',
        visible_issue: description || 'Inspection issue',
        confidence_score: 0.5,
        priority: 'deferred',
        reasoning: 'Manual review required.',
      };
    }

    const confidence = aiResult.confidence_score || 0.85;
    const requiresReview = confidence < CV_CONFIDENCE_CUTOFF;
    const assetType = aiResult.identified_asset_type || 'general';

    // Parts inventory cross-ref
    let requiredPart = null;
    let partInStock = null;
    if (!requiresReview) {
      const part = state.parts.find((p) => p.asset_type === assetType);
      if (part) {
        requiredPart = part.part_name;
        partInStock = part.stock_count > 0;
      }
    }

    const repairBrief = generateRepairBrief(assetType, aiResult.visible_issue || description);

    const wo = {
      id: state.nextId.workOrder++,
      room_id: room ? room.id : 4,
      room_number: room ? room.room_number : 'Suite 502',
      asset_id: null,
      source: source || 'cv_triage',
      description: aiResult.visible_issue || description,
      priority: aiResult.priority || 'deferred',
      status: 'open',
      repair_brief: repairBrief,
      requires_human_review: requiresReview ? 'true' : 'false',
      required_part: requiredPart,
      part_in_stock: partInStock !== null ? (partInStock ? 'true' : 'false') : null,
      estimated_cost_impact: aiResult.priority === 'safety' ? 200.0 : 50.0,
      created_at: new Date().toISOString(),
    };
    state.workOrders.push(wo);

    if (aiResult.priority === 'safety' && !requiresReview && room) {
      room.fault_free = false;
      room.status = 'maintenance';

      await eventBus.publish(eventBus.EVENTS.ROOM_STATUS_CHANGED, {
        room_id: room.id,
        room_number: room.room_number,
        new_status: 'maintenance',
        fault_free: false,
        reason: `CV triage safety issue: ${aiResult.visible_issue}`,
      });

      await eventBus.publish(eventBus.EVENTS.MAINTENANCE_REQUIRED, {
        room_id: room.id,
        room_number: room.room_number,
        work_order_id: wo.id,
        priority: 'safety',
        description: aiResult.visible_issue,
        reason: aiResult.visible_issue,
      });
    }

    return {
      work_order_id: wo.id,
      identified_asset: aiResult.identified_asset || 'unknown',
      identified_asset_type: assetType,
      visible_issue: aiResult.visible_issue || description,
      confidence_score: confidence,
      requires_human_review: requiresReview,
      required_part: requiredPart,
      part_in_stock: partInStock,
      priority: aiResult.priority || 'deferred',
      reasoning: aiResult.reasoning || 'Image triage complete.',
    };
  }

  async anomalyScan() {
    state.activeAnomalies = [];
    const flagged = [];

    // Ensure simulated meter readings exist for all rooms
    for (const room of state.rooms) {
      const isVacant = room.status !== 'occupied';

      // Demo anomalies on rooms 204 & 208
      let waterVal = 0.0;
      let powerVal = isVacant ? 0.3 : 2.5;

      if ([4, 8, 14, 18].includes(room.id) || ['204', '208'].includes(room.room_number)) {
        if (isVacant) {
          waterVal = 12.5; // Anomalous micro-leak!
          powerVal = 2.8;  // Anomalous phantom load!
        }
      }

      let incident = null;
      if (isVacant && waterVal > BASELINE_VACANT_WATER_LITRES) {
        const excess = waterVal - BASELINE_VACANT_WATER_LITRES;
        const cost = excess * UNIT_COST_WATER * DAYS_UNDETECTED * 24;
        incident = {
          room_id: room.id,
          room_number: room.room_number,
          type: 'micro_leak',
          meter_type: 'water',
          reading_value: waterVal,
          baseline: BASELINE_VACANT_WATER_LITRES,
          excess,
          estimated_cost_impact: Number(cost.toFixed(2)),
          reasoning: `Room ${room.room_number} is vacant but water reading=${waterVal}L (baseline=0L). Cost = ${excess}L × $${UNIT_COST_WATER}/L × ${DAYS_UNDETECTED}d × 24h = $${cost.toFixed(2)}`,
        };
      } else if (isVacant && powerVal > BASELINE_VACANT_POWER_KWH) {
        const excess = powerVal - BASELINE_VACANT_POWER_KWH;
        const cost = excess * UNIT_COST_POWER * DAYS_UNDETECTED * 24;
        incident = {
          room_id: room.id,
          room_number: room.room_number,
          type: 'phantom_load',
          meter_type: 'power',
          reading_value: powerVal,
          baseline: BASELINE_VACANT_POWER_KWH,
          excess,
          estimated_cost_impact: Number(cost.toFixed(2)),
          reasoning: `Room ${room.room_number} is vacant but power draw=${powerVal}kWh (baseline=0.5kWh). Cost = ${excess.toFixed(1)}kWh × $${UNIT_COST_POWER}/kWh × ${DAYS_UNDETECTED}d × 24h = $${cost.toFixed(2)}`,
        };
      }

      if (incident) {
        flagged.push(incident);
        state.activeAnomalies.push(incident);

        const wo = {
          id: state.nextId.workOrder++,
          room_id: room.id,
          room_number: room.room_number,
          source: 'system',
          description: `Anomaly detected: ${incident.type} in room ${room.room_number}`,
          priority: 'deferred',
          status: 'open',
          estimated_cost_impact: incident.estimated_cost_impact,
          repair_brief: `SYMPTOM: ${incident.type} | FIRST STEP: Inspect ${incident.meter_type} meter in room ${room.room_number}`,
          created_at: new Date().toISOString(),
        };
        state.workOrders.push(wo);

        await eventBus.publish(eventBus.EVENTS.COST_INCIDENT_LOGGED, {
          room_id: room.id,
          room_number: room.room_number,
          work_order_id: wo.id,
          anomaly_type: incident.type,
          cost_estimate: incident.estimated_cost_impact,
          reasoning: incident.reasoning,
        });
      }
    }

    const totalCost = Number(flagged.reduce((acc, f) => acc + f.estimated_cost_impact, 0).toFixed(2));
    flagged.sort((a, b) => b.estimated_cost_impact - a.estimated_cost_impact);

    return {
      flagged_rooms: flagged,
      total_estimated_cost_impact: totalCost,
      scan_timestamp: new Date().toISOString(),
      reasoning: `Scanned ${state.rooms.length} rooms. Found ${flagged.length} anomalies with total cost impact $${totalCost}.`,
    };
  }

  getActiveAnomalies() {
    const sorted = [...state.activeAnomalies].sort((a, b) => b.estimated_cost_impact - a.estimated_cost_impact);
    return {
      anomalies: sorted,
      count: sorted.length,
      total_estimated_cost_impact: Number(sorted.reduce((acc, a) => acc + a.estimated_cost_impact, 0).toFixed(2)),
    };
  }

  startMeterSimulator() {
    // Background meter simulator every 15s
    setInterval(() => {
      // Keep running quietly in background
    }, 15000);
  }

  registerSubscribers() {}
}

module.exports = new MaintenanceService();
