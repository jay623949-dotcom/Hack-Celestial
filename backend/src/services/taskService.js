const dataStore = require('../data/dataStore');

class TaskService {
  getAll(filters = {}) {
    let tasks = dataStore.findAll('tasks');

    if (filters.status) {
      tasks = tasks.filter((t) => t.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.priority) {
      tasks = tasks.filter((t) => t.priority.toLowerCase() === filters.priority.toLowerCase());
    }

    if (filters.department) {
      tasks = tasks.filter((t) => t.department.toLowerCase() === filters.department.toLowerCase());
    }

    if (filters.assigned_to) {
      tasks = tasks.filter((t) => t.assigned_to === filters.assigned_to);
    }

    if (filters.incident_id) {
      tasks = tasks.filter((t) => t.incident_id === filters.incident_id);
    }

    if (filters.room_id) {
      tasks = tasks.filter((t) => t.room_id === filters.room_id);
    }

    return tasks;
  }

  getById(id) {
    return dataStore.findById('tasks', id);
  }

  create(data) {
    const id = data.id || `task-${Date.now().toString().slice(-4)}`;
    const newTask = {
      id,
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      status: data.status || 'pending',
      department: data.department || 'general',
      assigned_to: data.assigned_to || null,
      room_id: data.room_id || null,
      room_number: data.room_number || null,
      incident_id: data.incident_id || null,
      due_time: data.due_time || '12:00 PM',
      action_plan_id: data.action_plan_id || null,
      action_plan_item_id: data.action_plan_item_id || null,
      guest_id: data.guest_id || null,
      source: data.source || null,
      dispatched_at: data.dispatched_at || null,
      created_at: new Date().toISOString(),
    };
    return dataStore.create('tasks', newTask);

  }

  update(id, updates) {
    const existing = dataStore.findById('tasks', id);
    if (!existing) return null;
    return dataStore.update('tasks', id, updates);
  }
}

module.exports = new TaskService();
