from fastapi import FastAPI
from app.router import events

app = FastAPI()

# Include routes
app.include_router(events.router)
