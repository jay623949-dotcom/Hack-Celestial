from sqlalchemy import Column, Integer, String, Float, Boolean
from app.db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # standard / deluxe / suite / villa
    base_rate = Column(Float, nullable=False)
    current_rate = Column(Float, nullable=False)
    status = Column(String, default="available")  # available / occupied / maintenance
    fault_free = Column(Boolean, default=True)
    floor = Column(Integer, default=1)
    wing = Column(String, default="A")
