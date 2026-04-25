from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from app.core.room_manager import manager
from app.core.game import Action, Phase

router = APIRouter()


@router.websocket("/ws/{room_id}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_id: str):
    game = manager.get_room(room_id)
    if not game or player_id not in game.players:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    manager.connect(room_id, player_id, websocket)

    # Mark player as connected
    game.players[player_id].is_connected = True

    # Send initial state
    state = game.get_state_for_player(player_id)
    await websocket.send_json({"type": "game_state", "data": state})

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type")

            if msg_type == "start_game":
                if game.phase == Phase.WAITING:
                    await game.start_hand()

            elif msg_type == "action":
                action_str = msg.get("action", "").lower()
                amount = msg.get("amount", 0)
                try:
                    action = Action(action_str)
                    await game.handle_action(player_id, action, amount)
                except ValueError:
                    await websocket.send_json({"type": "error", "data": {"message": "Invalid action"}})

            elif msg_type == "chat":
                text = msg.get("text", "")
                player = game.players.get(player_id)
                if player and text.strip():
                    # Broadcast chat to all in room
                    conns = manager.connections.get(room_id, {})
                    for pid, ws in conns.items():
                        try:
                            await ws.send_json({
                                "type": "chat",
                                "data": {"player_name": player.name, "text": text}
                            })
                        except Exception:
                            pass

    except WebSocketDisconnect:
        manager.disconnect(room_id, player_id)
        # Notify remaining players
        game = manager.get_room(room_id)
        if game:
            for pid in game.player_order:
                state = game.get_state_for_player(pid)
                conns = manager.connections.get(room_id, {})
                ws = conns.get(pid)
                if ws:
                    try:
                        await ws.send_json({"type": "game_state", "data": state})
                    except Exception:
                        pass
