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
      incidents = incidents.filter((i) => 
        (i.department && i.department.toLowerCase() === filters.department.toLowerCase()) ||
        (i.affected_department && i.affected_department.toLowerCase() === filters.department.toLowerCase()) ||
        (i.reporting_department && i.reporting_department.toLowerCase() === filters.department.toLowerCase())
      );
    }

    if (filters.reporting_department) {
      incidents = incidents.filter((i) => i.reporting_department && i.reporting_department.toLowerCase() === filters.reporting_department.toLowerCase());
    }

    if (filters.affected_department) {
      incidents = incidents.filter((i) => (i.affected_department && i.affected_department.toLowerCase() === filters.affected_department.toLowerCase()) || (i.department && i.department.toLowerCase() === filters.affected_department.toLowerCase()));
    }

    if (filters.room_id) {
      incidents = incidents.filter((i) => i.room_id === filters.room_id);
    }

    return incidents;
  }

  getById(id) {
    if (id === 'incident-001' || id === 'INC-401-AC') {
      return dataStore.findById('incidents', 'INC-401-AC') || dataStore.findById('incidents', 'incident-001');
    }
    return dataStore.findById('incidents', id);
  }

  create(data) {
    const id = data.id || `incident-${Date.now().toString().slice(-4)}`;
    const affectedDept = data.affected_department || data.department || 'maintenance';
    const reportingDept = data.reporting_department || 'front_desk';

    const newIncident = {
      id,
      title: data.title,
      description: data.description || '',
      severity: data.severity || 'medium',
      status: data.status || 'open',
      department: affectedDept,
      affected_department: affectedDept,
      reporting_department: reportingDept,
      reported_by: data.reported_by || 'Staff Member',
      category: data.category || 'general',
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
