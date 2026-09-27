const dataStore = require('../data/dataStore');

class StaffService {
  getAll(filters = {}) {
    let staff = dataStore.findAll('staff');

    if (filters.department) {
      staff = staff.filter((s) => s.department.toLowerCase() === filters.department.toLowerCase());
    }

    if (filters.status) {
      staff = staff.filter((s) => s.status.toLowerCase() === filters.status.toLowerCase());
    }

    return staff;
  }

  getById(id) {
    return dataStore.findById('staff', id);
  }

  create(data) {
    const id = data.id || `staff-${Date.now().toString().slice(-4)}`;
    const newStaff = {
      id,
      name: data.name,
      department: data.department,
      role: data.role || 'Staff Member',
      status: data.status || 'on_duty',
      current_task: data.current_task || 'Standby',
    };
    return dataStore.create('staff', newStaff);
  }

  update(id, updates) {
    const existing = dataStore.findById('staff', id);
    if (!existing) return null;
    return dataStore.update('staff', id, updates);
  }
}

module.exports = new StaffService();
