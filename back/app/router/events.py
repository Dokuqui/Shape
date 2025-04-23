from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.schemas.event import Event, EventCreate
from app.crud import event as crud
from app.database import get_db

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[Event])
async def read_events(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await crud.get_events(db, skip=skip, limit=limit)


@router.get("/{event_id}", response_model=Event)
async def read_event(event_id: int, db: AsyncSession = Depends(get_db)):
    db_event = await crud.get_event(db, event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event


@router.post("/", response_model=Event)
async def create_event(event: EventCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_event(db, event)
