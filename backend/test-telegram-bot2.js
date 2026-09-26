const assert = require('assert');
const telegramBot = require('./src/services/telegramBot');
const incidentService = require('./src/services/incidentService');
const roomService = require('./src/services/roomService');

async function runTests() {
  console.log('🧪 Starting Telegram Bot Stateful Flow Tests...\n');

  const chatId = 998877;
  const messagesSent = [];

  const mockSendMessage = async (targetChatId, text, opts) => {
    messagesSent.push({ targetChatId, text, opts });
    return { message_id: messagesSent.length };
  };

  const mockAnswerCallback = async (queryId) => {
    return true;
  };

  // 1. Test /start command
  console.log('Test 1: Sending /start command...');
  await telegramBot.processIncomingText({
    chatId,
    text: '/start',
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'IDLE');
  assert.strictEqual(telegramBot.sessions[chatId].roomNumber, null);
  const lastMsg1 = messagesSent[messagesSent.length - 1];
  assert(lastMsg1.text.includes('Welcome to Resort 360 Concierge'));
  assert(lastMsg1.opts && lastMsg1.opts.reply_markup && lastMsg1.opts.reply_markup.inline_keyboard);
  console.log('✅ Test 1 Passed: /start displayed welcome message and inline keyboard.\n');

  // 2. Test "Book a Room" action (now conversational booking)
  console.log('Test 2: Clicking "Book a Room" button...');
  await telegramBot.processCallbackQuery({
    queryId: 'q1',
    chatId,
    data: 'book_room',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  const lastMsg2 = messagesSent[messagesSent.length - 1];
  assert(lastMsg2.text.includes("What is your full name?"));
  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_BOOKING_NAME');
  console.log('✅ Test 2 Passed: "Book a Room" initiated conversational booking flow.\n');

  // 3. Test "My Booking Details" action
  console.log('Test 3: Clicking "My Booking Details" button...');
  await telegramBot.processCallbackQuery({
    queryId: 'q2',
    chatId,
    data: 'booking_details',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_ROOM');
  const lastMsg3 = messagesSent[messagesSent.length - 1];
  assert(lastMsg3.text.includes('Please enter your Room Number to verify your stay:'));
  console.log('✅ Test 3 Passed: Session transitioned to AWAITING_ROOM.\n');

  // 4a. Test Unauthorized Room Verification Attempt (Stranger trying to claim Room 204)
  console.log('Test 4a: Unauthorized user tries to claim Room 204...');
  await telegramBot.processIncomingText({
    chatId,
    text: '204',
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'IDLE');
  assert.strictEqual(telegramBot.sessions[chatId].roomNumber, null);
  const unauthMsg = messagesSent[messagesSent.length - 1];
  assert(unauthMsg.text.includes('Verification Failed'));
  assert(unauthMsg.opts?.reply_markup?.inline_keyboard);
  console.log('✅ Test 4a Passed: Unauthorized access to Room 204 securely rejected.\n');

  // Register an active reservation for this Telegram user in Room 204
  const guestService = require('./src/services/guestService');
  guestService.create({
    name: 'Emily Watson',
    room_number: '204',
    room_id: 'room-204',
    vip: true,
    telegram_id: String(chatId),
  });

  // User taps "Try Again"
  console.log('Test 4b: User taps "Try Again" and inputs Room 204 with authorized Telegram ID...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_try_again',
    chatId,
    data: 'verify_try_again',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });
  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_ROOM');

  // 4b. Authorized Verification
  await telegramBot.processIncomingText({
    chatId,
    text: '204',
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].roomNumber, '204');
  assert.strictEqual(telegramBot.sessions[chatId].guestName, 'Emily Watson');
  assert.strictEqual(telegramBot.sessions[chatId].step, 'VERIFIED');
  const lastMsg4 = messagesSent[messagesSent.length - 1];
  assert(lastMsg4.text.includes('Room 204 verified! Welcome back, Emily Watson.'));
  assert(lastMsg4.opts && lastMsg4.opts.reply_markup && lastMsg4.opts.reply_markup.inline_keyboard);
  console.log('✅ Test 4b Passed: Authorized guest verified successfully.\n');

  // 5. Test "Report an Issue" action
  console.log('Test 5: Clicking "Report an Issue" button...');
  await telegramBot.processCallbackQuery({
    queryId: 'q3',
    chatId,
    data: 'report_issue',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_COMPLAINT');
  const lastMsg5 = messagesSent[messagesSent.length - 1];
  assert(lastMsg5.text.includes('Our AI Operations Swarm will triage it immediately'));
  console.log('✅ Test 5 Passed: Session transitioned to AWAITING_COMPLAINT.\n');

  // 6. Test Receiving the Complaint & Backend Incident Creation
  console.log('Test 6: Guest submits complaint: "The air conditioner is leaking water heavily in the bedroom"...');
  const complaintText = 'The air conditioner is leaking water heavily in the bedroom';
  await telegramBot.processIncomingText({
    chatId,
    text: complaintText,
    sendMessage: mockSendMessage,
  });

  // Verify guest received confirmation
  const confirmMsg = messagesSent.find(m => m.text.includes('Ticket logged! Our AI Swarm is analyzing your report'));
  assert(confirmMsg, 'Guest did not receive confirmation message');

  // Verify session state reset to VERIFIED
  assert.strictEqual(telegramBot.sessions[chatId].step, 'VERIFIED');
  assert.strictEqual(telegramBot.sessions[chatId].roomNumber, '204');

  // Verify incident exists in incidentService
  const allIncidents = incidentService.getAll();
  const createdIncident = allIncidents.find(i => i.description === complaintText);
  assert(createdIncident, 'Incident not found in incidentService!');
  assert.strictEqual(createdIncident.source, 'Telegram');
  assert.strictEqual(createdIncident.status, 'open');
  assert.strictEqual(createdIncident.department, 'maintenance');
  assert.strictEqual(createdIncident.room_id, 'room-204');
  console.log(`✅ Test 6 Passed: Real incident created in backend: ID=${createdIncident.id}, Department=${createdIncident.department}, Severity=${createdIncident.severity}, Room=${createdIncident.room_id}.\n`);

  // 7. Test HTTP API POST /api/incidents with { room_number, description, source: 'Telegram' }
  console.log('Test 7: POST /api/incidents with { room_number, description, source: "Telegram" }...');
  const app = require('./src/app');
  const http = require('http');

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;

  const postData = JSON.stringify({
    room_number: '105',
    description: 'Heater not turning on in living room',
    source: 'Telegram',
  });

  const response = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/incidents',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  testServer.close();

  assert.strictEqual(response.statusCode, 201);
  assert.strictEqual(response.body.success, true);
  assert.strictEqual(response.body.data.source, 'Telegram');
  assert.strictEqual(response.body.data.room_id, 'room-105');
  console.log(`✅ Test 7 Passed: POST /api/incidents successfully logged incident ID ${response.body.data.id}.\n`);

  console.log('🎉 ALL TELEGRAM BOT STATEFUL WORKFLOW & API TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
