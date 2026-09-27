/**
 * Automated Verification for Outbound Guest Feedback Loop (Telegram Push on Task/Incident Completion)
 */
const assert = require('assert');
const http = require('http');

async function runTests() {
  console.log('🧪 Starting Outbound Guest Feedback Loop Verification...\n');

  const telegramBot = require('./src/services/telegramBot');
  const taskService = require('./src/services/taskService');
  const incidentService = require('./src/services/incidentService');
  const guestService = require('./src/services/guestService');
  const staffService = require('./src/services/staffService');
  const socketService = require('./src/services/socket.service');
  const app = require('./src/app');

  // Track Telegram dispatches
  const dispatchedMessages = [];
  const mockBot = {
    sendMessage: async (chatId, text, opts) => {
      dispatchedMessages.push({ chatId, text, opts });
      return { message_id: Math.floor(Math.random() * 10000) };
    },
  };

  // Seed Staff Member
  const testStaff = staffService.create({
    id: 'staff-901',
    name: 'Vikram Singh',
    department: 'Maintenance',
  });

  // Seed Guest with Telegram ID in Room 204
  const testGuest = guestService.create({
    name: 'Priya Sharma',
    room_number: '204',
    room_id: 'room-204',
    telegram_id: '888001',
  });

  // ── TEST 1: Direct notifyGuestTaskCompleted call ──
  console.log('Test 1: Testing direct notifyGuestTaskCompleted dispatch...');
  const directResult = await telegramBot.notifyGuestTaskCompleted({
    roomNumber: '204',
    title: 'HVAC Air Filter Replacement & Temperature Calibration',
    assignedStaff: 'Vikram Singh',
    overrideBot: mockBot,
  });

  assert.strictEqual(directResult.success, true);
  assert.strictEqual(dispatchedMessages.length, 1);
  const msg1 = dispatchedMessages[0];
  assert.strictEqual(String(msg1.chatId), '888001');
  assert(msg1.text.includes('Service Update for Room 204'));
  assert(msg1.text.includes('Hello Priya Sharma, our team has completed your request:'));
  assert(msg1.text.includes('HVAC Air Filter Replacement & Temperature Calibration'));
  assert(msg1.text.includes('Vikram Singh'));
  assert(msg1.text.includes('Everything is operating normally and verified.'));
  console.log('Dispatched Notification Preview:\n------------------------------------');
  console.log(msg1.text);
  console.log('------------------------------------');
  console.log('✅ Test 1 Passed: Outbound message format and guest resolution verified.\n');

  // ── TEST 2: Graceful handling when no telegram_id is registered ──
  console.log('Test 2: Testing behavior when guest has no telegram_id...');
  const guestNoTg = guestService.create({
    name: 'Anonymous Guest',
    room_number: '999',
    room_id: 'room-999',
    telegram_id: null,
  });

  const noTgResult = await telegramBot.notifyGuestTaskCompleted({
    roomNumber: '999',
    title: 'Balcony Lightbulb Change',
    assignedStaff: 'Vikram Singh',
    overrideBot: mockBot,
  });
  assert.strictEqual(noTgResult.success, false);
  assert.strictEqual(noTgResult.reason, 'No registered telegram_id');
  console.log('✅ Test 2 Passed: Clean early return when no Telegram ID is associated.\n');

  // ── TEST 3: Network / Bot error resilience ──
  console.log('Test 3: Testing error resilience when bot.sendMessage throws...');
  const failingBot = {
    sendMessage: async () => {
      throw new Error('Telegram Gateway Connection Timeout');
    },
  };
  const failResult = await telegramBot.notifyGuestTaskCompleted({
    roomNumber: '204',
    title: 'Test Task Failure',
    overrideBot: failingBot,
  });
  assert.strictEqual(failResult.success, false);
  assert(failResult.error.includes('Telegram Gateway Connection Timeout'));
  console.log('✅ Test 3 Passed: Error safely caught without throwing an uncaught exception.\n');

  // ── TEST 4: API Trigger via PATCH /api/tasks/:id ──
  console.log('Test 4: Testing PATCH /api/tasks/:id completion trigger...');
  const task1 = taskService.create({
    id: 'task-test-ac-1',
    title: 'Fix Air Conditioner Water Dripping',
    priority: 'high',
    status: 'in_progress',
    department: 'maintenance',
    room_id: 'room-204',
    room_number: '204',
    assigned_to: 'staff-901',
  });

  // Temporarily hook telegramBot's internal bot instance or mock
  const origNotify = telegramBot.notifyGuestTaskCompleted;
  let interceptedNotification = null;
  telegramBot.notifyGuestTaskCompleted = async (params) => {
    interceptedNotification = params;
    return origNotify({ ...params, overrideBot: mockBot });
  };

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const patchTaskRes = await new Promise((resolve, reject) => {
    const postData = JSON.stringify({ status: 'completed' });
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/tasks/${task1.id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  assert.strictEqual(patchTaskRes.status, 200);
  assert.strictEqual(patchTaskRes.body.success, true);
  assert(interceptedNotification, 'notifyGuestTaskCompleted was not invoked');
  assert.strictEqual(interceptedNotification.taskId, task1.id);
  assert.strictEqual(interceptedNotification.roomNumber, '204');

  // Check socket events from socketService history buffer
  const history = socketService.getRecentEvents();
  const taskUpdatedEvent = history.find((e) => e.event === 'task:updated' && (e.data?.id === task1.id || e.data?.task_id === task1.id));
  const taskCompletedEvent = history.find((e) => e.event === 'task.completed');
  assert(taskUpdatedEvent, 'task:updated socket event missing');
  assert(taskCompletedEvent, 'task.completed socket event missing');
  console.log('✅ Test 4 Passed: PATCH /api/tasks/:id triggered guest notification and synchronized Socket.IO.\n');

  // ── TEST 5: API Trigger via PATCH /api/incidents/:id ──
  console.log('Test 5: Testing PATCH /api/incidents/:id resolution trigger...');
  const incident1 = incidentService.create({
    id: 'inc-test-shower-1',
    title: 'Bathroom Shower Temperature Issue',
    description: 'Shower water fluctuates unexpectedly',
    severity: 'medium',
    status: 'investigating',
    department: 'maintenance',
    room_id: 'room-204',
    guest_id: testGuest.id,
    assigned_to: 'staff-901',
  });

  interceptedNotification = null;

  const patchIncRes = await new Promise((resolve, reject) => {
    const postData = JSON.stringify({ status: 'resolved', resolution_notes: 'Replaced thermostatic mixer valve' });
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/incidents/${incident1.id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  server.close();

  assert.strictEqual(patchIncRes.status, 200);
  assert.strictEqual(patchIncRes.body.success, true);
  assert(interceptedNotification, 'notifyGuestTaskCompleted was not invoked on incident resolution');
  assert.strictEqual(interceptedNotification.roomNumber, '204');
  assert.strictEqual(interceptedNotification.title, 'Bathroom Shower Temperature Issue');

  // Check incident socket events from socketService history buffer
  const updatedHistory = socketService.getRecentEvents();
  const incidentUpdatedEvent = updatedHistory.find((e) => e.event === 'incident:updated' && (e.data?.id === incident1.id || e.data?.incident_id === incident1.id));
  assert(incidentUpdatedEvent, 'incident:updated socket event missing');
  console.log('✅ Test 5 Passed: PATCH /api/incidents/:id triggered guest notification and synchronized Socket.IO.\n');

  // Restore
  telegramBot.notifyGuestTaskCompleted = origNotify;

  console.log('🎉 ALL 5 GUEST FEEDBACK LOOP TESTS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
