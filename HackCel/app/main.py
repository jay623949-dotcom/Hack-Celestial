"""
FastAPI main application entry point.
Registers all routers, startup/shutdown events, background tasks,
and cross-agent event subscribers.
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.event_bus import router as events_router
from app.services.frontdesk_service import router as frontdesk_router
from app.services.frontdesk_service import register_subscribers as fd_subscribers
from app.services.housekeeping_service import router as housekeeping_router
from app.services.housekeeping_service import register_subscribers as hk_subscribers
from app.services.maintenance_service import router as maintenance_router
from app.services.maintenance_service import register_subscribers as maint_subscribers
from app.services.maintenance_service import simulate_meter_readings
from app.services.revenue_service import router as revenue_router
from app.services.revenue_service import register_subscribers as rev_subscribers
from app.demo.reset import router as demo_router
from app.seed_data import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB, seed data, register all event subscribers, start background tasks."""
    # 1. Init database tables
    await init_db()

    # 2. Seed initial data (idempotent — only if DB is empty)
    from app.db import AsyncSessionLocal
    from sqlalchemy import select
    from app.models.room import Room
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Room).limit(1))
        existing = result.scalar_one_or_none()
    if not existing:
        await run_seed()

    # 3. Register all cross-agent event subscribers
    fd_subscribers()
    hk_subscribers()
    maint_subscribers()
    rev_subscribers()

    # 4. Start background meter reading simulator
    meter_task = asyncio.create_task(simulate_meter_readings())

    yield  # App is running

    # Shutdown
    meter_task.cancel()


# ─── App Instance ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Smart Resort 360 API",
    description=(
        "Autonomous multi-agent resort operating system. "
        "4 agents: Front Desk, Housekeeping, Maintenance, Revenue. "
        "Event-driven via in-memory pub/sub + SSE streaming."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Test Ping Endpoint ───────────────────────────────────────────────────────
@app.post("/api/test/ping", tags=["System"])
async def test_ping():
    """Smoke test ping endpoint to verify REST + SSE end-to-end connection."""
    from datetime import datetime, timezone
    import app.event_bus as bus
    payload = {
        "message": "backend is alive",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await bus.publish("TEST_PING", payload)
    return {"status": "published", "event": "TEST_PING", "payload": payload}

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(events_router)
app.include_router(frontdesk_router)
app.include_router(housekeeping_router)
app.include_router(maintenance_router)
app.include_router(revenue_router)
app.include_router(demo_router)


# ─── Guardrails Endpoint ──────────────────────────────────────────────────────
@app.get("/api/guardrails", tags=["System"])
async def guardrails():
    """
    Lists all active guardrail thresholds.
    Every prediction/pricing/triage response includes a 'reasoning' string.
    """
    return {
        "guardrails": {
            "rate_change_cap_pct": 15,
            "rate_change_cap_description": "Maximum ±15% pricing change per /api/revenue/pricing call",
            "cv_confidence_cutoff": 0.6,
            "cv_confidence_description": "CV triage confidence below 0.6 sets requires_human_review=true and does NOT auto-assign parts",
            "anomaly_baseline_vacant_water_litres": 0.0,
            "anomaly_baseline_vacant_power_kwh": 0.5,
            "anomaly_unit_cost_water_per_litre": 0.004,
            "anomaly_unit_cost_power_per_kwh": 0.15,
            "anomaly_days_undetected_default": 3,
            "fault_free_rule": "Room.fault_free ONLY flips to True via explicit /api/maintenance/resolve call — defaults to unsafe when uncertain",
            "ai_fallback": "All AI client calls wrapped in try/except with rule-based fallback — demo never hard-fails on AI timeout",
            "occupancy_flash_sale_threshold_pct": 60,
            "sentiment_priority_weights": {"VIP": 100, "Premium": 60, "Standard": 20},
            "sentiment_weights": {"At-Risk": 80, "Neutral": 0, "Positive": -10},
        },
        "event_types": [
            "GUEST_CHECKED_IN", "SENTIMENT_ALERT", "ROOM_READY_ETA_UPDATED",
            "MAINTENANCE_REQUIRED", "COST_INCIDENT_LOGGED", "PERISHABLE_FLASH_SALE",
            "ROOM_STATUS_CHANGED", "NET_REVPAR_UPDATED", "OCCUPANCY_THRESHOLD_CROSSED",
        ],
    }


# ─── Debug Endpoint (remove after verification) ───────────────────────────────
@app.get("/api/debug/revenue-state", tags=["System"])
async def debug_revenue_state():
    from app.services import revenue_service
    return {
        "total_active_cost_incidents": revenue_service._total_active_cost_incidents,
    }


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "service": "Smart Resort 360 API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
