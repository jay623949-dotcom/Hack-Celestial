# Resort 360 — NuGen Domain Alignment Package

**Target Base Model**: `Llama-V3p2-3b-Reasoning` or `qwen-v2p5-0p5b-instruct`  
**Aligned Model**: `resort360-hospitality-v1`  
**Domain**: Luxury Resort Operations, Multi-Agent Swarm Orchestration, & Hotel ERP Governance  
**Property**: The Grand Azure Bay Resort & Villas, South Goa, India  

---

## 📁 Alignment Artifacts Available for Upload

| File | Format | Description | Target NuGen Step |
|---|---|---|---|
| [`RESORT360_NUGEN_DOMAIN_CONTEXT.md`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/RESORT360_NUGEN_DOMAIN_CONTEXT.md) | Markdown | **Primary Master Domain Knowledge Document** (12 comprehensive sections, ~4,500 words) | **Step 1: Domain Document Upload** |
| [`RESORT360_NUGEN_DOMAIN_CONTEXT.txt`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/RESORT360_NUGEN_DOMAIN_CONTEXT.txt) | Plain Text | Identical plain-text copy (for uploaders requiring `.txt`) | **Step 1: Domain Document Upload (Alternative)** |
| [`resort360-domain-scenarios.jsonl`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/resort360-domain-scenarios.jsonl) | JSONL | 25 curated luxury resort training scenarios | **Step 2: Training Scenarios Upload** |
| [`resort360-benchmark.jsonl`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/resort360-benchmark.jsonl) | JSONL | 15 quantitative evaluation benchmarks | **Step 3: Benchmark Creation** |
| [`resort360-alignment-guide.md`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/resort360-alignment-guide.md) | Markdown | Alignment execution checklist and validation guide | Reference |

---

## 🚀 NuGen Platform Upload Sequence (docs.nugen.in)

1. **Step 1: Domain Context Document**:
   - In NuGen Studio / Console (`platform.nugen.in`), select **Create Alignment Project** or **Upload Domain Documents**.
   - Upload [`RESORT360_NUGEN_DOMAIN_CONTEXT.md`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/RESORT360_NUGEN_DOMAIN_CONTEXT.md) (or [`.txt`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/RESORT360_NUGEN_DOMAIN_CONTEXT.txt)).
   - Tags: `hospitality-operations`, `resort360`, `luxury-resort`, `vip-protocols`.

2. **Step 2: Training Scenarios**:
   - Upload [`resort360-domain-scenarios.jsonl`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/resort360-domain-scenarios.jsonl).

3. **Step 3: Base Model Selection**:
   - Choose **Llama-V3p2-3b-Reasoning** (or `qwen-v2p5-0p5b-instruct`).

4. **Step 4: Benchmark Dataset**:
   - Upload [`resort360-benchmark.jsonl`](file:///c:/Web%20Devlopment/HackathonProject/resort360/data/nugen/resort360-benchmark.jsonl).

5. **Step 5: Start Alignment**:
   - Click **Start Alignment Training**.
   - Output model ID: `resort360-hospitality-v1`.

---

## 🧠 Core Domain Architecture
```
Operational Telemetry / Guest Chatbot / Concern Form
                       ↓
           NuGen Domain-Aligned Model
           (resort360-hospitality-v1)
                       ↓
  [Front Desk]  [Housekeeping]  [Maintenance]  [Revenue]
                       ↓
              Consensus Engine
                       ↓
         Manager on Duty (HITL Approval)
                       ↓
          Structured Task Dispatch
```

*Resort 360 — Hack Celestial Hackathon*
