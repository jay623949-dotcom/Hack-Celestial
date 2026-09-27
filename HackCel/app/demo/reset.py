"""
POST /demo/reset — truncates all data and re-runs seed_data.
Required between rehearsals and before the live judged demo run.
"""
from fastapi import APIRouter
from app.seed_data import run_seed
from app.event_bus import clear_history
from app.services import revenue_service

router = APIRouter(prefix="/demo", tags=["Demo"])


@router.post("/reset")
async def demo_reset():
    """
    Full demo reset:
    1. Drop and recreate all DB tables
    2. Re-seed all data
    3. Clear event history
    4. Reset revenue cost counter
    """
    # Reset in-memory state
    clear_history()
    revenue_service._total_active_cost_incidents = 0.0

    # Drop + recreate + seed
    await run_seed()

    return {
        "ok": True,
        "message": "Demo environment reset successfully. All tables truncated and reseeded.",
        "next_step": "Ready for demo cascade: POST /api/frontdesk/checkin to begin.",
    }
