const http = require('http');
const app = require('./src/app');

const server = http.createServer(app);

// Use port 5055 for automated test script to avoid any port conflicts
const PORT = 5055;

server.listen(PORT, async () => {
  console.log(`[TestRunner] Test server listening on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}/api/v1`;
  let passed = 0;
  let failed = 0;

  async function request(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    return { status: res.status, body: json };
  }

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log('\n--- 1. Health Check ---');
    const health = await request('/health');
    assert(health.status === 200, 'Health endpoint returns 200');
    assert(health.body.success === true && health.body.status === 'healthy', 'Health body structure matches contract');

    console.log('\n--- 2. Room APIs ---');
    const allRooms = await request('/rooms');
    assert(allRooms.status === 200 && allRooms.body.data.length === 20, 'GET /rooms returns all 20 rooms');
    assert(allRooms.body.meta.count === 20, 'Rooms meta.count is 20');

    const filteredRoomsStatus = await request('/rooms?status=available');
    assert(filteredRoomsStatus.body.data.every((r) => r.status === 'available'), 'Filter rooms by status=available works');

    const filteredRoomsType = await request('/rooms?type=Suite');
    assert(filteredRoomsType.body.data.length > 0 && filteredRoomsType.body.data.every((r) => r.type.toLowerCase().includes('suite')), 'Filter rooms by type=Suite works');

    const filteredRoomsFloor = await request('/rooms?floor=4');
    assert(filteredRoomsFloor.body.data.length === 4 && filteredRoomsFloor.body.data.every((r) => r.floor === 4), 'Filter rooms by floor=4 works');

    const singleRoom = await request('/rooms/room-401');
    assert(singleRoom.status === 200 && singleRoom.body.data.number === '401', 'GET /rooms/room-401 returns Suite 401');

    const createRoomRes = await request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ number: '601', type: 'Panoramic Penthouse', status: 'available', floor: 6 }),
    });
    assert(createRoomRes.status === 201 && createRoomRes.body.data.number === '601', 'POST /rooms creates room 601');

    const patchRoomRes = await request('/rooms/room-601', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'occupied' }),
    });
    assert(patchRoomRes.status === 200 && patchRoomRes.body.data.status === 'occupied', 'PATCH /rooms/:id updates room status');

    console.log('\n--- 3. Guest APIs ---');
    const allGuests = await request('/guests');
    assert(allGuests.status === 200 && allGuests.body.data.length === 5, 'GET /guests returns all guests');

    const vipGuests = await request('/guests?vip=true');
    assert(vipGuests.body.data.every((g) => g.vip === true), 'Filter guests by vip=true works');

    const roomGuests = await request('/guests?room_id=room-203');
    assert(roomGuests.body.data.length === 1 && roomGuests.body.data[0].id === 'guest-003', 'Filter guests by room_id works');

    const singleGuest = await request('/guests/guest-001');
    assert(singleGuest.status === 200 && singleGuest.body.data.name === 'Alexander Vance', 'GET /guests/guest-001 returns Alexander Vance');

    const createGuestRes = await request('/guests', {
      method: 'POST',
      body: JSON.stringify({ name: 'Lady Victoria Sterling', vip: true, vip_tier: 'Diamond VIP', room_id: 'room-505' }),
    });
    assert(createGuestRes.status === 201 && createGuestRes.body.data.name === 'Lady Victoria Sterling', 'POST /guests creates guest');

    const patchGuestRes = await request(`/guests/${createGuestRes.body.data.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes: 'Requires high floor' }),
    });
    assert(patchGuestRes.status === 200 && patchGuestRes.body.data.notes === 'Requires high floor', 'PATCH /guests/:id updates guest');

    console.log('\n--- 4. Staff APIs ---');
    const allStaff = await request('/staff');
    assert(allStaff.status === 200 && allStaff.body.data.length === 10, 'GET /staff returns 10 staff members');

    const maintStaff = await request('/staff?department=maintenance');
    assert(maintStaff.body.data.every((s) => s.department === 'maintenance'), 'Filter staff by department=maintenance works');

    const onDutyStaff = await request('/staff?status=on_duty');
    assert(onDutyStaff.body.data.every((s) => s.status === 'on_duty'), 'Filter staff by status=on_duty works');

    const singleStaff = await request('/staff/staff-005');
    assert(singleStaff.status === 200 && singleStaff.body.data.name === 'Bob Miller', 'GET /staff/staff-005 returns Bob Miller');

    const createStaffRes = await request('/staff', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alina Thorne', department: 'housekeeping', status: 'on_duty', role: 'Attendant' }),
    });
    assert(createStaffRes.status === 201 && createStaffRes.body.data.name === 'Alina Thorne', 'POST /staff creates staff member');

    const patchStaffRes = await request(`/staff/${createStaffRes.body.data.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'busy' }),
    });
    assert(patchStaffRes.status === 200 && patchStaffRes.body.data.status === 'busy', 'PATCH /staff/:id updates status to busy');

    console.log('\n--- 5. Incident APIs ---');
    const allIncidents = await request('/incidents');
    assert(allIncidents.status === 200 && allIncidents.body.data.length === 6, 'GET /incidents returns 6 initial incidents');

    const openIncidents = await request('/incidents?status=open');
    assert(openIncidents.body.data.every((i) => i.status === 'open'), 'Filter incidents by status=open works');

    const criticalIncidents = await request('/incidents?severity=critical');
    assert(criticalIncidents.body.data.every((i) => i.severity === 'critical'), 'Filter incidents by severity=critical works');

    const maintIncidents = await request('/incidents?department=maintenance');
    assert(maintIncidents.body.data.every((i) => i.department === 'maintenance'), 'Filter incidents by department=maintenance works');

    const room401Incidents = await request('/incidents?room_id=room-401');
    assert(room401Incidents.body.data.length > 0 && room401Incidents.body.data.every((i) => i.room_id === 'room-401'), 'Filter incidents by room_id=room-401 works');

    const singleIncident = await request('/incidents/incident-001');
    assert(singleIncident.status === 200 && singleIncident.body.data.room_id === 'room-401', 'GET /incidents/incident-001 returns AC breakdown');

    const createIncidentRes = await request('/incidents', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Poolside cabana light circuit trip',
        severity: 'medium',
        status: 'open',
        department: 'maintenance',
        room_id: 'room-104',
      }),
    });
    assert(createIncidentRes.status === 201 && createIncidentRes.body.data.title === 'Poolside cabana light circuit trip', 'POST /incidents creates new incident');

    const patchIncidentRes = await request(`/incidents/${createIncidentRes.body.data.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolved' }),
    });
    assert(patchIncidentRes.status === 200 && patchIncidentRes.body.data.status === 'resolved', 'PATCH /incidents/:id updates incident status to resolved');

    console.log('\n--- 6. Task APIs ---');
    const allTasks = await request('/tasks');
    assert(allTasks.status === 200 && allTasks.body.data.length === 15, 'GET /tasks returns 15 initial tasks');

    const pendingTasks = await request('/tasks?status=pending');
    assert(pendingTasks.body.data.every((t) => t.status === 'pending'), 'Filter tasks by status=pending works');

    const hkTasks = await request('/tasks?department=housekeeping');
    assert(hkTasks.body.data.every((t) => t.department === 'housekeeping'), 'Filter tasks by department=housekeeping works');

    const highTasks = await request('/tasks?priority=high');
    assert(highTasks.body.data.every((t) => t.priority === 'high'), 'Filter tasks by priority=high works');

    const staff005Tasks = await request('/tasks?assigned_to=staff-005');
    assert(staff005Tasks.body.data.every((t) => t.assigned_to === 'staff-005'), 'Filter tasks by assigned_to=staff-005 works');

    const inc002Tasks = await request('/tasks?incident_id=incident-002');
    assert(inc002Tasks.body.data.every((t) => t.incident_id === 'incident-002'), 'Filter tasks by incident_id=incident-002 works');

    const singleTask = await request('/tasks/task-001');
    assert(singleTask.status === 200 && singleTask.body.data.title.includes('HVAC'), 'GET /tasks/task-001 returns task-001');

    const createTaskRes = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Check pool water pH level',
        priority: 'low',
        status: 'pending',
        department: 'maintenance',
        assigned_to: 'staff-006',
        room_id: 'room-104',
      }),
    });
    assert(createTaskRes.status === 201 && createTaskRes.body.data.title === 'Check pool water pH level', 'POST /tasks creates task');

    const patchTaskRes = await request(`/tasks/${createTaskRes.body.data.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
    assert(patchTaskRes.status === 200 && patchTaskRes.body.data.status === 'completed', 'PATCH /tasks/:id updates status to completed');

    console.log('\n--- 7. Operations Summary (Dynamic Calculation) ---');
    const summary = await request('/operations/summary');
    assert(summary.status === 200 && summary.body.success === true, 'GET /operations/summary returns 200 success');
    assert(summary.body.data.rooms.total >= 20, 'Operations summary room count calculated dynamically');
    assert(typeof summary.body.data.incidents.open === 'number', 'Incident open count is numeric and calculated');
    assert(typeof summary.body.data.tasks.pending === 'number', 'Task pending count is numeric and calculated');
    assert(typeof summary.body.data.staff.on_duty === 'number', 'Staff on_duty count is numeric and calculated');

    console.log('\n--- 8. Validation & Relationship Errors ---');
    const invalidRoomBody = await request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ number: '999' }), // missing type and status
    });
    assert(invalidRoomBody.status === 400 && invalidRoomBody.body.error.code === 'VALIDATION_ERROR', 'Room creation with missing fields returns 400 VALIDATION_ERROR');

    const nonExistentRoom = await request('/rooms/room-nonexistent-999');
    assert(nonExistentRoom.status === 404 && nonExistentRoom.body.error.code === 'RESOURCE_NOT_FOUND', 'Querying non-existent room ID returns 404 RESOURCE_NOT_FOUND');

    const guestInvalidRoom = await request('/guests', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ghost Guest', room_id: 'room-nonexistent-123' }),
    });
    assert(guestInvalidRoom.status === 400 && guestInvalidRoom.body.error.code === 'RELATIONSHIP_VALIDATION_ERROR', 'Assigning guest to non-existent room returns 400 RELATIONSHIP_VALIDATION_ERROR');

    const taskInvalidStaff = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Invalid Task', priority: 'low', status: 'pending', assigned_to: 'staff-ghost-999' }),
    });
    assert(taskInvalidStaff.status === 400 && taskInvalidStaff.body.error.code === 'RELATIONSHIP_VALIDATION_ERROR', 'Assigning task to non-existent staff returns 400 RELATIONSHIP_VALIDATION_ERROR');

    const taskInvalidIncident = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Invalid Task 2', priority: 'low', status: 'pending', incident_id: 'incident-ghost-999' }),
    });
    assert(taskInvalidIncident.status === 400 && taskInvalidIncident.body.error.code === 'RELATIONSHIP_VALIDATION_ERROR', 'Associating task to non-existent incident returns 400 RELATIONSHIP_VALIDATION_ERROR');

    const incidentInvalidRoom = await request('/incidents', {
      method: 'POST',
      body: JSON.stringify({ title: 'Invalid Incident', severity: 'high', status: 'open', room_id: 'room-ghost-999' }),
    });
    assert(incidentInvalidRoom.status === 400 && incidentInvalidRoom.body.error.code === 'RELATIONSHIP_VALIDATION_ERROR', 'Associating incident to non-existent room returns 400 RELATIONSHIP_VALIDATION_ERROR');

    console.log('\n--- 9. AI Operational Analysis & Context Builder API ---');
    const aiContextRes = await request('/ai/context', {
      method: 'POST',
      body: JSON.stringify({ trigger: { type: 'multiple_incidents' } }),
    });
    assert(aiContextRes.status === 200 && aiContextRes.body.success === true, 'POST /ai/context generates canonical context from DB state');
    assert(aiContextRes.body.data.context.rooms.length > 0, 'Generated context contains relevant rooms');
    assert(aiContextRes.body.data.context.constraints.length > 0, 'Generated context derives operational constraints');

    const aiMissingTrigger = await request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    assert(aiMissingTrigger.status === 400 && aiMissingTrigger.body.error.code === 'MISSING_TRIGGER_OR_CONTEXT', 'POST /ai/analyze without trigger or context returns 400 MISSING_TRIGGER_OR_CONTEXT');

    const aiInvalidContext = await request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ context: { invalid: true } }),
    });
    assert(aiInvalidContext.status === 400 && aiInvalidContext.body.error.code === 'INVALID_CONTEXT', 'POST /ai/analyze with malformed context returns 400 INVALID_CONTEXT');

    console.log('\n========================================');
    console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
    console.log('========================================\n');
  } catch (err) {
    console.error('[TestRunner] Unexpected failure:', err);
    failed++;
  } finally {
    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  }
});
