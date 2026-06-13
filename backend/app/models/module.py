from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from app.database import Base


class LearningModule(Base):
    __tablename__ = "learning_modules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    module_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=False)


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("learning_modules.id"), nullable=False)
    name = Column(String(100), nullable=False)
    lesson_type = Column(String(50), nullable=False)
    target = Column(String(10), nullable=False)
    content = Column(JSON, nullable=True)
    sort_order = Column(Integer, nullable=False)


class LessonImage(Base):
    __tablename__ = "lesson_images"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    reference = Column(String(50), nullable=False)
    image_url = Column(String(500), nullable=True)
    source = Column(String(50), default="emoji")
