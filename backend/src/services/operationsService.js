const dataStore = require('../data/dataStore');

class OperationsService {
  getSummary() {
    const store = dataStore.getStore();
    const rooms = store.rooms || [];
    const incidents = store.incidents || [];
    const tasks = store.tasks || [];
    const staff = store.staff || [];

    // Calculate room counts dynamically
    const roomSummary = {
      total: rooms.length,
      occupied: rooms.filter((r) => r.status === 'occupied').length,
      available: rooms.filter((r) => r.status === 'available').length,
      maintenance: rooms.filter((r) => r.status === 'maintenance').length,
      reserved: rooms.filter((r) => r.status === 'reserved').length,
      dirty: rooms.filter((r) => r.status === 'dirty').length,
    };

    // Calculate incident counts dynamically
    const incidentSummary = {
      total: incidents.length,
      open: incidents.filter((i) => i.status === 'open').length,
      in_progress: incidents.filter((i) => i.status === 'in_progress').length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
      critical: incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length,
      high: incidents.filter((i) => i.severity === 'high' && i.status !== 'resolved').length,
    };

    // Calculate task counts dynamically
    const taskSummary = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };

    // Calculate staff status dynamically
    const staffSummary = {
      total: staff.length,
      on_duty: staff.filter((s) => s.status === 'on_duty').length,
      busy: staff.filter((s) => s.status === 'busy').length,
      off_duty: staff.filter((s) => s.status === 'off_duty').length,
    };

    return {
      resort: store.resort || {},
      rooms: roomSummary,
      incidents: incidentSummary,
      tasks: taskSummary,
      staff: staffSummary,
    };
  }
}

module.exports = new OperationsService();
