# websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List, Optional, Any
from collections import defaultdict
import json
import asyncio
import logging
import time

logger = logging.getLogger(__name__)


class DocumentManager:
    def __init__(self) -> None:
        self.active_connections: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.document_content: Dict[str, str] = {}
        self.user_cursors: Dict[str, Dict[str, Dict]] = defaultdict(dict)

    async def connect(self, doc_id: str, websocket: WebSocket, user_id: Optional[str] = None,
                      user_name: Optional[str] = None):
        try:
            await websocket.accept()

            connection_info = {
                "websocket": websocket,
                "user_id": user_id or f"anonymous_{int(time.time())}",
                "user_name": user_name or "Anonymous",
                "connected_at": time.time()
            }

            self.active_connections[doc_id].append(connection_info)

            if doc_id in self.document_content:
                await websocket.send_json({
                    "type": "init",
                    "content": self.document_content[doc_id]
                })

            if doc_id in self.user_cursors:
                for existing_user_id, cursor_data in self.user_cursors[doc_id].items():
                    await websocket.send_json({
                        "type": "cursor_update",
                        "user_id": existing_user_id,
                        "user_name": cursor_data.get("user_name", "Anonymous"),
                        "position": cursor_data.get("position"),
                        "color": cursor_data.get("color", "#3b82f6")
                    })

            await self.broadcast_to_others(doc_id, websocket, {
                "type": "user_joined",
                "user_id": connection_info["user_id"],
                "user_name": connection_info["user_name"],
                "active_users": len(self.active_connections[doc_id])
            })

            logger.info(
                f"User {connection_info['user_id']} ({connection_info['user_name']}) connected to document {doc_id}. Total connections: {len(self.active_connections[doc_id])}")

        except Exception as e:
            logger.error(f"Error connecting to document {doc_id}: {e}")

    async def disconnect(self, doc_id: str, websocket: WebSocket, user_id: Optional[str] = None):
        try:
            connection_to_remove = None
            for conn_info in self.active_connections[doc_id]:
                if conn_info["websocket"] == websocket:
                    connection_to_remove = conn_info
                    break

            if connection_to_remove:
                self.active_connections[doc_id].remove(connection_to_remove)
                disconnected_user_id = connection_to_remove["user_id"]

                # Clean up cursor and selection data
                if doc_id in self.user_cursors and disconnected_user_id in self.user_cursors[doc_id]:
                    del self.user_cursors[doc_id][disconnected_user_id]

                await self.broadcast_to_others(doc_id, websocket, {
                    "type": "cursor_removed",
                    "user_id": disconnected_user_id
                })

                # Notify other users about disconnection
                await self.broadcast_to_others(doc_id, websocket, {
                    "type": "user_left",
                    "user_id": disconnected_user_id,
                    "active_users": len(self.active_connections[doc_id])
                })

            # Clean up empty document connections
            if not self.active_connections[doc_id]:
                if doc_id in self.document_content:
                    del self.document_content[doc_id]
                if doc_id in self.user_cursors:
                    del self.user_cursors[doc_id]

            logger.info(
                f"User disconnected from document {doc_id}. Remaining connections: {len(self.active_connections[doc_id])}")

        except Exception as e:
            logger.error(f"Error disconnecting from document {doc_id}: {e}")

    async def broadcast(self, doc_id: str, message: Dict, sender: Optional[WebSocket] = None):
        if doc_id not in self.active_connections:
            return

        # Update document content if it's a content update
        if message.get("type") == "update":
            self.document_content[doc_id] = message.get("content", "")

        # Send to all connections
        disconnected = []
        for conn_info in self.active_connections[doc_id][:]:
            try:
                await conn_info["websocket"].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to connection: {e}")
                disconnected.append(conn_info)

        # Remove disconnected connections
        for conn_info in disconnected:
            if conn_info in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(conn_info)

    async def broadcast_to_others(self, doc_id: str, sender: WebSocket, message: Dict):
        if doc_id not in self.active_connections:
            return

        disconnected = []
        for conn_info in self.active_connections[doc_id][:]:
            if conn_info["websocket"] != sender:
                try:
                    await conn_info["websocket"].send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to connection: {e}")
                    disconnected.append(conn_info)

        for conn_info in disconnected:
            if conn_info in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(conn_info)

    def generate_user_color(self, user_id: str) -> str:
        """Generate a consistent color for a user based on their ID"""
        colors = [
            "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
            "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
            "#ec4899", "#6366f1", "#14b8a6", "#f43f5e"
        ]
        # Use hash of user_id to get consistent color
        hash_val = sum(ord(c) for c in str(user_id))
        return colors[hash_val % len(colors)]

    async def update_cursor_position(self, doc_id: str, user_id: str, position: Dict, user_name: str = "Anonymous"):

        color = self.generate_user_color(user_id)

        self.user_cursors[doc_id][user_id] = {
            "position": position,
            "user_name": user_name,
            "color": color,
            "timestamp": time.time()
        }

        await self.broadcast_to_others(doc_id, None, {
            "type": "cursor_update",
            "user_id": user_id,
            "user_name": user_name,
            "position": position,
            "color": color
        })
        # print(self.user_cursors[doc_id])