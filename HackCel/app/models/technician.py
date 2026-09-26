from sqlalchemy import Column, Integer, String, JSON
from app.db import Base


class Technician(Base):
    __tablename__ = "technicians"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    skill_tags = Column(JSON, default=list)         # ["plumbing", "electrical", etc.]
    current_job_count = Column(Integer, default=0)
    status = Column(String, default="available")    # available / busy / off-duty
