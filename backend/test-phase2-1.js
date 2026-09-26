const contextBuilder = require('./src/services/context-builder.service');
const openAIService = require('./src/services/openai.service');
const dataStore = require('./src/data/dataStore');

async function testPhase21() {
  console.log('====================================================');
  console.log('RESORT 360 — PHASE 2.1 CONTEXT BUILDER VERIFICATION');
  console.log('====================================================\n');

  const store = dataStore.getStore();
  console.log(`✓ Data store verified: ${store.rooms.length} rooms, ${store.guests.length} guests, ${store.staff.length} staff, ${store.incidents.length} incidents, ${store.tasks.length} tasks.\n`);

  const scenariosToTest = [
    {
      name: '1. VIP Early Arrival',
      trigger: { type: 'vip_early_arrival', guest_id: 'guest-001' },
    },
    {
      name: '2. Room 401 HVAC Failure',
      trigger: { type: 'hvac_failure', room_id: 'room-401' },
    },
    {
      name: '3. Housekeeping Bottleneck',
      trigger: { type: 'housekeeping_bottleneck' },
    },
    {
      name: '4. Large Group Arrival',
      trigger: { type: 'large_group_arrival' },
    },
    {
      name: '5. Multiple Simultaneous Incidents',
      trigger: { type: 'multiple_incidents' },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const scen of scenariosToTest) {
    console.log(`Testing Scenario: ${scen.name}...`);
    try {
      const canonicalContext = await contextBuilder.buildContext(scen.trigger);

      // 1. Verify schema compliance
      const validation = openAIService.validateInputContext(canonicalContext);
      if (!validation.valid) {
        console.error(`  ✗ Schema validation failed for ${scen.name}:`, validation.errors);
        failed++;
        continue;
      }

      // 2. Verify non-empty relevant operational components
      if (!canonicalContext.resort?.name || canonicalContext.rooms.length === 0 || canonicalContext.staff.length === 0) {
        console.error(`  ✗ Incomplete operational context generated for ${scen.name}`);
        failed++;
        continue;
      }

      // 3. Verify factual constraints were derived from database state
      if (!canonicalContext.constraints || canonicalContext.constraints.length === 0) {
        console.error(`  ✗ No operational constraints derived for ${scen.name}`);
        failed++;
        continue;
      }

      console.log(`  ✓ Canonical context generated: ${canonicalContext.rooms.length} rooms, ${canonicalContext.incidents.length} incidents, ${canonicalContext.staff.length} staff, ${canonicalContext.tasks.length} tasks, ${canonicalContext.constraints.length} derived constraints.`);
      console.log(`  ✓ Adheres 100% to agent-context.schema.json`);
      passed++;
    } catch (err) {
      console.error(`  ✗ Error in ${scen.name}:`, err.message);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`Phase 2.1 Verification Result: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

testPhase21().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
