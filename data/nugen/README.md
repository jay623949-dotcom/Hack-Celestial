# Resort 360 — Nugen Domain Alignment Dataset

## Purpose
This directory contains the domain-specific training and alignment corpus for **Nugen Intelligence** model customization. 

Standard foundation models (e.g. general LLMs) lack deep operational context regarding hospitality operations, inter-departmental trade-offs, VIP priority escalation thresholds, and simultaneous incident arbitration.

By aligning a base foundation model (such as `qwen-v2p5-0p5b-instruct`) using Nugen's train-time and inference-time alignment platform, we produce **Resort 360 Domain-Aligned Hospitality Intelligence**.

## Files in this Directory
1. `resort360-alignment-scenarios.jsonl`:
   - 25 high-fidelity operational scenarios teaching multi-departmental reasoning.
   - Covers VIP early arrivals, HVAC compressor failures, plumbing leaks, housekeeping turnover bottlenecks, high occupancy yield trade-offs, weather disruptions, and Telegram/WhatsApp escalations.
   - Formatted with structured instruction, operational context, and canonical JSON output schema.

2. `resort360-operations-handbook.txt`:
   - Plain text operational standard operating procedures (SOPs) designed for direct upload to Nugen Document API (`POST /api/v3/documents/create`).
   - Details guest VIP tiers, room turn times, maintenance response SLAs, housekeeping priority queues, and manager approval boundaries.

## Alignment Pipeline
```
Base Model (e.g. qwen-v2p5-0p5b-instruct)
       ↓
Nugen Document Upload & Benchmark Preparation
       ↓
Nugen Domain Alignment Project (POST /api/v3/alignment-projects/create)
       ↓
Domain-Aligned Adaptor Checkpoint
       ↓
Nugen Model Deployment (POST /api/v3/models/{id}/deployment)
       ↓
Resort 360 Real-Time Inference (POST /api/v3/inference/chat/completions)
```
