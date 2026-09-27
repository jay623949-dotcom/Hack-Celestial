# Resort 360 — Weather Digital Twin & Nugen Domain Intelligence (Phase 11)

## 1. Problem Statement
Hospitality properties are open thermodynamic and logistical systems highly vulnerable to microclimate and meteorological disruptions. Unpredicted or poorly anticipated weather changes (monsoons, high-intensity rain bursts, gale squalls, extreme heat) cause operational friction:
- Inbound travel disruptions delay guest check-ins, causing subsequent **arrival clustering** at the Front Desk.
- Heavy rainfall drives guests indoors, collapsing beach/pool activity while overloading indoor dining, spas, and lounges.
- Sudden shifts create compressed room turnover bottlenecks for Housekeeping.
- Thermal spikes overload HVAC compressors, triggering hardware faults (e.g. Room 401 compressor capacitor lockouts).
- Outdoor inventory (beach cabanas, open-air suites) demand evaporates, while indoor suites command premium protection.

Traditional hotel software displays static weather widgets that operate in isolation from operational workflows. Resort 360 Phase 11 bridges this gap with an **AI-driven Weather Digital Twin** integrated with a **Nugen-aligned domain model**.

---

## 2. Architectural Principle
The Weather Digital Twin is **not** a disconnected demo or external weather site. It acts as an environmental intelligence layer that feeds structured operational context into the existing 10-phase Resort 360 autonomous multi-agent swarm:

```
                  LIVE METEOROLOGICAL TELEMETRY (Open-Meteo)
                                     ↓
                           WEATHER SERVICE CACHE
                                     ↓
                       DIGITAL TWIN SIMULATION ENGINE
                                     ↓
               ┌─────────────────────┴─────────────────────┐
               ↓                                           ↓
       PUBLIC/SOCIAL SIGNALS                         NUGEN DOMAIN MODEL
       (Transit Corridors)                   (resort360-hospitality-v1)
               │                                           │
               └─────────────────────┬─────────────────────┘
                                     ↓
                         WEATHER OPERATIONAL IMPACT
                                     ↓
                        STRUCTURED AI AGENT CONTEXT
                                     ↓
                       EXISTING RESORT 360 AGENT SWARM
                   [Front Desk · Housekeeping · Maint · Rev]
                                     ↓
                              SWARM CONSENSUS
                                     ↓
                              MANAGER APPROVAL
                                     ↓
                           LIVE DISPATCH & SOCKET.IO
```

---

## 3. Real vs. Simulated State Isolation
To satisfy mandatory enterprise safety rules:
- **REAL OPERATIONAL STATE:** The active database containing rooms, guests, staff, incidents, and tasks.
- **SIMULATED DIGITAL TWIN STATE:** An in-memory virtual snapshot executing what-if experiments with altered meteorological parameters.
- **ISOLATION GUARANTEE:** Running simulations **NEVER mutates** production operational tables. The UI displays an explicit amber `SIMULATION MODE` indicator whenever exploring scenarios.

---

## 4. Live Weather Integration (Open-Meteo)
- **Endpoint:** `GET /api/v1/weather/current` & `GET /api/v1/weather/refresh`
- **Provider:** Open-Meteo High-Resolution Numerical Weather Model (free tier, no API key required).
- **Location Coordinates:** Azure Bay Resort & Spa, South Goa, India (15.2993° N, 74.1240° E).
- **Caching:** 10-minute in-memory cache to prevent redundant external network roundtrips.
- **Normalization:** Standardized internal structure with temperature, precipitation rate (mm/h), wind speed (km/h), humidity, UV index, and calibrated operational severity (`LOW`, `MEDIUM`, `HIGH`, `EXTREME`).

---

## 5. Geospatial Map & Operational Corridor
- Visualizes key real-world entities in the South Goa transit corridor:
  1. **Azure Bay Resort & Villas** (15.2993° N, 74.1240° E) — Core property with 45 rooms, HVAC network, and beach zone.
  2. **Goa Dabolim Airport (GOI)** (15.3808° N, 73.8312° E) — Primary arrival node; subject to NH66 highway waterlogging.
  3. **Panaji Urban Corridor** (15.4989° N, 73.8278° E) — Contractor and vendor supply depot.
  4. **South Goa Beach Strip (Benaulim/Colva)** (15.2500° N, 73.9100° E) — Outdoor recreational amenities.
- **Visual Features:** Active precipitation radar sweep overlay, arterial transit routes with color-coded disruption status, and interactive click-to-inspect facility cards.

---

## 6. Real-World Public / Social Signals
Ingests and normalizes crowdsourced traveler and municipal reports:
- Normalized schema: `source`, `timestamp`, `location`, `text`, `signalType`, `severity`, `confidence`.
- Extracts operational signals (e.g., `"Heavy waterlogging on NH66 Airport Road"` → `{ type: 'transport_disruption', severity: 'high' }`).
- Curated real-world verified fallback dataset ensures presentation reliability even during third-party API outages.

---

## 7. Interactive What-If Simulation Engine
Enables managers to stress-test the property under hypothetical extreme scenarios:
- **Parameters:** Precipitation rate (0–100 mm/h), Ambient Temperature (20–45°C), Wind Velocity (0–80 km/h), Event Duration (0.5–6 hours).
- **Presets:** Monsoon Cloudburst (45 mm/h), Heatwave (38°C), Coastal Squall (65 km/h), Clear Coastal.
- **Causal Propagation Chains:**
  - *Rainfall:* Rain Surge → Highway Flooding → 78% Airport Delay → Front Desk Arrival Clustering → Express Housekeeping Pressure → Safe Alternative Room Bottleneck.
  - *Heatwave:* Ambient 38°C → 100% HVAC Duty Cycle → Thermal Trip Risk → Suite 401 Compressor Lockout → Maintenance Urgent Work Order.

---

## 8. Nugen Intelligence Domain Alignment
- **Base Foundation:** `Llama-V3p2-3b-Reasoning`
- **Domain Focus:** `WEATHER → RESORT OPERATIONAL IMPACT`
- **Aligned Model ID:** `resort360-hospitality-v1`
- **Alignment ID:** `alignment-resort360-v1`
- **Alignment Dataset:**
  - `data/nugen/resort360-hospitality-handbook.md`: Standard operating procedures, weather thresholds, and multi-agent coordination protocols.
  - `data/nugen/resort360-domain-scenarios.jsonl`: 25 comprehensive prompt-completion training scenarios mapping meteorological conditions to departmental impacts.
  - `data/nugen/resort360-benchmark.jsonl`: 15 structured domain validation benchmarks.
- **Inference Integration:** `backend/src/services/nugenWeather.service.js` invokes Nugen REST API with fallback to deterministic rules derived directly from alignment training.

---

## 9. AI Agent Swarm Context Integration
Environmental intelligence is automatically synthesized into departmental prompts for the 4 core reasoning agents:
1. **Front Desk Agent:** Receives travel delay probability and expected arrival clustering windows to prepare express lounge check-in.
2. **Housekeeping Agent:** Receives turnover compression forecasts to prioritize suites with imminent check-ins over delayed arrivals.
3. **Maintenance Agent:** Receives HVAC head-pressure risk warnings and roof drainage alerts to pre-stage technicians.
4. **Revenue Agent:** Adjusts dynamic pricing to discount outdoor cabanas and protect premium indoor inventory.

---

## 10. Room 401 VIP Demo Integration
The canonical Resort 360 presentation scenario is enriched:
1. Manager inspects **Weather Digital Twin**: 45 mm/h cloudburst predicted; airport road flooded.
2. Digital Twin outputs: VIP Alexander Vance (Diamond Tier) arrival delayed by 40 minutes; 5 safe alternative rooms available.
3. Incident strikes: Room 401 HVAC compressor capacitor fails.
4. Swarm Agents reason with full environmental context: Front Desk knows Vance is delayed; Maintenance knows HVAC cannot be serviced outdoors in torrential rain; Revenue clears reassigning Vance to Executive Suite 505.
5. Swarm Consensus approves the move; Manager confirms; Work orders dispatch seamlessly via Socket.IO.

---

## 11. API Endpoints Reference
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/weather/current` | Returns normalized live weather telemetry |
| `GET` | `/api/v1/weather/refresh` | Force-refreshes weather telemetry cache |
| `GET` | `/api/v1/digital-twin/weather/context` | Full combined weather, impact, signals, and resort state |
| `GET` | `/api/v1/digital-twin/weather/signals` | Curated public/social transit signals |
| `POST` | `/api/v1/digital-twin/weather/simulate` | What-if simulation (zero production mutation) |
| `POST` | `/api/v1/nugen/weather-impact` | Nugen domain-aligned model inference |
