from sqlalchemy import Column, Integer, String
from app.database import Base


class EmojiMapping(Base):
    __tablename__ = "emoji_mappings"

    id = Column(Integer, primary_key=True, index=True)
    mapping_type = Column(String(20), nullable=False, index=True)
    key = Column(String(50), nullable=False)
    emoji = Column(String(30), nullable=False)
    label = Column(String(100), nullable=True)
