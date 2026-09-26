"""
Maintenance Agent Service
Publishers: MAINTENANCE_REQUIRED, ROOM_STATUS_CHANGED, COST_INCIDENT_LOGGED
Differentiators: CV Triage, Micro-Leak & Phantom Load Detection
"""
import base64
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.db import get_db
from app.models.room import Room
from app.models.workorder import WorkOrder
from app.models.asset import Asset
from app.models.technician import Technician
from app.models.meter import MeterReading
from app.models.parts import PartsInventory
from app.schemas.schemas import (
    MaintenanceTicketRequest, WorkOrderResponse, ResolveWorkOrderRequest,
    ImageTriageRequest, ImageTriageResponse, AnomalyScanResponse
)
from app.ai.mock_ai_client import cv_triage
import app.event_bus as bus

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

# ─── Guardrail Constants (document at /api/guardrails) ───────────────────────
CV_CONFIDENCE_CUTOFF = 0.6
BASELINE_VACANT_POWER_KWH = 0.5       # kWh per reading period for vacant room
BASELINE_VACANT_WATER_LITRES = 0.0    # Litres per reading for vacant room (should be 0)
UNIT_COST_POWER = 0.15                # USD per kWh
UNIT_COST_WATER = 0.004              # USD per litre
DAYS_UNDETECTED = 3                   # Used in cost impact calc

# ─── Troubleshooting guide links (keyed by asset_type) ────────────────────────
TROUBLESHOOTING_LINKS = {
    "hvac": "https://resort360.internal/guides/hvac-troubleshooting",
    "plumbing": "https://resort360.internal/guides/plumbing-troubleshooting",
    "electrical": "https://resort360.internal/guides/electrical-safety",
    "pool": "https://resort360.internal/guides/pool-maintenance",
    "elevator": "https://resort360.internal/guides/elevator-inspection",
    "furniture": "https://resort360.internal/guides/furniture-repair",
    "default": "https://resort360.internal/guides/general-maintenance",
}

# ─── Keyword priority triage ──────────────────────────────────────────────────
SAFETY_KEYWORDS = ["fire", "smoke", "gas", "spark", "electric", "flood", "structural", "collapse", "emergency"]
GUEST_FACING_KEYWORDS = ["leak", "no hot water", "ac", "hvac", "lock", "door", "window", "noise", "plumbing"]
COSMETIC_KEYWORDS = ["stain", "scratch", "paint", "furniture", "carpet", "curtain", "bulb", "dim"]


def keyword_triage(description: str) -> str:
    desc = description.lower()
    if any(kw in desc for kw in SAFETY_KEYWORDS):
        return "safety"
    if any(kw in desc for kw in GUEST_FACING_KEYWORDS):
        return "guest-facing"
    if any(kw in desc for kw in COSMETIC_KEYWORDS):
        return "cosmetic"
    return "deferred"


# ─── Contextual Repair Brief Generator ────────────────────────────────────────
async def generate_repair_brief(db: AsyncSession, asset_type: str, description: str) -> str:
    """
    Query Asset repair_history for recurring patterns.
    Generate a templated brief: symptom + likely cause + first diagnostic + guide link.
    """
    result = await db.execute(select(Asset).where(Asset.asset_type == asset_type))
    assets = result.scalars().all()

    recurring = False
    recurring_issue = ""
    for asset in assets:
        history = asset.repair_history or []
        issue_types = [h.get("issue_type", "") for h in history]
        # Check for recurring pattern (same issue appearing 2+ times)
        desc_lower = description.lower()
        for issue_type in set(issue_types):
            if issue_type and issue_types.count(issue_type) >= 2 and issue_type.lower() in desc_lower:
                recurring = True
                recurring_issue = issue_type
                break

    guide_link = TROUBLESHOOTING_LINKS.get(asset_type, TROUBLESHOOTING_LINKS["default"])

    brief_parts = [f"SYMPTOM: {description[:200]}"]
    if recurring:
        brief_parts.append(f"LIKELY CAUSE: Recurring '{recurring_issue}' issue detected in asset history ({asset_type}). Check for systemic failure.")
    else:
        brief_parts.append(f"LIKELY CAUSE: First occurrence for this asset type. Standard diagnostic recommended.")
    brief_parts.append(f"FIRST STEP: Inspect {asset_type} unit for visible damage or blockage.")
    brief_parts.append(f"GUIDE: {guide_link}")
    if recurring:
        brief_parts.append("FLAG: Schedule preventive maintenance review after resolution.")

    return " | ".join(brief_parts)


# ─── Auto-assign technician ────────────────────────────────────────────────────
async def auto_assign_technician(db: AsyncSession, asset_type: str) -> Optional[int]:
    """Find the least-loaded technician with the right skill tag."""
    result = await db.execute(
        select(Technician)
        .where(Technician.status == "available")
        .order_by(Technician.current_job_count)
    )
    technicians = result.scalars().all()

    for tech in technicians:
        skills = tech.skill_tags or []
        if asset_type in skills or "general" in skills:
            tech.current_job_count += 1
            return tech.id
    return None


# ─── Endpoints ────────────────────────────────────────────────────────────────
@router.post("/upload-ticket", response_model=WorkOrderResponse)
async def upload_ticket(req: MaintenanceTicketRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a work order from a maintenance ticket.
    If image provided, call CV triage. Else use keyword triage.
    Publishes MAINTENANCE_REQUIRED + ROOM_STATUS_CHANGED for safety/fault issues.
    """
    room_result = await db.execute(select(Room).where(Room.id == req.room_id))
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail=f"Room {req.room_id} not found")

    ai_result = None
    priority = "cosmetic"
    asset_type = "general"
    reasoning = ""

    # Try CV triage if image provided, fallback to keyword triage
    if req.image_base64:
        try:
            image_data = base64.b64decode(req.image_base64)
            ai_result = await cv_triage(image_data=image_data, description=req.description)
            priority = ai_result.get("priority", "cosmetic")
            asset_type = ai_result.get("identified_asset_type", "general")
            reasoning = ai_result.get("reasoning", "")
        except Exception as e:
            # Graceful fallback to keyword triage
            priority = keyword_triage(req.description)
            reasoning = f"CV triage failed ({e}), keyword fallback used."
    else:
        priority = keyword_triage(req.description)
        reasoning = f"Keyword triage applied. Priority: {priority}."

    # Find related asset
    asset_result = await db.execute(
        select(Asset).where(and_(Asset.room_id == req.room_id, Asset.asset_type == asset_type))
    )
    asset = asset_result.scalar_one_or_none()
    asset_id = asset.id if asset else None

    # Generate contextual repair brief
    repair_brief = await generate_repair_brief(db, asset_type, req.description)

    # Auto-assign technician
    technician_id = await auto_assign_technician(db, asset_type)

    # Create work order
    wo = WorkOrder(
        room_id=req.room_id,
        asset_id=asset_id,
        source=req.source,
        description=req.description,
        priority=priority,
        status="open",
        assigned_technician_id=technician_id,
        repair_brief=repair_brief,
        estimated_cost_impact=0.0,
    )
    db.add(wo)
    await db.flush()
    await db.refresh(wo)

    # Safety/fault room handling
    room_changed = False
    if priority == "safety":
        room.fault_free = False
        room.status = "maintenance"
        room_changed = True

    if room_changed:
        await bus.publish(bus.ROOM_STATUS_CHANGED, {
            "room_id": req.room_id,
            "room_number": room.room_number,
            "new_status": "maintenance",
            "fault_free": False,
            "reason": f"Safety-priority work order #{wo.id} created: {req.description[:100]}",
        })
        await bus.publish(bus.MAINTENANCE_REQUIRED, {
            "room_id": req.room_id,
            "room_number": room.room_number,
            "work_order_id": wo.id,
            "priority": priority,
            "description": req.description,
            "reason": req.description,
            "assigned_technician_id": technician_id,
        })

        # Log cost incident for Revenue agent
        estimated_cost = 500.0 if priority == "safety" else 150.0
        wo.estimated_cost_impact = estimated_cost
        await bus.publish(bus.COST_INCIDENT_LOGGED, {
            "room_id": req.room_id,
            "work_order_id": wo.id,
            "cost_estimate": estimated_cost,
            "priority": priority,
            "description": req.description,
            "reasoning": f"Work order #{wo.id} estimated cost impact: ${estimated_cost}",
        })

    return WorkOrderResponse(
        id=wo.id,
        room_id=wo.room_id,
        asset_id=wo.asset_id,
        source=wo.source,
        description=wo.description,
        priority=wo.priority,
        status=wo.status,
        assigned_technician_id=wo.assigned_technician_id,
        repair_brief=wo.repair_brief,
        estimated_cost_impact=wo.estimated_cost_impact,
        requires_human_review=wo.requires_human_review or "false",
        required_part=wo.required_part,
        part_in_stock=wo.part_in_stock,
        reasoning=reasoning,
    )


@router.post("/resolve")
async def resolve_work_order(req: ResolveWorkOrderRequest, db: AsyncSession = Depends(get_db)):
    """Mark WorkOrder resolved. Flips room.fault_free=True only if no other open WOs exist."""
    wo_result = await db.execute(select(WorkOrder).where(WorkOrder.id == req.work_order_id))
    wo = wo_result.scalar_one_or_none()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    wo.status = "resolved"
    wo.resolved_at = datetime.now(timezone.utc)

    # Check for other open work orders on same room
    if wo.room_id:
        open_result = await db.execute(
            select(WorkOrder).where(
                and_(
                    WorkOrder.room_id == wo.room_id,
                    WorkOrder.status.in_(["open", "in-progress"]),
                    WorkOrder.id != wo.id,
                )
            )
        )
        other_open = open_result.scalars().all()

        room_result = await db.execute(select(Room).where(Room.id == wo.room_id))
        room = room_result.scalar_one_or_none()

        if room and len(other_open) == 0:
            room.fault_free = True
            room.status = "available"
            await bus.publish(bus.ROOM_STATUS_CHANGED, {
                "room_id": wo.room_id,
                "room_number": room.room_number,
                "new_status": "available",
                "fault_free": True,
                "reason": f"All work orders resolved. Last resolved: {req.resolution_notes or 'WO#' + str(wo.id)}",
            })

    # Release technician
    if wo.assigned_technician_id:
        tech_result = await db.execute(select(Technician).where(Technician.id == wo.assigned_technician_id))
        tech = tech_result.scalar_one_or_none()
        if tech and tech.current_job_count > 0:
            tech.current_job_count -= 1

    return {
        "ok": True,
        "work_order_id": wo.id,
        "reasoning": f"Work order #{wo.id} resolved. {req.resolution_notes}",
    }


@router.get("/rooms/available-safe")
async def available_safe_rooms(db: AsyncSession = Depends(get_db)):
    """Rooms where status=available AND fault_free=true. Front Desk depends on this exact contract."""
    result = await db.execute(
        select(Room).where(and_(Room.status == "available", Room.fault_free == True))
    )
    rooms = result.scalars().all()
    return {
        "rooms": [
            {
                "id": r.id,
                "room_number": r.room_number,
                "category": r.category,
                "current_rate": r.current_rate,
                "floor": r.floor,
                "wing": r.wing,
                "fault_free": r.fault_free,
                "status": r.status,
            }
            for r in rooms
        ],
        "count": len(rooms),
        "reasoning": "Filtered by status=available AND fault_free=true per front desk contract.",
    }


# ─── Differentiator A: CV Triage ──────────────────────────────────────────────
@router.post("/diagnostics/image-triage", response_model=ImageTriageResponse)
async def image_triage(req: ImageTriageRequest, db: AsyncSession = Depends(get_db)):
    """Computer vision triage — calls AI CV endpoint, cross-references parts inventory."""
    try:
        image_data = base64.b64decode(req.image_base64) if req.image_base64 else None
        ai_result = await cv_triage(image_data=image_data, description=req.description)
    except Exception as e:
        # Graceful fallback
        ai_result = {
            "identified_asset": "unknown",
            "identified_asset_type": "general",
            "visible_issue": req.description,
            "confidence_score": 0.4,
            "priority": "deferred",
            "reasoning": f"CV triage failed ({e}). Manual review required.",
        }

    confidence = ai_result.get("confidence_score", 0.0)
    requires_review = confidence < CV_CONFIDENCE_CUTOFF
    asset_type = ai_result.get("identified_asset_type", "general")

    # Cross-reference parts inventory
    required_part = None
    part_in_stock = None

    if not requires_review:
        part_result = await db.execute(
            select(PartsInventory).where(PartsInventory.asset_type == asset_type)
        )
        part = part_result.scalar_one_or_none()
        if part:
            required_part = part.part_name
            part_in_stock = part.stock_count > 0

    # Create work order
    asset_result = await db.execute(
        select(Asset).where(and_(Asset.room_id == req.room_id, Asset.asset_type == asset_type))
    )
    asset = asset_result.scalar_one_or_none()

    repair_brief = await generate_repair_brief(db, asset_type, ai_result.get("visible_issue", req.description))

    wo = WorkOrder(
        room_id=req.room_id,
        asset_id=asset.id if asset else None,
        source=req.source or "cv_triage",
        description=ai_result.get("visible_issue", req.description),
        priority=ai_result.get("priority", "deferred"),
        status="open",
        repair_brief=repair_brief,
        requires_human_review="true" if requires_review else "false",
        required_part=required_part,
        part_in_stock="true" if part_in_stock else ("false" if part_in_stock is not None else None),
        estimated_cost_impact=200.0 if ai_result.get("priority") == "safety" else 50.0,
    )
    db.add(wo)
    await db.flush()
    await db.refresh(wo)

    # If safety priority, update room and publish events
    if ai_result.get("priority") == "safety" and not requires_review:
        room_result = await db.execute(select(Room).where(Room.id == req.room_id))
        room = room_result.scalar_one_or_none()
        if room:
            room.fault_free = False
            room.status = "maintenance"
            await bus.publish(bus.ROOM_STATUS_CHANGED, {
                "room_id": req.room_id,
                "new_status": "maintenance",
                "fault_free": False,
                "reason": f"CV triage safety issue: {ai_result.get('visible_issue')}",
            })
            await bus.publish(bus.MAINTENANCE_REQUIRED, {
                "room_id": req.room_id,
                "work_order_id": wo.id,
                "priority": "safety",
                "description": ai_result.get("visible_issue", ""),
                "reason": ai_result.get("visible_issue", ""),
            })

    return ImageTriageResponse(
        work_order_id=wo.id,
        identified_asset=ai_result.get("identified_asset", "unknown"),
        identified_asset_type=asset_type,
        visible_issue=ai_result.get("visible_issue", ""),
        confidence_score=confidence,
        requires_human_review=requires_review,
        required_part=required_part,
        part_in_stock=part_in_stock,
        priority=ai_result.get("priority", "deferred"),
        reasoning=ai_result.get("reasoning", ""),
    )


# ─── Differentiator B: Anomaly Scan ───────────────────────────────────────────
_active_anomalies: List[dict] = []


@router.post("/anomaly/scan", response_model=AnomalyScanResponse)
async def anomaly_scan(db: AsyncSession = Depends(get_db)):
    """
    Scan all rooms for micro-leak / phantom load anomalies.
    Flags: nonzero water usage in vacant room, power > threshold in vacant room.
    Computes cost impact and auto-creates low-priority work orders.
    """
    global _active_anomalies
    _active_anomalies = []
    flagged = []

    rooms_result = await db.execute(select(Room))
    rooms = rooms_result.scalars().all()

    for room in rooms:
        # Get latest meter readings for this room
        water_result = await db.execute(
            select(MeterReading)
            .where(and_(MeterReading.room_id == room.id, MeterReading.meter_type == "water"))
            .order_by(MeterReading.timestamp.desc())
        )
        water_reading = water_result.scalar_one_or_none()

        power_result = await db.execute(
            select(MeterReading)
            .where(and_(MeterReading.room_id == room.id, MeterReading.meter_type == "power"))
            .order_by(MeterReading.timestamp.desc())
        )
        power_reading = power_result.scalar_one_or_none()

        incident = None

        if water_reading and water_reading.occupancy_status_at_time == "vacant":
            excess_litres = max(0, water_reading.reading_value - BASELINE_VACANT_WATER_LITRES)
            if excess_litres > 0:
                cost = excess_litres * UNIT_COST_WATER * DAYS_UNDETECTED * 24
                incident = {
                    "room_id": room.id,
                    "room_number": room.room_number,
                    "type": "micro_leak",
                    "meter_type": "water",
                    "reading_value": water_reading.reading_value,
                    "baseline": BASELINE_VACANT_WATER_LITRES,
                    "excess": excess_litres,
                    "estimated_cost_impact": round(cost, 2),
                    "reasoning": (
                        f"Room {room.room_number} is vacant but water reading={water_reading.reading_value}L "
                        f"(baseline={BASELINE_VACANT_WATER_LITRES}L). "
                        f"Cost = {excess_litres}L × ${UNIT_COST_WATER}/L × {DAYS_UNDETECTED}days × 24h = ${cost:.2f}"
                    ),
                }

        elif power_reading and power_reading.occupancy_status_at_time == "vacant":
            excess_kwh = max(0, power_reading.reading_value - BASELINE_VACANT_POWER_KWH)
            if excess_kwh > 0:
                cost = excess_kwh * UNIT_COST_POWER * DAYS_UNDETECTED * 24
                incident = {
                    "room_id": room.id,
                    "room_number": room.room_number,
                    "type": "phantom_load",
                    "meter_type": "power",
                    "reading_value": power_reading.reading_value,
                    "baseline": BASELINE_VACANT_POWER_KWH,
                    "excess": excess_kwh,
                    "estimated_cost_impact": round(cost, 2),
                    "reasoning": (
                        f"Room {room.room_number} is vacant but power draw={power_reading.reading_value}kWh "
                        f"(baseline={BASELINE_VACANT_POWER_KWH}kWh). "
                        f"Cost = {excess_kwh}kWh × ${UNIT_COST_POWER}/kWh × {DAYS_UNDETECTED}days × 24h = ${cost:.2f}"
                    ),
                }

        if incident:
            flagged.append(incident)
            _active_anomalies.append(incident)

            # Auto-create low-priority work order
            wo = WorkOrder(
                room_id=room.id,
                source="system",
                description=f"Anomaly detected: {incident['type']} in room {room.room_number}",
                priority="deferred",
                status="open",
                estimated_cost_impact=incident["estimated_cost_impact"],
                repair_brief=f"SYMPTOM: {incident['type']} | FIRST STEP: Inspect {incident['meter_type']} meter and connections in room {room.room_number} | GUIDE: {TROUBLESHOOTING_LINKS.get('plumbing' if incident['type'] == 'micro_leak' else 'electrical', TROUBLESHOOTING_LINKS['default'])}",
            )
            db.add(wo)
            await db.flush()

            # Publish cost incident — triggers Revenue net RevPAR live update
            await bus.publish(bus.COST_INCIDENT_LOGGED, {
                "room_id": room.id,
                "room_number": room.room_number,
                "work_order_id": wo.id,
                "anomaly_type": incident["type"],
                "cost_estimate": incident["estimated_cost_impact"],
                "reasoning": incident["reasoning"],
            })

    total_cost = sum(f["estimated_cost_impact"] for f in flagged)
    flagged.sort(key=lambda x: x["estimated_cost_impact"], reverse=True)

    return AnomalyScanResponse(
        flagged_rooms=flagged,
        total_estimated_cost_impact=round(total_cost, 2),
        scan_timestamp=datetime.now(timezone.utc),
        reasoning=f"Scanned {len(rooms)} rooms. Found {len(flagged)} anomalies with total estimated cost impact ${total_cost:.2f}. Constants: unit_cost_water=${UNIT_COST_WATER}/L, unit_cost_power=${UNIT_COST_POWER}/kWh, days_undetected={DAYS_UNDETECTED}.",
    )


@router.get("/anomaly/active")
async def active_anomalies():
    """Return current flagged anomalies sorted by estimated_cost_impact descending."""
    sorted_anomalies = sorted(_active_anomalies, key=lambda x: x["estimated_cost_impact"], reverse=True)
    return {
        "anomalies": sorted_anomalies,
        "count": len(sorted_anomalies),
        "total_estimated_cost_impact": sum(a["estimated_cost_impact"] for a in sorted_anomalies),
    }


# ─── Background Task: Meter Reading Simulator ─────────────────────────────────
async def simulate_meter_readings():
    """
    Async background task — simulates meter readings every 15 seconds.
    Seeds realistic baseline for most rooms; anomalous readings for demo rooms
    (rooms 204, 208 as configured in seed data).
    """
    import asyncio
    import random
    from app.db import AsyncSessionLocal

    ANOMALOUS_ROOMS = [204, 208]  # Room IDs that are seeded to show leaks

    while True:
        try:
            async with AsyncSessionLocal() as db:
                rooms_result = await db.execute(select(Room))
                rooms = rooms_result.scalars().all()

                for room in rooms:
                    occupancy = "occupied" if room.status == "occupied" else "vacant"

                    # Water reading
                    if room.id in ANOMALOUS_ROOMS and occupancy == "vacant":
                        water_val = round(random.uniform(8.0, 15.0), 2)  # Anomalous!
                        power_val = round(random.uniform(1.5, 3.5), 2)   # Anomalous!
                    elif occupancy == "occupied":
                        water_val = round(random.uniform(20.0, 60.0), 2)
                        power_val = round(random.uniform(1.0, 4.0), 2)
                    else:
                        water_val = 0.0
                        power_val = round(random.uniform(0.1, 0.4), 2)  # Normal standby

                    db.add(MeterReading(
                        meter_type="water",
                        room_id=room.id,
                        reading_value=water_val,
                        occupancy_status_at_time=occupancy,
                    ))
                    db.add(MeterReading(
                        meter_type="power",
                        room_id=room.id,
                        reading_value=power_val,
                        occupancy_status_at_time=occupancy,
                    ))

                await db.commit()
        except Exception:
            pass  # Don't let background task crash the app

        await asyncio.sleep(15)


def register_subscribers():
    pass  # Maintenance is primary publisher; no subscriptions needed here
