from typing import List

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
import os

from app.database import get_db
from app.models.gallery import Photo as PhotoModel
from app.schemas.photo import Photo

router = APIRouter(prefix="/photos", tags=["photos"])

UPLOAD_DIR = "static/gallery/"

@router.post("/upload/{event_id}", response_model=Photo)
async def upload_photo(event_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"/static/gallery/{file.filename}"

    photo = PhotoModel(event_id=event_id, file_url=file_url)
    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    return photo


@router.get("/events/{event_id}/photos", response_model=List[Photo])
async def get_gallery_photos(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PhotoModel).where(PhotoModel.event_id == event_id))
    photos = result.scalars().all()

    if not photos:
        raise HTTPException(status_code=404, detail="No photos found for this event")

    return photos


@router.delete("/photos/{photo_id}", status_code=204)
async def delete_photo(photo_id: int, db: AsyncSession = Depends(get_db)):
    photo = await db.execute(select(PhotoModel).where(PhotoModel.id == photo_id))
    photo = photo.scalars().first()

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Delete the photo file from the server
    os.remove(os.path.join(UPLOAD_DIR, photo.file_url.split('/')[-1]))

    await db.delete(photo)
    await db.commit()

    return {"message": "Photo deleted successfully"}

