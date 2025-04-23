from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    cover_image_url: Optional[str] = None


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: int

    class Config:
        orm_mode = True
