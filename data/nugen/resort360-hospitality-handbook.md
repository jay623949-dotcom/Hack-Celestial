# RESORT 360 — Hospitality Operations Handbook
### Domain Knowledge Document for Nugen Alignment — Base Model: Llama-V3p2-3b-Reasoning
**Document Version**: 3.0-ALIGN  
**Domain**: Luxury Resort & Hospitality Operations  
**Property**: The Grand Azure Bay Resort & Villas, Goa, India  
**Classification**: AI Domain Alignment Material

---

## A. RESORT 360 OVERVIEW

### What is Resort 360?

Resort 360 is an AI-powered operational decision and orchestration layer built specifically for luxury hospitality properties — resorts, hotels, and estate properties. It sits directly above existing hotel operational data as an intelligent coordination layer, translating isolated real-time data points from multiple departments into unified, explainable, and coordinated action plans for human managers.

Resort 360 does **not** replace existing hotel management systems. It provides the intelligence layer that those systems lack: the ability to see across departmental boundaries simultaneously, reason about competing priorities, and generate a single coordinated response plan.

### What Operational Problem Does It Solve?

Hotels and resorts operate in high-friction, real-time environments where multiple unrelated incidents frequently collide at the same moment:

- A VIP guest arrives 2 hours ahead of their scheduled check-in time.
- Their assigned suite simultaneously suffers an unexpected HVAC failure.
- The only available alternative room needs a priority clean.
- A wedding block is locking down the rest of the floor inventory.
- Revenue Management needs to protect limited Deluxe inventory from casual reassignment.

Without a coordination layer, resolving this scenario requires 5 to 10 frantic phone calls, radio calls, WhatsApp messages, and manual lookups across separate screens. By the time a decision is reached, the VIP guest has been waiting in the lobby for 20 minutes, rooms have been cleaned out of priority order, and revenue-critical inventory has been misallocated.

Resort 360 **synthesizes all operational streams simultaneously** and produces one clear, coordinated, explainable action plan for the manager to approve, modify, or reject.

### How AI Assists Managers

The AI system acts as a specialist consultant — not an autonomous executor:

1. **Context Assembly**: The system automatically collects real-time operational context from the database — room statuses, guest profiles, staff availability, active incidents, and pending tasks.
2. **Multi-Agent Analysis**: Four specialized departmental AI agents analyze the context from their domain perspective, each producing prioritized recommendations.
3. **Consensus Synthesis**: The Consensus Orchestrator reconciles conflicts between departmental recommendations and produces one unified action plan with clear reasoning.
4. **Human-in-the-Loop Approval**: The generated plan is presented to the Manager on Duty. The AI cannot execute any operational change without explicit human authorization.
5. **Task Dispatch**: Once approved, the system dispatches structured work orders to staff, tracks completion, and updates room/staff status in real time.

### Why Recommendations Require Cross-Departmental Coordination

No single department has the full operational picture:
- Front Desk sees the guest and their VIP tier, but not room repair timelines.
- Housekeeping knows room readiness, but not revenue block constraints.
- Maintenance knows repair ETAs, but not whether an alternative room is revenue-free.
- Revenue knows inventory value, but not guest satisfaction urgency.

Resort 360 combines all four views. Any recommendation that appears correct from one departmental lens may be destructive from another. The AI must reason across all four simultaneously.

---

## B. HOTEL OPERATIONAL ENTITIES

### Guest
A guest is a person with an active reservation or walk-in accommodation request. Guests vary by loyalty tier (VIP Presidential, VIP Platinum, VIP Gold, VIP Silver, Standard), which directly affects service priority, acceptable wait times, and service recovery thresholds. A guest's profile includes their name, assigned room, check-in/check-out dates, number of occupants, VIP status, and any special requests. The guest entity is the primary driver of operational urgency in Resort 360.

**Operational Significance**: VIP guest impact is the single most common escalation trigger. An unresolved incident affecting a VIP guest in the lobby generates measurable CSAT decline, potential negative reviews, and loyalty program churn.

### Room
A room is a physical accommodation unit with a unique room number, floor, category/type, occupancy status, and housekeeping status. Rooms transition through states: `available` → `occupied` → `dirty` → `cleaning` → `inspected` → `available`. Rooms can also be in `maintenance` (physically defective) or `reserved` (blocked for incoming guests).

**Operational Significance**: Room status is the core constraint for all check-in operations. A room in `maintenance` status cannot be handed over regardless of guest urgency. Room inventory is finite and finite inventory at high occupancy creates compounding pressure.

### Staff
Staff are on-duty personnel assigned to departments (Front Desk, Housekeeping, Maintenance, Revenue Management, Security). Each staff member has a current availability status: `on_duty`, `available`, `busy`, or `off_duty`. Staff capacity is the most common operational constraint during peak periods.

**Operational Significance**: Staff availability determines whether a recommended action is actually executable. Recommending an "express room clean" when no housekeepers are available is operationally meaningless.

### Department
Departments are operational units with distinct responsibilities, decision domains, and escalation thresholds. The four primary departments in Resort 360 are Front Desk, Housekeeping, Maintenance, and Revenue Management. Each department has defined scope; cross-department actions require coordination rather than unilateral decision-making.

### Incident
An incident is a documented operational disruption — a physical asset failure, guest complaint, staffing deficit, weather event, or competing operational demand. Incidents have a severity level (LOW, MEDIUM, HIGH, CRITICAL), a primary affected department, an associated room and/or guest, and a current status (open, in_progress, escalated, resolved). Incidents drive the AI analysis pipeline.

**Operational Significance**: The way incidents are triaged determines which department responds first, which resources are consumed, and how much cascading disruption occurs.

### Task
A task is a concrete, assignable work order generated from an approved action plan. Tasks have a type, description, assigned staff member, priority, estimated duration, and completion status. Tasks are the operational output of the AI recommendation pipeline.

### Action Plan
An action plan is the AI system's structured recommendation output — a coordinated set of tasks, reasoning, trade-off analysis, and escalation requirements for the Manager on Duty to review. Action plans must be approved before any task is created or dispatched.

### Manager
The Manager on Duty (MOD) is the human decision authority in Resort 360. The MOD reviews AI-generated action plans and exercises one of three options: **Approve**, **Modify**, or **Reject**. The manager's decision is logged immutably in an audit trail.

### Occupancy
Occupancy is the percentage of total rooms currently occupied or reserved. Expressed as: `(occupied_rooms / total_rooms) × 100`. Occupancy determines how much flexibility the resort has for room reassignment, upgrades, and operational trade-offs.

**Operational Significance**: At 60% occupancy, the resort can absorb most incidents with minimal disruption. At 90%+ occupancy, every room becomes critical inventory.

### VIP
A VIP guest has an active loyalty tier designation (Presidential, Platinum, Gold, or Silver) that triggers elevated service expectations, reduced acceptable wait times, and higher escalation thresholds. VIP status does not override safety — but it compresses the decision timeline.

### Revenue
Revenue in operational context means the measurable financial value of room inventory, ADR differentials between room categories, and the risk of displacing a paying future guest by misallocating a room today.

---

## C. DEPARTMENTS

### 1. Front Desk

**Core Responsibilities**: Managing guest arrivals and check-in. Identifying VIP tier and activating service protocols. Communicating room readiness to waiting guests. Initiating service recovery (lounge escort, amenity vouchers, complimentary upgrades). Coordinating room reassignment requests with Housekeeping and Revenue.

**Decisions Front Desk Makes**: Whether to offer lounge escort. Whether to propose room reassignment. What service recovery is appropriate. When to escalate to Manager.

**Dependencies**: Cannot issue room keys until Housekeeping signs off inspection. Cannot reassign rooms blocked by Revenue. Relies on Maintenance for repair ETAs.

**Escalation Conditions**: VIP waiting beyond 15 minutes without a ready room. No available alternative room. Guest requires General Manager intervention. Service recovery cost exceeds INR 5,000.

---

### 2. Housekeeping

**Core Responsibilities**: Room turnover after checkout. Express priority cleaning for VIP arrivals or urgent reassignments. Stayover refresh. Reporting room defects to Maintenance. Maintaining cleaning sequence.

**Room Cleaning Priority Order**:
1. VIP arrival alternative rooms (Express: 20-25 minutes).
2. Active room reassignment (VIP or Standard).
3. Confirmed arrivals within 1 hour.
4. General afternoon arrivals.
5. Stayover refresh.
6. Deep clean / quarterly maintenance.

**Dependencies**: Cannot clean rooms under active Maintenance lock. Inspection sign-off is prerequisite for Front Desk key issuance.

**Escalation Conditions**: Physical defect discovered during clean. Attendant count drops below minimum. Cleaning demand exceeds labor capacity by more than 25%.

---

### 3. Maintenance

**Core Responsibilities**: Diagnosing and repairing physical asset failures (HVAC, plumbing, electrical, locks). Estimating repair timelines based on technical assessment. Placing failed rooms under maintenance isolation. Coordinating temporary workarounds.

**Triage Priority When One Technician, Multiple Incidents**:
1. Safety hazards (electrical, flooding, fire-related) — always first.
2. VIP room failures during peak arrival hours.
3. Amenity-critical failures affecting many guests (pool, elevator).
4. Standard room failures for occupied guests.
5. Cosmetic repairs — defer to next shift.

**Key Rule**: Maintenance must never state a repair timeline without a technical basis. "Repair in 30 minutes" is only valid if fault type, parts availability, and no secondary fault are confirmed. If unknown: state a diagnosis window first.

**Dependencies**: Repair completion is prerequisite for returning room to inventory. Must communicate ETAs to Front Desk and Housekeeping. Safety-critical repairs cannot be split with lower-priority tasks.

---

### 4. Revenue Management

**Core Responsibilities**: Protecting room inventory from miscategorized reassignment. Evaluating financial impact of room swaps. Enforcing group reservation blocks. Adjusting OTA channel availability when rooms go offline. Flagging inventory risk.

**Occupancy Decision Thresholds**:
- < 60%: High flexibility — complimentary upgrades and early check-ins freely accommodated.
- 60-79%: Single-tier upgrades permitted. Reassigned rooms protected from same-day OTA.
- 80-89%: All reassignments cross-checked against 48-hour reservation horizon.
- 90-100%: Critical inventory. Manager approval required for any room taken offline.

**Key Rule**: Revenue cannot override Maintenance safety determinations. Revenue flags are advisory during genuine safety emergencies.

---

## D. INCIDENT SEVERITY

### CRITICAL
Requires response within 5-10 minutes. Involves immediate safety risk, major revenue threat at high occupancy, or multi-department cascade.

**Examples**: Active flooding. HVAC failure with VIP arriving in under 30 minutes and ambient temp above 32°C. Presidential Suite amenity failure. Major event venue failure.

### HIGH
Requires response within 15-30 minutes. Guest experience materially affected; safety not immediately at risk.

**Examples**: VIP room dirty on arrival with housekeeping available to expedite. Non-VIP occupied room failure with immediate alternative available. Housekeeping shortfall during peak turnover. Three concurrent maintenance calls with one technician.

### MEDIUM
Requires response within 1 hour. Standard SOP resolves without management escalation.

**Examples**: Standard room maintenance request (TV failure, safe locked). Non-urgent WhatsApp complaint. Mild housekeeping delay for non-VIP.

### LOW
Cosmetic or administrative. No immediate operational impact.

**Examples**: Minibar billing discrepancy. Decorative item damage. Non-urgent preference request.

---

### Severity Determination — Multi-Factor Reasoning

Severity is NEVER determined by a single variable. Always evaluate:

| Factor | Lower Severity | Higher Severity |
|---|---|---|
| Guest VIP Tier | Standard | Platinum/Presidential |
| Guest Location | In room, comfortable | Lobby, waiting, distressed |
| Room Condition | Uncomfortable | Unsafe |
| Occupancy | Below 70% | Above 85% |
| Alternative Options | Multiple available | None available |
| Staff Availability | Adequate | Constrained |
| Time Sensitivity | Hours | Minutes |
| Cascading Risk | Low | High (multiple rooms/guests) |

**Example**: A broken TV in a standard room at 40% occupancy is LOW. The same failure in a VIP suite on a sold-out night during a corporate retreat is MEDIUM-HIGH.

---

## E. PRIORITIZATION

When multiple incidents compete for the same resources, evaluate in this order:

1. **Physical Safety** — Always Priority 1. No other factor overrides.
2. **Immediate Guest Impact** — VIP or Standard guest actively distressed in a public area.
3. **VIP Tier Priority** — Among equal incidents, VIP tier elevates urgency.
4. **Operational Scale** — 8 rooms affected > 1 room affected (all else equal).
5. **Time Sensitivity** — Hard deadlines (VIP arriving in 15 minutes) > flexible windows.
6. **Occupancy Pressure** — At 90%+ every inventory decision is amplified.
7. **Revenue Impact** — Group block protection considered once safety and guest factors are satisfied.
8. **Resource Availability** — Recommendations must match actual available staff and resources.
9. **Cascade Prevention** — Address root causes before cascading failures multiply.

**Key Principle**: Correct priority is always the product of multiple factors evaluated together, not a single dimension.

---

## F. VIP HANDLING

### VIP Early Arrival
1. Welcome guest by name at Front Desk.
2. Immediately assess assigned room status.
3. If room not ready: escort to Private Club Lounge with complimentary beverage and personal attendant.
4. Activate express housekeeping on assigned room OR identify viable alternative if room is in maintenance.
5. Provide guest with clear, realistic room-ready time.
6. No VIP waits in the lobby beyond 10 minutes without an escorted alternative.

### VIP Room Failure
1. Assess whether defect resolves before guest arrival (if repair < 30 min and guest > 30 min away, repair may be viable).
2. If repair window exceeds guest arrival: identify best available alternative room at same or higher tier.
3. Confirm with Revenue that alternative room is not reserved.
4. Housekeeping performs express VIP refresh on alternative room.
5. Maintenance logs failed room as `maintenance` status, provides ETA.
6. Manager approval required for formal VIP room reassignment.

### VIP Escalation Triggers
- Guest waiting in public area beyond 15 minutes.
- No same-category alternative room available.
- Guest has voiced displeasure or requested management.
- Service recovery cost exceeds INR 5,000.

---

## G. ROOM FAILURE HANDLING

### HVAC Failure
- CRITICAL if temperature exceeds 30°C or VIP guest arriving imminently.
- Diagnosis SLA: 10 minutes. If repair > 30 minutes and guest arrives within 60 minutes: initiate reassignment.
- Place room in `maintenance` status, remove from OTA inventory, identify alternative.

### Plumbing Failure
- CRITICAL if active leak; HIGH if slow drain.
- Immediate water isolation valve shutoff. Guest evacuated within 5 minutes.
- Wet-vacuum extraction deployed. Guest relocated. Room in `maintenance` status.

### Room Not Ready
- HIGH for VIP arrivals; MEDIUM for Standard.
- Calculate realistic completion: standard clean 35-40 min; express tandem clean 20-25 min with 2 attendants.
- If already at property: activate lounge/pool access + F&B credit as hospitality bridge.
- Never say "room isn't ready" without simultaneously offering a comfortable waiting alternative.

### Multiple Concurrent Room Failures
- Triage all incidents by severity, guest impact, and time sensitivity before assigning any technician.
- Do not split one technician across concurrent safety-critical tasks.
- If only one technician and multiple critical incidents: escalate immediately for emergency on-call authorization.

---

## H. HOUSEKEEPING

### Express Clean Protocol (< 25 minute target)
- Deploy 2 attendants in tandem.
- Focus: bathroom sanitization, bed linen change, visible surfaces, minibar check, amenity placement.
- Defer: carpet shampooing, deep wardrobe inspection, window cleaning.
- Supervisor inspection required before releasing room to Front Desk.

### VIP Room Preparation Extras
- Tropical fruit arrangement or welcome amenity per guest preference file.
- Fresh flowers confirmed by Front Desk.
- Temperature pre-set to guest preference.
- Personal welcome card from General Manager.
- Full equipment function check (TV, AC, safe, shower) before sign-off.

### Staff Shortage Response
1. Reassess cleaning queue — deprioritize stayover refreshes.
2. Notify Front Desk immediately for check-in estimate adjustments.
3. Supervisor authorizes express protocol for all priority rooms.
4. If deficit > 30%: escalate to Manager for overtime/agency authorization.

---

## I. MAINTENANCE

### Room Isolation Protocol
A room with active defect must be placed in `maintenance` status:
- Prevents Front Desk from issuing keys.
- Removes room from OTA/PMS availability.
- Triggers Revenue to update channel availability.
- Cannot return to `available` without signed Maintenance completion record.

### Diagnosis Before Timeline
Never recommend repair timeline without technical grounding:
- Fault type must be known.
- Parts must be confirmed in-stock.
- No secondary fault indicated.
If any condition unknown: state diagnosis window first.

### Temporary Workarounds
When repair exceeds 30-minute window for guest-facing rooms:
- Portable AC unit deployment (if in inventory).
- Fan + ventilation only if outdoor temperature below 28°C.
- Guest relocation is the default workaround for any comfort-impacting failure.

---

## J. REVENUE MANAGEMENT

### Group Block Enforcement
Group reservation blocks restrict specific rooms or floors. These locks must be respected:
- Front Desk cannot reassign blocked rooms without Revenue authorization.
- Revenue must confirm block scope (exact rooms, dates) before refusing a request.
- Safety emergencies supersede blocks — but Revenue must be notified immediately.

### OTA Channel Management
When room is taken offline for maintenance:
1. Revenue removes room from all OTA channels within 15 minutes.
2. Failure creates overbooking risk.

### Revenue Conflict Resolution
If proposed alternative room is reserved for an incoming guest:
- Arrival > 24 hours: Revenue may temporarily authorize with a resolution plan.
- Arrival < 12 hours: Identify different alternative or escalate to Manager.

---

## K. GUEST COMMUNICATION

### AI Identification Protocol for Any Channel Message
When a guest message arrives (WhatsApp, Telegram, telephone):
1. Guest Identity — match to guest profile.
2. Issue Type — operational problem classification.
3. Urgency Level — safety vs. comfort vs. preference.
4. Affected Room — which physical room.
5. Required Department — which department owns the resolution.
6. Escalation Flag — does Manager need to be involved.

### Response SLAs
- Safety concerns: Dispatch within 3 minutes. Manager notified.
- VIP comfort complaints: Acknowledge within 60 seconds, physical response within 10 minutes.
- Standard complaints: Acknowledge within 2 minutes, response within 20 minutes.
- Preference requests: Acknowledge and execute within 1 hour.

---

## L. MANAGER APPROVAL

### Fundamental Principle
The AI recommends. The human manager decides. No operational change — room reassignment, task dispatch, staff reallocation — is executed without explicit Manager on Duty authorization.

### Mandatory Escalation Triggers
1. Any VIP room reassignment.
2. Any room taken offline at occupancy > 80%.
3. Service recovery compensation exceeding INR 5,000.
4. Emergency staff overtime or on-call call-in.
5. Cross-department resource reallocation from regular queue.
6. Any action with revenue displacement risk.

---

## M. EXPLAINABILITY

Every recommendation must include structured justification:

**WHAT**: Describe what is happening. Include specific room numbers, guest IDs, incident IDs.

**WHY**: Explain why this action was selected over alternatives. Include the key factors.

**IMPACT**: Quantify impact of action vs. inaction. What happens if followed? What if not?

**REQUIRED ACTIONS**: Department-by-department steps.

**DEPENDENCIES**: Which actions cannot start until another completes.

**ESCALATION**: Whether manager approval is required and specifically why.

Generic reasoning like "best practice" or "standard procedure" without specifics is unacceptable. Every recommendation must be grounded in the actual context data provided.

---

*End of Resort 360 Hospitality Operations Handbook — Version 3.0-ALIGN*  
*Prepared for Nugen Domain Alignment. Base Model: Llama-V3p2-3b-Reasoning.*
*Property: The Grand Azure Bay Resort & Villas, Goa, India.*

