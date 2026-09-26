from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db import Base


class MeterReading(Base):
    __tablename__ = "meter_readings"

    id = Column(Integer, primary_key=True, index=True)
    meter_type = Column(String, nullable=False)     # water / power
    room_id = Column(Integer, nullable=True)
    reading_value = Column(Float, nullable=False)   # litres for water, kWh for power
    timestamp = Column(DateTime, server_default=func.now())
    occupancy_status_at_time = Column(String, default="unknown")  # occupied / vacant
