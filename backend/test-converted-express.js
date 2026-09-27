const app = require('./src/app');
const http = require('http');

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('[Test Server] Listening on http://localhost:5099');

  async function req(path, method = 'GET', body = null) {
    const res = await fetch(`http://localhost:5099${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data };
  }

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

  console.log('\n--- 1. Testing System & Health Endpoints ---');
  await test('GET /health', async () => {
    const res = await req('/health');
    if (res.status !== 200 || res.data.status !== 'ok') throw new Error(`Status ${res.status}`);
  });

  await test('POST /demo/reset', async () => {
    const res = await req('/demo/reset', 'POST');
    if (res.status !== 200 || !res.data.ok) throw new Error(`Status ${res.status}`);
  });

  await test('GET /api/guardrails', async () => {
    const res = await req('/api/guardrails');
    if (res.status !== 200 || !res.data.guardrails) throw new Error(`Status ${res.status}`);
  });

  await test('POST /api/test/ping', async () => {
    const res = await req('/api/test/ping', 'POST');
    if (res.status !== 200 || res.data.status !== 'published') throw new Error(`Status ${res.status}`);
  });

  console.log('\n--- 2. Testing Front Desk Endpoints ---');
  await test('POST /api/frontdesk/checkin (At-Risk Speaker)', async () => {
    const res = await req('/api/frontdesk/checkin', 'POST', {
      name: 'Dr. Evelyn Vance',
      reservation_id: 'RES-TEST-001',
      room_id: 1,
      transcript: 'My flight was delayed 5 hours and luggage stuck. Urgent keynote at 9 AM, need whisper-quiet suite!',
    });
    if (res.status !== 200 || res.data.sentiment_state !== 'At-Risk') {
      throw new Error(`Unexpected response: ${JSON.stringify(res.data)}`);
    }
  });

  await test('GET /api/frontdesk/guests', async () => {
    const res = await req('/api/frontdesk/guests');
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) throw new Error(`No guests`);
  });

  await test('GET /api/frontdesk/priority-queue', async () => {
    const res = await req('/api/frontdesk/priority-queue');
    if (res.status !== 200 || !Array.isArray(res.data) || res.data[0].priority_score === undefined) {
      throw new Error(`Invalid priority queue`);
    }
  });

  console.log('\n--- 3. Testing Housekeeping Endpoints ---');
  await test('GET /api/housekeeping/tasks', async () => {
    const res = await req('/api/housekeeping/tasks');
    if (res.status !== 200 || !Array.isArray(res.data)) throw new Error(`Failed to get tasks`);
  });

  await test('POST /api/housekeeping/reorder', async () => {
    const res = await req('/api/housekeeping/reorder', 'POST', { task_ids_in_order: [3, 1, 2] });
    if (res.status !== 200 || !res.data.ok) throw new Error(`Reorder failed`);
  });

  console.log('\n--- 4. Testing Maintenance Endpoints ---');
  await test('POST /api/maintenance/upload-ticket (Safety leak)', async () => {
    const res = await req('/api/maintenance/upload-ticket', 'POST', {
      room_id: 4,
      description: 'Major water pipe rupture and flooding in bathroom under vanity',
      source: 'guest',
    });
    if (res.status !== 200 || res.data.priority !== 'safety') throw new Error(`Failed safety priority triage`);
  });

  await test('GET /api/maintenance/rooms/available-safe', async () => {
    const res = await req('/api/maintenance/rooms/available-safe');
    if (res.status !== 200 || !Array.isArray(res.data.rooms)) throw new Error(`Available safe rooms failed`);
  });

  await test('POST /api/maintenance/anomaly/scan', async () => {
    const res = await req('/api/maintenance/anomaly/scan', 'POST');
    if (res.status !== 200 || !Array.isArray(res.data.flagged_rooms)) throw new Error(`Anomaly scan failed`);
  });

  console.log('\n--- 5. Testing Revenue Endpoints ---');
  await test('POST /api/revenue/pricing (±15% cap check)', async () => {
    const res = await req('/api/revenue/pricing', 'POST', {
      room_category: 'deluxe',
      occupancy_pct: 0.9,
      demand_signal: 'surge',
    });
    if (res.status !== 200 || Math.abs(res.data.change_pct) > 15) throw new Error(`Cap exceeded: ${res.data.change_pct}`);
  });

  await test('GET /api/revenue/net-revpar', async () => {
    const res = await req('/api/revenue/net-revpar');
    if (res.status !== 200 || res.data.net_revpar === undefined) throw new Error(`Net revpar failed`);
  });

  await test('POST /api/revenue/flash-sale', async () => {
    const res = await req('/api/revenue/flash-sale', 'POST', {
      asset_description: 'Sunset Spa & Cabana Bundle',
      price: 69,
      expiry_minutes: 45,
    });
    if (res.status !== 200 || res.data.offers_created === 0) throw new Error(`Flash sale failed`);
  });

  await test('POST /api/revenue/wing-shutdown-simulate', async () => {
    const res = await req('/api/revenue/wing-shutdown-simulate', 'POST', { wing_id: 'B' });
    if (res.status !== 200 || res.data.current_net_profit_target === undefined) throw new Error(`Shutdown failed`);
  });

  console.log('\n--- 6. Testing Engine Endpoints ---');
  await test('POST /api/engine/guest-intake', async () => {
    const res = await req('/api/engine/guest-intake', 'POST', {
      transcript: 'I need a fast checkin and quiet room for an early morning keynote presentation.',
    });
    if (res.status !== 200 || !res.data.result) throw new Error(`Engine guest intake failed`);
  });

  await test('POST /api/engine/maintenance-cv', async () => {
    const res = await req('/api/engine/maintenance-cv', 'POST', {
      fixture_hint: 'Shower cartridge leak in bathroom ceiling',
    });
    if (res.status !== 200 || !res.data.result) throw new Error(`Engine maintenance cv failed`);
  });

  console.log('\n--- 7. Verifying Original Hack-Celestial Endpoints are Unbroken ---');
  await test('GET /api/v1/health', async () => {
    const res = await req('/api/v1/health');
    if (res.status !== 200) throw new Error(`Original health failed`);
  });

  await test('GET /api/v1/rooms', async () => {
    const res = await req('/api/v1/rooms');
    if (res.status !== 200) throw new Error(`Original rooms failed`);
  });

  await test('GET /api/v1/incidents', async () => {
    const res = await req('/api/v1/incidents');
    if (res.status !== 200) throw new Error(`Original incidents failed`);
  });

  server.close();
  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
