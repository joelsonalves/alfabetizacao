from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class AchievementDefinition(Base):
    __tablename__ = "achievement_definitions"

    id = Column(Integer, primary_key=True, index=True)
    achievement_type = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    icon = Column(String(30), nullable=True)
    criteria = Column(String(500), nullable=True)
    active = Column(Boolean, default=True)
