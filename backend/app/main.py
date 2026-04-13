from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import rooms, game

app = FastAPI(title="Poker App", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router, prefix="/api")
app.include_router(game.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
