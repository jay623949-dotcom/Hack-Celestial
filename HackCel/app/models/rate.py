from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db import Base


class RateChangeLog(Base):
    __tablename__ = "rate_change_logs"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, nullable=True)            # Nullable for category-level changes
    room_category = Column(String, nullable=True)
    old_rate = Column(Float, nullable=False)
    new_rate = Column(Float, nullable=False)
    trigger_reason = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
