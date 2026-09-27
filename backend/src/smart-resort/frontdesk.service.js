/**
 * Smart Resort 360 - Front Desk Service
 */
const { state } = require('./smartResortStore');
const eventBus = require('./eventBus');
const { classifyPersonaSentiment } = require('./aiClassifier');

const VALUE_TIER_WEIGHTS = { VIP: 100, Premium: 60, Standard: 20 };
const SENTIMENT_WEIGHTS = { 'At-Risk': 80, Neutral: 0, Positive: -10 };

class FrontDeskService {
  async checkIn(reqData) {
    const { name, reservation_id, room_id, transcript, checkout_date } = reqData;

    // 1. AI Classification
    let aiResult;
    try {
      aiResult = await classifyPersonaSentiment(transcript || '');
    } catch (e) {
      aiResult = {
        persona_label: 'Business',
        value_tier: 'Standard',
        sentiment_state: 'Neutral',
        reasoning: 'Fallback classification applied.',
        confidence: 0.7,
      };
    }

    // 2. Validate Room
    const roomIdNum = parseInt(room_id, 10);
    const room = state.rooms.find((r) => r.id === roomIdNum || r.room_number === String(room_id));
    if (!room) {
      const err = new Error(`Room ${room_id} not found`);
      err.status = 404;
      throw err;
    }

    if (!room.fault_free) {
      const err = new Error(`Room ${room_id} is not fault-free — cannot check in`);
      err.status = 409;
      throw err;
    }

    // 3. Create or update guest
    let guest = state.guests.find((g) => g.reservation_id === reservation_id);
    const checkinDt = new Date().toISOString();

    if (!guest) {
      guest = {
        id: state.nextId.guest++,
        name: name || 'Guest',
        reservation_id: reservation_id || `RES-${Math.floor(Math.random() * 9000 + 1000)}`,
        room_id: room.id,
        persona_label: aiResult.persona_label,
        value_tier: aiResult.value_tier,
        sentiment_state: aiResult.sentiment_state,
        checkin_date: checkinDt,
        checkout_date: checkout_date || new Date(Date.now() + 48 * 3600000).toISOString(),
        wallet_spend_to_date: 0.0,
      };
      state.guests.push(guest);
    } else {
      guest.persona_label = aiResult.persona_label;
      guest.value_tier = aiResult.value_tier;
      guest.sentiment_state = aiResult.sentiment_state;
      guest.checkin_date = checkinDt;
      guest.room_id = room.id;
    }

    // Mark room occupied
    room.status = 'occupied';

    // 4. Publish Events
    const eventPayload = {
      guest_id: guest.id,
      name: guest.name,
      reservation_id: guest.reservation_id,
      persona_label: aiResult.persona_label,
      value_tier: aiResult.value_tier,
      sentiment_state: aiResult.sentiment_state,
      room_id: room.id,
      room_number: room.room_number,
      checkin_time: checkinDt,
      reasoning: aiResult.reasoning || '',
      confidence: aiResult.confidence || 0.9,
    };

    await eventBus.publish(eventBus.EVENTS.GUEST_CHECKED_IN, eventPayload);

    if (aiResult.sentiment_state === 'At-Risk') {
      await eventBus.publish(eventBus.EVENTS.SENTIMENT_ALERT, {
        ...eventPayload,
        alert_reason: 'Guest classified as At-Risk on intake transcript analysis',
      });
    }

    return {
      ...guest,
      reasoning: aiResult.reasoning || '',
    };
  }

  getGuests() {
    return state.guests.filter((g) => Boolean(g.checkin_date));
  }

  serviceRecovery(guestId, action) {
    const guest = state.guests.find((g) => g.id === parseInt(guestId, 10));
    if (!guest) {
      const err = new Error('Guest not found');
      err.status = 404;
      throw err;
    }

    if (guest.sentiment_state === 'At-Risk') {
      guest.sentiment_state = 'Neutral';
    }

    const actionMap = {
      complimentary_upgrade: `Complimentary room upgrade offered to ${guest.name}. Sentiment reset to Neutral.`,
      spa_voucher: `Complimentary spa voucher issued to ${guest.name}.`,
      room_credit: `₹4,000 room credit applied to ${guest.name}'s account.`,
      manager_callback: `Duty manager callback scheduled for ${guest.name} within 15 mins.`,
    };

    const actionTaken = actionMap[action] || `Custom recovery action: ${action}`;

    return {
      guest_id: guest.id,
      action_taken: actionTaken,
      reasoning: `Guest ${guest.name} (${guest.persona_label}, ${guest.value_tier}) received recovery perk '${action}'.`,
    };
  }

  getPriorityQueue() {
    const active = state.guests.filter((g) => Boolean(g.checkin_date));
    const items = active.map((g) => {
      const vWeight = VALUE_TIER_WEIGHTS[g.value_tier] || 20;
      const sWeight = SENTIMENT_WEIGHTS[g.sentiment_state] || 0;
      const score = vWeight + sWeight;

      return {
        guest_id: g.id,
        name: g.name,
        room_id: g.room_id,
        persona_label: g.persona_label,
        value_tier: g.value_tier,
        sentiment_state: g.sentiment_state,
        priority_score: score,
        reasoning: `Score ${score} = value_tier(${g.value_tier}=${vWeight}) + sentiment(${g.sentiment_state}=${sWeight})`,
      };
    });

    items.sort((a, b) => b.priority_score - a.priority_score);
    return items;
  }

  registerSubscribers() {
    // When SENTIMENT_ALERT is published
    eventBus.subscribe(eventBus.EVENTS.SENTIMENT_ALERT, async (payload) => {
      console.log(`[FrontDesk] Received SENTIMENT_ALERT for guest: ${payload.name}`);
    });
  }
}

module.exports = new FrontDeskService();
