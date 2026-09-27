"""
In-memory async pub/sub event bus + SSE endpoint.
All four agents share this module for event-driven cross-agent communication.
"""
import asyncio
import json
from typing import Callable, Dict, List, Any
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

# ─── Event Type Constants ───────────────────────────────────────────────────
GUEST_CHECKED_IN = "GUEST_CHECKED_IN"
SENTIMENT_ALERT = "SENTIMENT_ALERT"
ROOM_READY_ETA_UPDATED = "ROOM_READY_ETA_UPDATED"
MAINTENANCE_REQUIRED = "MAINTENANCE_REQUIRED"
COST_INCIDENT_LOGGED = "COST_INCIDENT_LOGGED"
PERISHABLE_FLASH_SALE = "PERISHABLE_FLASH_SALE"
ROOM_STATUS_CHANGED = "ROOM_STATUS_CHANGED"

# ─── Internal State ──────────────────────────────────────────────────────────
_subscribers: Dict[str, List[Callable]] = {}
_sse_queues: List[asyncio.Queue] = []
_event_history: List[Dict[str, Any]] = []


def subscribe(event_type: str, handler: Callable):
    """Register an async handler for a specific event type."""
    if event_type not in _subscribers:
        _subscribers[event_type] = []
    _subscribers[event_type].append(handler)


async def publish(event_type: str, payload: dict):
    """
    Push event to all registered handlers and SSE queues.
    Handlers are called as asyncio tasks (fire-and-forget, non-blocking).
    """
    event = {"event": event_type, "payload": payload}
    _event_history.append(event)

    # Notify all SSE clients
    for queue in _sse_queues:
        await queue.put(event)

    # Fire all subscribers — awaited sequentially so state changes are synchronous.
    # This is critical for the live cascade: COST_INCIDENT_LOGGED → _total_active_cost_incidents
    # must update before the caller (or frontend) reads /api/revenue/net-revpar.
    handlers = _subscribers.get(event_type, [])
    for handler in handlers:
        try:
            await handler(payload)
        except Exception:
            pass  # Don't let a subscriber bring down the event bus


# ─── SSE Router ─────────────────────────────────────────────────────────────
router = APIRouter()


@router.get("/api/events/stream")
async def sse_stream():
    """
    Server-Sent Events endpoint — streams ALL published events to frontend.
    This powers the live dashboard cascade visualization.
    """
    queue: asyncio.Queue = asyncio.Queue()
    _sse_queues.append(queue)

    async def event_generator():
        # Send event history on connect so dashboard can catch up
        for ev in _event_history[-20:]:
            yield f"data: {json.dumps(ev)}\n\n"
        try:
            while True:
                event = await asyncio.wait_for(queue.get(), timeout=30.0)
                yield f"data: {json.dumps(event)}\n\n"
        except asyncio.TimeoutError:
            # Send heartbeat to keep connection alive
            yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            _sse_queues.remove(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


@router.get("/api/events/history")
async def get_event_history():
    """Return last 50 published events (for debugging)."""
    return {"events": _event_history[-50:]}


def clear_history():
    """Clear event history (used by demo reset). Does NOT clear subscribers."""
    global _event_history
    _event_history.clear()
    # NOTE: _subscribers intentionally NOT cleared — subscribers are registered at
    # startup and must persist across demo resets for the cascade to work correctly.
