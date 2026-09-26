from sqlalchemy import Column, Integer, String, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.db import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_type = Column(String, nullable=False)     # hvac / plumbing / electrical / pool / elevator
    room_id = Column(Integer, nullable=True)        # Nullable for shared assets (pool, elevator)
    install_date = Column(DateTime, nullable=True)
    last_service_date = Column(DateTime, nullable=True)
    run_hours = Column(Float, default=0.0)
    repair_history = Column(JSON, default=list)     # List of {issue_type, date, resolved_by}
    location_label = Column(String, nullable=True)  # e.g., "Pool Pump Room", "Room 204"
