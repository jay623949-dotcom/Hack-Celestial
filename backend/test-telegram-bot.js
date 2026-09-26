/**
 * Test Suite for Resort 360 Telegram Bot Integration
 */
const telegramService = require('./src/services/telegramService');
const incidentService = require('./src/services/incidentService');
const roomService = require('./src/services/roomService');
const guestService = require('./src/services/guestService');

async function runTests() {
  console.log('====================================================');
  console.log('  Testing Telegram Bot Integration (Unit & Flow)   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}:`, e.message);
      failed++;
    }
  }

  // 1. Safe Initialization Without Token
  await test('Safe initialization without token (no crash)', async () => {
    const bot = telegramService.initBot(undefined);
    if (bot !== null) throw new Error('Expected null when token is missing');
  });

  // 2. Room Extraction Tests
  await test('Room number extraction from guest message', async () => {
    const testCases = [
      { text: 'There is water leaking in Room 204 please help', expected: '204' },
      { text: 'Suite 301 needs fresh towels immediately', expected: '301' },
      { text: 'The door lock in villa V02 is jammed', expected: 'V02' },
      { text: 'AC broken in 102', expected: '102' },
      { text: 'Hello, what time is breakfast?', expected: null },
    ];

    for (const tc of testCases) {
      const extracted = telegramService.extractRoomNumber(tc.text);
      if (extracted !== tc.expected) {
        throw new Error(`Text "${tc.text}": expected "${tc.expected}", got "${extracted}"`);
      }
    }
  });

  // 3. Complaint Triage Tests
  await test('Complaint triage logic (department & severity)', async () => {
    const cases = [
      {
        text: 'Massive burst pipe emergency flooding bathroom',
        expectedDept: 'maintenance',
        expectedSeverity: 'critical',
      },
      {
        text: 'The AC in our room stopped cooling and is blowing hot air',
        expectedDept: 'maintenance',
        expectedSeverity: 'high',
      },
      {
        text: 'Please send extra clean towels and pillows to our room',
        expectedDept: 'housekeeping',
        expectedSeverity: 'medium',
      },
      {
        text: 'There is a wrong room fee on my folio check out bill',
        expectedDept: 'front_desk',
        expectedSeverity: 'low',
      },
      {
        text: 'Very loud noise from the neighbor party in the hallway',
        expectedDept: 'front_desk',
        expectedSeverity: 'low',
      },
    ];

    for (const c of cases) {
      const triaged = telegramService.triageComplaint(c.text);
      if (triaged.department !== c.expectedDept) {
        throw new Error(`Expected department "${c.expectedDept}", got "${triaged.department}" for "${c.text}"`);
      }
      if (triaged.severity !== c.expectedSeverity) {
        throw new Error(`Expected severity "${c.expectedSeverity}", got "${triaged.severity}" for "${c.text}"`);
      }
    }
  });

  // 4. Session & Guest Profile Mapping
  await test('Chat ID session mapping to guest & room profile', async () => {
    const fakeChatId = 987654321;
    const session = telegramService.getOrCreateSession(fakeChatId, 'Sarah Jenkins', 'The shower in Room 102 has low pressure');

    if (!session || session.chatId !== fakeChatId) {
      throw new Error('Failed to create or retrieve session for chatId');
    }
    if (!session.guestId) {
      throw new Error('Session missing guestId');
    }
    if (session.roomNumber !== '102') {
      throw new Error(`Expected room 102, got ${session.roomNumber}`);
    }
  });

  // 5. Simulated Incoming Telegram Message -> Incident Creation Flow
  await test('End-to-End message flow creates incident and maps correctly', async () => {
    const fakeChatId = 554433221;
    let sentMessage = null;

    // Mock bot.sendMessage
    telegramService.bot = {
      sendMessage: async (chatId, text, options) => {
        sentMessage = { chatId, text, options };
        return { message_id: 999 };
      },
    };

    const initialIncidentCount = incidentService.getAll().length;

    // Simulate incoming message
    await telegramService.handleIncomingMessage({
      chat: { id: fakeChatId },
      from: { first_name: 'Alex', last_name: 'Morgan', username: 'alexm' },
      text: 'The HVAC unit in Room 204 is making an alarming rattling sound and not cooling!',
    });

    const newIncidents = incidentService.getAll();
    if (newIncidents.length !== initialIncidentCount + 1) {
      throw new Error(`Expected incident count to increase by 1 (was ${initialIncidentCount}, now ${newIncidents.length})`);
    }

    const createdIncident = newIncidents[newIncidents.length - 1];
    if (createdIncident.department !== 'maintenance') {
      throw new Error(`Expected department "maintenance", got "${createdIncident.department}"`);
    }
    if (!createdIncident.description.includes('Room 204')) {
      throw new Error(`Description does not include complaint text: ${createdIncident.description}`);
    }

    // Verify confirmation message was sent to Telegram guest
    if (!sentMessage) {
      throw new Error('Bot did not send confirmation message to guest');
    }
    if (sentMessage.chatId !== fakeChatId) {
      throw new Error(`Expected confirmation to chatId ${fakeChatId}, got ${sentMessage.chatId}`);
    }
    if (!sentMessage.text.includes('Resort 360 AI is analyzing your request')) {
      throw new Error(`Confirmation text missing expected phrasing: ${sentMessage.text}`);
    }
    if (!sentMessage.text.includes(createdIncident.id)) {
      throw new Error(`Confirmation text missing incident ticket #${createdIncident.id}`);
    }

    console.log(`    ℹ️ Generated Incident: #${createdIncident.id} [${createdIncident.severity.toUpperCase()}] -> ${createdIncident.department}`);
    console.log(`    ℹ️ Reply to Guest: "${sentMessage.text.split('\n')[0]}"`);

    // Reset mock
    telegramService.bot = null;
  });

  // 6. Test /start command
  await test('/start command sends friendly onboarding message', async () => {
    let sentMessage = null;
    telegramService.bot = {
      sendMessage: async (chatId, text, options) => {
        sentMessage = { chatId, text, options };
        return { message_id: 1000 };
      },
    };

    await telegramService.handleIncomingMessage({
      chat: { id: 111222 },
      from: { first_name: 'Elena' },
      text: '/start',
    });

    if (!sentMessage || !sentMessage.text.includes('Welcome to Azure Bay Resort 360 Assistant')) {
      throw new Error('Expected welcome onboarding message');
    }

    telegramService.bot = null;
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
