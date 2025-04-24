from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import shutil

from app.schemas.event import Event, EventCreate, EventUpdate
from app.crud import event as crud
from app.database import get_db

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[Event])
async def read_events(
    skip: int = 0,
    limit: int = 10,
    title: Optional[str] = Query(None),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_events(db, skip=skip, limit=limit, title=title, from_date=from_date, to_date=to_date)


@router.get("/{event_id}", response_model=Event)
async def read_event(event_id: int, db: AsyncSession = Depends(get_db)):
    db_event = await crud.get_event(db, event_id)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event


@router.post("/", response_model=Event)
async def create_event(event: EventCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_event(db, event)


@router.put("/{event_id}", response_model=Event)
async def update_event(event_id: int, event: EventUpdate, db: AsyncSession = Depends(get_db)):
    db_event = await crud.update_event(db, event_id, event)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event


@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_event(db, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")


@router.post("/upload-cover/")
async def upload_event_cover(file: UploadFile = File(...)):
    file_location = f"static/images/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": file.filename, "url": f"/static/images/{file.filename}"}