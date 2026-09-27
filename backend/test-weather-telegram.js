/**
 * Automated Verification for Weather Integration in Telegram Bot
 */
const assert = require('assert');

async function runTests() {
  console.log('🧪 Starting Telegram Weather Integration Verification...\n');

  const telegramBot = require('./src/services/telegramBot');
  const weatherService = require('./src/services/weather.service');
  const guestService = require('./src/services/guestService');

  // ── TEST 1: guestMenuKeyboard includes the Weather button ──
  console.log('Test 1: Checking guestMenuKeyboard buttons...');
  const keyboard = telegramBot.guestMenuKeyboard.reply_markup.inline_keyboard;
  const flatButtons = keyboard.flat();
  const weatherBtn = flatButtons.find((b) => b.callback_data === 'resort_weather');
  assert(weatherBtn, '❌ "resort_weather" button not found in guestMenuKeyboard');
  assert.strictEqual(weatherBtn.text, '☀️ Resort Weather & Forecast');
  console.log('✅ Test 1 Passed: Weather button correctly configured in guestMenuKeyboard.\n');

  // ── TEST 2: formatWeatherCard format validation ──
  console.log('Test 2: Validating formatWeatherCard structure...');
  const liveWeather = await weatherService.getCurrentWeather();
  const card = telegramBot.formatWeatherCard(liveWeather);
  console.log('Formatted Weather Card Output:\n------------------------------------');
  console.log(card);
  console.log('------------------------------------');

  assert(card.includes('☀️ Resort 360 Weather & Forecast 🌴'), 'Card header missing');
  assert(card.includes('🌡 Current Conditions:'), 'Current conditions missing');
  assert(card.includes('🌤 Forecast:'), 'Forecast line missing');
  assert(card.includes('💡 Concierge Note:'), 'Concierge note missing');
  console.log('✅ Test 2 Passed: formatWeatherCard adheres to requested format.\n');

  // ── TEST 3: On-Demand callback query 'resort_weather' ──
  console.log('Test 3: Testing callback query "resort_weather"...');
  let sentMessages = [];
  const mockSendMessage = async (chatId, text, opts) => {
    sentMessages.push({ chatId, text, opts });
  };

  const testChatId = 987654321;
  telegramBot.sessions[testChatId] = {
    step: 'VERIFIED',
    roomNumber: '101',
    guestName: 'Jane Doe',
    isVip: true,
  };

  await telegramBot.processCallbackQuery({
    queryId: 'q-weather-1',
    chatId: testChatId,
    data: 'resort_weather',
    answerCallback: async () => {},
    sendMessage: mockSendMessage,
  });

  assert.strictEqual(sentMessages.length, 1, 'Expected 1 message to be sent');
  assert(sentMessages[0].text.includes('☀️ Resort 360 Weather & Forecast 🌴'));
  assert(sentMessages[0].opts?.reply_markup?.inline_keyboard, 'Back button keyboard missing');
  const backBtn = sentMessages[0].opts.reply_markup.inline_keyboard.flat().find((b) => b.callback_data === 'back_to_menu');
  assert(backBtn, 'Expected "back_to_menu" inline button');
  assert.strictEqual(telegramBot.sessions[testChatId].step, 'VERIFIED', 'Session step must remain VERIFIED');
  console.log('✅ Test 3 Passed: On-demand callback query returned formatted card with Back to Menu button.\n');

  // ── TEST 4: Text command "weather" and "forecast" ──
  console.log('Test 4: Testing text triggers for weather...');
  sentMessages = [];
  await telegramBot.processIncomingText({
    chatId: testChatId,
    text: 'weather',
    sendMessage: mockSendMessage,
  });
  assert.strictEqual(sentMessages.length, 1);
  assert(sentMessages[0].text.includes('☀️ Resort 360 Weather & Forecast 🌴'));

  sentMessages = [];
  await telegramBot.processIncomingText({
    chatId: testChatId,
    text: 'resort weather',
    sendMessage: mockSendMessage,
  });
  assert.strictEqual(sentMessages.length, 1);
  assert(sentMessages[0].text.includes('☀️ Resort 360 Weather & Forecast 🌴'));
  console.log('✅ Test 4 Passed: Text triggers ("weather", "resort weather") work seamlessly.\n');

  // ── TEST 5: Graceful error handling on timeout/failure ──
  console.log('Test 5: Testing error resilience on weather timeout...');
  sentMessages = [];
  const origGetCurrentWeather = weatherService.getCurrentWeather;
  weatherService.getCurrentWeather = async () => {
    throw new Error('Open-Meteo gateway timeout (mock)');
  };

  await telegramBot.processCallbackQuery({
    queryId: 'q-weather-err',
    chatId: testChatId,
    data: 'resort_weather',
    answerCallback: async () => {},
    sendMessage: mockSendMessage,
  });

  // Restore weather service
  weatherService.getCurrentWeather = origGetCurrentWeather;

  assert.strictEqual(sentMessages.length, 1);
  assert.strictEqual(
    sentMessages[0].text,
    '⚠️ Weather service is temporarily updating. Please try again in a few moments.'
  );
  assert.strictEqual(telegramBot.sessions[testChatId].step, 'VERIFIED', 'Session step must remain VERIFIED even on error');
  console.log('✅ Test 5 Passed: Graceful fallback error message sent without breaking session state.\n');

  // ── TEST 6: Predictive Broadcast Function sendWeatherUpdateToGuests ──
  console.log('Test 6: Testing sendWeatherUpdateToGuests broadcast function...');
  // Seed test guests
  const guest1 = guestService.create({
    name: 'Alice Wonder',
    room_number: '201',
    telegram_id: '777001',
  });
  const guest2 = guestService.create({
    name: 'Bob Builder',
    room_number: '202',
    telegram_id: '777002',
  });
  const guestNoTelegram = guestService.create({
    name: 'Charlie Anonymous',
    room_number: '203',
    telegram_id: null,
  });

  const broadcastDeliveries = [];
  const mockBot = {
    sendMessage: async (chatId, msg, opts) => {
      // Simulate failure for Bob to verify fault tolerance
      if (String(chatId) === '777002') {
        throw new Error('Bot was blocked by user 777002');
      }
      broadcastDeliveries.push({ chatId, msg, opts });
      return { message_id: Math.floor(Math.random() * 1000) };
    },
  };

  const broadcastResult = await telegramBot.sendWeatherUpdateToGuests(mockBot);
  console.log('Broadcast execution result:', broadcastResult);

  assert(broadcastResult.sent >= 1, 'Should have delivered to at least 1 guest');
  assert(broadcastResult.failed >= 1, 'Should have logged 1 failure for the blocked guest');
  const aliceDelivery = broadcastDeliveries.find((d) => String(d.chatId) === '777001');
  assert(aliceDelivery, 'Alice did not receive her broadcast');
  assert(aliceDelivery.msg.includes('Good morning, Alice Wonder! 🌴'));
  assert(aliceDelivery.msg.includes('Room 201'));
  assert(aliceDelivery.msg.includes('☀️ Resort 360 Weather & Forecast 🌴'));
  console.log('Sample Broadcast Message Dispatched:\n------------------------------------');
  console.log(aliceDelivery.msg);
  console.log('------------------------------------');
  console.log('✅ Test 6 Passed: Broadcast delivered personalized updates and tolerated single recipient failures.\n');

  // ── TEST 7: Express route POST /api/weather/broadcast ──
  console.log('Test 7: Verifying Express POST /api/weather/broadcast route...');
  const app = require('./src/app');
  const http = require('http');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const res = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/weather/broadcast',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          server.close();
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', (e) => {
      server.close();
      reject(e);
    });
    req.end();
  });

  assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
  assert.strictEqual(res.body.success, true);
  console.log('API Broadcast Response:', res.body);
  console.log('✅ Test 7 Passed: POST /api/weather/broadcast operational.\n');

  console.log('🎉 ALL 7 TELEGRAM WEATHER INTEGRATION TESTS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
