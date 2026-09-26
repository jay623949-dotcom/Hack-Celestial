from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db import Base


class HousekeepingTask(Base):
    __tablename__ = "housekeeping_tasks"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, nullable=False, index=True)
    status = Column(String, default="dirty")        # dirty / cleaning / ready / blocked
    priority_rank = Column(Integer, default=100)    # Lower = higher priority
    assigned_housekeeper_id = Column(Integer, nullable=True)
    eta_minutes = Column(Integer, default=30)
    blocked = Column(String, default="false")       # "true" if maintenance blocking
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
