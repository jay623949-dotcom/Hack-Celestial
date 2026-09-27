from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db import Base


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, nullable=True)
    room_id = Column(Integer, nullable=True, index=True)
    source = Column(String, default="staff")        # guest / staff / system / cv_triage
    description = Column(Text, nullable=False)
    priority = Column(String, default="cosmetic")   # safety / guest-facing / cosmetic / deferred
    status = Column(String, default="open")         # open / in-progress / resolved
    assigned_technician_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)
    repair_brief = Column(Text, nullable=True)      # AI-generated contextual brief
    estimated_cost_impact = Column(Float, default=0.0)
    requires_human_review = Column(String, default="false")
    required_part = Column(String, nullable=True)
    part_in_stock = Column(String, nullable=True)
