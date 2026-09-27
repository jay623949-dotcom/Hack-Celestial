# Resort 360 — Nugen Intelligence Integration & Model Alignment Guide

## 1. What Nugen Does in Resort 360
**Nugen Intelligence** (https://docs.nugen.in) provides the specialized, domain-aligned artificial intelligence foundation for Resort 360. 

Rather than relying on generic, off-the-shelf foundation models that lack hospitality domain reasoning, Resort 360 leverages Nugen's **Domain-Aligned AI™** platform. Nugen aligns a base model (such as `qwen-v2p5-0p5b-instruct`) using our curated luxury resort operational corpus, producing a dedicated domain model:
`resort360-hospitality-v1`.

### Core Capabilities Powered by Nugen:
- **High-Stakes Operational Triage**: Rapidly evaluates concurrent incidents, assessing structural severity vs guest impact.
- **Cross-Departmental Arbitration**: Understands trade-offs between Front Desk guest satisfaction, Housekeeping turnover capacity, Engineering repair windows, and Revenue yield protection.
- **Calibrated Confidence Scoring**: Surfaces Nugen's native `confidence_score` (0–100) on every decision, providing transparency for manager governance.
- **Strict Structured Decision Output**: Outputs machine-validated JSON enforcing operational dependencies and escalation boundaries.

---

## 2. Why We Use Nugen
General-purpose LLMs exhibit critical deficiencies when deployed in luxury resort management:
1. **Hallucinated Readiness**: Generic models often propose seating incoming guests before maintenance has logged root-cause clearance.
2. **Context Window Saturation**: Sending full raw property databases exhausts token windows and produces generic chatbot fluff.
3. **Lack of Calibrated Confidence**: Generic APIs do not provide domain uncertainty metrics, making automated arbitration unsafe.
4. **Failure to Respect Human-in-the-Loop Boundaries**: General models attempt to make executive decisions rather than structuring options for human manager authorization.

**Nugen's Train-Time and Inference-Time Alignment** solves this by embedding Resort 360 SOPs, VIP tiers, and failure recovery protocols directly into the model weights and inference trajectory.

---

## 3. Where Nugen Sits in the Architecture
Nugen operates as the **Domain Intelligence Layer** between the raw database context and the departmental agent swarm:

```
                            RESORT 360
                                 │
                                 ↓
                          Hotel Database
                      (Rooms, Guests, Staff,
                      Incidents, Active Tasks)
                                 │
                                 ↓
                         AI Context Builder
                    (Compact Canonical Context)
                                 │
                                 ↓
                   =============================
                   NUGEN DOMAIN-ALIGNED MODEL
                   (resort360-hospitality-v1)
                   POST /api/v3/inference/chat
                   =============================
                                 │
                                 ↓
                      Structured Domain Output
                     (Severity, Impact, Actions,
                    Dependencies, Confidence Score)
                                 │
                   ┌─────────────┼─────────────┐
                   ↓             ↓             ↓
               Front Desk   Housekeeping  Maintenance
                 Agent         Agent         Agent
                   ↓             ↓             ↓
                   └─────────────┼─────────────┘
                                 ↓
                         CONSENSUS ENGINE
                  (Arbitration & Action Planning)
                                 │
                                 ↓
                      OPERATIONAL DECISION
                        MANAGER CONSOLE
                  [ APPROVE ] [ MODIFY ] [ REJECT ]
                                 │
                                 ↓
                          EXECUTION ENGINE
                    (Dispatches Discrete Tasks to
                      Staff & Room Telemetry)
```

Nugen is genuinely invoked at runtime to evaluate operational context before departmental consensus synthesis.

---

## 4. Alignment & Customization Workflow
The official Nugen alignment pipeline implemented in Resort 360 follows the complete lifecycle documented at [docs.nugen.in](https://docs.nugen.in):

```
Base Model (e.g. qwen-v2p5-0p5b-instruct)
                 ↓
1. Upload Domain Documents (POST /api/v3/documents/create)
                 ↓
2. Document Status Verification (GET /api/v3/documents/{id}/status)
                 ↓
3. Create Alignment Project (POST /api/v3/alignment-projects/create)
                 ↓
4. Status Tracking (GET /api/v3/alignment-projects/{id}/status)
                 ↓
5. Aligned Model Ready (GET /api/v3/models/aligned)
                 ↓
6. Model Deployment (POST /api/v3/models/{id}/deployment)
                 ↓
7. Real-Time Inference (POST /api/v3/inference/chat/completions)
```

To run this pipeline automatically:
```bash
node scripts/setup-nugen-alignment.js
```

---

## 5. Dataset Structure
The domain alignment corpus is located in `/data/nugen/`:
- `resort360-operations-handbook.txt`:
  Plain text operational standard operating procedures (SOPs) formatted for direct upload to Nugen Document API (`POST /api/v3/documents/create`). Details VIP tier protocols, HVAC failure mitigation, room turnover sequencing, and manager escalation boundaries.
- `resort360-alignment-scenarios.jsonl`:
  25 high-fidelity operational scenarios teaching multi-departmental reasoning. Each entry includes:
  - `situation` & `context` (incident, guest, hotel occupancy, staff, room state, external signals)
  - `output` (incident_id, severity, summary, affected_departments, impact, recommended_actions, dependencies, escalation_required, escalation_reason, explanation, confidence_score)

---

## 6. Model Lifecycle
1. **Base Model Selection**:
   Discovered via `GET /api/v3/models/base`. Resort 360 targets alignment-ready base models (e.g. `qwen-v2p5-0p5b-instruct`).
2. **Train-Time Adaptation**:
   Nugen creates domain adapters through supervised and reinforcement stages on the uploaded corpus.
3. **Deployment**:
   Model is deployed via `POST /api/v3/models/{model_id}/deployment`.
4. **Inference**:
   The deployed model ID (`resort360-hospitality-v1` or `model_01kmqm4nrn9fw6r`) is queried via `POST /api/v3/inference/chat/completions`.

---

## 7. Inference Flow & Request/Response Specification
- **Endpoint**: `https://api.nugen.in/api/v3/inference/chat/completions`
- **Headers**:
  ```http
  Authorization: Bearer <NUGEN_API_KEY>
  Content-Type: application/json
  ```
- **Request Payload**:
  ```json
  {
    "model": "resort360-hospitality-v1",
    "messages": [
      { "role": "system", "content": "You are the Resort 360 Domain-Aligned Hospitality Intelligence Engine..." },
      { "role": "user", "content": "Analyze the following resort operational context: {...}" }
    ],
    "temperature": 0.2,
    "max_tokens": 1200
  }
  ```
- **Response Structure**:
  ```json
  {
    "id": "nugen-resp-401ac",
    "object": "chat.completion",
    "model": "resort360-hospitality-v1",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "{\n  \"incident_id\": \"INC-401-AC\",\n  \"severity\": \"CRITICAL\",\n  \"summary\": \"...\",\n  \"affected_departments\": [\"front_desk\", \"maintenance\", \"housekeeping\", \"revenue\"],\n  \"impact\": [...],\n  \"recommended_actions\": [...],\n  \"dependencies\": [...],\n  \"escalation_required\": true,\n  \"explanation\": { ... }\n}"
        },
        "finish_reason": "stop"
      }
    ],
    "confidence_score": 96.2,
    "usage": { "prompt_tokens": 420, "completion_tokens": 280, "total_tokens": 700 }
  }
  ```

---

## 8. Environment Variables
Add to `backend/.env`:
```env
# AI Model Universal Adapter
AI_PROVIDER=nugen

# Nugen Intelligence Platform Configuration
NUGEN_API_KEY=your_nugen_api_key_here
NUGEN_BASE_URL=https://api.nugen.in
NUGEN_MODEL_ID=resort360-hospitality-v1
NUGEN_ALIGNMENT_ID=alignment_01k4x9m2p7q3r8c1
NUGEN_DEPLOYMENT_ID=deployment_01k4x9m2p7q3r9d2
```

---

## 9. API & Service Architecture
Implemented cleanly in Node.js / Express:
- `backend/src/services/nugen/nugenSchemas.js`: Strict Ajv JSON schema validation.
- `backend/src/services/nugen/nugenAlignmentService.js`: Official Nugen alignment API client (upload, create project, poll status, deploy).
- `backend/src/services/nugen/nugenInferenceService.js`: Runtime inference client with calibrated confidence score parsing and schema normalization.
- `backend/src/services/nugen/nugenService.js`: Unified service façade.
- `backend/src/routes/ai.routes.js`: Exposes `POST /api/v1/ai/nugen/analyze` and `GET /api/v1/ai/nugen/status`.
- `backend/src/controllers/ai.controller.js`: Controller endpoints with HTTP error normalization.

---

## 10. Demo Scenario: VIP Early Arrival + Room 401 AC Failure
The live demonstration scenario tells the complete end-to-end story:
1. **The Situation**:
   - VIP guest **Arjun Mehta** arrives 2 hours early (14:00).
   - Assigned Suite 401 has an active AC compressor failure (ambient temperature 29°C).
   - Hotel is operating at **82% occupancy** with constrained housekeeping capacity.
2. **Nugen Domain Analysis**:
   - Classifies incident as **CRITICAL**.
   - Determines in-situ repair window (>45 mins) violates VIP arrival wait-time SLA.
   - Recommends immediate guest escort to Private Club Lounge with welcome beverage.
   - Designates pre-inspected Deluxe Room 205 for reassignment.
   - Assigns technician Rohan Mehta to diagnose Room 401 compressor breaker.
   - Returns **96.2% domain confidence score**.
3. **Departmental & Consensus Convergence**:
   - Front Desk, Housekeeping, Maintenance, and Revenue agents align on the plan.
4. **Manager Decision**:
   - Manager reviews the proposal in the **Operational Decision Review** console (`/dashboard/consensus`).
   - Manager clicks **Approve**.
5. **Execution**:
   - Tasks are dispatched in real-time to staff devices and the room status board.

---

## 11. How to Run Nugen Inference
### Via REST API:
```bash
curl -X POST http://localhost:5000/api/v1/ai/nugen/analyze \
  -H "Content-Type: application/json" \
  -d '{"trigger": {"type": "vip_early_arrival", "incident_id": "INC-401-AC"}}'
```

### Via Backend Node.js Service:
```javascript
const nugenService = require('./src/services/nugen/nugenService');
const decision = await nugenService.analyzeOperationalIncident(canonicalContext);
console.log(decision.confidence_score, decision.summary);
```

### Via Frontend Client:
```javascript
import { analyzeWithNugen } from '@/lib/api';
const res = await analyzeWithNugen({ trigger: { type: 'vip_early_arrival' } });
```

---

## 12. How to Verify That the Aligned Model Is Being Used
1. Inspect the response payload:
   - `provider`: `"nugen"`
   - `aligned_model_id`: `"resort360-hospitality-v1"`
   - `confidence_score`: `96.2` (only returned by Nugen domain-aligned inference)
2. View the **Decision Console** (`http://localhost:3000/dashboard/consensus`):
   - The **Nugen Domain-Aligned AI** badge is displayed prominently with live confidence indicator, model identifier, and structured operational reasoning breakdown.
3. Check backend terminal logs:
   ```
   [OrchestratorService] Invoking Nugen Domain-Aligned Hospitality Intelligence...
   [NUGEN] Starting domain inference for incident: INC-401-AC (Model: resort360-hospitality-v1)
   [NUGEN] Domain response validated successfully against strict schema.
   [OrchestratorService] Nugen domain analysis completed (Confidence: 96.2%, Model: resort360-hospitality-v1)
   ```

---

## 13. Error & Fallback Handling
Resort 360 is built with mission-critical enterprise resilience:
- **Missing API Key / Offline Mode**:
  If `NUGEN_API_KEY` is not set or the cloud endpoint is unreachable, the service does **NOT crash**. It logs:
  `[NUGEN] NUGEN_API_KEY not configured. Utilizing deterministic domain-aligned intelligence ruleset.`
  It delivers a fully compliant, high-confidence domain decision derived directly from the alignment scenarios, allowing live presentations and offline testing without disruption.
- **Malformed Model Output**:
  If a model response fails schema validation, the system falls back to a deterministic safe operational contingency plan and alerts the manager console.
- **Strict Human Approval Enforcement**:
  `requires_human_approval` is permanently locked to `true`. Nugen recommendations can never bypass manager review or auto-execute without explicit authorization.
