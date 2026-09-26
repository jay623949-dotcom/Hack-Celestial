const assert = require('assert');
const telegramBot = require('./src/services/telegramBot');
const roomService = require('./src/services/roomService');
const guestService = require('./src/services/guestService');
const incidentService = require('./src/services/incidentService');
const socketService = require('./src/services/socket.service');

async function runBookingFlowTests() {
  console.log('🧪 Starting Telegram Bot In-Chat Conversational Booking Flow Tests...\n');

  const chatId = 88776655;
  const messagesSent = [];
  const emittedEvents = [];

  // Intercept socket events
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

  // Step 1: User sends /start
  console.log('Step 1: Sending /start...');
  await telegramBot.processIncomingText({
    chatId,
    text: '/start',
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'IDLE');
  const msg1 = messagesSent[messagesSent.length - 1];
  assert(msg1.text.includes('Welcome to Resort 360 Concierge'));
  console.log('✅ Step 1 Passed: Welcome message sent with Book a Room button.\n');

  // Step 2: User taps "🏨 Book a Room"
  console.log('Step 2: Tapping "🏨 Book a Room" inline button...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_book',
    chatId,
    data: 'book_room',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_BOOKING_NAME');
  const msg2 = messagesSent[messagesSent.length - 1];
  assert(msg2.text.includes('What is your full name?'));
  console.log('✅ Step 2 Passed: Transitioned to AWAITING_BOOKING_NAME.\n');

  // Step 3: User inputs their name: "Sophia Taylor"
  console.log('Step 3: User inputs full name "Sophia Taylor"...');
  await telegramBot.processIncomingText({
    chatId,
    text: 'Sophia Taylor',
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].guestName, 'Sophia Taylor');
  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_BOOKING_ROOM_TYPE');
  const msg3 = messagesSent[messagesSent.length - 1];
  assert(msg3.text.includes('Nice to meet you, Sophia Taylor!'));
  assert(msg3.opts?.reply_markup?.inline_keyboard);
  console.log('✅ Step 3 Passed: Guest name recorded and Room Type inline keyboard sent.\n');

  // Step 4: User selects room type: "🏨 Deluxe Suite" (room_type_deluxe)
  console.log('Step 4: User selects "🏨 Deluxe Suite"...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_type',
    chatId,
    data: 'room_type_deluxe',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].roomType, 'Deluxe Suite');
  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_BOOKING_VIP_STATUS');
  const msg4 = messagesSent[messagesSent.length - 1];
  assert(msg4.text.includes('Are you checking in under a VIP priority reservation?'));
  assert(msg4.opts?.reply_markup?.inline_keyboard);
  console.log('✅ Step 4 Passed: Room type recorded and VIP status prompt sent.\n');

  // Step 5: User selects VIP: "⭐ Yes, VIP Guest" (vip_yes)
  console.log('Step 5: User selects VIP ("vip_yes")...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_vip',
    chatId,
    data: 'vip_yes',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  // Verify session state
  const session = telegramBot.sessions[chatId];
  assert.strictEqual(session.step, 'VERIFIED');
  assert(session.roomNumber, 'Session roomNumber was not set!');
  assert.strictEqual(session.isVip, true);

  // Verify confirmation card was sent
  const confirmationMsg = messagesSent.find((m) => m.text.includes('Booking Confirmed! Welcome to Resort 360.'));
  assert(confirmationMsg, 'Confirmation card was not sent!');
  assert(confirmationMsg.text.includes('Guest: Sophia Taylor'));
  assert(confirmationMsg.text.includes(`Room: ${session.roomNumber}`));
  assert(confirmationMsg.text.includes('Priority: VIP'));
  console.log('✅ Step 5 Confirmation Card Verified:\n' + confirmationMsg.text + '\n');

  // Verify Guest Record created in guestService
  const allGuests = guestService.getAll();
  const createdGuest = allGuests.find((g) => g.name === 'Sophia Taylor' && g.room_number === session.roomNumber);
  assert(createdGuest, 'Guest record not found in guestService!');
  assert.strictEqual(createdGuest.vip, true);
  assert.strictEqual(createdGuest.telegram_id, chatId);
  console.log(`✅ Step 5 Guest Record Verified: ID=${createdGuest.id}, Name=${createdGuest.name}, Room=${createdGuest.room_number}, VIP=${createdGuest.vip}`);

  // Verify Room Status updated to occupied
  const room = roomService.getAll().find((r) => String(r.number) === String(session.roomNumber));
  assert(room, 'Room not found in roomService!');
  assert.strictEqual(room.status, 'occupied');
  console.log(`✅ Step 5 Room Status Verified: Room ${room.number} is now '${room.status}'`);

  // Verify Socket.IO events were emitted
  const guestCreatedEvent = emittedEvents.find((e) => e.event === 'guest:created');
  const roomUpdatedEvent = emittedEvents.find((e) => e.event === 'room:updated');
  assert(guestCreatedEvent, 'Socket.IO event "guest:created" was not emitted!');
  assert(roomUpdatedEvent, 'Socket.IO event "room:updated" was not emitted!');
  console.log('✅ Step 5 Socket.IO Events Verified: "guest:created" and "room:updated" were emitted to dashboard.\n');

  // Step 6: Verify guest can now immediately report an issue from their verified room
  console.log('Step 6: Guest uses verified menu to report an issue...');
  await telegramBot.processCallbackQuery({
    queryId: 'q_issue',
    chatId,
    data: 'report_issue',
    answerCallback: mockAnswerCallback,
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(telegramBot.sessions[chatId].step, 'AWAITING_COMPLAINT');

  const complaintText = 'Mini-fridge in room is making a loud buzzing noise';
  await telegramBot.processIncomingText({
    chatId,
    text: complaintText,
    sendMessage: mockSendMessage,
  });

  const allIncidents = incidentService.getAll();
  const incident = allIncidents.find((i) => i.description === complaintText);
  assert(incident, 'Incident was not created for verified guest room!');
  assert.strictEqual(incident.room_id, room.id);
  assert.strictEqual(incident.source, 'Telegram');
  console.log(`✅ Step 6 Issue Reporting Verified: Incident ${incident.id} auto-associated with Room ${session.roomNumber}.\n`);

  console.log('🎉 ALL IN-CHAT CONVERSATIONAL BOOKING FLOW TESTS PASSED SUCCESSFULLY!');
}

runBookingFlowTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
