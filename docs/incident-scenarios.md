# RESORT 360 — Operational Incident Scenarios

> **SINGLE SOURCE OF TRUTH (OPERATIONAL BENCHMARKS & TEST SCENARIOS)**  
> **Location**: `/docs/incident-scenarios.md`

---

## 1. Overview
Resort operations do not fail because teams lack data; they fail because multiple independent incidents collide, forcing staff into uncoordinated trade-offs. The 6 operational scenarios below define the benchmarks that Resort 360’s operational context and future AI agents will reason over.

---

## 2. Scenario Catalog

### Scenario 001: VIP Early Arrival + Room Breakdown (The Killer Demo)
- **Scenario ID**: `SCENARIO-001`
- **Trigger**: At 10:40 AM, Diamond VIP Alexander Vance arrives at the front desk 20 minutes before his scheduled check-in time. Concurrently, Housekeeping reports that Room 401 has an HVAC compressor breakdown.
- **Initial Conditions**:
  - Assigned Suite 401 has an ambient temperature of 82°F (28°C).
  - Alternative Suite 505 was vacated at 10:15 AM and is currently marked `DIRTY`.
  - Floor 4 (Rooms 402–415) is locked for a 50-person wedding party arriving at 2:00 PM.
  - Housekeeping staff is busy finishing scheduled morning cleans on Floor 3.
- **Departments Affected**: Front Desk, Housekeeping, Maintenance, Revenue.
- **Guests Affected**: Alexander Vance (`guest-001`, Diamond VIP).
- **Rooms Affected**: Room 401 (broken AC), Room 505 (unreserved dirty suite).
- **Staff Affected**: Sarah Jenkins (Front Desk), Maria Santos & Elena Gomez (Housekeeping), Bob Miller (Chief HVAC Tech).
- **Operational Constraints**:
  - Diamond VIP maximum acceptable lobby wait time: 10 minutes.
  - Room 401 HVAC capacitor replacement ETA: 75 minutes.
  - Suite 505 express turnover time: 25 minutes (requires 2 attendants).
  - Rooms 402–415 cannot be reallocated due to wedding block lock.
- **Relevant Data**:
  - Room 505 is unreserved until tomorrow 3:00 PM ($0 revenue cannibalization).
- **Possible Actions**:
  1. Make VIP wait 75 minutes in lobby while Room 401 is repaired (*Unacceptable CSAT drop*).
  2. Downgrade VIP to a Standard Deluxe room (*High service recovery penalty*).
  3. Reassign VIP to Suite 505, divert 2 attendants for 25-minute express clean, escort guest to Executive Lounge with beverage credit, and dispatch technician to 401 (*Optimal*).
- **Risks**: Diverting housekeepers slightly delays routine clean on Room 105.
- **Expected Agent Perspectives**:
  - *Front Desk*: Escort VIP to lounge immediately; deliver signature drink.
  - *Housekeeping*: Reassign Maria and Elena to Suite 505 for 25m express clean.
  - *Maintenance*: Take Room 401 offline; dispatch Bob with 45uF capacitor.
  - *Revenue*: Approve Suite 505 reassignment ($0 displacement); protect Floor 4 block.
- **Human Decision Required**: Duty Manager approves Suite 505 reassignment and staff work order dispatch.

---

### Scenario 002: Room HVAC Failure in Occupied Guest Suite
- **Scenario ID**: `SCENARIO-002`
- **Trigger**: In-house guest in Suite 304 calls Front Desk reporting complete AC failure and rattling noise at 2:15 PM during 90°F outdoor weather.
- **Initial Conditions**:
  - Room 304 occupied by Gold VIP Jonathan Hastings attending an executive conference.
  - Engineering backlog has 3 routine maintenance tickets.
- **Departments Affected**: Maintenance, Front Desk, Housekeeping.
- **Guests Affected**: Jonathan Hastings (`guest-005`, Gold VIP).
- **Rooms Affected**: Room 304, Room 303 (adjacent inspected Executive Suite).
- **Staff Affected**: Bob Miller (HVAC), Priya Patel (VIP Concierge).
- **Operational Constraints**:
  - In-room temperature rising rapidly; repairs taking > 30 minutes require immediate guest relocation.
  - Technician must inspect within 15 minutes to assess compressor vs thermostat fault.
- **Relevant Data**:
  - Room 303 is vacant, inspected, and identical in tier.
- **Possible Actions**:
  1. Keep guest in room while technician dismantles unit (*Poor guest experience*).
  2. Offer immediate room swap to identical adjacent Suite 303; transfer luggage seamlessly; repair 304 without time pressure.
- **Risks**: Guest inconvenience during key and baggage transfer.
- **Expected Agent Perspectives**:
  - *Front Desk*: Proactively offer keycard swap to Room 303 and conference dining credit.
  - *Maintenance*: Triage HVAC in Room 304 once room is vacated.
  - *Housekeeping*: Inspect luggage transit between 304 and 303.
- **Human Decision Required**: Duty Manager authorizes key packet creation and room swap.

---

### Scenario 003: Housekeeping Turnaround Bottleneck During Peak Turnover
- **Scenario ID**: `SCENARIO-003`
- **Trigger**: 12 unexpected late checkouts occur between 11:30 AM and 12:00 PM, while 10 new arrivals are scheduled between 1:00 PM and 2:30 PM.
- **Initial Conditions**:
  - Only 4 housekeeping attendants on duty across 3 floors.
  - Standard clean time is 40 minutes per room; total required cleaning labor is 8 hours with only 6 labor-hours available before check-in peak.
- **Departments Affected**: Housekeeping, Front Desk, Revenue.
- **Guests Affected**: Inbound afternoon arrivals.
- **Rooms Affected**: Rooms 101, 102, 104, 105, 201, 203, 204.
- **Staff Affected**: Kenji Sato (Housekeeping Supervisor), Attendants Maria & Elena.
- **Operational Constraints**:
  - Inbound VIP guests must have ready rooms before non-loyalty arrivals.
  - Deep sanitation standards cannot be compromised.
- **Relevant Data**:
  - Flight delays push 3 arrivals back to 4:30 PM, reducing immediate pressure.
- **Possible Actions**:
  1. Clean rooms in arbitrary numerical order 101 $\rightarrow$ 204 (*Causes VIP check-in wait*).
  2. Dynamically re-sequence clean orders matching flight arrival times: clean VIP arrivals first, followed by early arrivals, holding delayed arrivals for 3:00 PM.
- **Risks**: Housekeepers traverse between floors instead of cleaning strictly along one corridor.
- **Expected Agent Perspectives**:
  - *Front Desk*: Surface arrival times and flight tracking for inbound guests.
  - *Housekeeping*: Re-order attendant clean board based on arrival urgency.
  - *Revenue*: Monitor late arrival guarantees.
- **Human Decision Required**: Supervisor authorizes dynamic re-sequencing of cleaning routes.

---

### Scenario 004: Large Group / Wedding Arrival (50 Guests)
- **Scenario ID**: `SCENARIO-004`
- **Trigger**: A 50-person destination wedding block arrives by private motorcoach at 1:45 PM (15 minutes ahead of schedule) on Floor 4.
- **Initial Conditions**:
  - Rooms 402, 403, and 404 require final lock check and welcome packet staging.
  - Lobby has high transient guest volume.
- **Departments Affected**: Front Desk, Revenue, Maintenance, Guest Services.
- **Guests Affected**: Wedding party group (50 guests).
- **Rooms Affected**: Rooms 402, 403, 404, 405–415.
- **Staff Affected**: Sarah Jenkins (Front Desk), Chloe Bennett (Revenue).
- **Operational Constraints**:
  - Bus arrival causes immediate front desk queue congestion if processed individually.
  - Group contracts mandate pre-printed keys and luggage delivery to rooms within 20 minutes.
- **Relevant Data**:
  - Pre-registration completed online for 85% of party.
- **Possible Actions**:
  1. Funnel all 50 guests into standard reception line (*Lobby chaos*).
  2. Activate satellite check-in at Garden Terrace; distribute pre-encoded digital key packets with welcome flute; route luggage directly via service elevator.
- **Risks**: Room lock failure on Room 404 could delay family members.
- **Expected Agent Perspectives**:
  - *Revenue*: Ensure block rate compliance and banquet voucher activation.
  - *Front Desk*: Direct motorcoach to private terrace; dispatch satellite check-in desks.
  - *Maintenance*: Verify Room 404 lock latch before group arrives at door.
- **Human Decision Required**: Front Desk Manager approves opening satellite terrace reception.

---

### Scenario 005: Guest Noise Complaint Under Heavy Staff Load
- **Scenario ID**: `SCENARIO-005`
- **Trigger**: Guest in Room 203 calls at 10:15 PM reporting violent rattling noise from an adjacent service pump room.
- **Initial Conditions**:
  - Night engineering staff has only 1 duty technician on property.
  - Hotel is at 95% occupancy.
- **Departments Affected**: Maintenance, Front Desk, Security.
- **Guests Affected**: Marcus Sterling (`guest-003`).
- **Rooms Affected**: Room 203, Mechanical Riser 2.
- **Staff Affected**: Night Engineer Lucas Rossi.
- **Operational Constraints**:
  - Noise exceeds 65dB in guest bedroom; sleep disturbance will trigger chargeback or public negative review.
  - Technician is currently responding to a kitchen walk-in freezer alarm.
- **Relevant Data**:
  - Room 205 is clean and unassigned on the quiet garden wing.
- **Possible Actions**:
  1. Tell guest technician is busy and will inspect in 1 hour (*Guaranteed escalations*).
  2. Immediately offer room move to quiet Suite 205 with porter assistance; dispatch engineer to silence pump after kitchen safety check.
- **Risks**: Late night move disrupts guest resting state.
- **Expected Agent Perspectives**:
  - *Front Desk*: Prioritize quiet room relocation; log folio recovery credit.
  - *Maintenance*: Assess if pump can be temporarily switched to secondary silent circuit.
- **Human Decision Required**: Night Manager approves immediate room move and service recovery amenity.

---

### Scenario 006: Multiple Simultaneous Incidents (The Ultimate Operational Test)
- **Scenario ID**: `SCENARIO-006`
- **Trigger**: At 10:45 AM, three separate operational disruptions occur simultaneously:
  1. Room 401 HVAC failure with VIP Vance in lobby.
  2. Water booster pump pressure drops in Building B impacting 4 rooms.
  3. Kitchen reports express cleanup needed in Banquet Hall before 11:30 AM lunch.
- **Initial Conditions**:
  - Multiple departments compete for the same maintenance technicians and cleaning personnel.
- **Departments Affected**: Front Desk, Housekeeping, Maintenance, Revenue.
- **Guests Affected**: VIP Vance (`guest-001`), Building B in-house guests.
- **Rooms Affected**: Suite 401, Building B suites (101–104).
- **Staff Affected**: All on-duty staff.
- **Operational Constraints**:
  - Maintenance cannot address both HVAC 401 and Booster Pump B with only 1 HVAC technician.
  - Front Desk cannot predict guest room readiness without cross-departmental coordination.
- **Why Resort 360 Exists**:
  - Front Desk only sees the VIP.
  - Engineering only sees the pump telemetry.
  - Housekeeping only sees dirty rooms.
  - **Resort 360 synthesizes all 3 streams**: It assigns Tech Bob to 401, Tech Derrick to Pump B, moves VIP to 505 with express cleaners Maria and Elena, and schedules Banquet cleanup after express clean completion.
- **Human Decision Required**: General Manager approves global coordinated triage plan.
