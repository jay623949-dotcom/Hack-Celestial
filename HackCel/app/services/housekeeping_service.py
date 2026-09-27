"""
Housekeeping Agent Service
Publishers: ROOM_READY_ETA_UPDATED
Subscribers: GUEST_CHECKED_IN (priority bump for VIP/At-Risk), MAINTENANCE_REQUIRED (block task)
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_db
from app.models.housekeeping import HousekeepingTask
from app.models.guest import Guest
from app.models.room import Room
from app.schemas.schemas import HousekeepingTaskResponse, ReorderRequest, CompleteTaskRequest
import app.event_bus as bus

router = APIRouter(prefix="/api/housekeeping", tags=["Housekeeping"])


# ─── Endpoints ────────────────────────────────────────────────────────────────
@router.get("/tasks", response_model=List[HousekeepingTaskResponse])
async def get_tasks(db: AsyncSession = Depends(get_db)):
    """Return current housekeeping queue sorted by priority_rank (ascending = highest priority)."""
    result = await db.execute(
        select(HousekeepingTask)
        .where(HousekeepingTask.status.in_(["dirty", "cleaning"]))
        .order_by(HousekeepingTask.priority_rank)
    )
    tasks = result.scalars().all()
    return [HousekeepingTaskResponse.model_validate(t) for t in tasks]


@router.post("/reorder")
async def reorder(req: ReorderRequest, db: AsyncSession = Depends(get_db)):
    """Manual override of queue order. task_ids_in_order[0] becomes priority_rank=1."""
    for rank, task_id in enumerate(req.task_ids_in_order, start=1):
        result = await db.execute(select(HousekeepingTask).where(HousekeepingTask.id == task_id))
        task = result.scalar_one_or_none()
        if task:
            task.priority_rank = rank
            # Publish ETA update for each reordered room
            await bus.publish(bus.ROOM_READY_ETA_UPDATED, {
                "room_id": task.room_id,
                "eta_minutes": task.eta_minutes,
                "priority_rank": rank,
                "reason": "Manual reorder by housekeeping supervisor",
            })

    return {"ok": True, "reordered": len(req.task_ids_in_order), "reasoning": "Queue manually reordered by supervisor."}


@router.post("/complete")
async def complete_task(req: CompleteTaskRequest, db: AsyncSession = Depends(get_db)):
    """Mark a housekeeping task as ready. Publishes ROOM_READY_ETA_UPDATED with eta_minutes: 0."""
    result = await db.execute(select(HousekeepingTask).where(HousekeepingTask.id == req.task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "ready"
    task.eta_minutes = 0

    # Update room status to available
    room_result = await db.execute(select(Room).where(Room.id == task.room_id))
    room = room_result.scalar_one_or_none()
    if room:
        room.status = "available"

    # Publish completion
    await bus.publish(bus.ROOM_READY_ETA_UPDATED, {
        "room_id": task.room_id,
        "eta_minutes": 0,
        "status": "ready",
        "reason": "Housekeeping task completed — room is clean and ready",
    })

    await bus.publish(bus.ROOM_STATUS_CHANGED, {
        "room_id": task.room_id,
        "new_status": "available",
        "reason": "Housekeeping complete",
    })

    return {"ok": True, "room_id": task.room_id, "reasoning": "Room marked ready. ROOM_READY_ETA_UPDATED published."}


# ─── Internal helper ─────────────────────────────────────────────────────────
async def _bump_room_priority(room_id: int, reason: str):
    """Move a room's housekeeping task to the top of the queue."""
    from app.db import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(HousekeepingTask)
            .where(HousekeepingTask.room_id == room_id, HousekeepingTask.status.in_(["dirty", "cleaning"]))
        )
        task = result.scalar_one_or_none()
        if not task:
            return

        # Shift all others down
        all_result = await db.execute(
            select(HousekeepingTask)
            .where(HousekeepingTask.status.in_(["dirty", "cleaning"]))
            .order_by(HousekeepingTask.priority_rank)
        )
        all_tasks = all_result.scalars().all()

        for t in all_tasks:
            if t.id != task.id:
                t.priority_rank += 1

        task.priority_rank = 1
        task.eta_minutes = max(5, task.eta_minutes - 10)  # Accelerate ETA

        await db.commit()

        await bus.publish(bus.ROOM_READY_ETA_UPDATED, {
            "room_id": room_id,
            "eta_minutes": task.eta_minutes,
            "priority_rank": 1,
            "reason": reason,
        })


# ─── Event Subscriber: GUEST_CHECKED_IN → bump priority for VIP/At-Risk ───────
async def _on_guest_checked_in(payload: dict):
    """Defer to avoid nested DB session deadlock with the check-in handler."""
    import asyncio
    asyncio.create_task(_deferred_bump(payload))


async def _deferred_bump(payload: dict):
    import asyncio
    await asyncio.sleep(0)  # Yield so parent session closes first
    value_tier = payload.get("value_tier", "")
    sentiment = payload.get("sentiment_state", "")
    room_id = payload.get("room_id")
    if room_id and (value_tier == "VIP" or sentiment == "At-Risk"):
        reason = (
            f"Priority bump: guest {payload.get('name')} is "
            f"{'VIP' if value_tier == 'VIP' else ''}"
            f"{'At-Risk' if sentiment == 'At-Risk' else ''} "
            f"(value_tier={value_tier}, sentiment={sentiment})"
        )
        await _bump_room_priority(room_id, reason)


# ─── Event Subscriber: MAINTENANCE_REQUIRED → block housekeeping task ─────────
async def _on_maintenance_required(payload: dict):
    """Defer to avoid nested DB session deadlock with the maintenance handler."""
    import asyncio
    asyncio.create_task(_deferred_block(payload))


async def _deferred_block(payload: dict):
    import asyncio
    await asyncio.sleep(0)
    room_id = payload.get("room_id")
    if not room_id:
        return
    from app.db import AsyncSessionLocal
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(HousekeepingTask)
                .where(HousekeepingTask.room_id == room_id, HousekeepingTask.status.in_(["dirty", "cleaning"]))
            )
            task = result.scalar_one_or_none()
            if task:
                task.blocked = "true"
                task.status = "blocked" if task.status == "cleaning" else task.status
                await db.commit()
    except Exception:
        pass


# ─── Event Subscriber: ROOM_STATUS_CHANGED → clear block when room is safe ────
async def _on_room_status_changed(payload: dict):
    """Defer to avoid nested DB session deadlock."""
    import asyncio
    asyncio.create_task(_deferred_unblock(payload))


async def _deferred_unblock(payload: dict):
    import asyncio
    await asyncio.sleep(0)
    room_id = payload.get("room_id")
    new_status = payload.get("new_status", "")
    if room_id and new_status == "available":
        from app.db import AsyncSessionLocal
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(HousekeepingTask)
                    .where(HousekeepingTask.room_id == room_id, HousekeepingTask.blocked == "true")
                )
                task = result.scalar_one_or_none()
                if task:
                    task.blocked = "false"
                    task.status = "dirty"
                    await db.commit()
        except Exception:
            pass


def register_subscribers():
    bus.subscribe(bus.GUEST_CHECKED_IN, _on_guest_checked_in)
    bus.subscribe(bus.MAINTENANCE_REQUIRED, _on_maintenance_required)
    bus.subscribe(bus.ROOM_STATUS_CHANGED, _on_room_status_changed)
