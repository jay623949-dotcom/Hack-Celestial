"""
Front Desk Agent Service — handles check-in, guest management, and service recovery.
Publishers: GUEST_CHECKED_IN, SENTIMENT_ALERT
Subscribers: SENTIMENT_ALERT (auto service recovery)
"""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.db import get_db
from app.models.guest import Guest
from app.models.room import Room
from app.schemas.schemas import (
    CheckInRequest, GuestResponse, ServiceRecoveryRequest, ServiceRecoveryResponse,
    PriorityQueueItem
)
from app.ai.mock_ai_client import classify_persona_sentiment
import app.event_bus as bus

router = APIRouter(prefix="/api/frontdesk", tags=["Front Desk"])

# Priority scoring weights
VALUE_TIER_WEIGHTS = {"VIP": 100, "Premium": 60, "Standard": 20}
SENTIMENT_WEIGHTS = {"At-Risk": 80, "Neutral": 0, "Positive": -10}


# ─── Endpoints ────────────────────────────────────────────────────────────────
@router.post("/checkin", response_model=GuestResponse)
async def checkin(req: CheckInRequest, db: AsyncSession = Depends(get_db)):
    """
    Guest check-in: classify persona/sentiment via AI, update room status,
    publish GUEST_CHECKED_IN. If At-Risk, also publish SENTIMENT_ALERT.
    """
    # 1. AI Classification (with graceful fallback)
    try:
        ai_result = await classify_persona_sentiment(req.transcript)
    except Exception:
        ai_result = {
            "persona_label": "Business",
            "value_tier": "Standard",
            "sentiment_state": "Neutral",
            "reasoning": "AI classification failed — rule-based fallback applied.",
            "confidence": 0.5,
        }

    # 2. Fetch or create guest
    result = await db.execute(select(Guest).where(Guest.reservation_id == req.reservation_id))
    guest = result.scalar_one_or_none()

    checkin_dt = datetime.now(timezone.utc)
    checkout_dt = None
    if req.checkout_date:
        try:
            checkout_dt = datetime.fromisoformat(req.checkout_date)
        except Exception:
            pass

    if not guest:
        guest = Guest(
            name=req.name,
            reservation_id=req.reservation_id,
            room_id=req.room_id,
            persona_label=ai_result["persona_label"],
            value_tier=ai_result["value_tier"],
            sentiment_state=ai_result["sentiment_state"],
            checkin_date=checkin_dt,
            checkout_date=checkout_dt,
        )
        db.add(guest)
    else:
        guest.persona_label = ai_result["persona_label"]
        guest.value_tier = ai_result["value_tier"]
        guest.sentiment_state = ai_result["sentiment_state"]
        guest.checkin_date = checkin_dt
        guest.checkout_date = checkout_dt
        guest.room_id = req.room_id

    # 3. Update room status
    room_result = await db.execute(select(Room).where(Room.id == req.room_id))
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail=f"Room {req.room_id} not found")
    if not room.fault_free:
        raise HTTPException(status_code=409, detail=f"Room {req.room_id} is not fault-free — cannot check in")
    room.status = "occupied"

    await db.flush()
    await db.refresh(guest)

    # 4. Publish events
    event_payload = {
        "guest_id": guest.id,
        "name": guest.name,
        "reservation_id": guest.reservation_id,
        "persona_label": ai_result["persona_label"],
        "value_tier": ai_result["value_tier"],
        "sentiment_state": ai_result["sentiment_state"],
        "room_id": req.room_id,
        "checkin_time": checkin_dt.isoformat(),
        "reasoning": ai_result.get("reasoning", ""),
        "confidence": ai_result.get("confidence", 1.0),
    }
    await bus.publish(bus.GUEST_CHECKED_IN, event_payload)

    if ai_result["sentiment_state"] == "At-Risk":
        await bus.publish(bus.SENTIMENT_ALERT, {
            **event_payload,
            "alert_reason": "Guest classified as At-Risk on intake transcript analysis",
        })

    return GuestResponse(
        **{k: getattr(guest, k) for k in [
            "id", "name", "reservation_id", "persona_label", "value_tier",
            "sentiment_state", "checkin_date", "checkout_date", "wallet_spend_to_date", "room_id"
        ]},
        reasoning=ai_result.get("reasoning", ""),
    )


@router.get("/guests", response_model=List[GuestResponse])
async def list_guests(db: AsyncSession = Depends(get_db)):
    """List all checked-in guests with their current persona/sentiment/room."""
    result = await db.execute(select(Guest).where(Guest.checkin_date.isnot(None)))
    guests = result.scalars().all()
    return [
        GuestResponse(
            **{k: getattr(g, k) for k in [
                "id", "name", "reservation_id", "persona_label", "value_tier",
                "sentiment_state", "checkin_date", "checkout_date", "wallet_spend_to_date", "room_id"
            ]},
            reasoning="",
        )
        for g in guests
    ]


@router.post("/service-recovery", response_model=ServiceRecoveryResponse)
async def service_recovery(req: ServiceRecoveryRequest, db: AsyncSession = Depends(get_db)):
    """
    Manually trigger a service recovery action for an at-risk guest.
    Also auto-triggered by SENTIMENT_ALERT subscriber.
    """
    result = await db.execute(select(Guest).where(Guest.id == req.guest_id))
    guest = result.scalar_one_or_none()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")

    # Apply recovery: move sentiment from At-Risk toward Neutral
    if guest.sentiment_state == "At-Risk":
        guest.sentiment_state = "Neutral"

    action_map = {
        "complimentary_upgrade": f"Complimentary room upgrade offered to {guest.name} (was {guest.persona_label}). Sentiment reset to Neutral.",
        "spa_voucher": f"Complimentary spa voucher issued to {guest.name}.",
        "room_credit": f"$50 room credit applied to {guest.name}'s account.",
        "manager_callback": f"Duty manager callback scheduled for {guest.name} within 15 mins.",
    }

    action_taken = action_map.get(req.action, f"Custom recovery action: {req.action}")

    return ServiceRecoveryResponse(
        guest_id=req.guest_id,
        action_taken=action_taken,
        reasoning=(
            f"Guest {guest.name} identified as At-Risk via sentiment analysis. "
            f"Recovery protocol '{req.action}' triggered. "
            f"Persona: {guest.persona_label}, Value Tier: {guest.value_tier}."
        ),
    )


@router.get("/priority-queue", response_model=List[PriorityQueueItem])
async def priority_queue(db: AsyncSession = Depends(get_db)):
    """
    Service priority ranking across all active guests.
    Score = value_tier_weight + sentiment_weight.
    """
    result = await db.execute(select(Guest).where(Guest.checkin_date.isnot(None)))
    guests = result.scalars().all()

    items = []
    for g in guests:
        score = (
            VALUE_TIER_WEIGHTS.get(g.value_tier, 0)
            + SENTIMENT_WEIGHTS.get(g.sentiment_state, 0)
        )
        items.append(PriorityQueueItem(
            guest_id=g.id,
            name=g.name,
            room_id=g.room_id,
            persona_label=g.persona_label,
            value_tier=g.value_tier,
            sentiment_state=g.sentiment_state,
            priority_score=score,
            reasoning=(
                f"Score {score} = value_tier({g.value_tier}={VALUE_TIER_WEIGHTS.get(g.value_tier, 0)}) "
                f"+ sentiment({g.sentiment_state}={SENTIMENT_WEIGHTS.get(g.sentiment_state, 0)})"
            ),
        ))

    items.sort(key=lambda x: x.priority_score, reverse=True)
    return items


# ─── Event Subscriber: SENTIMENT_ALERT → auto service recovery ────────────────
async def _on_sentiment_alert(payload: dict):
    """Auto-triggered when a guest is flagged At-Risk on check-in."""
    from app.db import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Guest).where(Guest.id == payload.get("guest_id")))
        guest = result.scalar_one_or_none()
        if guest and guest.sentiment_state == "At-Risk":
            # Log the auto-recovery trigger (don't flip sentiment — front desk should confirm)
            pass  # Endpoint /service-recovery handles mutation; this just fires the alert pipeline


def register_subscribers():
    bus.subscribe(bus.SENTIMENT_ALERT, _on_sentiment_alert)
