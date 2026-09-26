from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, nullable=False, index=True)
    offer_type = Column(String, nullable=False)     # flash_sale / upgrade / bundle
    persona_match = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    expiry = Column(DateTime, nullable=True)
    status = Column(String, default="pending")      # pending / accepted / expired / declined
    offer_copy = Column(Text, nullable=True)        # AI-generated persona-framed copy
    created_at = Column(DateTime, server_default=func.now())
