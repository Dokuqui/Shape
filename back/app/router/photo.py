from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
import os

from app.database import get_db
from app.models.gallery import Photo as PhotoModel
from app.schemas.photo import Photo

router = APIRouter(prefix="/photos", tags=["photos"])

UPLOAD_DIR = "static/images"

@router.post("/upload/{event_id}", response_model=Photo)
async def upload_photo(event_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"/static/images/{file.filename}"

    photo = PhotoModel(event_id=event_id, file_url=file_url)
    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    return photo
