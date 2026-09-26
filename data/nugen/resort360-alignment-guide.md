# Resort 360 — Nugen Domain Alignment Guide
**Base Model**: Llama-V3p2-3b-Reasoning | **Aligned Model**: resort360-hospitality-v1

## 1. Objective
Transform Llama-V3p2-3b-Reasoning into a resort operations decision-support AI that reasons correctly about multi-department hospitality incidents, applies VIP protocols, and generates structured department-specific action plans.

## 2. Domain Files
| File | Purpose |
|---|---|
| resort360-hospitality-handbook.md | Primary knowledge source |
| resort360-domain-scenarios.jsonl | 25 labeled training scenarios |
| resort360-benchmark.jsonl | 15 held-out evaluation cases |

## 3. Input Format
```json
{ "situation": "...", "incident": { "type":"...", "severity":"...", "room":"..." },
  "guest": { "vip_tier":"...", "status":"..." },
  "hotel": { "occupancy_pct": 82 }, "staff": { "maintenance_available": 1 } }
```

## 4. Expected Output Format
```json
{ "severity": "CRITICAL|HIGH|MEDIUM|LOW", "summary": "...",
  "affected_departments": [],
  "recommended_actions": [{ "department":"...", "priority":"...", "action":"...", "reason":"..." }],
  "escalation_required": true, "escalation_reason": "...",
  "explanation": { "what":"...", "why":"...", "impact":"..." } }
```

## 5. Key Behavioral Rules
1. Never generate repair timeline without technical basis — state "diagnosis required" if fault type unknown.
2. Never override safety with revenue — physical safety is always Priority 1.
3. Never recommend room reassignment without revenue clearance.
4. Always identify department-specific actions — generic responses are unacceptable.
5. Always ground escalation in a specific threshold — not just "escalation required."
6. Always acknowledge staff constraints — recommendations must be feasible with stated staff.
7. VIP tier protocols are mandatory without explicit prompting.
8. Manager approval is mandatory — AI never implies it executes directly.

## 6. Validation Benchmarks
Pass criteria for aligned model:
- Severity classification: ≥90%
- Escalation flag: ≥90%
- Correct primary department: ≥85%
- Context-specific explanation: ≥80%
- No safety-overridden-by-revenue errors: 100%

## 7. Integration Path
```
Resort 360 Backend → AIService.callNugenAligned()
  → resort360-hospitality-v1 (Nugen Endpoint)
  → Structured JSON → 4 Departmental Agents
  → Consensus Orchestrator → Manager Approval → Task Dispatch
```
