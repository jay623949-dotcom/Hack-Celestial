const dataStore = require('../data/dataStore');

class GuestService {
  getAll(filters = {}) {
    let guests = dataStore.findAll('guests');

    if (filters.vip !== undefined) {
      const isVip = String(filters.vip).toLowerCase() === 'true';
      guests = guests.filter((g) => Boolean(g.vip) === isVip);
    }

    if (filters.room_id) {
      guests = guests.filter((g) => g.room_id === filters.room_id);
    }

    return guests;
  }

  getById(id) {
    return dataStore.findById('guests', id);
  }

  create(data) {
    const id = data.id || `guest-${Date.now().toString().slice(-4)}`;
    const newGuest = {
      id,
      name: data.name,
      vip: Boolean(data.vip),
      vip_tier: data.vip_tier || (data.vip ? 'VIP' : 'Standard'),
      room_id: data.room_id || null,
      room_number: data.room_number || null,
      telegram_id: data.telegram_id || null,
      check_in: data.check_in || new Date().toISOString(),
      check_out: data.check_out || null,
      notes: data.notes || '',
    };
    return dataStore.create('guests', newGuest);
  }

  update(id, updates) {
    const existing = dataStore.findById('guests', id);
    if (!existing) return null;
    return dataStore.update('guests', id, updates);
  }
}

module.exports = new GuestService();
