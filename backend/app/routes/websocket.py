# websocket_router.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.models.websocket_manager import DocumentManager
import logging
import json
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter()
manager = DocumentManager()

@router.websocket("/ws/{doc_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    doc_id: str,
    user_id: Optional[str] = Query(None),
    user_name: Optional[str] = Query(None)
):
    """WebSocket endpoint for collaborative editing"""
    try:
        await manager.connect(doc_id, websocket, user_id)
        while True:
            try:
                message = json.loads(await websocket.receive_text())
                msg_type = message.get("type")

                if msg_type == "update":
                    await manager.broadcast_to_others(doc_id, websocket, {
                        "type": "update",
                        "content": message.get("content", ""),
                        "user_id": user_id,
                        "timestamp": message.get("timestamp")
                    })

                elif msg_type == "cursor":
                    return await manager.update_cursor_position(
                        doc_id,
                        user_id or "anonymous",
                        {
                            "position": message.get("position"),
                        }
                    )

                elif msg_type == "selection":
                    # This assumes update_selection exists
                    await manager.update_selection(
                        doc_id,
                        user_id or "anonymous",
                        message.get("selection")
                    )

                elif msg_type == "ping":
                    await websocket.send_json({"type": "pong"})

                else:
                    logger.warning(f"Unhandled message type: {msg_type}")

            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Error during WebSocket message handling: {e}")
                break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: doc_id={doc_id}, user_id={user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await manager.disconnect(doc_id, websocket, user_id)

@router.get("/documents/{doc_id}/active-users")
async def get_active_users(doc_id: str):
    return {
        "doc_id": doc_id,
        "active_users": manager.get_active_users_count(doc_id)
    }
