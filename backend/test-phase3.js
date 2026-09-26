const http = require('http');
const app = require('./src/app');
const orchestratorService = require('./src/services/orchestrator.service');
const consensusService = require('./src/services/consensus.service');
const agentService = require('./src/services/agent.service');

const server = http.createServer(app);
const PORT = 5066;

server.listen(PORT, async () => {
  console.log(`[Phase3TestRunner] Orchestration & Consensus test server on port ${PORT}`);

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
    console.log('\n--- 1. Schema & Fallback Unit Verification ---');

    const dummyContext = {
      context_id: 'ctx-test-101',
      schema_version: '1.0',
      created_at: new Date().toISOString(),
      resort: {
        id: 'resort-001',
        name: 'The Grand Azure Resort & Spa',
        timezone: 'America/New_York',
      },
      trigger: {
        type: 'hvac_failure',
        room_id: 'room-401',
      },
      rooms: [
        { id: 'room-401', number: '401', category: 'Deluxe Suite', status: 'maintenance' },
        { id: 'room-505', number: '505', category: 'Executive Suite', status: 'dirty' },
      ],
      staff: [
        { id: 'staff-001', name: 'Sarah Jenkins', department: 'front_desk', status: 'on_duty' },
        { id: 'staff-005', name: 'Bob Miller', department: 'maintenance', status: 'on_duty' },
      ],
      incidents: [
        { id: 'incident-001', title: 'AC breakdown', severity: 'critical', department: 'maintenance', room_id: 'room-401' },
      ],
      constraints: [
        'Floor 4 rooms 402-415 locked for wedding party block.',
      ],
    };

    // Test consensus fallback generation with complete agent set
    const mockAgentResponses = [
      {
        agent: 'front_desk',
        schema_version: '1.0',
        assessment: { summary: 'VIP Vance requires lounge escort.', priority: 'critical' },
        observations: ['Guest waiting in lobby.'],
        constraints: ['Do not make guest wait in lobby.'],
        recommendations: [
          {
            recommendation_id: 'rec-fd-1',
            action: 'Escort VIP Vance to Executive Lounge and offer welcome refreshment',
            reason: 'De-escalate wait time during suite repair',
            priority: 'critical',
            affected_rooms: ['room-401'],
            affected_guests: ['guest-001'],
            required_staff: ['staff-001'],
            estimated_duration_minutes: 10,
            risks: ['Guest impatience'],
            confidence: 0.95,
          },
        ],
        confidence: 0.95,
      },
      {
        agent: 'housekeeping',
        schema_version: '1.0',
        assessment: { summary: 'Suite 505 checkout completed, cleanable in 25 min.', priority: 'high' },
        observations: ['Suite 505 is currently dirty.'],
        constraints: ['Standard cleaning requires 45 mins; 2 staff express is 25 mins.'],
        recommendations: [
          {
            recommendation_id: 'rec-hk-1',
            action: 'Assign 2 attendants to express-turnover Suite 505',
            reason: 'Prepares alternate VIP suite rapidly',
            priority: 'high',
            affected_rooms: ['room-505'],
            affected_guests: ['guest-001'],
            required_staff: ['staff-003', 'staff-004'],
            estimated_duration_minutes: 25,
            risks: ['Floor 3 turnover delay'],
            confidence: 0.90,
          },
        ],
        confidence: 0.90,
      },
      {
        agent: 'revenue',
        schema_version: '1.0',
        assessment: { summary: 'Suite 505 unreserved; Floor 4 locked for wedding block.', priority: 'medium' },
        observations: ['Floor 4 is reserved for 2 PM wedding group.'],
        constraints: ['Do not allocate Floor 4 rooms to non-group guests.'],
        recommendations: [
          {
            recommendation_id: 'rec-rev-1',
            action: 'Authorize VIP complimentary upgrade to Suite 505 and lock Floor 4 block',
            reason: 'Zero revenue displacement on 505; protects wedding revenue',
            priority: 'high',
            affected_rooms: ['room-505'],
            affected_guests: ['guest-001'],
            required_staff: ['staff-007'],
            estimated_duration_minutes: 5,
            risks: ['None'],
            confidence: 0.98,
          },
        ],
        confidence: 0.98,
      },
    ];

    const fallbackConsensus = consensusService.buildFallbackConsensus(
      dummyContext,
      mockAgentResponses,
      { front_desk: 'available', housekeeping: 'available', maintenance: 'unavailable', revenue: 'available' }
    );

    assert(fallbackConsensus.requires_human_approval === true, 'Consensus mandates requires_human_approval === true');
    assert(fallbackConsensus.action_plan.requires_human_approval === true, 'Action plan mandates requires_human_approval === true');
    assert(fallbackConsensus.action_plan.status === 'pending_approval', 'Action plan initial status is pending_approval');
    assert(fallbackConsensus.conflicts.length > 0, 'Explicit conflict detected and arbitrated in consensus');
    assert(fallbackConsensus.agent_status.maintenance === 'unavailable', 'Agent status correctly identifies unavailable maintenance agent');

    const schemaValidation = consensusService.validateConsensus(fallbackConsensus);
    assert(schemaValidation.valid === true, 'Consensus adheres strictly to consensus-response.schema.json');

    // 2. Direct API Endpoint Verification with live DB-built context via trigger
    console.log('\n--- 2. Direct API Endpoint Verification ---');

    // Test POST /api/v1/ai/consensus invalid input
    const invalidConsensusReq = await request('/ai/consensus', {
      method: 'POST',
      body: JSON.stringify({ agents: ['ghost_agent_999'] }),
    });
    assert(invalidConsensusReq.status === 400 && invalidConsensusReq.body.error.code === 'UNKNOWN_AGENT', 'POST /ai/consensus with invalid agent returns 400 UNKNOWN_AGENT');

    // Test POST /api/v1/ai/consensus with valid trigger
    const liveConsensusReq = await request('/ai/consensus', {
      method: 'POST',
      body: JSON.stringify({
        trigger: { type: 'multiple_incidents' },
        agents: ['front_desk'], // test single agent run to ensure fast, deterministic execution
      }),
    });

    assert(liveConsensusReq.status === 200, 'POST /ai/consensus returns 200 OK');
    assert(liveConsensusReq.body.success === true, 'Response body success is true');
    assert(liveConsensusReq.body.data.consensus.requires_human_approval === true, 'API consensus output guarantees requires_human_approval === true');
    assert(Array.isArray(liveConsensusReq.body.data.consensus.agreements), 'API consensus output contains agreements array');
    assert(Array.isArray(liveConsensusReq.body.data.consensus.conflicts), 'API consensus output contains conflicts array');
    assert(Array.isArray(liveConsensusReq.body.data.consensus.recommendations), 'API consensus output contains recommendations array');
    assert(Array.isArray(liveConsensusReq.body.data.consensus.action_plan.actions), 'API consensus output contains action_plan.actions array');
    assert(liveConsensusReq.body.data.agents.length === 1, 'Per-agent execution result is preserved and returned');

    console.log('\n--- 3. Orchestration Agent Resilience (Failure Handling) ---');
    // Simulate multi-agent run with mock failure handling
    const resilientConsensus = await consensusService.synthesizeConsensus(dummyContext, [
      { agent: 'front_desk', status: 'completed', data: mockAgentResponses[0] },
      { agent: 'maintenance', status: 'error', error: { message: 'Timeout' } },
      { agent: 'revenue', status: 'completed', data: mockAgentResponses[2] },
    ]);

    assert(resilientConsensus.agent_status.maintenance === 'unavailable', 'Consensus identifies failed agent without crashing');
    assert(resilientConsensus.agent_status.front_desk === 'available', 'Available agent status recorded');
    assert(resilientConsensus.recommendations.length > 0, 'Consensus produces recommendations from remaining healthy agents');

    console.log('\n========================================');
    console.log(`Phase 3 Test Execution Finished: ${passed} Passed, ${failed} Failed`);
    console.log('========================================\n');
  } catch (err) {
    console.error('[Phase3TestRunner] Unexpected test failure:', err);
    failed++;
  } finally {
    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  }
});
