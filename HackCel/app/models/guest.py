from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from app.db import Base


class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    reservation_id = Column(String, unique=True, index=True, nullable=False)
    persona_label = Column(String, default="Business")  # 8 persona types
    value_tier = Column(String, default="Standard")     # VIP / Premium / Standard
    sentiment_state = Column(String, default="Neutral") # Positive / Neutral / At-Risk
    checkin_date = Column(DateTime, nullable=True)
    checkout_date = Column(DateTime, nullable=True)
    wallet_spend_to_date = Column(Float, default=0.0)
    room_id = Column(Integer, nullable=True)            # Assigned room
    created_at = Column(DateTime, server_default=func.now())
