"""
Revenue Agent Service
Publishers: PERISHABLE_FLASH_SALE (also triggers via event)
Subscribers: COST_INCIDENT_LOGGED (live Net RevPAR), GUEST_CHECKED_IN (occupancy threshold)
"""
from datetime import datetime, timezone, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sqlfunc

from app.db import get_db
from app.models.room import Room
from app.models.guest import Guest
from app.models.rate import RateChangeLog
from app.models.offer import Offer
from app.schemas.schemas import (
    PricingRequest, PricingResponse, CurrentPricingResponse,
    NetRevParResponse, FlashSaleRequest, FlashSaleResponse,
    WingShutdownRequest, WingShutdownResponse,
)
from app.ai.mock_ai_client import generate_offer_copy
import app.event_bus as bus

router = APIRouter(prefix="/api/revenue", tags=["Revenue"])

# ─── In-memory running totals (live update on event) ─────────────────────────
_total_active_cost_incidents: float = 0.0
_occupancy_threshold_for_flash = 0.6    # Trigger flash sale when occupancy > 60%

# ─── Guardrail Constants ─────────────────────────────────────────────────────
RATE_CHANGE_CAP = 0.15                  # Max ±15% per call


# ─── Demand signal → rate multipliers ────────────────────────────────────────
DEMAND_MULTIPLIERS = {
    "low": -0.05,
    "neutral": 0.0,
    "high": 0.08,
    "surge": 0.15,
}


# ─── Endpoints ────────────────────────────────────────────────────────────────
@router.post("/pricing", response_model=PricingResponse)
async def recalculate_pricing(req: PricingRequest, db: AsyncSession = Depends(get_db)):
    """
    Recalculate rate for a room_category. Cap at ±15%. Log to RateChangeLog.
    """
    # Get current base rate for category
    result = await db.execute(
        select(Room).where(Room.category == req.room_category)
    )
    rooms = result.scalars().all()
    if not rooms:
        raise HTTPException(status_code=404, detail=f"Room category '{req.room_category}' not found")

    # Use first room's current_rate as the category reference rate
    old_rate = rooms[0].current_rate
    base_rate = rooms[0].base_rate

    # Compute adjustment
    occupancy_factor = (req.occupancy_pct - 0.5) * 0.2    # ±10% based on occupancy deviation from 50%
    demand_factor = DEMAND_MULTIPLIERS.get(req.demand_signal, 0.0)

    total_adj = occupancy_factor + demand_factor
    # Cap at ±15%
    total_adj = max(-RATE_CHANGE_CAP, min(RATE_CHANGE_CAP, total_adj))

    new_rate = round(old_rate * (1 + total_adj), 2)
    new_rate = max(base_rate * 0.5, new_rate)   # Floor at 50% of base rate

    # Apply to all rooms in category
    for room in rooms:
        room.current_rate = new_rate

    # Build human-readable reason
    reason_parts = [f"Occupancy={req.occupancy_pct*100:.0f}%", f"Demand={req.demand_signal}"]
    if req.manual_reason:
        reason_parts.append(req.manual_reason)
    trigger_reason = " | ".join(reason_parts)

    # Log rate change
    log = RateChangeLog(
        room_category=req.room_category,
        old_rate=old_rate,
        new_rate=new_rate,
        trigger_reason=trigger_reason,
    )
    db.add(log)

    return PricingResponse(
        room_category=req.room_category,
        old_rate=old_rate,
        new_rate=new_rate,
        change_pct=round(total_adj * 100, 2),
        trigger_reason=trigger_reason,
        reasoning=(
            f"Rate adjusted {total_adj*100:+.1f}% (capped at ±{RATE_CHANGE_CAP*100:.0f}%). "
            f"Occupancy factor: {occupancy_factor*100:+.1f}%, Demand factor: {demand_factor*100:+.1f}%. "
            f"New rate: ${new_rate}/night."
        ),
    )


@router.get("/pricing/current/{room_category}", response_model=CurrentPricingResponse)
async def current_pricing(room_category: str, db: AsyncSession = Depends(get_db)):
    """Live rate + last 5 changes for a room category."""
    room_result = await db.execute(
        select(Room).where(Room.category == room_category)
    )
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail=f"Category '{room_category}' not found")

    log_result = await db.execute(
        select(RateChangeLog)
        .where(RateChangeLog.room_category == room_category)
        .order_by(RateChangeLog.timestamp.desc())
        .limit(5)
    )
    logs = log_result.scalars().all()

    return CurrentPricingResponse(
        room_category=room_category,
        current_rate=room.current_rate,
        base_rate=room.base_rate,
        last_5_changes=[
            {
                "id": l.id,
                "old_rate": l.old_rate,
                "new_rate": l.new_rate,
                "trigger_reason": l.trigger_reason,
                "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            }
            for l in logs
        ],
    )


@router.get("/net-revpar", response_model=NetRevParResponse)
async def net_revpar(db: AsyncSession = Depends(get_db)):
    """
    Compute gross + net RevPAR/ADR. Net = Gross - active cost incidents.
    Updates live via COST_INCIDENT_LOGGED event subscriber.
    """
    rooms_result = await db.execute(select(Room))
    rooms = rooms_result.scalars().all()
    total_rooms = len(rooms)
    if total_rooms == 0:
        raise HTTPException(status_code=503, detail="No rooms seeded yet")

    occupied_rooms = [r for r in rooms if r.status == "occupied"]
    occupancy_pct = len(occupied_rooms) / total_rooms

    # Gross ADR = average current_rate among occupied rooms
    gross_adr = sum(r.current_rate for r in occupied_rooms) / max(len(occupied_rooms), 1)
    gross_revpar = gross_adr * occupancy_pct

    # Cost deduction
    cost_deduction = _total_active_cost_incidents
    net_revpar_val = max(0.0, gross_revpar - (cost_deduction / max(total_rooms, 1)))
    net_adr = max(0.0, gross_adr - (cost_deduction / max(len(occupied_rooms), 1)))

    return NetRevParResponse(
        gross_revpar=round(gross_revpar, 2),
        gross_adr=round(gross_adr, 2),
        net_revpar=round(net_revpar_val, 2),
        net_adr=round(net_adr, 2),
        occupancy_pct=round(occupancy_pct, 4),
        total_active_cost_incidents=round(cost_deduction, 2),
        cost_deduction=round(cost_deduction, 2),
        reasoning=(
            f"Occupancy: {occupancy_pct*100:.1f}% ({len(occupied_rooms)}/{total_rooms} rooms). "
            f"Gross RevPAR: ${gross_revpar:.2f}, Net RevPAR: ${net_revpar_val:.2f} "
            f"(deducted ${cost_deduction:.2f} in active cost incidents). "
            f"Formula: Net RevPAR = Gross RevPAR - (total_cost_incidents / total_rooms)."
        ),
    )


@router.post("/flash-sale", response_model=FlashSaleResponse)
async def flash_sale(req: FlashSaleRequest, db: AsyncSession = Depends(get_db)):
    """
    Trigger a perishable inventory flash sale.
    Scans checked-in guests, generates persona-matched copy, creates Offer records,
    publishes PERISHABLE_FLASH_SALE.
    """
    guest_result = await db.execute(
        select(Guest).where(Guest.checkin_date.isnot(None))
    )
    guests = guest_result.scalars().all()

    if not guests:
        raise HTTPException(status_code=404, detail="No checked-in guests to target")

    expiry_dt = datetime.now(timezone.utc) + timedelta(minutes=req.expiry_minutes)
    offers_created = []

    for guest in guests:
        # Generate persona-framed copy via AI client
        try:
            copy_result = await generate_offer_copy(guest.persona_label, req.asset_description)
            offer_copy = copy_result["offer_copy"]
        except Exception:
            offer_copy = f"Special offer: {req.asset_description} — available for {req.expiry_minutes} minutes."

        offer = Offer(
            guest_id=guest.id,
            offer_type=req.offer_type,
            persona_match=guest.persona_label,
            price=req.price,
            expiry=expiry_dt,
            status="pending",
            offer_copy=offer_copy,
        )
        db.add(offer)
        await db.flush()

        offers_created.append({
            "guest_id": guest.id,
            "guest_name": guest.name,
            "persona_label": guest.persona_label,
            "offer_id": offer.id,
            "offer_copy": offer_copy,
        })

    # Publish flash sale event
    await bus.publish(bus.PERISHABLE_FLASH_SALE, {
        "asset_description": req.asset_description,
        "offer_type": req.offer_type,
        "price": req.price,
        "expiry_minutes": req.expiry_minutes,
        "guests_targeted": len(offers_created),
        "offers": offers_created,
        "reasoning": f"Flash sale for '{req.asset_description}' sent to {len(offers_created)} checked-in guests with persona-matched copy.",
    })

    return FlashSaleResponse(
        offers_created=len(offers_created),
        guests_targeted=offers_created,
        reasoning=f"Created {len(offers_created)} offers for '{req.asset_description}'. Expiry in {req.expiry_minutes} minutes. PERISHABLE_FLASH_SALE published.",
    )


@router.post("/wing-shutdown-simulate", response_model=WingShutdownResponse)
async def wing_shutdown_simulate(req: WingShutdownRequest, db: AsyncSession = Depends(get_db)):
    """
    Simulate closing a wing. Checks safety feasibility via maintenance service,
    computes revised pricing on remaining rooms to hit same net profit target.
    """
    from app.services import maintenance_service
    from sqlalchemy import and_

    wing_rooms_result = await db.execute(
        select(Room).where(Room.wing == req.wing_id)
    )
    wing_rooms = wing_rooms_result.scalars().all()

    if not wing_rooms:
        raise HTTPException(status_code=404, detail=f"Wing '{req.wing_id}' not found")

    # Check feasibility: any safety-critical assets in this wing?
    safety_blockers = []
    for room in wing_rooms:
        from app.models.workorder import WorkOrder
        wo_result = await db.execute(
            select(WorkOrder).where(
                and_(
                    WorkOrder.room_id == room.id,
                    WorkOrder.priority == "safety",
                    WorkOrder.status.in_(["open", "in-progress"])
                )
            )
        )
        open_safety_wos = wo_result.scalars().all()
        if open_safety_wos:
            safety_blockers.append(
                f"Room {room.room_number}: {len(open_safety_wos)} open safety work order(s)"
            )

    feasible = len(safety_blockers) == 0

    # Compute current net profit from all rooms
    all_rooms_result = await db.execute(select(Room))
    all_rooms = all_rooms_result.scalars().all()
    remaining_rooms = [r for r in all_rooms if r.wing != req.wing_id]

    current_revenue = sum(r.current_rate for r in all_rooms if r.status == "occupied")
    net_profit_target = max(current_revenue - _total_active_cost_incidents, 0)

    remaining_occupied = [r for r in remaining_rooms if r.status == "occupied"]
    revised_rate = 0.0
    if remaining_occupied:
        revised_rate = round(net_profit_target / len(remaining_occupied), 2)

    return WingShutdownResponse(
        wing_id=req.wing_id,
        feasible=feasible,
        safety_blockers=safety_blockers,
        rooms_affected=len(wing_rooms),
        rooms_remaining=len(remaining_rooms),
        current_net_profit_target=round(net_profit_target, 2),
        revised_rate_required=revised_rate,
        before_after_comparison={
            "before": {
                "active_rooms": len(all_rooms),
                "occupied": len([r for r in all_rooms if r.status == "occupied"]),
                "avg_rate": round(sum(r.current_rate for r in all_rooms) / max(len(all_rooms), 1), 2),
            },
            "after": {
                "active_rooms": len(remaining_rooms),
                "occupied": len(remaining_occupied),
                "required_avg_rate": revised_rate,
            },
        },
        reasoning=(
            f"Wing {req.wing_id} has {len(wing_rooms)} rooms. "
            f"{'Feasible' if feasible else 'NOT feasible — safety blockers: ' + str(safety_blockers)}. "
            f"Net profit target: ${net_profit_target:.2f}. "
            f"Required rate on {len(remaining_occupied)} remaining occupied rooms: ${revised_rate:.2f}/night."
        ),
    )


# ─── Event Subscribers ────────────────────────────────────────────────────────
async def _on_cost_incident_logged(payload: dict):
    """
    COST_INCIDENT_LOGGED → increment total_active_cost_incidents → re-publish NET_REVPAR_UPDATED.
    This is the 'live' moment: maintenance cost deducted without page refresh.
    
    IMPORTANT: We do NOT open a new DB session here — the caller's session may still hold
    a SQLite write lock. Instead, update the in-memory counter and publish NET_REVPAR_UPDATED
    using a deferred asyncio task that opens its own session safely after the lock is released.
    """
    global _total_active_cost_incidents
    cost = payload.get("cost_estimate", 0.0)
    _total_active_cost_incidents += cost

    # Schedule NET_REVPAR_UPDATED as a background task to avoid nested DB session deadlock
    import asyncio
    asyncio.create_task(_publish_net_revpar_update(cost, payload))


async def _publish_net_revpar_update(cost: float, original_payload: dict):
    """Deferred task: opens a fresh DB session to compute + publish NET_REVPAR_UPDATED."""
    import asyncio
    await asyncio.sleep(0)  # Yield control so the parent DB session can close first
    from app.db import AsyncSessionLocal
    try:
        async with AsyncSessionLocal() as db:
            rooms_result = await db.execute(select(Room))
            rooms = rooms_result.scalars().all()
            total_rooms = len(rooms)
            occupied = [r for r in rooms if r.status == "occupied"]
            occupancy_pct = len(occupied) / max(total_rooms, 1)
            gross_adr = sum(r.current_rate for r in occupied) / max(len(occupied), 1)
            gross_revpar = gross_adr * occupancy_pct
            net_revpar_val = max(0.0, gross_revpar - (_total_active_cost_incidents / max(total_rooms, 1)))

            # Push directly to SSE queues + event history (don't call publish to avoid re-entrant deadlock)
            from app.event_bus import _sse_queues, _event_history
            event = {
                "event": "NET_REVPAR_UPDATED",
                "payload": {
                    "gross_revpar": round(gross_revpar, 2),
                    "net_revpar": round(net_revpar_val, 2),
                    "cost_deduction": round(_total_active_cost_incidents, 2),
                    "latest_incident": original_payload,
                    "reasoning": f"Maintenance cost ${cost:.2f} deducted. New net RevPAR: ${net_revpar_val:.2f}",
                }
            }
            _event_history.append(event)
            for queue in _sse_queues:
                await queue.put(event)
    except Exception:
        pass


async def _on_guest_checked_in(payload: dict):
    """On check-in, evaluate if occupancy crosses threshold — deferred to avoid DB deadlock."""
    import asyncio
    asyncio.create_task(_check_occupancy_threshold())


async def _check_occupancy_threshold():
    """Deferred occupancy check — runs after parent DB session is released."""
    import asyncio
    await asyncio.sleep(0)
    from app.db import AsyncSessionLocal
    try:
        async with AsyncSessionLocal() as db:
            rooms_result = await db.execute(select(Room))
            rooms = rooms_result.scalars().all()
            if not rooms:
                return
            occupancy_pct = len([r for r in rooms if r.status == "occupied"]) / len(rooms)
            if occupancy_pct >= _occupancy_threshold_for_flash:
                from app.event_bus import _sse_queues, _event_history
                event = {
                    "event": "OCCUPANCY_THRESHOLD_CROSSED",
                    "payload": {
                        "occupancy_pct": round(occupancy_pct, 4),
                        "threshold": _occupancy_threshold_for_flash,
                        "reasoning": f"Occupancy {occupancy_pct*100:.1f}% crossed {_occupancy_threshold_for_flash*100:.0f}% threshold on check-in.",
                    }
                }
                _event_history.append(event)
                for queue in _sse_queues:
                    await queue.put(event)
    except Exception:
        pass


def register_subscribers():
    bus.subscribe(bus.COST_INCIDENT_LOGGED, _on_cost_incident_logged)
    bus.subscribe(bus.GUEST_CHECKED_IN, _on_guest_checked_in)
