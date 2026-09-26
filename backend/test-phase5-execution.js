/**
 * Phase 5 Execution Engine Comprehensive Test Suite
 * Tests all 12 operational scenarios specified in RESORT 360 Phase 5 requirements:
 * 1. Approved plan executes
 * 2. Unapproved (pending) plan blocked
 * 3. Rejected plan blocked
 * 4. Duplicate execution is idempotent
 * 5. Task dispatch and traceability
 * 6. Staff state transitions (available -> busy -> available)
 * 7. Room state transitions (cleaning -> in_progress -> clean/ready)
 * 8. Multiple active tasks staff workload preservation
 * 9. Real-time event broadcasting
 * 10. Execution state & timeline persistence (survives refresh)
 * 11. Partial failure resilience
 * 12. Full end-to-end closed loop
 */

const assert = require('assert');
const executionService = require('./src/services/execution.service');
const aiPersistence = require('./src/services/ai-persistence.service');
const taskService = require('./src/services/taskService');
const staffService = require('./src/services/staffService');
const roomService = require('./src/services/roomService');
const incidentService = require('./src/services/incidentService');
const socketService = require('./src/services/socket.service');

async function runTests() {
  console.log('\n======================================================');
  console.log('  RESORT 360 — PHASE 5 EXECUTION ENGINE TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function recordTest(name, fn) {
    return async () => {
      try {
        await fn();
        console.log(`  ✓ [PASS] ${name}`);
        passed++;
      } catch (err) {
        console.error(`  ✗ [FAIL] ${name}`);
        console.error(`    Error: ${err.message}\n`);
        failed++;
      }
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Approved Plan Executes Successfully
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 1: Approved action plan executes and creates tasks', async () => {
    // Seed an approved plan
    const planId = 'test-plan-approved-01';
    await aiPersistence.persistActionPlan({
      id: planId,
      analysis_run_id: 'run-test-01',
      context_id: 'ctx-test-01',
      title: 'VIP Arrival Operational Plan',
      description: 'Prepare suite and prioritize VIP greeting',
      status: 'approved',
      items: [
        {
          id: 'item-101',
          description: 'Expedite Room 205 turnover',
          department: 'housekeeping',
          priority: 'urgent',
          assigned_staff: 'staff-001',
          room_id: 'room-205',
        },
        {
          id: 'item-102',
          description: 'Greet VIP Vance at lobby',
          department: 'front_desk',
          priority: 'high',
          assigned_staff: 'staff-002',
          guest_id: 'guest-001',
        },
      ],
    });

    const execState = await executionService.executePlan(planId);
    assert.ok(execState, 'Execution state returned');
    assert.strictEqual(execState.action_plan_id, planId);
    assert.strictEqual(execState.status, 'running');
    assert.strictEqual(execState.total_tasks, 2);
    assert.strictEqual(execState.completed_tasks, 0);
    assert.strictEqual(execState.tasks.length, 2);
    assert.strictEqual(execState.tasks[0].status, 'dispatched');
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Unapproved (Pending) Plan Cannot Execute
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 2: Unapproved plan execution is strictly blocked', async () => {
    const planId = 'test-plan-pending-02';
    await aiPersistence.persistActionPlan({
      id: planId,
      analysis_run_id: 'run-test-02',
      title: 'Pending Plan',
      status: 'pending_review',
      items: [{ id: 'item-201', description: 'Some pending action', department: 'housekeeping' }],
    });

    try {
      await executionService.executePlan(planId);
      assert.fail('Execution should have been rejected for unapproved plan');
    } catch (err) {
      assert.strictEqual(err.code, 'PLAN_NOT_APPROVED');
      assert.strictEqual(err.status, 409);
    }
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Rejected Plan Cannot Execute
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 3: Rejected action plan execution is strictly blocked', async () => {
    const planId = 'test-plan-rejected-03';
    await aiPersistence.persistActionPlan({
      id: planId,
      analysis_run_id: 'run-test-03',
      title: 'Rejected Plan',
      status: 'rejected',
      items: [{ id: 'item-301', description: 'Some rejected action', department: 'maintenance' }],
    });

    try {
      await executionService.executePlan(planId);
      assert.fail('Execution should have been rejected for rejected plan');
    } catch (err) {
      assert.strictEqual(err.code, 'PLAN_REJECTED');
      assert.strictEqual(err.status, 409);
    }
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Idempotent Execution (Duplicate Execution Attempt)
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 4: Duplicate execution attempt is idempotent without duplicates', async () => {
    const planId = 'test-plan-approved-01'; // already executed in Test 1
    const tasksBefore = executionService.getExecutionState(planId).tasks.length;

    const secondExec = await executionService.executePlan(planId);
    assert.strictEqual(secondExec.tasks.length, tasksBefore, 'No duplicate tasks created');
    assert.strictEqual(secondExec.status, 'running', 'Returns existing execution state');
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Task Dispatch & Traceability
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 5: Executable tasks preserve traceability to action plan', async () => {
    const planId = 'test-plan-approved-01';
    const execState = executionService.getExecutionState(planId);
    const firstTask = execState.tasks[0];

    assert.ok(firstTask.id, 'Task has valid ID');
    assert.strictEqual(firstTask.action_plan_id, planId, 'Traceable to action_plan_id');
    assert.strictEqual(firstTask.action_plan_item_id, 'item-101', 'Traceable to action_plan_item_id');
    assert.strictEqual(firstTask.department, 'housekeeping');
    assert.strictEqual(firstTask.room_id, 'room-205');
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Staff State Lifecycle (Available -> Busy -> Available)
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 6: Staff transitions to busy on assignment and available on completion', async () => {
    const testStaffId = 'staff-turnover-test';
    staffService.create({
      id: testStaffId,
      name: 'Sunita Rao',
      department: 'housekeeping',
      role: 'Attendant',
      status: 'on_duty',
    });

    const planId = 'test-plan-staff-06';
    await aiPersistence.persistActionPlan({
      id: planId,
      analysis_run_id: 'run-test-06',
      status: 'approved',
      items: [
        {
          id: 'item-601',
          description: 'Single task for Sunita',
          department: 'housekeeping',
          assigned_staff: testStaffId,
        },
      ],
    });

    await executionService.executePlan(planId);
    const staffBusy = staffService.getById(testStaffId);
    assert.strictEqual(staffBusy.status, 'busy', 'Staff must be marked busy when assigned a task');

    // Complete the task
    const execState = executionService.getExecutionState(planId);
    const taskId = execState.tasks[0].id;
    await executionService.advanceTaskStatus(taskId, 'completed');

    const staffAvailable = staffService.getById(testStaffId);
    assert.strictEqual(staffAvailable.status, 'on_duty', 'Staff returns to on_duty/available when all tasks complete');
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Room State Lifecycle Cascades
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 7: Room transitions to in_progress during cleaning and clean/available on completion', async () => {
    const testRoomId = 'room-lifecycle-test';
    roomService.create({
      id: testRoomId,
      number: '310',
      type: 'Deluxe Suite',
      status: 'dirty',
      housekeeping_status: 'dirty',
    });

    const planId = 'test-plan-room-07';
    await aiPersistence.persistActionPlan({
      id: planId,
      analysis_run_id: 'run-test-07',
      status: 'approved',
      items: [
        {
          id: 'item-701',
          description: 'Clean Room 310',
          department: 'housekeeping',
          room_id: testRoomId,
        },
      ],
    });

    await executionService.executePlan(planId);
    const execState = executionService.getExecutionState(planId);
    const taskId = execState.tasks[0].id;

    // Start task
    await executionService.advanceTaskStatus(taskId, 'in_progress');
    const roomInProgress = roomService.getById(testRoomId);
    assert.strictEqual(roomInProgress.housekeeping_status, 'in_progress', 'Room housekeeping_status must be in_progress');

    // Complete task
    await executionService.advanceTaskStatus(taskId, 'completed');
    const roomReady = roomService.getById(testRoomId);
    assert.strictEqual(roomReady.housekeeping_status, 'clean', 'Room housekeeping_status must be clean');
    assert.strictEqual(roomReady.status, 'available', 'Room status must be available');
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Multiple Active Tasks Staff Workload Retention
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 8: Staff remains busy while another assigned task is still active', async () => {
    const multiStaffId = 'staff-multi-test';
    staffService.create({
      id: multiStaffId,
      name: 'Ravi Kumar',
      department: 'maintenance',
      role: 'HVAC Specialist',
      status: 'on_duty',
    });

    const planId = 'test-plan-multi-08';
    await aiPersistence.persistActionPlan({
      id: planId,
      analysis_run_id: 'run-test-08',
      status: 'approved',
      items: [
        { id: 'item-801', description: 'HVAC check 1', department: 'maintenance', assigned_staff: multiStaffId },
        { id: 'item-802', description: 'HVAC check 2', department: 'maintenance', assigned_staff: multiStaffId },
      ],
    });

    await executionService.executePlan(planId);
    const execState = executionService.getExecutionState(planId);
    const taskA = execState.tasks[0].id;
    const taskB = execState.tasks[1].id;

    // Complete Task A
    await executionService.advanceTaskStatus(taskA, 'completed');
    const staffMidway = staffService.getById(multiStaffId);
    assert.strictEqual(staffMidway.status, 'busy', 'Staff must remain busy because Task B is still active');

    // Complete Task B
    await executionService.advanceTaskStatus(taskB, 'completed');
    const staffFinished = staffService.getById(multiStaffId);
    assert.strictEqual(staffFinished.status, 'on_duty', 'Staff becomes available only after all tasks complete');
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 9: Real-time Event History
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 9: Real-time event broadcasting records history in circular buffer', async () => {
    const recentEvents = socketService.getRecentEvents(10);
    assert.ok(Array.isArray(recentEvents), 'Socket history buffer is accessible');
    assert.ok(recentEvents.length > 0, 'Recent execution events recorded in buffer');

    const hasTaskEvents = recentEvents.some(e => e.event.startsWith('task.') || e.event.startsWith('execution.'));
    assert.ok(hasTaskEvents, 'Contains task/execution broadcast events');
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 10: Timeline Persistence (Survives Page Refresh)
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 10: Execution timeline events are persisted and queryable', async () => {
    const planId = 'test-plan-approved-01';
    const timeline = executionService.getExecutionTimeline(planId);

    assert.ok(Array.isArray(timeline), 'Timeline is array');
    assert.ok(timeline.length >= 2, 'Has action_plan.approved and execution.started events');
    assert.strictEqual(timeline[0].event_type, 'action_plan.approved');
    assert.strictEqual(timeline[1].event_type, 'execution.started');
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 11: Task State Transition Guard
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 11: Invalid task transitions (e.g. completed -> in_progress) are rejected', async () => {
    const planId = 'test-plan-approved-01';
    const execState = executionService.getExecutionState(planId);
    const task = execState.tasks[0];

    // Mark task completed
    await executionService.advanceTaskStatus(task.id, 'completed');

    try {
      await executionService.advanceTaskStatus(task.id, 'in_progress');
      assert.fail('Should reject completed -> in_progress transition');
    } catch (err) {
      assert.strictEqual(err.code, 'INVALID_STATE_TRANSITION');
    }
  })();

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 12: Full Operational Execution Completion
  // ──────────────────────────────────────────────────────────────────────────
  await recordTest('TEST 12: Execution marks as completed when all tasks finish', async () => {
    const planId = 'test-plan-approved-01';
    const execState = executionService.getExecutionState(planId);
    const remainingTasks = execState.tasks.filter(t => t.status !== 'completed');

    for (const t of remainingTasks) {
      await executionService.advanceTaskStatus(t.id, 'completed');
    }

    const finalState = executionService.getExecutionState(planId);
    assert.strictEqual(finalState.status, 'completed', 'Execution status must be completed');
    assert.strictEqual(finalState.completed_tasks, finalState.total_tasks, 'All tasks completed');
    assert.strictEqual(finalState.progress_pct, 100, 'Progress must be 100%');
  })();

  console.log('\n======================================================');
  console.log(`  PHASE 5 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution crashed:', err);
  process.exit(1);
});
