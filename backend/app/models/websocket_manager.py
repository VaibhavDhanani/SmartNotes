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
        self.user_selections: Dict[str, Dict[str, Dict]] = defaultdict(dict)

    async def connect(self, doc_id: str, websocket: WebSocket, user_id: Optional[str] = None,
                      user_name: Optional[str] = None):
        """Connect a user to a document"""
        try:
            await websocket.accept()

            # Store connection info with user details
            connection_info = {
                "websocket": websocket,
                "user_id": user_id or f"anonymous_{int(time.time())}",
                "user_name": user_name or "Anonymous",
                "connected_at": time.time()
            }

            self.active_connections[doc_id].append(connection_info)

            # Send current document content to new user
            if doc_id in self.document_content:
                await websocket.send_json({
                    "type": "init",
                    "content": self.document_content[doc_id]
                })

            # Send existing cursors to new user
            if doc_id in self.user_cursors:
                for existing_user_id, cursor_data in self.user_cursors[doc_id].items():
                    await websocket.send_json({
                        "type": "cursor_update",
                        "user_id": existing_user_id,
                        "user_name": cursor_data.get("user_name", "Anonymous"),
                        "position": cursor_data.get("position"),
                        "color": cursor_data.get("color", "#3b82f6")
                    })

            # Send existing selections to new user
            if doc_id in self.user_selections:
                for existing_user_id, selection_data in self.user_selections[doc_id].items():
                    await websocket.send_json({
                        "type": "selection_update",
                        "user_id": existing_user_id,
                        "user_name": selection_data.get("user_name", "Anonymous"),
                        "selection": selection_data.get("selection"),
                        "color": selection_data.get("color", "#3b82f6")
                    })

            # Notify other users about new connection
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
        """Disconnect a user from a document"""
        try:
            # Find and remove the connection
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

                if doc_id in self.user_selections and disconnected_user_id in self.user_selections[doc_id]:
                    del self.user_selections[doc_id][disconnected_user_id]

                # Notify other users about cursor removal
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
                if doc_id in self.user_selections:
                    del self.user_selections[doc_id]

            logger.info(
                f"User disconnected from document {doc_id}. Remaining connections: {len(self.active_connections[doc_id])}")

        except Exception as e:
            logger.error(f"Error disconnecting from document {doc_id}: {e}")

    async def broadcast(self, doc_id: str, message: Dict, sender: Optional[WebSocket] = None):
        """Broadcast message to all connected users"""
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
        """Broadcast message to all users except the sender"""
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

        # Remove disconnected connections
        for conn_info in disconnected:
            if conn_info in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(conn_info)

    def get_active_users_count(self, doc_id: str) -> int:
        """Get number of active users for a document"""
        return len(self.active_connections.get(doc_id, []))

    def get_user_info(self, doc_id: str, user_id: str) -> Optional[Dict]:
        """Get user information by user_id"""
        for conn_info in self.active_connections.get(doc_id, []):
            if conn_info["user_id"] == user_id:
                return {
                    "user_id": conn_info["user_id"],
                    "user_name": conn_info["user_name"]
                }
        return None

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
        """Update and broadcast cursor position"""
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

    async def update_selection(self, doc_id: str, user_id: str, selection: Dict, user_name: str = "Anonymous"):
        """Update and broadcast text selection"""
        if not selection or selection.get("start") == selection.get("end"):
            # Remove selection if empty
            if doc_id in self.user_selections and user_id in self.user_selections[doc_id]:
                del self.user_selections[doc_id][user_id]
                await self.broadcast_to_others(doc_id, None, {
                    "type": "selection_removed",
                    "user_id": user_id
                })
            return

        color = self.generate_user_color(user_id)

        self.user_selections[doc_id][user_id] = {
            "selection": selection,
            "user_name": user_name,
            "color": color,
            "timestamp": time.time()
        }

        await self.broadcast_to_others(doc_id, None, {
            "type": "selection_update",
            "user_id": user_id,
            "user_name": user_name,
            "selection": selection,
            "color": color
        })