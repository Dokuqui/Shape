from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from app.router import events, photo, user

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routes
app.include_router(events.router)

app.include_router(photo.router)

app.include_router(user.router)
