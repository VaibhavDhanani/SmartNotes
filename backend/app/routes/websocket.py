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
    try:
        await manager.connect(doc_id, websocket, user_id, user_name)

        while True:
            try:
                message_text = await websocket.receive_text()
                message = json.loads(message_text)
                msg_type = message.get("type")

                current_user_id = user_id or f"anonymous"
                current_user_name = user_name or "anonymous"

                if msg_type == "update":
                    await manager.broadcast_to_others(doc_id, websocket, {
                        "type": "update",
                        "content": message.get("content", ""),
                        "user_id": current_user_id,
                        "user_name": current_user_name,
                        "timestamp": message.get("timestamp")
                    })

                elif msg_type == "cursor":
                    position = message.get("position", {})
                    await manager.update_cursor_position(
                        doc_id,
                        current_user_id,
                        position,
                        current_user_name
                    )
                    # print(manager.user_cursors[doc_id])

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