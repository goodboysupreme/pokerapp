from fastapi import APIRouter
from pydantic import BaseModel

from app.core.room_manager import manager

router = APIRouter()


class CreateRoomRequest(BaseModel):
    player_name: str


class JoinRoomRequest(BaseModel):
    room_id: str
    player_name: str


@router.post("/rooms/create")
async def create_room(req: CreateRoomRequest):
    room_id, player_id = manager.create_room(req.player_name)
    return {"room_id": room_id, "player_id": player_id}


@router.post("/rooms/join")
async def join_room(req: JoinRoomRequest):
    player_id = manager.join_room(req.room_id.upper(), req.player_name)
    if not player_id:
        return {"error": "Room not found or full"}
    return {"room_id": req.room_id.upper(), "player_id": player_id}


@router.get("/rooms")
async def list_rooms():
    return {"rooms": manager.list_rooms()}
