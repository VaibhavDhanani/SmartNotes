from fastapi import WebSocket
from typing import Dict, List, Optional, Any
from collections import defaultdict
import logging
import time
import json

logger = logging.getLogger(__name__)


class DocumentManager:
    def __init__(self) -> None:
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list) # Key: docid, Value: websocket
        self.connection_info: Dict[str, Dict[str, Any]] = {}  # Key: WebSocket, Value: connection info
        self.document_content: Dict[str, str] = {}
        self.user_cursors: Dict[str, Dict[str, Dict]] = defaultdict(dict)
        self.COLORS = [
            "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
            "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
            "#ec4899", "#6366f1", "#14b8a6", "#f43f5e"
        ]

    async def connect(self, doc_id: str, websocket: WebSocket, user_id: Optional[str] = None,
                      user_name: Optional[str] = None):
        await websocket.accept()
        
        user_id = user_id or f"anonymous_{int(time.time())}"
        user_name = user_name or "Anonymous"
        
        self.connection_info[websocket] = {
            "doc_id": doc_id,
            "user_id": user_id,
            "user_name": user_name,
            "connected_at": time.time()
        }
        self.active_connections[doc_id].append(websocket)

        # Send initial document state
        if doc_id in self.document_content:
            await self._send_message(websocket, {
                "type": "init",
                "content": self.document_content[doc_id],
                "active_users": len(self.active_connections[doc_id])
            })

        #NOTE: Send existing cursors
        for cursor_user_id, cursor_data in self.user_cursors.get(doc_id, {}).items():
            if cursor_user_id != user_id:  # Don't send back their own cursor
                await self._send_message(websocket, {
                    "type": "cursor_update",
                    "user_id": cursor_user_id,
                    "user_name": cursor_data.get("user_name"),
                    "position": cursor_data.get("position"),
                    "color": cursor_data.get("color")
                })

        # Notify others about new user
        await self.broadcast(doc_id, {
            "type": "user_joined",
            "user_id": user_id,
            "user_name": user_name,
            "active_users": len(self.active_connections[doc_id])
        }, exclude=websocket)

        logger.info(f"User {user_id} ({user_name}) connected to document {doc_id}")




    async def disconnect(self, websocket: WebSocket):
        if websocket not in self.connection_info:
            return

        conn_info = self.connection_info[websocket]
        doc_id = conn_info["doc_id"]
        user_id = conn_info["user_id"]

        try:
            if websocket in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(websocket)

            if doc_id in self.user_cursors and user_id in self.user_cursors[doc_id]:
                del self.user_cursors[doc_id][user_id]
                await self.broadcast(doc_id, {
                    "type": "cursor_removed",
                    "user_id": user_id
                })

            await self.broadcast(doc_id, {
                "type": "user_left",
                "user_id": user_id,
                "active_users": len(self.active_connections[doc_id])
            })

            # Cleanup if no more connections
            if not self.active_connections[doc_id]:
                self.document_content.pop(doc_id, None)
                self.user_cursors.pop(doc_id, None)

        finally:
            self.connection_info.pop(websocket, None)
            logger.info(f"User {user_id} disconnected from document {doc_id}")
            
            

    async def handle_message(self, websocket: WebSocket, message: Dict):
        if websocket not in self.connection_info:
            return

        conn_info = self.connection_info[websocket]
        doc_id = conn_info["doc_id"]
        user_id = conn_info["user_id"]
        user_name = conn_info["user_name"]
        msg_type = message.get("type")

        if msg_type == "update":
            content = message.get("content", "")
            self.document_content[doc_id] = content
            await self.broadcast(doc_id, {
                "type": "update",
                "content": content,
                "user_id": user_id,
                "user_name": user_name,
                "timestamp": message.get("timestamp")
            }, exclude=websocket)

        elif msg_type == "cursor":
            position = message.get("position", {})
            await self.update_cursor(doc_id, user_id, position, user_name)
            
            

    async def update_cursor(self, doc_id: str, user_id: str, position: Dict, user_name: str):
        color = self.COLORS[sum(ord(c) for c in str(user_id)) % len(self.COLORS)]
        
        self.user_cursors[doc_id][user_id] = {
            "position": position,
            "user_name": user_name,
            "color": color,
            "timestamp": time.time()
        }

        await self.broadcast(doc_id, {
            "type": "cursor_update",
            "user_id": user_id,
            "user_name": user_name,
            "position": position,
            "color": color
        }, exclude=None)
        
        

    async def broadcast(self, doc_id: str, message: Dict, exclude: Optional[WebSocket] = None):
        if doc_id not in self.active_connections:
            return

        for ws in list(self.active_connections[doc_id]):  
            if ws != exclude:
                try:
                    await self.send_message(ws, message)
                except:
                    await self.cleanup_disconnected(ws)
                    
                    

    async def send_message(self, websocket: WebSocket, message: Dict):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            await self.cleanup_disconnected(websocket)
            
            

    async def cleanup_disconnected(self, websocket: WebSocket):
        if websocket in self.connection_info:
            await self.disconnect(websocket)