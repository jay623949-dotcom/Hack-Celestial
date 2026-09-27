/**
 * Smart Resort 360 - Housekeeping Service
 */
const { state } = require('./smartResortStore');
const eventBus = require('./eventBus');

class HousekeepingService {
  getTasks() {
    return state.housekeepingTasks
      .filter((t) => ['dirty', 'cleaning', 'blocked'].includes(t.status))
      .sort((a, b) => a.priority_rank - b.priority_rank);
  }

  async reorder(taskIdsInOrder) {
    let count = 0;
    for (let i = 0; i < taskIdsInOrder.length; i++) {
      const taskId = taskIdsInOrder[i];
      const task = state.housekeepingTasks.find((t) => t.id === taskId || t.room_id === taskId);
      if (task) {
        task.priority_rank = i + 1;
        count++;

        await eventBus.publish(eventBus.EVENTS.ROOM_READY_ETA_UPDATED, {
          room_id: task.room_id,
          eta_minutes: task.eta_minutes,
          priority_rank: task.priority_rank,
          reason: 'Manual reorder by housekeeping supervisor',
        });
      }
    }

    return {
      ok: true,
      reordered: count,
      reasoning: 'Housekeeping queue manually reordered.',
    };
  }

  async completeTask(identifier) {
    const task = state.housekeepingTasks.find(
      (t) => t.id === parseInt(identifier, 10) || t.room_id === parseInt(identifier, 10)
    );

    if (!task) {
      const err = new Error('Housekeeping task not found');
      err.status = 404;
      throw err;
    }

    task.status = 'ready';
    task.eta_minutes = 0;

    // Room becomes available
    const room = state.rooms.find((r) => r.id === task.room_id);
    if (room && room.status !== 'occupied') {
      room.status = 'available';
    }

    await eventBus.publish(eventBus.EVENTS.ROOM_READY_ETA_UPDATED, {
      room_id: task.room_id,
      eta_minutes: 0,
      status: 'ready',
      reason: 'Housekeeping task completed — room is clean and ready',
    });

    await eventBus.publish(eventBus.EVENTS.ROOM_STATUS_CHANGED, {
      room_id: task.room_id,
      new_status: 'available',
      reason: 'Housekeeping complete',
    });

    return {
      ok: true,
      room_id: task.room_id,
      reasoning: 'Room marked ready. ROOM_READY_ETA_UPDATED published.',
    };
  }

  async bumpRoomPriority(roomId, reason) {
    const task = state.housekeepingTasks.find(
      (t) => t.room_id === roomId && ['dirty', 'cleaning', 'blocked'].includes(t.status)
    );
    if (!task) return;

    // Shift other tasks down
    state.housekeepingTasks.forEach((t) => {
      if (t.id !== task.id && ['dirty', 'cleaning', 'blocked'].includes(t.status)) {
        t.priority_rank += 1;
      }
    });

    task.priority_rank = 1;
    task.eta_minutes = Math.max(5, task.eta_minutes - 10);

    await eventBus.publish(eventBus.EVENTS.ROOM_READY_ETA_UPDATED, {
      room_id: roomId,
      eta_minutes: task.eta_minutes,
      priority_rank: 1,
      reason,
    });
  }

  registerSubscribers() {
    // 1. VIP/At-Risk check-in bumps housekeeping priority
    eventBus.subscribe(eventBus.EVENTS.GUEST_CHECKED_IN, async (payload) => {
      const { value_tier, sentiment_state, room_id, name } = payload;
      if (room_id && (value_tier === 'VIP' || sentiment_state === 'At-Risk')) {
        const reason = `Priority bump: guest ${name} is ${value_tier === 'VIP' ? 'VIP ' : ''}${
          sentiment_state === 'At-Risk' ? 'At-Risk ' : ''
        }(value_tier=${value_tier}, sentiment=${sentiment_state})`;
        await this.bumpRoomPriority(room_id, reason);
      }
    });

    // 2. Maintenance Required blocks housekeeping
    eventBus.subscribe(eventBus.EVENTS.MAINTENANCE_REQUIRED, async (payload) => {
      const roomId = payload.room_id;
      if (!roomId) return;
      const task = state.housekeepingTasks.find((t) => t.room_id === roomId);
      if (task) {
        task.blocked = 'true';
        if (task.status === 'cleaning') task.status = 'blocked';
      }
    });

    // 3. Room status changed to available unblocks housekeeping
    eventBus.subscribe(eventBus.EVENTS.ROOM_STATUS_CHANGED, async (payload) => {
      const { room_id, new_status } = payload;
      if (room_id && new_status === 'available') {
        const task = state.housekeepingTasks.find((t) => t.room_id === room_id && t.blocked === 'true');
        if (task) {
          task.blocked = 'false';
          task.status = 'dirty';
        }
      }
    });
  }
}

module.exports = new HousekeepingService();
