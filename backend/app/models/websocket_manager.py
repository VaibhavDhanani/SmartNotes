# websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List, Optional
from collections import defaultdict
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

class DocumentManager:
    def __init__(self) -> None:
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list)
        self.document_content: Dict[str, str] = {}
        self.user_cursors: Dict[str, Dict] = defaultdict(dict)
        
    async def connect(self, doc_id: str, websocket: WebSocket, user_id: Optional[str] = None):
        """Connect a user to a document"""
        try:
            await websocket.accept()
            self.active_connections[doc_id].append(websocket)
            
            # Send current document content to new user
            if doc_id in self.document_content:
                await websocket.send_json({
                    "type": "init",
                    "content": self.document_content[doc_id]
                })
            
            # Notify other users about new connection
            await self.broadcast_to_others(doc_id, websocket, {
                "type": "user_joined",
                "user_id": user_id,
                "active_users": len(self.active_connections[doc_id])
            })
            
            logger.info(f"User connected to document {doc_id}. Total connections: {len(self.active_connections[doc_id])}")
            
        except Exception as e:
            logger.error(f"Error connecting to document {doc_id}: {e}")
            
    async def disconnect(self, doc_id: str, websocket: WebSocket, user_id: Optional[str] = None):
        """Disconnect a user from a document"""
        try:
            if websocket in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(websocket)
                
            # Clean up empty document connections
            if not self.active_connections[doc_id]:
                if doc_id in self.document_content:
                    del self.document_content[doc_id]
                if doc_id in self.user_cursors:
                    del self.user_cursors[doc_id]
                    
            # Notify other users about disconnection
            await self.broadcast_to_others(doc_id, websocket, {
                "type": "user_left",
                "user_id": user_id,
                "active_users": len(self.active_connections[doc_id])
            })
            
            logger.info(f"User disconnected from document {doc_id}. Remaining connections: {len(self.active_connections[doc_id])}")
            
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
        for connection in self.active_connections[doc_id][:]:  # Copy list to avoid modification during iteration
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to connection: {e}")
                disconnected.append(connection)
                
        # Remove disconnected connections
        for conn in disconnected:
            if conn in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(conn)
                
    async def broadcast_to_others(self, doc_id: str, sender: WebSocket, message: Dict):
        """Broadcast message to all users except the sender"""
        if doc_id not in self.active_connections:
            return
            
        disconnected = []
        for connection in self.active_connections[doc_id][:]:
            if connection != sender:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to connection: {e}")
                    disconnected.append(connection)
                    
        # Remove disconnected connections
        for conn in disconnected:
            if conn in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(conn)
                
    def get_active_users_count(self, doc_id: str) -> int:
        """Get number of active users for a document"""
        return len(self.active_connections.get(doc_id, []))
        
    async def update_cursor_position(self, doc_id: str, user_id: str, position: Dict):
        """Update and broadcast cursor position"""
        self.user_cursors[doc_id][user_id] = position
        
        await self.broadcast(doc_id, {
            "type": "cursor_update",
            "user_id": user_id,
            "position": position
        })
        
        return self.user_cursors