"""
Seed data script — populates all tables for demo.
Run directly or called by POST /demo/reset.
"""
import asyncio
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import engine, AsyncSessionLocal, Base
from app.models.guest import Guest
from app.models.room import Room
from app.models.asset import Asset
from app.models.technician import Technician
from app.models.housekeeping import HousekeepingTask
from app.models.meter import MeterReading
from app.models.parts import PartsInventory
from app.models.workorder import WorkOrder
from app.models.offer import Offer
from app.models.rate import RateChangeLog


async def drop_and_recreate():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


async def seed(db: AsyncSession):
    now = datetime.now(timezone.utc)

    # ─── Rooms 101–310 ────────────────────────────────────────────────────────
    rooms_data = []
    categories = {
        1: ("standard", 149.0, "A"),
        2: ("deluxe", 219.0, "A"),
        3: ("suite", 349.0, "B"),
    }
    for floor, (cat, base_rate, wing) in categories.items():
        for room_num in range(1, 11):
            r_num = f"{floor}{room_num:02d}"
            room = Room(
                room_number=r_num,
                category=cat,
                base_rate=base_rate,
                current_rate=base_rate,
                status="available",
                fault_free=True,
                floor=floor,
                wing=wing,
            )
            rooms_data.append(room)

    # Add villa rooms
    for i in range(1, 4):
        room = Room(
            room_number=f"V{i:02d}",
            category="villa",
            base_rate=599.0,
            current_rate=599.0,
            status="available",
            fault_free=True,
            floor=1,
            wing="C",
        )
        rooms_data.append(room)

    for r in rooms_data:
        db.add(r)
    await db.flush()

    # Get room IDs by number for later reference
    room_map = {r.room_number: r.id for r in rooms_data}

    # ─── Technicians ─────────────────────────────────────────────────────────
    technicians = [
        Technician(name="Carlos Mendez", skill_tags=["plumbing", "hvac", "general"], current_job_count=0, status="available"),
        Technician(name="Priya Sharma", skill_tags=["electrical", "general"], current_job_count=0, status="available"),
        Technician(name="James Okafor", skill_tags=["hvac", "pool", "elevator"], current_job_count=0, status="available"),
    ]
    for t in technicians:
        db.add(t)
    await db.flush()

    # ─── Assets (15 assets across HVAC/plumbing/electrical/pool/elevator) ────
    assets_data = [
        # HVAC units
        Asset(asset_type="hvac", room_id=room_map.get("101"), install_date=now - timedelta(days=1200),
              last_service_date=now - timedelta(days=90), run_hours=4800,
              repair_history=[
                  {"issue_type": "refrigerant_low", "date": "2024-01-15", "resolved_by": "Carlos Mendez"},
                  {"issue_type": "refrigerant_low", "date": "2024-06-20", "resolved_by": "James Okafor"},
              ], location_label="Room 101"),
        Asset(asset_type="hvac", room_id=room_map.get("204"), install_date=now - timedelta(days=800),
              last_service_date=now - timedelta(days=45), run_hours=3200,
              repair_history=[
                  {"issue_type": "compressor_fault", "date": "2025-03-10", "resolved_by": "James Okafor"},
              ], location_label="Room 204"),
        Asset(asset_type="hvac", room_id=room_map.get("301"), install_date=now - timedelta(days=600),
              last_service_date=now - timedelta(days=30), run_hours=2400,
              repair_history=[], location_label="Room 301"),
        # Plumbing
        Asset(asset_type="plumbing", room_id=room_map.get("204"), install_date=now - timedelta(days=2000),
              last_service_date=now - timedelta(days=180), run_hours=0,
              repair_history=[
                  {"issue_type": "pipe_leak", "date": "2023-11-01", "resolved_by": "Carlos Mendez"},
                  {"issue_type": "pipe_leak", "date": "2024-08-15", "resolved_by": "Carlos Mendez"},
                  {"issue_type": "pipe_leak", "date": "2025-02-01", "resolved_by": "Carlos Mendez"},
              ], location_label="Room 204 Bathroom"),
        Asset(asset_type="plumbing", room_id=room_map.get("208"), install_date=now - timedelta(days=1500),
              last_service_date=now - timedelta(days=120), run_hours=0,
              repair_history=[
                  {"issue_type": "pipe_leak", "date": "2024-12-01", "resolved_by": "Carlos Mendez"},
                  {"issue_type": "pipe_leak", "date": "2025-05-20", "resolved_by": "Carlos Mendez"},
              ], location_label="Room 208 Bathroom"),
        Asset(asset_type="plumbing", room_id=room_map.get("102"), install_date=now - timedelta(days=900),
              last_service_date=now - timedelta(days=60), run_hours=0,
              repair_history=[], location_label="Room 102"),
        # Electrical
        Asset(asset_type="electrical", room_id=room_map.get("305"), install_date=now - timedelta(days=1800),
              last_service_date=now - timedelta(days=200), run_hours=0,
              repair_history=[
                  {"issue_type": "outlet_fault", "date": "2024-09-10", "resolved_by": "Priya Sharma"},
                  {"issue_type": "outlet_fault", "date": "2025-01-15", "resolved_by": "Priya Sharma"},
              ], location_label="Room 305"),
        Asset(asset_type="electrical", room_id=room_map.get("103"), install_date=now - timedelta(days=400),
              last_service_date=now - timedelta(days=20), run_hours=0,
              repair_history=[], location_label="Room 103"),
        # Pool
        Asset(asset_type="pool", room_id=None, install_date=now - timedelta(days=3000),
              last_service_date=now - timedelta(days=7), run_hours=15000,
              repair_history=[
                  {"issue_type": "pump_failure", "date": "2024-06-01", "resolved_by": "James Okafor"},
              ], location_label="Main Pool"),
        Asset(asset_type="pool", room_id=None, install_date=now - timedelta(days=1500),
              last_service_date=now - timedelta(days=14), run_hours=7000,
              repair_history=[], location_label="Infinity Pool"),
        # Elevator
        Asset(asset_type="elevator", room_id=None, install_date=now - timedelta(days=5000),
              last_service_date=now - timedelta(days=30), run_hours=25000,
              repair_history=[
                  {"issue_type": "door_sensor", "date": "2024-03-20", "resolved_by": "James Okafor"},
                  {"issue_type": "door_sensor", "date": "2025-04-01", "resolved_by": "James Okafor"},
              ], location_label="Main Elevator"),
        Asset(asset_type="elevator", room_id=None, install_date=now - timedelta(days=2000),
              last_service_date=now - timedelta(days=15), run_hours=10000,
              repair_history=[], location_label="Service Elevator"),
        # Furniture
        Asset(asset_type="furniture", room_id=room_map.get("201"), install_date=now - timedelta(days=500),
              last_service_date=now - timedelta(days=100), run_hours=0,
              repair_history=[{"issue_type": "upholstery_tear", "date": "2024-11-01", "resolved_by": "Staff"}],
              location_label="Room 201"),
        Asset(asset_type="furniture", room_id=room_map.get("304"), install_date=now - timedelta(days=300),
              last_service_date=None, run_hours=0,
              repair_history=[], location_label="Room 304"),
        Asset(asset_type="hvac", room_id=room_map.get("V01"), install_date=now - timedelta(days=700),
              last_service_date=now - timedelta(days=60), run_hours=3000,
              repair_history=[], location_label="Villa V01"),
    ]
    for a in assets_data:
        db.add(a)
    await db.flush()

    # ─── Guests (20 guests, all 8 personas, both value tiers) ────────────────
    guests_data = [
        # Business
        Guest(name="Marcus Chen", reservation_id="RES001", persona_label="Business", value_tier="Premium",
              sentiment_state="Neutral", checkin_date=now - timedelta(hours=2),
              checkout_date=now + timedelta(days=2), room_id=room_map.get("201"), wallet_spend_to_date=320.0),
        Guest(name="Sarah Mitchell", reservation_id="RES002", persona_label="Business", value_tier="Standard",
              sentiment_state="At-Risk", checkin_date=now - timedelta(hours=1),
              checkout_date=now + timedelta(days=1), room_id=room_map.get("202"), wallet_spend_to_date=80.0),
        # Luxury
        Guest(name="Isabella Fontaine", reservation_id="RES003", persona_label="Luxury", value_tier="VIP",
              sentiment_state="Positive", checkin_date=now - timedelta(hours=4),
              checkout_date=now + timedelta(days=5), room_id=room_map.get("301"), wallet_spend_to_date=1200.0),
        Guest(name="Alexander Voss", reservation_id="RES004", persona_label="Luxury", value_tier="VIP",
              sentiment_state="Positive", checkin_date=now - timedelta(hours=6),
              checkout_date=now + timedelta(days=3), room_id=room_map.get("V01"), wallet_spend_to_date=2100.0),
        # Family
        Guest(name="The Williams Family", reservation_id="RES005", persona_label="Family", value_tier="Standard",
              sentiment_state="Neutral", checkin_date=now - timedelta(hours=3),
              checkout_date=now + timedelta(days=4), room_id=room_map.get("105"), wallet_spend_to_date=450.0),
        Guest(name="The Rodriguez Family", reservation_id="RES006", persona_label="Family", value_tier="Standard",
              sentiment_state="Positive", checkin_date=now - timedelta(hours=5),
              checkout_date=now + timedelta(days=6), room_id=room_map.get("106"), wallet_spend_to_date=380.0),
        # Frugal
        Guest(name="David Park", reservation_id="RES007", persona_label="Frugal", value_tier="Standard",
              sentiment_state="Neutral", checkin_date=now - timedelta(hours=2),
              checkout_date=now + timedelta(days=2), room_id=room_map.get("103"), wallet_spend_to_date=40.0),
        Guest(name="Emma Watts", reservation_id="RES008", persona_label="Frugal", value_tier="Standard",
              sentiment_state="Neutral", checkin_date=now - timedelta(hours=1),
              checkout_date=now + timedelta(days=1), room_id=room_map.get("104"), wallet_spend_to_date=30.0),
        # Loyalist
        Guest(name="Robert Thompson", reservation_id="RES009", persona_label="Loyalist", value_tier="Premium",
              sentiment_state="Positive", checkin_date=now - timedelta(hours=8),
              checkout_date=now + timedelta(days=3), room_id=room_map.get("203"), wallet_spend_to_date=890.0),
        Guest(name="Jennifer Adams", reservation_id="RES010", persona_label="Loyalist", value_tier="Premium",
              sentiment_state="Positive", checkin_date=now - timedelta(hours=12),
              checkout_date=now + timedelta(days=2), room_id=room_map.get("205"), wallet_spend_to_date=650.0),
        # Wellness
        Guest(name="Amara Osei", reservation_id="RES011", persona_label="Wellness", value_tier="Premium",
              sentiment_state="Positive", checkin_date=now - timedelta(hours=3),
              checkout_date=now + timedelta(days=5), room_id=room_map.get("302"), wallet_spend_to_date=760.0),
        Guest(name="Sofia Reyes", reservation_id="RES012", persona_label="Wellness", value_tier="Standard",
              sentiment_state="Neutral", checkin_date=now - timedelta(hours=2),
              checkout_date=now + timedelta(days=3), room_id=room_map.get("107"), wallet_spend_to_date=220.0),
        # Adventure
        Guest(name="Jake Morrison", reservation_id="RES013", persona_label="Adventure", value_tier="Standard",
              sentiment_state="Positive", checkin_date=now - timedelta(hours=4),
              checkout_date=now + timedelta(days=7), room_id=room_map.get("108"), wallet_spend_to_date=310.0),
        Guest(name="Nina Kowalski", reservation_id="RES014", persona_label="Adventure", value_tier="Standard",
              sentiment_state="Neutral", checkin_date=now - timedelta(hours=6),
              checkout_date=now + timedelta(days=4), room_id=room_map.get("109"), wallet_spend_to_date=140.0),
        # Bleisure
        Guest(name="Priya Nair", reservation_id="RES015", persona_label="Bleisure", value_tier="Premium",
              sentiment_state="Neutral", checkin_date=now - timedelta(hours=2),
              checkout_date=now + timedelta(days=3), room_id=room_map.get("303"), wallet_spend_to_date=540.0),
        Guest(name="Liam O'Brien", reservation_id="RES016", persona_label="Bleisure", value_tier="Standard",
              sentiment_state="Neutral", checkin_date=now - timedelta(hours=1),
              checkout_date=now + timedelta(days=2), room_id=room_map.get("110"), wallet_spend_to_date=180.0),
        # Additional demo guests (unoccupied — available for demo cascade check-in)
        Guest(name="Thomas Reynolds", reservation_id="RES017", persona_label="Business", value_tier="Premium",
              sentiment_state="Neutral", checkin_date=None,
              checkout_date=now + timedelta(days=2), room_id=None, wallet_spend_to_date=0.0),
        Guest(name="Claire Bennett", reservation_id="RES018", persona_label="Luxury", value_tier="VIP",
              sentiment_state="Neutral", checkin_date=None,
              checkout_date=now + timedelta(days=3), room_id=None, wallet_spend_to_date=0.0),
        Guest(name="Miguel Torres", reservation_id="RES019", persona_label="Business", value_tier="Standard",
              sentiment_state="Neutral", checkin_date=None,
              checkout_date=now + timedelta(days=1), room_id=None, wallet_spend_to_date=0.0),
        Guest(name="Zhang Wei", reservation_id="RES020", persona_label="Luxury", value_tier="VIP",
              sentiment_state="Neutral", checkin_date=None,
              checkout_date=now + timedelta(days=4), room_id=None, wallet_spend_to_date=0.0),
    ]
    for g in guests_data:
        db.add(g)
    await db.flush()

    # Update room statuses for checked-in guests
    occupied_room_ids = [
        room_map.get(r) for r in [
            "201", "202", "301", "V01", "105", "106", "103", "104",
            "203", "205", "302", "107", "108", "109", "303", "110"
        ] if room_map.get(r)
    ]
    for room in rooms_data:
        if room.id in occupied_room_ids:
            room.status = "occupied"

    # ─── Housekeeping Tasks ────────────────────────────────────────────────────
    # Rooms that need cleaning (not currently occupied, being turned over)
    dirty_rooms = ["206", "207", "304", "305"]
    housekeepers = [1, 2, 3]  # Technician IDs used as housekeeper IDs for demo
    for rank, r_num in enumerate(dirty_rooms, start=1):
        r_id = room_map.get(r_num)
        if r_id:
            db.add(HousekeepingTask(
                room_id=r_id,
                status="dirty",
                priority_rank=rank,
                assigned_housekeeper_id=housekeepers[(rank - 1) % len(housekeepers)],
                eta_minutes=25 + rank * 5,
                blocked="false",
            ))

    # ─── Meter Readings (baseline + 2 anomalous rooms for demo) ───────────────
    anomalous_rooms = [room_map.get("204"), room_map.get("208")]

    for room in rooms_data:
        occupancy = "occupied" if room.status == "occupied" else "vacant"
        for hours_ago in [3, 2, 1]:
            ts = now - timedelta(hours=hours_ago)
            if room.id in anomalous_rooms and occupancy == "vacant":
                # Anomalous — non-zero water in vacant rooms
                water_val = 12.5 + hours_ago * 1.5
                power_val = 2.8 + hours_ago * 0.3
            elif occupancy == "occupied":
                water_val = 35.0
                power_val = 2.5
            else:
                water_val = 0.0
                power_val = 0.3  # Normal standby

            db.add(MeterReading(
                meter_type="water", room_id=room.id, reading_value=water_val,
                timestamp=ts, occupancy_status_at_time=occupancy,
            ))
            db.add(MeterReading(
                meter_type="power", room_id=room.id, reading_value=power_val,
                timestamp=ts, occupancy_status_at_time=occupancy,
            ))

    # ─── Parts Inventory ──────────────────────────────────────────────────────
    parts = [
        PartsInventory(part_name="HVAC Refrigerant R-410A", asset_type="hvac", stock_count=5, unit_cost=80),
        PartsInventory(part_name="HVAC Compressor", asset_type="hvac", stock_count=1, unit_cost=450),
        PartsInventory(part_name="Pipe Joint Kit", asset_type="plumbing", stock_count=8, unit_cost=25),
        PartsInventory(part_name="Sink Faucet Assembly", asset_type="plumbing", stock_count=3, unit_cost=95),
        PartsInventory(part_name="Outlet Circuit Breaker", asset_type="electrical", stock_count=0, unit_cost=35),  # Out of stock!
        PartsInventory(part_name="LED Panel Light", asset_type="electrical", stock_count=12, unit_cost=18),
        PartsInventory(part_name="Pool Pump Seal", asset_type="pool", stock_count=2, unit_cost=65),
        PartsInventory(part_name="Pool Filter Cartridge", asset_type="pool", stock_count=4, unit_cost=40),
        PartsInventory(part_name="Elevator Door Sensor", asset_type="elevator", stock_count=0, unit_cost=220),  # Out of stock!
        PartsInventory(part_name="Elevator Cable Tension Kit", asset_type="elevator", stock_count=1, unit_cost=580),
        PartsInventory(part_name="Upholstery Repair Kit", asset_type="furniture", stock_count=6, unit_cost=30),
    ]
    for p in parts:
        db.add(p)

    await db.flush()
    await db.commit()
    print(f"[seed_data] Seeded: {len(rooms_data)} rooms, 3 technicians, {len(assets_data)} assets, {len(guests_data)} guests, {len(parts)} parts.")


async def run_seed():
    await drop_and_recreate()
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(run_seed())
