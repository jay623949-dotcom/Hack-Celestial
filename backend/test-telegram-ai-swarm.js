/**
 * Verification Script for Telegram Bot connected to AI Multi-Agent Consensus Swarm
 */
const assert = require('assert');

async function runTests() {
  console.log('🧪 Starting Telegram Bot + AI Multi-Agent Consensus Swarm Verification...\n');

  const telegramBot = require('./src/services/telegramBot');
  const incidentService = require('./src/services/incidentService');
  const taskService = require('./src/services/taskService');
  const socketService = require('./src/services/socket.service');

  // Track socket emissions
  const emittedEvents = [];
  const origEmitEvent = socketService.emitEvent;
  socketService.emitEvent = (event, data) => {
    emittedEvents.push({ event, data });
    origEmitEvent(event, data);
  };

  // Mock sendMessage
  const sentMessages = [];
  const mockSendMessage = async (chatId, text, opts) => {
    sentMessages.push({ chatId, text, opts });
    return { message_id: Math.floor(Math.random() * 1000) };
  };

  // ── TEST 1: Standard Guest Submits Complaint via Telegram ──
  console.log('Test 1: Standard guest submits AC leakage complaint via Telegram...');
  const chatId1 = 555111;
  telegramBot.sessions[chatId1] = {
    step: 'AWAITING_COMPLAINT',
    roomNumber: '302',
    guestName: 'Carlos Santana',
    isVip: false,
  };

  await telegramBot.processIncomingText({
    chatId: chatId1,
    text: 'Water is dripping from the bedroom AC unit onto the floor',
    sendMessage: mockSendMessage,
  });

  // Verify guest received response
  assert(sentMessages.length >= 2, 'Expected status card + follow-up menu');
  const replyCard = sentMessages[0].text;
  console.log('Telegram Reply Card Output:\n------------------------------------');
  console.log(replyCard);
  console.log('------------------------------------');

  assert(replyCard.includes('🛎 Incident Logged & Triaged!'), 'Header missing');
  assert(replyCard.includes('📋 Ticket: #incident-'), 'Ticket number missing');
  assert(replyCard.includes('📍 Room: 302'), 'Room missing');
  assert(replyCard.includes('⚡ Priority:'), 'Priority missing');
  assert(replyCard.includes('🤖 AI Consensus:'), 'AI Consensus summary missing');
  assert(replyCard.includes('Our staff has been notified and is attending to this now.'));

  // Verify incident in database
  const allIncidents = incidentService.getAll();
  const createdIncident = allIncidents.find((i) => i.room_number === '302');
  assert(createdIncident, 'Incident not found in database');
  assert.strictEqual(createdIncident.status, 'open');
  assert.strictEqual(createdIncident.source, 'Telegram');
  assert.strictEqual(createdIncident.department, 'maintenance');
  console.log(`✅ Incident persisted in DB: ID ${createdIncident.id}, Department: ${createdIncident.department}`);

  // Verify spawned tasks in database
  const spawnedTasks = taskService.getAll({ incident_id: createdIncident.id });
  assert(spawnedTasks.length > 0, 'No operational tasks spawned for incident');
  console.log(`✅ Spawned ${spawnedTasks.length} operational tasks for incident:`);
  spawnedTasks.forEach((t) => console.log(`   - Task [${t.priority}]: ${t.title} (${t.department})`));

  // Verify Socket.IO events
  const incidentEvent = emittedEvents.find((e) => e.event === 'incident:created' && e.data?.id === createdIncident.id);
  const consensusEvent = emittedEvents.find((e) => e.event === 'ai:consensus_generated' && e.data?.incident_id === createdIncident.id);
  const tasksEvent = emittedEvents.find((e) => e.event === 'tasks:created' && e.data?.incident_id === createdIncident.id);

  assert(incidentEvent, 'Socket event incident:created missing');
  assert(consensusEvent, 'Socket event ai:consensus_generated missing');
  assert(tasksEvent, 'Socket event tasks:created missing');
  console.log('✅ Real-time Socket.IO broadcasts verified: incident:created, ai:consensus_generated, tasks:created.\n');

  // Verify session step reset to VERIFIED
  assert.strictEqual(telegramBot.sessions[chatId1].step, 'VERIFIED');
  console.log('✅ Test 1 Passed: Standard guest complaint triggered full DB -> Swarm -> Task -> Socket -> Telegram flow.\n');

  // ── TEST 2: VIP Guest Complaint with Priority Elevation ──
  console.log('Test 2: VIP Guest submits issue (Priority elevation to Critical)...');
  sentMessages.length = 0;
  const chatId2 = 555222;
  telegramBot.sessions[chatId2] = {
    step: 'AWAITING_COMPLAINT',
    roomNumber: '401',
    guestName: 'Arjun Mehta',
    isVip: true,
  };

  await telegramBot.processIncomingText({
    chatId: chatId2,
    text: 'AC is blowing warm air and making a loud buzzing noise',
    sendMessage: mockSendMessage,
  });

  const vipReplyCard = sentMessages[0].text;
  console.log('VIP Reply Card Preview:\n------------------------------------');
  console.log(vipReplyCard);
  console.log('------------------------------------');

  assert(vipReplyCard.includes('VIP Priority'), 'VIP priority indicator missing from reply card');

  const vipIncident = incidentService.getAll().find((i) => i.room_number === '401' && i.source === 'Telegram');
  assert(vipIncident, 'VIP incident not found');
  assert(vipIncident.vip === true, 'VIP flag missing on incident');
  assert.strictEqual(vipIncident.severity, 'critical', 'VIP severity was not elevated to critical');
  console.log('✅ Test 2 Passed: VIP complaint correctly elevated severity and tagged VIP priority.\n');

  // ── TEST 3: Resilient Fallback Handling ──
  console.log('Test 3: Testing fault tolerance when AI swarm service throws an error...');
  sentMessages.length = 0;
  const orchestratorService = require('./src/services/orchestrator.service');
  const origOrchestrate = orchestratorService.orchestrateConsensus;
  orchestratorService.orchestrateConsensus = async () => {
    throw new Error('AI Model Rate Limit Exceeded (Mock)');
  };

  const chatId3 = 555333;
  telegramBot.sessions[chatId3] = {
    step: 'AWAITING_COMPLAINT',
    roomNumber: '105',
    guestName: 'Safe Fallback Guest',
    isVip: false,
  };

  await telegramBot.processIncomingText({
    chatId: chatId3,
    text: 'Shower drain is slow to empty',
    sendMessage: mockSendMessage,
  });

  // Restore orchestrator
  orchestratorService.orchestrateConsensus = origOrchestrate;

  assert(sentMessages.length >= 1, 'Expected reply even when swarm throws');
  const fallbackReply = sentMessages[0].text;
  assert(fallbackReply.includes('🛎 Incident Logged & Triaged!'), 'Fallback ticket header missing');
  assert(fallbackReply.includes('📍 Room: 105'), 'Fallback room missing');

  const fallbackIncident = incidentService.getAll().find((i) => i.room_number === '105');
  assert(fallbackIncident, 'Fallback incident must still be saved in DB');
  const fallbackTasks = taskService.getAll({ incident_id: fallbackIncident.id });
  assert(fallbackTasks.length > 0, 'Fallback triage task must be created');
  console.log('✅ Test 3 Passed: Swarm failure handled gracefully with DB write and fallback task creation.\n');

  // Restore socketService
  socketService.emitEvent = origEmitEvent;

  console.log('🎉 ALL TELEGRAM + AI SWARM INTEGRATION TESTS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
