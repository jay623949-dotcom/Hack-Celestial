/**
 * Smart Resort 360 - Revenue Agent Service
 */
const { state } = require('./smartResortStore');
const eventBus = require('./eventBus');
const { generateOfferCopy } = require('./aiClassifier');

const RATE_CHANGE_CAP = 0.15; // Max ±15% per pricing change
const DEMAND_MULTIPLIERS = {
  low: -0.05,
  neutral: 0.0,
  high: 0.08,
  surge: 0.15,
};

class RevenueService {
  async recalculatePricing(reqData) {
    const { room_category, occupancy_pct = 0.5, demand_signal = 'neutral', manual_reason } = reqData;

    const matchingRooms = state.rooms.filter((r) => r.category.toLowerCase() === room_category.toLowerCase());
    if (matchingRooms.length === 0) {
      const err = new Error(`Room category '${room_category}' not found`);
      err.status = 404;
      throw err;
    }

    const oldRate = matchingRooms[0].current_rate;
    const baseRate = matchingRooms[0].base_rate;

    const occupancyFactor = (occupancy_pct - 0.5) * 0.2;
    const demandFactor = DEMAND_MULTIPLIERS[demand_signal] || 0.0;
    let totalAdj = occupancyFactor + demandFactor;

    // Enforce ±15% Guardrail Cap
    totalAdj = Math.max(-RATE_CHANGE_CAP, Math.min(RATE_CHANGE_CAP, totalAdj));

    let newRate = Number((oldRate * (1 + totalAdj)).toFixed(2));
    newRate = Math.max(baseRate * 0.5, newRate);

    // Apply to all rooms in category
    matchingRooms.forEach((r) => {
      r.current_rate = newRate;
    });

    const reasonParts = [`Occupancy=${(occupancy_pct * 100).toFixed(0)}%`, `Demand=${demand_signal}`];
    if (manual_reason) reasonParts.push(manual_reason);
    const triggerReason = reasonParts.join(' | ');

    const log = {
      id: state.nextId.rateChangeLog++,
      room_category,
      old_rate: oldRate,
      new_rate: newRate,
      trigger_reason: triggerReason,
      timestamp: new Date().toISOString(),
    };
    state.rateChangeLogs.push(log);

    return {
      room_category,
      old_rate: oldRate,
      new_rate: newRate,
      change_pct: Number((totalAdj * 100).toFixed(2)),
      trigger_reason: triggerReason,
      reasoning: `Rate adjusted ${(totalAdj * 100).toFixed(1)}% (strictly capped at ±${(RATE_CHANGE_CAP * 100).toFixed(0)}%). New rate: $${newRate}/night.`,
    };
  }

  getCurrentPricing(category) {
    const room = state.rooms.find((r) => r.category.toLowerCase() === category.toLowerCase());
    if (!room) {
      const err = new Error(`Category '${category}' not found`);
      err.status = 404;
      throw err;
    }

    const logs = state.rateChangeLogs
      .filter((l) => l.room_category.toLowerCase() === category.toLowerCase())
      .slice(-5)
      .reverse();

    return {
      room_category: category,
      current_rate: room.current_rate,
      base_rate: room.base_rate,
      last_5_changes: logs,
    };
  }

  getNetRevPar() {
    const totalRooms = state.rooms.length;
    if (totalRooms === 0) {
      return {
        gross_revpar: 0,
        gross_adr: 0,
        net_revpar: 0,
        net_adr: 0,
        occupancy_pct: 0,
        total_active_cost_incidents: 0,
        cost_deduction: 0,
        reasoning: 'No rooms available.',
      };
    }

    const occupied = state.rooms.filter((r) => r.status === 'occupied');
    const occupancyPct = occupied.length / totalRooms;

    const grossAdr = occupied.length > 0
      ? occupied.reduce((acc, r) => acc + r.current_rate, 0) / occupied.length
      : 220.0;
    const grossRevpar = grossAdr * occupancyPct;

    const costDeduction = state.totalActiveCostIncidents;
    const netRevpar = Math.max(0.0, grossRevpar - costDeduction / totalRooms);
    const netAdr = Math.max(0.0, grossAdr - (occupied.length > 0 ? costDeduction / occupied.length : 0));

    return {
      gross_revpar: Number(grossRevpar.toFixed(2)),
      gross_adr: Number(grossAdr.toFixed(2)),
      net_revpar: Number(netRevpar.toFixed(2)),
      net_adr: Number(netAdr.toFixed(2)),
      occupancy_pct: Number(occupancyPct.toFixed(4)),
      total_active_cost_incidents: Number(costDeduction.toFixed(2)),
      cost_deduction: Number(costDeduction.toFixed(2)),
      reasoning: `Occupancy: ${(occupancyPct * 100).toFixed(1)}% (${occupied.length}/${totalRooms} rooms). Gross RevPAR: $${grossRevpar.toFixed(2)}, Net RevPAR: $${netRevpar.toFixed(2)} (deducted $${costDeduction.toFixed(2)} in active maintenance incidents). Formula: Net RevPAR = Gross RevPAR - (cost_incidents / total_rooms).`,
    };
  }

  async createFlashSale(reqData) {
    const { asset_description = 'Sunset Spa & Cabana Bundle', offer_type = 'perishable_inventory', price = 79, expiry_minutes = 60 } = reqData;

    const checkedInGuests = state.guests.filter((g) => Boolean(g.checkin_date));
    if (checkedInGuests.length === 0) {
      const err = new Error('No checked-in guests to target');
      err.status = 404;
      throw err;
    }

    const expiryDt = new Date(Date.now() + expiry_minutes * 60000).toISOString();
    const offersCreated = [];

    for (const guest of checkedInGuests) {
      const copyResult = await generateOfferCopy(guest.persona_label, asset_description);
      const offer = {
        id: state.nextId.offer++,
        guest_id: guest.id,
        guest_name: guest.name,
        offer_type,
        persona_match: guest.persona_label,
        price,
        expiry: expiryDt,
        status: 'pending',
        offer_copy: copyResult.offer_copy,
      };
      state.offers.push(offer);

      offersCreated.push({
        guest_id: guest.id,
        guest_name: guest.name,
        persona_label: guest.persona_label,
        offer_id: offer.id,
        offer_copy: copyResult.offer_copy,
      });
    }

    await eventBus.publish(eventBus.EVENTS.PERISHABLE_FLASH_SALE, {
      asset_description,
      offer_type,
      price,
      expiry_minutes,
      guests_targeted: offersCreated.length,
      offers: offersCreated,
      reasoning: `Flash sale for '${asset_description}' delivered to ${offersCreated.length} checked-in guests with persona-matched copy.`,
    });

    return {
      offers_created: offersCreated.length,
      guests_targeted: offersCreated,
      reasoning: `Created ${offersCreated.length} offers for '${asset_description}'. Expiry in ${expiry_minutes} mins. PERISHABLE_FLASH_SALE published.`,
    };
  }

  simulateWingShutdown(wingId) {
    const wingRooms = state.rooms.filter((r) => r.wing.toLowerCase() === wingId.toLowerCase());
    if (wingRooms.length === 0) {
      const err = new Error(`Wing '${wingId}' not found`);
      err.status = 404;
      throw err;
    }

    const wingRoomIds = wingRooms.map((r) => r.id);
    const safetyBlockers = [];

    for (const room of wingRooms) {
      const openSafety = state.workOrders.filter(
        (w) => w.room_id === room.id && w.priority === 'safety' && ['open', 'in-progress'].includes(w.status)
      );
      if (openSafety.length > 0) {
        safetyBlockers.push(`Room ${room.room_number}: ${openSafety.length} open safety work order(s)`);
      }
    }

    const feasible = safetyBlockers.length === 0;

    const allRooms = state.rooms;
    const remainingRooms = allRooms.filter((r) => r.wing.toLowerCase() !== wingId.toLowerCase());
    const currentRevenue = allRooms
      .filter((r) => r.status === 'occupied')
      .reduce((acc, r) => acc + r.current_rate, 0);
    const netProfitTarget = Math.max(currentRevenue - state.totalActiveCostIncidents, 0);

    const remainingOccupied = remainingRooms.filter((r) => r.status === 'occupied');
    const revisedRate = remainingOccupied.length > 0
      ? Number((netProfitTarget / remainingOccupied.length).toFixed(2))
      : 0.0;

    return {
      wing_id: wingId,
      feasible,
      safety_blockers: safetyBlockers,
      rooms_affected: wingRooms.length,
      rooms_remaining: remainingRooms.length,
      current_net_profit_target: Number(netProfitTarget.toFixed(2)),
      revised_rate_required: revisedRate,
      before_after_comparison: {
        before: {
          active_rooms: allRooms.length,
          occupied: allRooms.filter((r) => r.status === 'occupied').length,
          avg_rate: Number((allRooms.reduce((acc, r) => acc + r.current_rate, 0) / allRooms.length).toFixed(2)),
        },
        after: {
          active_rooms: remainingRooms.length,
          occupied: remainingOccupied.length,
          required_avg_rate: revisedRate,
        },
      },
      reasoning: `Wing ${wingId} has ${wingRooms.length} rooms. ${
        feasible ? 'Feasible.' : 'NOT feasible — safety blockers: ' + safetyBlockers.join(', ')
      } Required rate on ${remainingOccupied.length} remaining occupied rooms: $${revisedRate}/night to meet $${netProfitTarget.toFixed(2)} target.`,
    };
  }

  registerSubscribers() {
    // 1. COST_INCIDENT_LOGGED -> Increment cost & publish NET_REVPAR_UPDATED
    eventBus.subscribe(eventBus.EVENTS.COST_INCIDENT_LOGGED, async (payload) => {
      const cost = payload.cost_estimate || 0.0;
      state.totalActiveCostIncidents += cost;

      const netRevParData = this.getNetRevPar();
      await eventBus.publish(eventBus.EVENTS.NET_REVPAR_UPDATED, {
        ...netRevParData,
        latest_incident: payload,
        reasoning: `Maintenance cost $${cost.toFixed(2)} deducted. New net RevPAR: $${netRevParData.net_revpar}`,
      });
    });

    // 2. GUEST_CHECKED_IN -> Check occupancy threshold
    eventBus.subscribe(eventBus.EVENTS.GUEST_CHECKED_IN, async () => {
      const total = state.rooms.length;
      const occupied = state.rooms.filter((r) => r.status === 'occupied').length;
      const occupancyPct = occupied / Math.max(total, 1);

      if (occupancyPct >= 0.6) {
        await eventBus.publish(eventBus.EVENTS.OCCUPANCY_THRESHOLD_CROSSED, {
          occupancy_pct: Number(occupancyPct.toFixed(4)),
          threshold: 0.6,
          reasoning: `Occupancy ${(occupancyPct * 100).toFixed(1)}% crossed 60% threshold on check-in.`,
        });
      }
    });
  }
}

module.exports = new RevenueService();
