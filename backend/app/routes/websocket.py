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
        await manager.connect(doc_id, websocket, user_id, user_name)

        while True:
            try:
                message_text = await websocket.receive_text()
                message = json.loads(message_text)
                msg_type = message.get("type")

                current_user_id = user_id or f"anonymous_{int(time.time())}"
                current_user_name = user_name or "Anonymous"

                if msg_type == "update":
                    # Broadcast content update to other users
                    await manager.broadcast_to_others(doc_id, websocket, {
                        "type": "update",
                        "content": message.get("content", ""),
                        "user_id": current_user_id,
                        "user_name": current_user_name,
                        "timestamp": message.get("timestamp")
                    })

                elif msg_type == "cursor":
                    # Update cursor position
                    position = message.get("position", {})
                    await manager.update_cursor_position(
                        doc_id,
                        current_user_id,
                        position,
                        current_user_name
                    )

                elif msg_type == "selection":
                    # Update text selection
                    selection = message.get("selection", {})
                    await manager.update_selection(
                        doc_id,
                        current_user_id,
                        selection,
                        current_user_name
                    )

                elif msg_type == "ping":
                    # Respond to heartbeat
                    await websocket.send_json({"type": "pong"})

                else:
                    logger.warning(f"Unhandled message type: {msg_type}")

            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Error during WebSocket message handling: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Internal server error"
                })
                break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: doc_id={doc_id}, user_id={user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await manager.disconnect(doc_id, websocket, user_id)


@router.get("/documents/{doc_id}/active-users")
async def get_active_users(doc_id: str):
    """Get active users count for a document"""
    return {
        "doc_id": doc_id,
        "active_users": manager.get_active_users_count(doc_id)
    }


@router.get("/documents/{doc_id}/users")
async def get_document_users(doc_id: str):
    """Get all users currently editing a document"""
    users = []
    if doc_id in manager.active_connections:
        for conn_info in manager.active_connections[doc_id]:
            users.append({
                "user_id": conn_info["user_id"],
                "user_name": conn_info["user_name"],
                "connected_at": conn_info["connected_at"]
            })

    return {
        "doc_id": doc_id,
        "users": users,
        "total_users": len(users)
    }