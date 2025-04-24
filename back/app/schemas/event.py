from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

from app.schemas.photo import Photo


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    cover_image_url: Optional[str] = None
    video_url: Optional[str] = None
    photos: List[Photo] = []

    @field_validator("date")
    @classmethod
    def parse_date(cls, value: Optional[datetime]) -> Optional[datetime]:
        if value is None:
            return value
        if isinstance(value, str):
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if value.tzinfo is not None:
            value = value.replace(tzinfo=None)
        return value


class EventCreate(EventBase):
    pass

class EventUpdate(EventBase):
    pass


class Event(EventBase):
    id: int

    class Config:
        from_attributes = True