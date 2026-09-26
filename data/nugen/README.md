# Resort 360 — Nugen Domain Alignment Package

**Base Model**: Llama-V3p2-3b-Reasoning
**Aligned Model**: resort360-hospitality-v1
**Domain**: Luxury Resort & Hotel Operations

## Files

| File | Records/Size |
|---|---|
| resort360-hospitality-handbook.md | ~2,500 words |
| resort360-domain-scenarios.jsonl | 25 scenarios |
| resort360-benchmark.jsonl | 15 benchmarks |
| resort360-alignment-guide.md | ~700 words |
| README.md | This file |

## Upload Sequence to Nugen
1. Upload `resort360-hospitality-handbook.md` as domain document
2. Upload `resort360-domain-scenarios.jsonl` as training scenarios
3. Select base model: **Llama-V3p2-3b-Reasoning**
4. Create benchmark from `resort360-benchmark.jsonl`
5. Start Alignment

## Scenario Coverage (25 total)
VIP Early Arrival & Room Failure (3) | Housekeeping Incidents (4) | Maintenance Single & Multi (5) | Revenue Conflicts (3) | Weather & Safety (2) | Digital Guest Complaints (2) | Complex Multi-Department (3) | High Occupancy (3)

## Application Flow
```
Incident → NugenInferenceService (resort360-hospitality-v1)
  → Departmental Agents → Consensus → Manager Approval → Task Dispatch
```

*Resort 360 — Hack Celestial Hackathon*
