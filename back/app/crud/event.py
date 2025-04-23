from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.event import Event as EventModel
from app.schemas.event import EventCreate

async def get_event(db: AsyncSession, event_id: int):
    result = await db.execute(select(EventModel).where(EventModel.id == event_id))
    return result.scalars().first()

async def get_events(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(EventModel).offset(skip).limit(limit))
    return result.scalars().all()

async def create_event(db: AsyncSession, event: EventCreate):
    db_event = EventModel(**event.model_dump())
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event