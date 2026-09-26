/**
 * Resort 360 — Manager Decision & Action Plan Control Tests
 * Verifies Human-in-the-Loop decision control:
 * 1. Approve workflow
 * 2. Reject with mandatory reason
 * 3. Modify preserving original AI recommendation
 * 4. Modify then reject
 * 5. Invalid transition blocking (409 Conflict)
 * 6. Unauthorized user blocking (403 Forbidden)
 * 7. Double approval blocking (409 Conflict)
 * 8. Rejection without reason blocking (400 Bad Request)
 * 9. Modification audit trail inspection
 * 10. Individual action item status progression & parent plan status updates
 */

const http = require('http');
const app = require('./src/app');
const aiPersistence = require('./src/services/ai-persistence.service');

const PORT = 5066;
let server;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (_) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`\n==================================================`);
    console.log(`RESORT 360 — MANAGER DECISION & CONTROL TEST SUITE`);
    console.log(`==================================================\n`);

    try {
      // Helper to create a fresh test plan
      async function createTestPlan(testId) {
        const planId = `plan-test-${testId}-${Date.now()}`;
        const runId = `run-test-${testId}-${Date.now()}`;
        await aiPersistence.saveActionPlan({
          runId,
          contextId: `ctx-${testId}`,
          consensus: {
            consensus_id: `consensus-${testId}`,
            summary: `Test plan for scenario ${testId}`,
            priority: 'high',
            action_plan: {
              action_plan_id: planId,
              summary: `Action plan ${testId}`,
              actions: [
                {
                  action_id: `item-${testId}-1`,
                  type: 'room_prep',
                  action: 'Prepare Room 203',
                  description: 'Prepare Room 203',
                  department: 'housekeeping',
                  assigned_to: 'staff-004',
                  room_id: 'room-203',
                  priority: 'high',
                },
                {
                  action_id: `item-${testId}-2`,
                  type: 'inspect_hvac',
                  action: 'Inspect HVAC in Room 401',
                  description: 'Inspect HVAC in Room 401',
                  department: 'maintenance',
                  assigned_to: 'staff-005',
                  room_id: 'room-401',
                  priority: 'critical',
                },
              ],
            },
          },
        });
        return planId;
      }

      // --- TEST 1: APPROVE WORKFLOW ---
      console.log('--- TEST 1: APPROVE WORKFLOW ---');
      const plan1 = await createTestPlan('t1');
      const res1 = await request('POST', `/api/v1/action-plans/${plan1}/approve`, {
        comment: 'Executive General Manager approves plan for immediate execution.',
        actor_id: 'gm@resort360.demo',
        actor_role: 'manager',
      });
      assert(res1.status === 200, 'Approve endpoint returns 200 OK');
      assert(res1.body.data.status === 'approved', 'Plan status is updated to approved');
      assert(res1.body.data.approved_by === 'gm@resort360.demo', 'Approved by manager identity recorded');

      const audit1 = await request('GET', `/api/v1/action-plans/${plan1}/audit-trail`);
      assert(audit1.body.data.audit_trail.some(a => a.decision === 'approve'), 'Audit trail logs approve event');

      // --- TEST 2: REJECT WITH MANDATORY REASON ---
      console.log('\n--- TEST 2: REJECT WITH MANDATORY REASON ---');
      const plan2 = await createTestPlan('t2');
      const res2 = await request('POST', `/api/v1/action-plans/${plan2}/reject`, {
        reason: 'Room 203 is unavailable due to plumbing inspection.',
        actor_id: 'frontdesk.mgr@resort360.demo',
        actor_role: 'front_desk_manager',
      });
      assert(res2.status === 200, 'Reject endpoint returns 200 OK');
      assert(res2.body.data.status === 'rejected', 'Plan status is updated to rejected');
      assert(res2.body.data.rejected_reason === 'Room 203 is unavailable due to plumbing inspection.', 'Rejection reason persisted');

      // --- TEST 3: MODIFY PRESERVING ORIGINAL AI PLAN THEN APPROVE ---
      console.log('\n--- TEST 3: MODIFY PRESERVING ORIGINAL AI PLAN THEN APPROVE ---');
      const plan3 = await createTestPlan('t3');
      const res3 = await request('POST', `/api/v1/action-plans/${plan3}/modify`, {
        reason: 'Reassigning VIP to Room 205 instead of 203 as 205 is already inspected.',
        modifications: [
          {
            id: `item-t3-1`,
            action: 'Prepare Room 205',
            description: 'Prepare Room 205',
            room_id: 'room-205',
            assigned_staff: 'staff-003',
          },
        ],
      });
      assert(res3.status === 200, 'Modify endpoint returns 200 OK');
      assert(res3.body.data.status === 'modified_pending_approval', 'Status transitions to modified_pending_approval');
      assert(res3.body.data.original_plan[0].room_id === 'room-203', 'Original AI plan retains Room 203 (immutable)');
      assert(res3.body.data.modified_plan[0].room_id === 'room-205', 'Modified plan records Room 205');

      // Now approve the modified plan
      const res3Approve = await request('POST', `/api/v1/action-plans/${plan3}/approve`, {
        comment: 'Approving modified plan with Room 205.',
      });
      assert(res3Approve.status === 200, 'Approve of modified plan returns 200 OK');
      assert(res3Approve.body.data.status === 'approved', 'Plan status becomes approved');

      // --- TEST 4: MODIFY THEN REJECT ---
      console.log('\n--- TEST 4: MODIFY THEN REJECT ---');
      const plan4 = await createTestPlan('t4');
      await request('POST', `/api/v1/action-plans/${plan4}/modify`, {
        reason: 'Adjusting timeline.',
        modifications: [{ id: `item-t4-1`, priority: 'medium' }],
      });
      const res4Reject = await request('POST', `/api/v1/action-plans/${plan4}/reject`, {
        reason: 'Guest cancelled reservation before arrival.',
      });
      assert(res4Reject.status === 200, 'Rejecting a modified plan returns 200 OK');
      assert(res4Reject.body.data.status === 'rejected', 'Final status is rejected');

      // --- TEST 5: INVALID TRANSITIONS (409 CONFLICT) ---
      console.log('\n--- TEST 5: INVALID TRANSITIONS (409 CONFLICT) ---');
      // Attempt to approve an already rejected plan
      const res5RejectToApprove = await request('POST', `/api/v1/action-plans/${plan4}/approve`, {
        comment: 'Trying to approve rejected plan.',
      });
      assert(res5RejectToApprove.status === 409, 'Approving a rejected plan fails with 409 Conflict');

      // --- TEST 6: UNAUTHORIZED USER (403 FORBIDDEN) ---
      console.log('\n--- TEST 6: UNAUTHORIZED USER (403 FORBIDDEN) ---');
      const plan6 = await createTestPlan('t6');
      const res6 = await request('POST', `/api/v1/action-plans/${plan6}/approve`, {
        actor_role: 'guest_user',
      });
      assert(res6.status === 403, 'Unauthorized role returns 403 Forbidden');

      // --- TEST 7: DOUBLE APPROVAL BLOCKING (409 CONFLICT) ---
      console.log('\n--- TEST 7: DOUBLE APPROVAL BLOCKING ---');
      const res7Double = await request('POST', `/api/v1/action-plans/${plan1}/approve`, {
        comment: 'Double approval attempt.',
      });
      assert(res7Double.status === 409, 'Double approval blocked with 409 Conflict');

      // --- TEST 8: REJECTION WITHOUT REASON (400 BAD REQUEST) ---
      console.log('\n--- TEST 8: REJECTION WITHOUT REASON ---');
      const plan8 = await createTestPlan('t8');
      const res8 = await request('POST', `/api/v1/action-plans/${plan8}/reject`, {
        reason: '   ', // empty/whitespace
      });
      assert(res8.status === 400, 'Rejection without reason returns 400 Bad Request');

      // --- TEST 9: MODIFICATION AUDIT TRAIL ---
      console.log('\n--- TEST 9: MODIFICATION AUDIT TRAIL ---');
      const audit9 = await request('GET', `/api/v1/action-plans/${plan3}/audit-trail`);
      const modRecord = audit9.body.data.audit_trail.find(a => a.decision === 'modify');
      assert(!!modRecord, 'Audit trail contains modify record');
      assert(modRecord.reason.includes('Room 205'), 'Audit trail contains manager reason');
      assert(modRecord.changes.length > 0, 'Audit trail records changed items diff');

      // --- TEST 10: ACTION ITEM PROGRESSION & PLAN AUTO-STATUS ---
      console.log('\n--- TEST 10: ACTION ITEM PROGRESSION & PLAN AUTO-STATUS ---');
      const plan10 = await createTestPlan('t10');
      // Approve plan first
      await request('POST', `/api/v1/action-plans/${plan10}/approve`, { comment: 'Ready' });

      // Move item 1 to in_progress
      const res10Prog = await request('PATCH', `/api/v1/action-plans/${plan10}/items/item-t10-1/status`, {
        status: 'in_progress',
      });
      assert(res10Prog.status === 200, 'Item status update returns 200 OK');
      assert(res10Prog.body.data.item_status === 'in_progress', 'Item 1 is in_progress');
      assert(res10Prog.body.data.plan_status === 'in_progress', 'Parent plan auto-transitions to in_progress');

      // Complete item 1 and item 2
      await request('PATCH', `/api/v1/action-plans/${plan10}/items/item-t10-1/status`, { status: 'completed' });
      const res10Comp = await request('PATCH', `/api/v1/action-plans/${plan10}/items/item-t10-2/status`, {
        status: 'completed',
      });
      assert(res10Comp.body.data.plan_status === 'completed', 'Parent plan auto-transitions to completed when all items complete');

      console.log('\n==================================================');
      console.log('ALL 10 MANAGER DECISION TESTS PASSED SUCCESSFULLY!');
      console.log('==================================================\n');

      server.close(() => process.exit(0));
    } catch (err) {
      console.error('Test execution error:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();
