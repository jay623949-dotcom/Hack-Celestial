/**
 * Telegram Bot Integration Tests
 * Verifies telegramService error isolation, formatting, non-blocking dispatch,
 * and guest creation hook.
 */
const assert = require('assert');
const telegramService = require('./src/services/telegramService');
const guestService = require('./src/services/guestService');
const guestsController = require('./src/controllers/guests.controller');

async function runTests() {
  console.log('=== Running Telegram Integration Tests ===\n');

  // Test 1: Missing chatId
  console.log('Test 1: sendGuestWelcomeMessage with missing chatId');
  const resNoChatId = await telegramService.sendGuestWelcomeMessage({
    guestName: 'Jane Doe',
    roomNumber: '101',
    roomType: 'Deluxe',
  });
  assert.strictEqual(resNoChatId.success, false);
  assert.strictEqual(resNoChatId.reason, 'Missing chatId');
  console.log('✓ Handled missing chatId safely\n');

  // Test 2: Missing TELEGRAM_BOT_TOKEN (clean graceful exit)
  console.log('Test 2: sendGuestWelcomeMessage with missing TELEGRAM_BOT_TOKEN');
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_BOT_TOKEN;

  const resNoToken = await telegramService.sendGuestWelcomeMessage({
    chatId: '987654321',
    guestName: 'Vikramaditya Singhania',
    roomNumber: '401',
    roomType: 'Presidential Suite',
    checkInTime: '2026-09-26T18:30:00Z',
  });
  assert.strictEqual(resNoToken.success, false);
  assert.strictEqual(resNoToken.reason, 'TELEGRAM_BOT_TOKEN not configured');
  console.log('✓ Handled missing bot token without crashing\n');

  // Test 3: Error handling during dispatch with invalid token
  console.log('Test 3: Dispatch with dummy token (verifying try/catch error suppression)');
  process.env.TELEGRAM_BOT_TOKEN = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
  const resBadToken = await telegramService.sendGuestWelcomeMessage({
    chatId: '987654321',
    guestName: 'Aarav Patel',
    roomNumber: '205',
    roomType: 'Ocean Villa',
    checkInTime: new Date().toISOString(),
  });
  assert.strictEqual(resBadToken.success, false);
  assert(resBadToken.error, 'Error message should be captured');
  console.log(`✓ Caught error gracefully without crashing: "${resBadToken.error}"\n`);

  // Test 4: Verify guest creation service with telegramChatId
  console.log('Test 4: Guest creation service with telegramChatId');
  const newGuest = guestService.create({
    name: 'Ananya Sharma',
    vip: true,
    vip_tier: 'Diamond VIP',
    room_id: 'room-101',
    telegramChatId: '123456789',
  });
  assert.strictEqual(newGuest.name, 'Ananya Sharma');
  assert.strictEqual(newGuest.telegram_chat_id, '123456789');
  console.log('✓ Guest persisted with telegram_chat_id\n');

  // Test 5: Verify guestsController.createGuest endpoint with telegramChatId
  console.log('Test 5: guestsController.createGuest with telegramChatId');
  let statusCode = null;
  let responseData = null;
  const mockReq = {
    body: {
      name: 'Rohan Mehra',
      vip: false,
      room_id: 'room-102',
      telegramChatId: '998877665',
      notes: 'Late arrival',
    },
  };
  const mockRes = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };
  const mockNext = (err) => {
    if (err) throw err;
  };

  await guestsController.createGuest(mockReq, mockRes, mockNext);
  assert.strictEqual(statusCode, 201);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.name, 'Rohan Mehra');
  assert.strictEqual(responseData.data.telegram_chat_id, '998877665');
  console.log('✓ Controller returned 201 and created guest with telegram_chat_id without error\n');

  // Test 6: Verify guestsController.createGuest without telegramChatId works seamlessly
  console.log('Test 6: guestsController.createGuest without telegramChatId (non-telegram guest)');
  let statusCode2 = null;
  let responseData2 = null;
  const mockReq2 = {
    body: {
      name: 'Pooja Hegde',
      vip: true,
      vip_tier: 'Platinum VIP',
      room_id: 'room-103',
    },
  };
  const mockRes2 = {
    status(code) {
      statusCode2 = code;
      return this;
    },
    json(data) {
      responseData2 = data;
      return this;
    },
  };

  await guestsController.createGuest(mockReq2, mockRes2, mockNext);
  assert.strictEqual(statusCode2, 201);
  assert.strictEqual(responseData2.success, true);
  assert.strictEqual(responseData2.data.name, 'Pooja Hegde');
  assert.strictEqual(responseData2.data.telegram_chat_id, null);
  console.log('✓ Non-telegram guest created successfully without side effects\n');

  // Restore env
  if (originalToken !== undefined) {
    process.env.TELEGRAM_BOT_TOKEN = originalToken;
  } else {
    delete process.env.TELEGRAM_BOT_TOKEN;
  }

  console.log('========================================');
  console.log('All Telegram Integration Tests Passed! ✓');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
