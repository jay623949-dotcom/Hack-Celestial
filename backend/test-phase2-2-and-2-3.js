const agentService = require('./src/services/agent.service');
const contextBuilder = require('./src/services/context-builder.service');
const openAIService = require('./src/services/openai.service');

async function testPhase22And23() {
  console.log('================================================================');
  console.log('RESORT 360 — PHASE 2.2 & 2.3 DEPARTMENTAL AGENT VERIFICATION');
  console.log('================================================================\n');

  console.log(`Active AI Provider: ${openAIService.getActiveProvider()}`);
  console.log(`Supported Departmental Agents: ${agentService.getSupportedAgents().join(', ')}\n`);

  // Five required operational scenarios
  const scenarios = [
    {
      name: 'Scenario 1: VIP Early Arrival',
      trigger: { type: 'vip_early_arrival', guest_id: 'guest-001' },
      expectedFoci: {
        front_desk: 'guest arrival / VIP handling / lounge',
        housekeeping: 'express clean / suite preparation',
        maintenance: 'HVAC repair triage',
        revenue: 'room allocation / $0 displacement',
      },
    },
    {
      name: 'Scenario 2: Room 401 HVAC Failure',
      trigger: { type: 'hvac_failure', room_id: 'room-401' },
      expectedFoci: {
        front_desk: 'room swap / guest communication',
        housekeeping: 'alternative room readiness',
        maintenance: 'compressor & capacitor repair / habitability',
        revenue: 'out-of-order room impact',
      },
    },
    {
      name: 'Scenario 3: Housekeeping Bottleneck',
      trigger: { type: 'housekeeping_bottleneck' },
      expectedFoci: {
        front_desk: 'managing arrival wait times',
        housekeeping: 're-sequencing clean order / prioritizing VIP rooms',
        maintenance: 'ensuring no repair blockers',
        revenue: 'protecting check-in guarantees',
      },
    },
    {
      name: 'Scenario 4: Large Group Arrival',
      trigger: { type: 'large_group_arrival' },
      expectedFoci: {
        front_desk: 'satellite check-in / key packet distribution',
        housekeeping: 'group block room inspection',
        maintenance: 'door lock & physical checks',
        revenue: 'protecting group block locks (Rooms 402-415)',
      },
    },
    {
      name: 'Scenario 5: Multiple Simultaneous Incidents (The Ultimate Test)',
      trigger: { type: 'multiple_incidents' },
      expectedFoci: {
        front_desk: 'guest triage in lobby',
        housekeeping: 'staff capacity allocation',
        maintenance: 'competing equipment triage',
        revenue: 'overall yield and room inventory preservation',
      },
    },
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Run the Critical Multi-Agent Test across all 4 departments on Scenario 5
  console.log('----------------------------------------------------------------');
  console.log('CRITICAL CROSS-AGENT TEST: Scenario 5 (Multiple Simultaneous Incidents)');
  console.log('Passing IDENTICAL Canonical Context through Front Desk, Housekeeping, Maintenance & Revenue');
  console.log('----------------------------------------------------------------\n');

  const canonicalContext5 = await contextBuilder.buildContext(scenarios[4].trigger);
  console.log(`✓ Built Canonical Context "${canonicalContext5.context_id}"`);

  const crossAgentResults = await agentService.runBatchAgents(
    ['front_desk', 'housekeeping', 'maintenance', 'revenue'],
    canonicalContext5
  );

  for (const res of crossAgentResults) {
    totalTests++;
    if (res.status === 'completed') {
      const data = res.data;
      console.log(`\n▶ [${res.agent.toUpperCase()} AGENT] (Status: ${res.status}, ${res.duration_ms}ms)`);
      console.log(`  Assessment: "${data.assessment.summary}" (Priority: ${data.assessment.priority})`);
      console.log(`  Confidence: ${data.confidence}`);
      console.log(`  Observations (${data.observations.length}):`);
      data.observations.slice(0, 2).forEach((obs) => console.log(`    - [Fact] ${obs}`));
      console.log(`  Constraints (${data.constraints.length}):`);
      data.constraints.slice(0, 2).forEach((c) => console.log(`    - [Constraint] ${c}`));
      console.log(`  Recommendations (${data.recommendations.length}):`);
      data.recommendations.forEach((rec) => {
        console.log(`    - [${rec.recommendation_id}] ${rec.action}`);
        console.log(`      Reason: ${rec.reason}`);
        console.log(`      Affected Rooms: ${JSON.stringify(rec.affected_rooms)}, Staff: ${JSON.stringify(rec.required_staff)}`);
        console.log(`      Confidence: ${rec.confidence}`);
      });

      // Verify schema and non-empty outputs
      if (data.assessment?.summary && data.recommendations?.length > 0 && typeof data.confidence === 'number') {
        passedTests++;
      } else {
        console.error(`  ✗ Output missing required fields`);
        failedTests++;
      }
    } else {
      console.error(`\n✗ [${res.agent.toUpperCase()} AGENT] FAILED:`, res.error);
      failedTests++;
    }
  }

  // Verify that departmental perspectives differ
  if (crossAgentResults.every((r) => r.status === 'completed')) {
    const summaries = crossAgentResults.map((r) => r.data.assessment.summary);
    const uniqueSummaries = new Set(summaries);
    if (uniqueSummaries.size === crossAgentResults.length) {
      console.log('\n✓ Cross-Agent Perspective Verification: PASSED (All 4 agents produced unique departmental assessments).');
    } else {
      console.warn('\n⚠ Some agent summaries were identical:', summaries);
    }
  }

  console.log('\n================================================================');
  console.log(`Verification Summary: ${passedTests} Passed, ${failedTests} Failed out of ${totalTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

testPhase22And23().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
