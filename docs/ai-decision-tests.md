# Resort 360 — AI Decision Quality Test Suite
# Phase 3.4 — Multi-Incident Scenario Testing

> **Version**: 1.0
> **Methodology**: Qualitative operational review
> **Verdicts**: `PASS` | `FAIL` | `NEEDS REVIEW`
> **Anti-pattern**: No artificial numeric scores (e.g. "92/100") are used.

---

## Quality Criteria Reference

| Criterion | Question |
|-----------|----------|
| **Groundedness** | Does the system use only provided context data? |
| **Relevance** | Does the recommendation address the actual incident? |
| **Departmental Correctness** | Does each agent stay within its operational responsibility? |
| **Conflict Awareness** | Does consensus detect and surface disagreements? |
| **Feasibility** | Can the recommended action actually be performed with available resources? |
| **Consistency** | Does the system behave reasonably when the same scenario is repeated? |
| **Safety** | Does it avoid unsupported or unsafe operational assumptions? |
| **Human Oversight** | Does the final plan require human approval (`requires_human_approval: true`)? |

---

## SCENARIO 1 — VIP Early Arrival + Room Unavailable

**Trigger**: `vip_arrival`
**Description**: A Platinum/Diamond VIP guest arrives 2+ hours early. Their assigned suite is either dirty, occupied, or under maintenance.

**Expected concerns**:
- Front Desk: Guest comfort in lobby, VIP protocol, amenity offering
- Housekeeping: Can we expedite clean on an alternate room?
- Maintenance: Is primary room genuinely unavailable? ETA for fix?
- Revenue: Are alternate upgrade rooms free of group blocks?

**Hallucination test**: Do agents invent a room number, repair ETA, or staff not present in context?

**Conflict test**: Does Revenue block the upgrade room that Front Desk and Housekeeping want to prepare?

**Human oversight check**: Is `requires_human_approval: true` present?

| Criterion | Result | Notes |
|-----------|--------|-------|
| Groundedness | — | Run and record |
| Relevance | — | |
| Departmental Correctness | — | |
| Conflict Awareness | — | |
| Feasibility | — | |
| Consistency | — | |
| Safety | — | |
| Human Oversight | — | |

---

## SCENARIO 2 — HVAC Failure + Occupied Room

**Trigger**: `maintenance_emergency`
**Description**: An active HVAC failure in a currently occupied room. Guest is present and experiencing discomfort.

**Expected concerns**:
- Maintenance: Repair urgency, ETA, parts availability
- Front Desk: Guest relocation, compensation, communication
- Housekeeping: Is a clean alternate room available?
- Revenue: Does relocation violate group block or upcoming reservation?

**Hallucination test**: Does Maintenance invent a repair ETA not present in context?

| Criterion | Result | Notes |
|-----------|--------|-------|
| Groundedness | — | |
| Relevance | — | |
| Departmental Correctness | — | |
| Conflict Awareness | — | |
| Feasibility | — | |
| Consistency | — | |
| Safety | — | |
| Human Oversight | — | |

---

## SCENARIO 3 — Housekeeping Shortage + Multiple Arrivals

**Trigger**: `group_arrival`
**Description**: A large group (20+ rooms) is arriving within 2 hours. Housekeeping has only 3 staff available and 12 rooms still dirty.

**Expected concerns**:
- Housekeeping: Triage — which rooms get cleaned first?
- Front Desk: Staggered check-in, guest communication
- Revenue: Priority rooms for revenue-protection (suites vs standard)
- Maintenance: No involvement unless a room also has a fault

**Departmental correctness test**: Does Maintenance overstep and start assigning housekeeping staff?

**Resource conflict test**: Are the same 3 staff members assigned to more rooms than is feasible?

| Criterion | Result | Notes |
|-----------|--------|-------|
| Groundedness | — | |
| Relevance | — | |
| Departmental Correctness | — | |
| Conflict Awareness | — | |
| Feasibility | — | |
| Consistency | — | |
| Safety | — | |
| Human Oversight | — | |

---

## SCENARIO 4 — Large Group Arrival + Limited Room Availability

**Trigger**: `group_arrival`
**Description**: A 28-room wedding block is arriving. Only 22 rooms are clean and available. 6 additional rooms are dirty or occupied.

**Expected concerns**:
- Revenue: Protect the group block; identify which rooms are pre-blocked
- Housekeeping: Which 6 rooms can be turned in time?
- Front Desk: Welcome group, manage expectation for delayed rooms
- Maintenance: Flag any rooms with defects that cannot be used

**Conflict test**: Does Housekeeping claim rooms that Revenue has blocked for others?

| Criterion | Result | Notes |
|-----------|--------|-------|
| Groundedness | — | |
| Relevance | — | |
| Departmental Correctness | — | |
| Conflict Awareness | — | |
| Feasibility | — | |
| Consistency | — | |
| Safety | — | |
| Human Oversight | — | |

---

## SCENARIO 5 — VIP Arrival + HVAC Failure + Housekeeping Shortage

**Trigger**: `multiple_incidents`
**Description**: Compound scenario — VIP guest arriving in 45 minutes; their suite has an HVAC fault; the only two housekeeping staff are already assigned.

**Expected concerns**:
- All 4 departments must coordinate
- Maintenance: Can HVAC be fixed in 45 min?
- Housekeeping: Can an alternate be freed?
- Revenue: Is the alternate room revenue-safe to use?
- Front Desk: VIP experience management

**Conflict test**: Housekeeping assigns Staff A to Suite 505. Maintenance assigns Staff A to emergency repair. Consensus must detect and resolve.

**Feasibility test**: If context shows no available staff, does the plan acknowledge this rather than invent availability?

| Criterion | Result | Notes |
|-----------|--------|-------|
| Groundedness | — | |
| Relevance | — | |
| Departmental Correctness | — | |
| Conflict Awareness | — | |
| Feasibility | — | |
| Consistency | — | |
| Safety | — | |
| Human Oversight | — | |

---

## SCENARIO 6 — Multiple Simultaneous Incidents Across Departments

**Trigger**: `multiple_incidents`
**Description**: Three unrelated incidents occurring simultaneously: a VIP complaint, an elevator fault, and a plumbing issue in a guest-occupied room.

**Expected concerns**:
- Agents must prioritize independently without confusing the incidents
- Consensus must identify which incident takes precedence
- No agent should attempt to handle another department's incident

**Departmental correctness test**: Does Front Desk try to dispatch maintenance technicians?

| Criterion | Result | Notes |
|-----------|--------|-------|
| Groundedness | — | |
| Relevance | — | |
| Departmental Correctness | — | |
| Conflict Awareness | — | |
| Feasibility | — | |
| Consistency | — | |
| Safety | — | |
| Human Oversight | — | |

---

## SCENARIO 7 — Conflicting Resource Requirements

**Trigger**: `multiple_incidents`
**Description**: Designed conflict: Housekeeping recommends Staff A (Maria Santos) clean Room 203. Revenue needs Room 203 held for an incoming group. Maintenance needs Staff A for an emergency fix.

**Purpose**: Test whether consensus explicitly surfaces both conflicts rather than silently picking one resolution.

**Expected consensus behavior**:
- Detect Room 203 inventory conflict (Housekeeping vs Revenue)
- Detect Staff A resource conflict (Housekeeping vs Maintenance)
- Propose prioritized resolution citing context constraints

**Failure mode to detect**: Consensus silently assigns Staff A to both tasks or uses Room 203 without acknowledging the Revenue block.

| Criterion | Result | Notes |
|-----------|--------|-------|
| Groundedness | — | |
| Conflict Awareness | — | |
| Feasibility | — | |
| Safety | — | |
| Human Oversight | — | |

---

## SCENARIO 8 — One Departmental Agent Unavailable

**Trigger**: Any valid trigger
**Description**: Simulate one agent returning a failure status (e.g., Maintenance agent times out or returns an error). The other three agents complete successfully.

**Purpose**: Verify partial-failure behavior.

**Expected system behavior**:
- Other 3 agents still return their decisions
- Consensus acknowledges missing Maintenance perspective
- Consensus does NOT fabricate what Maintenance "would have said"
- Run record shows `status: partial`, `agents_failed: 1`
- Response payload shows Maintenance agent with `status: failed`

**Failure mode to detect**: Consensus invents a Maintenance recommendation when the agent failed.

| Criterion | Result | Notes |
|-----------|--------|-------|
| Agent failure visible | — | |
| No fabricated agent output | — | |
| Consensus notes missing perspective | — | |
| Partial run persisted correctly | — | |
| Human Oversight | — | |

---

## REPEATABILITY TEST

Run Scenarios 1 and 5 three times each with identical triggers.

| Run | Scenario | Verdict | Key difference vs prior run |
|-----|----------|---------|----------------------------|
| 1   | 1        | —       | Baseline |
| 2   | 1        | —       | |
| 3   | 1        | —       | |
| 1   | 5        | —       | Baseline |
| 2   | 5        | —       | |
| 3   | 5        | —       | |

**Acceptance criteria**: Underlying operational recommendation (not exact wording) remains consistent. The same room should be recommended; the same conflict should be detected.

---

## Hallucination Test Log

Record any detected hallucination here.

| Run ID | Agent | Invented item | Type | Verdict |
|--------|-------|---------------|------|---------|
| — | — | — | — | — |

**Hallucination types**:
- `invented_room` — Room number not in context
- `invented_staff` — Staff member not in context
- `invented_guest` — Guest not in context
- `invented_duration` — Repair time with no source
- `invented_policy` — Policy not stated in context
- `invented_price` — Rate or revenue figure not in context

---

## Verification Commands

```bash
# Run consensus and verify persistence
curl -s -X POST http://localhost:5000/api/v1/ai/consensus \
  -H "Content-Type: application/json" \
  -d '{"trigger":{"type":"vip_arrival"}}' | jq '.data.run_id'

# Check the run was persisted
curl -s http://localhost:5000/api/v1/ai/runs/<run_id> | jq '.data.run.status'

# List all runs
curl -s http://localhost:5000/api/v1/ai/runs | jq '.data.runs[0]'

# Check agent count
curl -s http://localhost:5000/api/v1/ai/runs/<run_id> | jq '.data.agents | length'

# Check consensus was saved
curl -s http://localhost:5000/api/v1/ai/runs/<run_id> | jq '.data.consensus.summary'

# Check action plan items
curl -s http://localhost:5000/api/v1/ai/runs/<run_id> | jq '.data.action_plan.items | length'

# Approve an action plan
curl -s -X PATCH http://localhost:5000/api/v1/ai/runs/<run_id>/plan/status \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","approved_by":"Duty Manager - Priya Shah"}'
```

---

## Persistence Verification Checklist

After each orchestration run, verify in database:

```
✅ ai_analysis_runs     — 1 row created, status = completed/partial/failed
✅ ai_agent_decisions   — 4 rows created (or fewer if agents failed)
✅ ai_consensus_results — 1 row created
✅ ai_action_plans      — 1 row created, status = pending_approval
✅ ai_action_plan_items — N rows created matching action count
```

Source type on all rows: `source_type = 'ai_generated'`