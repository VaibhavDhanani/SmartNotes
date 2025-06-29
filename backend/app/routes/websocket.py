from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.models.websocket_manager import DocumentManager
import logging
import json

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
            message_text = await websocket.receive_text()
            try:
                message = json.loads(message_text)
                await manager.handle_message(websocket, message)
            except json.JSONDecodeError:
                await manager.send_message(websocket, {
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Error handling message: {e}")
                await manager.send_message(websocket, {
                    "type": "error",
                    "message": "Internal server error"
                })
                break

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await manager.disconnect(websocket)