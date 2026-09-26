const dataStore = require('../data/dataStore');

class IncidentService {
  getAll(filters = {}) {
    let incidents = dataStore.findAll('incidents');

    if (filters.status) {
      incidents = incidents.filter((i) => i.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.severity) {
      incidents = incidents.filter((i) => i.severity.toLowerCase() === filters.severity.toLowerCase());
    }

    if (filters.department) {
      incidents = incidents.filter((i) => i.department.toLowerCase() === filters.department.toLowerCase());
    }

    if (filters.room_id) {
      incidents = incidents.filter((i) => i.room_id === filters.room_id);
    }

    return incidents;
  }

  getById(id) {
    return dataStore.findById('incidents', id);
  }

  create(data) {
    const id = data.id || `incident-${Date.now().toString().slice(-4)}`;
    const newIncident = {
      id,
      title: data.title,
      description: data.description || '',
      severity: data.severity,
      status: data.status || 'open',
      department: data.department || 'general',
      room_id: data.room_id || null,
      guest_id: data.guest_id || null,
      source: data.source || 'internal',
      reported_at: data.reported_at || new Date().toISOString(),
    };
    return dataStore.create('incidents', newIncident);
  }

  update(id, updates) {
    const existing = dataStore.findById('incidents', id);
    if (!existing) return null;
    return dataStore.update('incidents', id, updates);
  }
}

module.exports = new IncidentService();
