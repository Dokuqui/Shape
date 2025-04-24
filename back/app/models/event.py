from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship

from app.database import Base
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    location = Column(String)
    cover_image_url = Column(String)
    video_url = Column(String)

    photos = relationship("Photo", back_populates="event", cascade="all, delete")
