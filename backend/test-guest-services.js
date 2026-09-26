const assert = require('assert');
const telegramBot = require('./src/services/telegramBot');
const taskService = require('./src/services/taskService');
const incidentService = require('./src/services/incidentService');
const guestService = require('./src/services/guestService');
const socketService = require('./src/services/socket.service');

async function runGuestServicesTests() {
  console.log('🧪 Starting Core Guest Services Tests (Report Issue, Request Amenities, Late Checkout)...\n');

  const chatId = 77112233;
  const messagesSent = [];
  const emittedEvents = [];

  // Track socket events
  const originalEmit = socketService.emit;
  socketService.emit = (event, payload) => {
    emittedEvents.push({ event, payload });
    return originalEmit.call(socketService, event, payload);
  };

  const mockSendMessage = async (targetChatId, text, opts) => {
    messagesSent.push({ targetChatId, text, opts });
    return { message_id: messagesSent.length };
  };

  const mockAnswerCallback = async (queryId) => true;

  // Setup verified guest session
  telegramBot.sessions[chatId] = {
    step: 'VERIFIED',
    roomNumber: '305',
    guestName: 'Liam Hemsworth',
    isVip: true,
  };

  guestService.create({
    id: 'guest-test-305',
    name: 'Liam Hemsworth',
    room_number: '305',
    room_id: 'room-305',
    vip: true,
    telegram_id: String(chatId),
  });

  // -------------------------------------------------------------
  // Test 1: Feature 1 - Report an Issue
  // -------------------------------------------------------------
  console.log('Test 1: Guest taps "⚠️ Report an Issue"...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_issue_1',
    chatId,
    data: 'report_issue',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_COMPLAINT');
  const msg1 = messagesSent[messagesSent.length - 1];
  assert(msg1.text.includes('Our AI Operations Swarm will triage it immediately'));
  assert(msg1.opts?.reply_markup?.inline_keyboard); // Back to menu button
  console.log('✅ Test 1a: Transitioned to AWAITING_COMPLAINT with prompt and back button.');

  // Guest submits complaint text
  const issueText = 'The bathroom shower drain is backing up';
  await telegramBot.processIncomingText({
    chatId,
    text: issueText,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'VERIFIED');
  const msg1Confirm = messagesSent[messagesSent.length - 2];
  assert(msg1Confirm.text.includes('Ticket logged! Our AI Swarm is analyzing your report'));
  const incident = incidentService.getAll().find((i) => i.description === issueText);
  assert(incident, 'Incident was not saved in incidentService!');
  assert.strictEqual(incident.room_id, 'room-305');
  assert.strictEqual(incident.department, 'maintenance');

  const incidentSocket = emittedEvents.find((e) => e.event === 'incident:created');
  assert(incidentSocket, 'incident:created socket event was not emitted!');
  console.log(`✅ Test 1b: Incident logged (ID: ${incident.id}), socket emitted, session returned to VERIFIED.\n`);

  // -------------------------------------------------------------
  // Test 2: Feature 2 - Request Amenities
  // -------------------------------------------------------------
  console.log('Test 2: Guest taps "🛎 Request Amenities"...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_amenity_menu',
    chatId,
    data: 'request_amenities',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_AMENITY_SELECTION');
  const msg2 = messagesSent[messagesSent.length - 1];
  assert(msg2.text.includes('What can housekeeping bring to your room?'));
  assert(msg2.opts?.reply_markup?.inline_keyboard);
  console.log('✅ Test 2a: Transitioned to AWAITING_AMENITY_SELECTION with quick-select options.');

  // Guest selects "🛁 Fresh Towels"
  console.log('Test 2b: Guest selects "🛁 Fresh Towels"...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_towels',
    chatId,
    data: 'amenity_towels',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'VERIFIED');
  const msg2Confirm = messagesSent[messagesSent.length - 2];
  assert(msg2Confirm.text.includes('Housekeeping has received your request for Fresh Towels for Room 305'));

  const towelTask = taskService.getAll().find((t) => t.title === 'Deliver Fresh Towels' && t.room_number === '305');
  assert(towelTask, 'Housekeeping task was not created in taskService!');
  assert.strictEqual(towelTask.department, 'housekeeping');
  assert.strictEqual(towelTask.priority, 'high'); // VIP guest

  const taskCreatedSocket = emittedEvents.find((e) => e.event === 'task:created' && e.payload.title === 'Deliver Fresh Towels');
  assert(taskCreatedSocket, 'task:created socket event was not emitted!');
  console.log(`✅ Test 2b: Task created (ID: ${towelTask.id}), socket emitted, confirmation delivered.\n`);

  // -------------------------------------------------------------
  // Test 3: Feature 3 - Request Late Checkout (1:00 PM Complimentary)
  // -------------------------------------------------------------
  console.log('Test 3: Guest taps "🕒 Late Checkout"...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_checkout_menu',
    chatId,
    data: 'late_checkout',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_LATE_CHECKOUT_TIME');
  const msg3 = messagesSent[messagesSent.length - 1];
  assert(msg3.text.includes('Please select your preferred checkout time:'));
  console.log('✅ Test 3a: Transitioned to AWAITING_LATE_CHECKOUT_TIME with time slots.');

  // Guest selects "1:00 PM (Complimentary)"
  console.log('Test 3b: Guest selects 1:00 PM...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_1pm',
    chatId,
    data: 'late_checkout_1pm',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'VERIFIED');
  const msg3Confirm = messagesSent[messagesSent.length - 2];
  assert(msg3Confirm.text.includes('Late checkout request to 1:00 PM (Complimentary) for Room 305 has been registered'));

  const lateTask = taskService.getAll().find((t) => t.title.includes('Late Checkout (1:00 PM)'));
  assert(lateTask, 'Late checkout housekeeping task not created!');
  console.log(`✅ Test 3b: 1:00 PM late checkout approved and task logged (ID: ${lateTask.id}).\n`);

  // -------------------------------------------------------------
  // Test 4: Feature 3 - Request Late Checkout (3:00 PM Extended Review)
  // -------------------------------------------------------------
  console.log('Test 4: Guest requests 3:00 PM extended checkout...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_checkout_3pm_menu',
    chatId,
    data: 'late_checkout',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  await telegramBot.processCallbackQuery({
    queryId: 'q_3pm',
    chatId,
    data: 'late_checkout_3pm',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'VERIFIED');
  const reviewTask = taskService.getAll().find((t) => t.title.includes('Extended Checkout (3:00 PM)'));
  assert(reviewTask, 'Front Desk review task for 3:00 PM was not created!');
  assert.strictEqual(reviewTask.department, 'front_desk');
  console.log(`✅ Test 4: 3:00 PM review task created for Front Desk (ID: ${reviewTask.id}).\n`);

  // -------------------------------------------------------------
  // Test 5: Guardrails - Back to Menu button
  // -------------------------------------------------------------
  console.log('Test 5: Testing "🔙 Back to Menu" navigation...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_open_amenity',
    chatId,
    data: 'request_amenities',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });
  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_AMENITY_SELECTION');

  // User taps Back to Menu
  await telegramBot.processCallbackQuery({
    queryId: 'q_back',
    chatId,
    data: 'back_to_menu',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'VERIFIED');
  const msgBack = messagesSent[messagesSent.length - 1];
  assert(msgBack.text.includes('Returned to Guest Services Menu'));
  console.log('✅ Test 5: Back to Menu successfully returned session to VERIFIED.\n');

  console.log('🎉 ALL CORE GUEST SERVICES TESTS PASSED SUCCESSFULLY!');
}

runGuestServicesTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
