from sqlalchemy import Column, Integer, String
from app.db import Base


class PartsInventory(Base):
    __tablename__ = "parts_inventory"

    id = Column(Integer, primary_key=True, index=True)
    part_name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)     # hvac / plumbing / electrical / pool / elevator
    stock_count = Column(Integer, default=0)
    unit_cost = Column(Integer, default=50)         # USD
    reorder_threshold = Column(Integer, default=2)
