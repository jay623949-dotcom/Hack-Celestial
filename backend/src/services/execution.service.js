const taskService = require('./taskService');
const staffService = require('./staffService');
const roomService = require('./roomService');
const incidentService = require('./incidentService');
const aiPersistence = require('./ai-persistence.service');
const socketService = require('./socket.service');
const db = require('../config/db');

// In-memory backing store for execution records & timeline events
const inMemoryExecutions = new Map(); // planId -> executionRecord
const inMemoryTimeline = new Map();   // planId -> [events]

class ExecutionService {
  /**
   * Execute an approved action plan.
   * Converted approved action items into real operational tasks and dispatches them.
   * Enforces strict safety: only approved plans can execute; duplicate execution is blocked.
   */
  async executePlan(planId, options = {}) {
    const plan = await aiPersistence.getActionPlan(planId);
    if (!plan) {
      const error = new Error(`Action plan not found with id: ${planId}`);
      error.code = 'PLAN_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // 1. SAFETY GUARD: Plan must be approved
    if (plan.status === 'rejected') {
      const error = new Error('Cannot execute a rejected action plan.');
      error.code = 'PLAN_REJECTED';
      error.status = 409;
      throw error;
    }

    if (plan.status !== 'approved' && plan.status !== 'in_progress' && plan.status !== 'completed') {
      const error = new Error(`Only approved action plans can enter execution. Current status is '${plan.status}'.`);
      error.code = 'PLAN_NOT_APPROVED';
      error.status = 409;
      throw error;
    }

    // 2. IDEMPOTENCY GUARD: Check if execution already exists
    if (inMemoryExecutions.has(planId)) {
      const existing = inMemoryExecutions.get(planId);
      console.log(`[ExecutionService] Idempotency: Plan ${planId} already executed. Returning existing state.`);
      return this.getExecutionState(planId);
    }

    const execId = `exec-${planId}`;
    const now = new Date().toISOString();
    const approvedItems = plan.items || [];

    if (approvedItems.length === 0) {
      const error = new Error('No action items available in plan for execution.');
      error.code = 'NO_ACTION_ITEMS';
      error.status = 400;
      throw error;
    }

    // 3. Create Execution Record
    const executionRecord = {
      id: execId,
      action_plan_id: planId,
      status: 'running',
      total_tasks: approvedItems.length,
      completed_tasks: 0,
      failed_tasks: 0,
      tasks: [],
      started_at: now,
      completed_at: null,
      error_message: null,
      source_type: 'execution_engine',
    };
    inMemoryExecutions.set(planId, executionRecord);

    const timelineEvents = [];
    inMemoryTimeline.set(planId, timelineEvents);

    // Initial timeline events
    this._addTimelineEvent(planId, {
      execution_id: execId,
      event_type: 'action_plan.approved',
      title: 'Action Plan Approved',
      description: `Plan approved by ${plan.approved_by || 'Manager'} for immediate operational execution.`,
      department: 'management',
      created_at: plan.approved_at || now,
    });

    this._addTimelineEvent(planId, {
      execution_id: execId,
      event_type: 'execution.started',
      title: 'Execution Engine Started',
      description: `Automated dispatch of ${approvedItems.length} operational tasks initialized.`,
      department: 'operations',
      created_at: now,
    });

    // Broadcast execution started
    socketService.emitEvent('execution.started', {
      execution_id: execId,
      action_plan_id: planId,
      status: 'running',
      total_tasks: approvedItems.length,
      timestamp: now,
    });

    // 4. Convert Approved Action Items into Executable Tasks
    let failedDispatches = 0;

    for (let i = 0; i < approvedItems.length; i++) {
      const item = approvedItems[i];
      const taskId = `task-exec-${planId.replace('plan-', '')}-${i + 1}`;

      try {
        // Create operational task
        const createdTask = taskService.create({
          id: taskId,
          title: item.description,
          description: item.description,
          department: item.department || 'general',
          assigned_to: item.assigned_staff || null,
          room_id: item.room_id || null,
          guest_id: item.guest_id || null,
          priority: item.priority || 'medium',
          status: 'dispatched',
          action_plan_id: planId,
          action_plan_item_id: item.id,
          dispatched_at: now,
        });

        executionRecord.tasks.push(createdTask);

        // Update staff availability and workload
        let assignedStaffName = 'Available Team';
        if (item.assigned_staff) {
          const staffMember = staffService.getById(item.assigned_staff);
          if (staffMember) {
            assignedStaffName = staffMember.name;
            staffService.update(staffMember.id, {
              status: 'busy',
              current_task: item.description,
            });

            socketService.emitEvent('staff.status_changed', {
              staff_id: staffMember.id,
              name: staffMember.name,
              department: staffMember.department,
              status: 'busy',
              current_task: item.description,
            });
          }
        }

        // Operational Room preparation state change
        if (item.room_id && (item.department === 'housekeeping' || item.department === 'maintenance')) {
          const roomObj = roomService.getById(item.room_id);
          if (roomObj) {
            socketService.emitEvent('room.status_changed', {
              room_id: item.room_id,
              number: roomObj.number,
              status: roomObj.status,
              housekeeping_status: item.department === 'housekeeping' ? 'cleaning' : roomObj.housekeeping_status,
              task_id: taskId,
            });
          }
        }

        // Log task dispatched timeline event
        this._addTimelineEvent(planId, {
          execution_id: execId,
          task_id: taskId,
          event_type: 'task.dispatched',
          title: `Task Dispatched: ${item.description}`,
          description: `Assigned to ${assignedStaffName} (${item.department?.replace('_', ' ')}) with ${item.priority} priority.`,
          department: item.department,
          staff_id: item.assigned_staff,
          room_id: item.room_id,
          created_at: new Date().toISOString(),
        });

        // Broadcast task.dispatched event
        socketService.emitEvent('task.dispatched', {
          task_id: taskId,
          action_plan_id: planId,
          action_plan_item_id: item.id,
          title: item.description,
          department: item.department,
          assigned_staff: item.assigned_staff,
          assigned_staff_name: assignedStaffName,
          room_id: item.room_id,
          priority: item.priority,
          status: 'dispatched',
        });
      } catch (taskErr) {
        console.error(`[ExecutionService] Failed to dispatch item ${item.id}:`, taskErr.message);
        failedDispatches++;
        this._addTimelineEvent(planId, {
          execution_id: execId,
          event_type: 'task.dispatch_failed',
          title: `Dispatch Failed: ${item.description}`,
          description: taskErr.message,
          department: item.department,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Set execution status
    if (failedDispatches > 0 && failedDispatches < approvedItems.length) {
      executionRecord.status = 'partial';
      executionRecord.failed_tasks = failedDispatches;
      executionRecord.error_message = `${failedDispatches} task(s) could not be dispatched.`;
    } else if (failedDispatches === approvedItems.length) {
      executionRecord.status = 'failed';
      executionRecord.failed_tasks = failedDispatches;
      executionRecord.error_message = 'All task dispatches failed.';
    }

    // Save to PostgreSQL if connected
    try {
      await db.query(`
        INSERT INTO ai_action_plan_executions
          (id, action_plan_id, status, total_tasks, completed_tasks, failed_tasks, started_at, source_type)
        VALUES ($1, $2, $3, $4, 0, $5, NOW(), 'execution_engine')
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          total_tasks = EXCLUDED.total_tasks
      `, [execId, planId, executionRecord.status, approvedItems.length, failedDispatches]);
    } catch (_) {}

    return this.getExecutionState(planId);
  }

  /**
   * Advance task status (e.g. dispatched -> accepted -> in_progress -> completed -> blocked).
   * Automatically executes room state changes, staff state changes, and incident resolution.
   */
  async advanceTaskStatus(taskId, newStatus, options = {}) {
    const validStatuses = ['pending', 'dispatched', 'accepted', 'in_progress', 'completed', 'blocked', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      const error = new Error(`Invalid task status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
      error.code = 'INVALID_TASK_STATUS';
      error.status = 400;
      throw error;
    }

    const task = taskService.getById(taskId);
    if (!task) {
      const error = new Error(`Task not found with id: ${taskId}`);
      error.code = 'TASK_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const previousStatus = task.status;
    if (previousStatus === 'completed' && newStatus !== 'completed') {
      const error = new Error('Completed tasks cannot transition to prior states.');
      error.code = 'INVALID_STATE_TRANSITION';
      error.status = 409;
      throw error;
    }

    const now = new Date().toISOString();
    const updates = {
      status: newStatus,
      updated_at: now,
    };

    if (newStatus === 'in_progress' && !task.started_at) {
      updates.started_at = now;
    }
    if (newStatus === 'completed') {
      updates.completed_at = now;
    }

    const updatedTask = taskService.update(taskId, updates);
    const planId = task.action_plan_id || 'plan-vip-arrival';
    const execution = inMemoryExecutions.get(planId);

    // ── 1. STAFF STATE LOGIC ──────────────────────────────────────────────────
    if (task.assigned_to) {
      const staffMember = staffService.getById(task.assigned_to);
      if (staffMember) {
        if (newStatus === 'completed' || newStatus === 'cancelled') {
          // Count remaining active tasks for this staff member
          const allTasks = taskService.getAll({ assigned_to: task.assigned_to });
          const activeTasks = allTasks.filter(t => t.id !== taskId && ['pending', 'dispatched', 'accepted', 'in_progress', 'blocked'].includes(t.status));

          if (activeTasks.length === 0) {
            staffService.update(staffMember.id, {
              status: 'on_duty',
              current_task: 'Available',
            });
            socketService.emitEvent('staff.status_changed', {
              staff_id: staffMember.id,
              name: staffMember.name,
              department: staffMember.department,
              status: 'on_duty',
              current_task: 'Available',
            });
          } else {
            staffService.update(staffMember.id, {
              status: 'busy',
              current_task: activeTasks[0].title || 'Busy',
            });
          }
        } else if (newStatus === 'in_progress' || newStatus === 'accepted') {
          staffService.update(staffMember.id, {
            status: 'busy',
            current_task: task.title,
          });
          socketService.emitEvent('staff.status_changed', {
            staff_id: staffMember.id,
            name: staffMember.name,
            department: staffMember.department,
            status: 'busy',
            current_task: task.title,
          });
        }
      }
    }

    // ── 2. ROOM STATE LOGIC ───────────────────────────────────────────────────
    if (task.room_id) {
      const room = roomService.getById(task.room_id);
      if (room) {
        if (task.department === 'housekeeping') {
          if (newStatus === 'in_progress') {
            roomService.update(room.id, { housekeeping_status: 'in_progress' });
            socketService.emitEvent('room.status_changed', {
              room_id: room.id,
              number: room.number,
              status: room.status,
              housekeeping_status: 'in_progress',
              message: `Room ${room.number} cleaning in progress.`,
            });
          } else if (newStatus === 'completed') {
            roomService.update(room.id, {
              status: 'available',
              housekeeping_status: 'clean',
              last_cleaned: now,
            });
            socketService.emitEvent('room.status_changed', {
              room_id: room.id,
              number: room.number,
              status: 'available',
              housekeeping_status: 'clean',
              message: `Room ${room.number} inspected and ready for check-in.`,
            });
          }
        } else if (task.department === 'maintenance') {
          if (newStatus === 'completed') {
            // Once HVAC/maintenance is finished, room transitions out of maintenance
            roomService.update(room.id, {
              status: 'available',
              housekeeping_status: 'clean',
            });
            socketService.emitEvent('room.status_changed', {
              room_id: room.id,
              number: room.number,
              status: 'available',
              message: `Room ${room.number} repair completed and certified online.`,
            });
          }
        }
      }
    }

    // ── 3. INCIDENT RESOLUTION LOGIC ─────────────────────────────────────────
    if (task.incident_id && newStatus === 'completed') {
      const incident = incidentService.getById(task.incident_id);
      if (incident) {
        const relatedTasks = taskService.getAll({ incident_id: task.incident_id });
        const pendingForIncident = relatedTasks.filter(t => t.id !== taskId && t.status !== 'completed');
        if (pendingForIncident.length === 0) {
          incidentService.update(incident.id, { status: 'resolved' });
          socketService.emitEvent('incident.status_changed', {
            incident_id: incident.id,
            title: incident.title,
            status: 'resolved',
          });
        }
      }
    }

    // ── 4. LOG TIMELINE EVENT ────────────────────────────────────────────────
    this._addTimelineEvent(planId, {
      execution_id: execution ? execution.id : `exec-${planId}`,
      task_id: taskId,
      event_type: `task.${newStatus}`,
      title: `${task.title} → ${newStatus.toUpperCase()}`,
      description: `Task progressed from ${previousStatus} to ${newStatus}.`,
      department: task.department,
      staff_id: task.assigned_to,
      room_id: task.room_id,
      created_at: now,
    });

    // ── 5. BROADCAST REAL-TIME TASK EVENT ────────────────────────────────────
    socketService.emitEvent(`task.${newStatus}`, {
      task_id: taskId,
      action_plan_id: planId,
      title: task.title,
      department: task.department,
      status: newStatus,
      previous_status: previousStatus,
      assigned_to: task.assigned_to,
      room_id: task.room_id,
      updated_at: now,
    });

    // ── 6. UPDATE EXECUTION PROGRESS & COMPLETION ────────────────────────────
    if (execution) {
      const allTasks = execution.tasks || [];
      // Update in-memory task copy
      const idx = allTasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        allTasks[idx] = updatedTask;
      }

      const completedCount = allTasks.filter(t => t.status === 'completed').length;
      execution.completed_tasks = completedCount;

      if (completedCount === allTasks.length && allTasks.length > 0) {
        execution.status = 'completed';
        execution.completed_at = now;

        // Update plan status to completed
        const plan = await aiPersistence.getActionPlan(planId);
        if (plan) {
          plan.status = 'completed';
        }

        this._addTimelineEvent(planId, {
          execution_id: execution.id,
          event_type: 'execution.completed',
          title: 'All Operational Tasks Completed',
          description: `All ${allTasks.length} tasks successfully finished across departments.`,
          department: 'operations',
          created_at: now,
        });

        socketService.emitEvent('execution.completed', {
          execution_id: execution.id,
          action_plan_id: planId,
          status: 'completed',
          completed_at: now,
        });
      }
    }

    return {
      success: true,
      task: updatedTask,
      execution: execution ? this.getExecutionState(planId) : null,
    };
  }

  /**
   * Get current execution state with live tasks, progress, and status.
   */
  getExecutionState(planId) {
    const execution = inMemoryExecutions.get(planId);
    if (!execution) {
      return null;
    }

    const tasks = execution.tasks || [];
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const dispatched = tasks.filter(t => t.status === 'dispatched' || t.status === 'accepted').length;

    return {
      execution_id: execution.id,
      action_plan_id: planId,
      status: execution.status,
      total_tasks: tasks.length,
      completed_tasks: completed,
      in_progress_tasks: inProgress,
      dispatched_tasks: dispatched,
      progress_pct: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      started_at: execution.started_at,
      completed_at: execution.completed_at,
      tasks,
      timeline: inMemoryTimeline.get(planId) || [],
    };
  }

  /**
   * Get timeline of persisted execution events for an action plan.
   */
  getExecutionTimeline(planId) {
    return inMemoryTimeline.get(planId) || [];
  }

  /**
   * Internal helper to record an execution timeline event.
   */
  _addTimelineEvent(planId, eventData) {
    const events = inMemoryTimeline.get(planId) || [];
    const record = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action_plan_id: planId,
      execution_id: eventData.execution_id,
      task_id: eventData.task_id || null,
      event_type: eventData.event_type,
      title: eventData.title,
      description: eventData.description || '',
      department: eventData.department || 'operations',
      staff_id: eventData.staff_id || null,
      room_id: eventData.room_id || null,
      created_at: eventData.created_at || new Date().toISOString(),
    };
    events.push(record);
    inMemoryTimeline.set(planId, events);

    // Save to PostgreSQL if connected
    try {
      db.query(`
        INSERT INTO ai_action_plan_execution_events
          (id, execution_id, action_plan_id, task_id, event_type, title, description, department, staff_id, room_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [record.id, record.execution_id, planId, record.task_id, record.event_type, record.title, record.description, record.department, record.staff_id, record.room_id, record.created_at]).catch(() => {});
    } catch (_) {}

    return record;
  }
}

module.exports = new ExecutionService();
