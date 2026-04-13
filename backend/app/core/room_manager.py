from __future__ import annotations

import uuid
from typing import Dict, Optional

from fastapi import WebSocket

from app.core.game import GameState


class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, GameState] = {}
        self.connections: Dict[str, Dict[str, WebSocket]] = {}  # room_id -> {player_id: ws}

    def create_room(self, host_name: str) -> tuple[str, str]:
        room_id = uuid.uuid4().hex[:6].upper()
        player_id = uuid.uuid4().hex[:8]
        game = GameState(room_id=room_id)
        game.broadcast = self._make_broadcast(room_id)
        game.add_player(player_id, host_name)
        self.rooms[room_id] = game
        self.connections[room_id] = {}
        return room_id, player_id

    def join_room(self, room_id: str, player_name: str) -> Optional[str]:
        game = self.rooms.get(room_id)
        if not game:
            return None
        if len(game.players) >= 8:
            return None
        player_id = uuid.uuid4().hex[:8]
        game.add_player(player_id, player_name)
        return player_id

    def get_room(self, room_id: str) -> Optional[GameState]:
        return self.rooms.get(room_id)

    def connect(self, room_id: str, player_id: str, ws: WebSocket):
        if room_id in self.connections:
            self.connections[room_id][player_id] = ws

    def disconnect(self, room_id: str, player_id: str):
        if room_id in self.connections:
            self.connections[room_id].pop(player_id, None)
        game = self.rooms.get(room_id)
        if game:
            game.remove_player(player_id)
            # Clean up empty rooms
            if not any(p.is_connected for p in game.players.values()):
                self.rooms.pop(room_id, None)
                self.connections.pop(room_id, None)

    def _make_broadcast(self, room_id: str):
        async def broadcast(player_id: str, state: dict):
            conns = self.connections.get(room_id, {})
            ws = conns.get(player_id)
            if ws:
                try:
                    await ws.send_json({"type": "game_state", "data": state})
                except Exception:
                    pass
        return broadcast

    def list_rooms(self) -> list[dict]:
        result = []
        for room_id, game in self.rooms.items():
            connected = [p for p in game.players.values() if p.is_connected]
            result.append({
                "room_id": room_id,
                "player_count": len(connected),
                "max_players": 8,
                "phase": game.phase.value,
                "players": [p.name for p in connected],
            })
        return result


manager = RoomManager()
