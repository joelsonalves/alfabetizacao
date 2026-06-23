from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base


class ScoringRule(Base):
    __tablename__ = "scoring_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_key = Column(String(50), unique=True, nullable=False, index=True)
    lesson_type = Column(String(50), nullable=True)
    value = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    active = Column(Boolean, default=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
