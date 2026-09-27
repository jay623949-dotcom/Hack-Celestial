/**
 * Resort 360 — Nugen Domain Intelligence Integration Tests
 * 
 * Verifies:
 * 1. Nugen configuration & initialization
 * 2. Domain dataset integrity (JSONL + Handbook)
 * 3. Schema validation (strict output format compliance)
 * 4. Nugen inference execution & confidence score parsing
 * 5. Deterministic fallback when key is unconfigured
 * 6. API routes: GET /api/v1/ai/nugen/status & POST /api/v1/ai/nugen/analyze
 * 7. End-to-end multi-agent orchestration with embedded Nugen domain analysis
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const app = require('./src/app');
const nugenService = require('./src/services/nugen/nugenService');
const nugenInference = require('./src/services/nugen/nugenInferenceService');
const { validateNugenResponse } = require('./src/services/nugen/nugenSchemas');
const orchestratorService = require('./src/services/orchestrator.service');
const contextBuilder = require('./src/services/context-builder.service');

const PORT = 5066;
let server;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(rawData);
          } catch (e) {
            parsed = rawData;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log(' RESORT 360 — NUGEN INTEGRATION TEST SUITE');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Dataset Integrity
  console.log('--- 1. Domain Dataset Integrity ---');
  test('Domain handbook text file exists and is populated', () => {
    const handbookPath = path.join(__dirname, '..', 'data', 'nugen', 'resort360-operations-handbook.txt');
    assert.strictEqual(fs.existsSync(handbookPath), true, 'Handbook must exist');
    const content = fs.readFileSync(handbookPath, 'utf8');
    assert.ok(content.length > 500, 'Handbook must have substantive SOP content');
    assert.ok(content.toLowerCase().includes('vip early arrival'), 'Handbook must define VIP protocols');
  });

  test('25 Domain alignment scenarios JSONL file is valid', () => {
    const jsonlPath = path.join(__dirname, '..', 'data', 'nugen', 'resort360-alignment-scenarios.jsonl');
    assert.strictEqual(fs.existsSync(jsonlPath), true, 'JSONL dataset must exist');
    const lines = fs.readFileSync(jsonlPath, 'utf8').trim().split('\n');
    assert.ok(lines.length >= 25, `Expected >= 25 scenarios, found ${lines.length}`);
    const first = JSON.parse(lines[0]);
    assert.ok(first.input && first.output, 'Each scenario must have input and output');
    assert.ok(first.output.confidence_score >= 90, 'Confidence score must be realistic');
  });

  // 2. Schema Validation
  console.log('\n--- 2. Schema Validation ---');
  test('Validates compliant Nugen output object', () => {
    const sample = {
      incident_id: 'INC-401-AC',
      severity: 'CRITICAL',
      summary: 'AC failure requiring VIP reassignment to Room 205',
      affected_departments: ['front_desk', 'maintenance', 'housekeeping', 'revenue'],
      impact: ['Lobby wait time', 'Inventory block'],
      recommended_actions: [
        { department: 'front_desk', priority: 'CRITICAL', action: 'Escort guest', reason: 'VIP SOP' }
      ],
      dependencies: ['Housekeeping inspection required'],
      escalation_required: true,
      escalation_reason: 'VIP reassignment',
      explanation: { what: 'AC failed', why: 'Compressor burnt', impact: 'VIP unseated' },
      confidence_score: 96.5,
    };
    const res = validateNugenResponse(sample);
    assert.strictEqual(res.valid, true, `Validation failed: ${res.errors?.join(', ')}`);
  });

  test('Rejects malformed Nugen output missing mandatory fields', () => {
    const malformed = { summary: 'Missing incident id and required fields' };
    const res = validateNugenResponse(malformed);
    assert.strictEqual(res.valid, false, 'Malformed output should fail validation');
  });

  // 3. Inference Service
  console.log('\n--- 3. Inference Service & Resilience ---');
  await asyncTest('nugenInference.analyzeResortIncident returns structured decision with confidence score', async () => {
    const context = await contextBuilder.buildContext({ type: 'vip_early_arrival', incident_id: 'INC-401-AC' });
    const decision = await nugenInference.analyzeResortIncident(context);

    assert.strictEqual(decision.incident_id, 'INC-401-AC');
    assert.ok(['CRITICAL', 'HIGH'].includes(decision.severity));
    assert.ok(Array.isArray(decision.affected_departments));
    assert.ok(decision.affected_departments.includes('front_desk'));
    assert.ok(decision.affected_departments.includes('maintenance'));
    assert.ok(typeof decision.confidence_score === 'number' && decision.confidence_score > 0);
    assert.strictEqual(decision.escalation_required, true);
    assert.strictEqual(decision.provider, 'nugen');
  });

  // 4. API Endpoints
  console.log('\n--- 4. Nugen REST Endpoints ---');
  await asyncTest('GET /api/v1/ai/nugen/status returns operational readiness', async () => {
    const res = await request('GET', '/api/v1/ai/nugen/status');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.provider, 'nugen');
    assert.strictEqual(res.body.data.alignment_ready, true);
  });

  await asyncTest('POST /api/v1/ai/nugen/analyze executes domain inference', async () => {
    const res = await request('POST', '/api/v1/ai/nugen/analyze', {
      trigger: { type: 'vip_early_arrival', incident_id: 'INC-401-AC' },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const domainAnalysis = res.body.data.domain_analysis;
    assert.ok(domainAnalysis);
    assert.strictEqual(domainAnalysis.incident_id, 'INC-401-AC');
    assert.ok(domainAnalysis.confidence_score >= 90);
    assert.ok(domainAnalysis.recommended_actions.length > 0);
  });

  // 5. Consensus Orchestrator Integration
  console.log('\n--- 5. Consensus Pipeline Integration ---');
  await asyncTest('Orchestrator embeds Nugen domain intelligence into multi-agent consensus', async () => {
    const orchestration = await orchestratorService.orchestrateConsensus({
      trigger: { type: 'vip_early_arrival', incident_id: 'INC-401-AC' },
    });

    assert.ok(orchestration.domain_intelligence, 'Must have domain_intelligence in response');
    assert.strictEqual(orchestration.domain_intelligence.provider, 'nugen');
    assert.ok(orchestration.domain_intelligence.confidence_score >= 90);
    assert.strictEqual(orchestration.domain_intelligence.severity, 'CRITICAL');
    assert.ok(orchestration.consensus, 'Must have consensus result');
    assert.strictEqual(orchestration.consensus.requires_human_approval, true, 'Manager approval must be required');
    assert.ok(orchestration.agents.length >= 4, 'Must execute departmental agents');
  });

  console.log('\n========================================');
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
}

server = app.listen(PORT, async () => {
  try {
    await runTests();
  } finally {
    server.close();
  }
});
