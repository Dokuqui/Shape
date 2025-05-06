from datetime import datetime
import os
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from typing import List, Optional
import shutil
import json

from app.schemas.event import Event, EventCreate, EventUpdate
from app.crud import event as crud
from app.database import get_db
from app.models.event import Event as EventModel


BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL")

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

    query = select(EventModel).options(joinedload(EventModel.photos))
    if title:
        query = query.where(EventModel.title.ilike(f"%{title}%"))
    if from_date:
        query = query.where(EventModel.date >= from_date)
    if to_date:
        query = query.where(EventModel.date <= to_date)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    events = result.unique().scalars().all()

    for event in events:
        if event.cover_image_url and not event.cover_image_url.startswith("http"):
            event.cover_image_url = f"{BACKEND_BASE_URL}{event.cover_image_url}"

    return events

@router.get("/{event_id}", response_model=Event)
async def read_event(event_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(
        select(EventModel).options(joinedload(EventModel.photos)).where(EventModel.id == event_id)
    )
    db_event = result.scalars().first()
    if db_event is None:

        raise HTTPException(status_code=404, detail="Event not found")

    if db_event.cover_image_url and not db_event.cover_image_url.startswith("http"):
        db_event.cover_image_url = f"{BACKEND_BASE_URL}{db_event.cover_image_url}"

    return db_event

@router.post("/", response_model=Event)
async def create_event(
    event: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):

    try:
        event_dict = json.loads(event)

        event_dict.pop("cover_image_url", None)
        event_dict.pop("video_url", None)
        event_dict.pop("photos", None)
        event_dict.pop("id", None)
        event_data = EventCreate(**event_dict)

    except json.JSONDecodeError:

        raise HTTPException(status_code=422, detail="Invalid JSON in event field")
    except ValueError as e:

        raise HTTPException(status_code=422, detail=str(e))

    file_url = None
    if file and file.filename:

        filename = os.path.splitext(file.filename)[0] + os.path.splitext(file.filename)[-1].lower()
        file_location = f"static/images/{filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_url = f"{BACKEND_BASE_URL}/static/images/{quote(filename)}"


    event_data = EventCreate(
        title=event_data.title,
        description=event_data.description,
        date=event_data.date,
        location=event_data.location,
        cover_image_url=file_url
    )
    event_data.cover_image_url = file_url
    db_event = await crud.create_event(db, event_data)

    result = await db.execute(
        select(EventModel).options(joinedload(EventModel.photos)).where(EventModel.id == db_event.id)
    )
    db_event = result.scalars().first()
    if not db_event:
        raise HTTPException(status_code=500, detail="Failed to fetch created event")

    return db_event

@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: int,
    event: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        event_dict = json.loads(event)

        event_dict.pop("id", None)
        event_dict.pop("photos", None)
        event_dict.pop("cover_image_url", None)
        event_data = EventUpdate(**event_dict)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON in event field")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    db_event = await crud.update_event(db, event_id, event_data)
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    result = await db.execute(
        select(EventModel).options(joinedload(EventModel.photos)).where(EventModel.id == db_event.id)
    )
    db_event = result.scalars().first()
    if not db_event:
        raise HTTPException(status_code=500, detail="Failed to fetch updated event")
    if db_event.cover_image_url and not db_event.cover_image_url.startswith("http"):
        db_event.cover_image_url = f"{BACKEND_BASE_URL}{db_event.cover_image_url}"
    return db_event

@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_event(db, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")

@router.post("/upload-cover/")
async def upload_event_cover(file: UploadFile = File(...)):

    filename = os.path.splitext(file.filename)[0] + os.path.splitext(file.filename)[-1].lower()
    file_location = f"static/images/{filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file_url = f"{BACKEND_BASE_URL}/static/images/{quote(filename)}"
    return {"filename": filename, "url": file_url}