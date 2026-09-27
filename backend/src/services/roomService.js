const dataStore = require('../data/dataStore');

class RoomService {
  getAll(filters = {}) {
    let rooms = dataStore.findAll('rooms');

    if (filters.status) {
      rooms = rooms.filter((r) => r.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.type) {
      rooms = rooms.filter((r) => r.type.toLowerCase().includes(filters.type.toLowerCase()));
    }

    if (filters.floor !== undefined) {
      const floorNum = parseInt(filters.floor, 10);
      if (!isNaN(floorNum)) {
        rooms = rooms.filter((r) => r.floor === floorNum);
      }
    }

    return rooms;
  }

  getById(id) {
    return dataStore.findById('rooms', id);
  }

  create(data) {
    const id = data.id || `room-${data.number || Date.now()}`;
    const newRoom = {
      id,
      number: String(data.number),
      floor: data.floor || (data.number ? parseInt(String(data.number)[0], 10) : 1),
      type: data.type,
      status: data.status || 'available',
      features: Array.isArray(data.features) ? data.features : [],
      last_cleaned: data.last_cleaned || new Date().toISOString(),
    };
    return dataStore.create('rooms', newRoom);
  }

  update(id, updates) {
    const existing = dataStore.findById('rooms', id);
    if (!existing) return null;
    return dataStore.update('rooms', id, updates);
  }
}

module.exports = new RoomService();
