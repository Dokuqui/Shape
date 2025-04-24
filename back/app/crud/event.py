from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime

from app.models.event import Event as EventModel
from app.schemas.event import EventCreate, EventUpdate

async def get_event(db: AsyncSession, event_id: int) -> Optional[EventModel]:
    result = await db.execute(select(EventModel).where(EventModel.id == event_id))
    return result.scalars().first()

async def get_events(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    title: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None
) -> List[EventModel]:
    query = select(EventModel)

    if title:
        query = query.where(EventModel.title.ilike(f"%{title}%"))
    if from_date:
        query = query.where(EventModel.date >= from_date)
    if to_date:
        query = query.where(EventModel.date <= to_date)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def create_event(db: AsyncSession, event: EventCreate) -> EventModel:
    event_dict = event.model_dump()
    if event_dict["date"] is not None and isinstance(event_dict["date"], datetime) and event_dict[
        "date"].tzinfo is not None:
        event_dict["date"] = event_dict["date"].replace(tzinfo=None)

    db_event = EventModel(**event_dict)
    db.add(db_event)
    try:
        await db.commit()
        await db.refresh(db_event)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create event."
        ) from e
    return db_event

async def update_event(db: AsyncSession, event_id: int, event_update: EventUpdate) -> Optional[EventModel]:
    result = await db.execute(select(EventModel).where(EventModel.id == event_id))
    event = result.scalars().first()
    if event is None:
        return None
    for key, value in event_update.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    await db.commit()
    await db.refresh(event)
    return event

async def delete_event(db: AsyncSession, event_id: int) -> bool:
    result = await db.execute(select(EventModel).where(EventModel.id == event_id))
    event = result.scalars().first()
    if event is None:
        return False
    await db.delete(event)
    await db.commit()
    return True