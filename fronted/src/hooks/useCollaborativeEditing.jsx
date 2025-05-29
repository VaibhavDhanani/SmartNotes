// useCollaborativeEditing.js
import { useEffect, useRef, useState, useCallback } from "react";

export default function useCollaborativeEditing(docId, setContent, userId = null, userName = null) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [connectionError, setConnectionError] = useState(null);
  const lastUpdateRef = useRef("");
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/${docId}${userId ? `?user_id=${userId}` : ''}${userName ? `&user_name=${encodeURIComponent(userName)}` : ''}`;
    
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionError("Connection error occurred");
    };

    socketRef.current.onclose = (event) => {
      console.log("WebSocket disconnected", event.code, event.reason);
      setIsConnected(false);
      
      // Attempt to reconnect if not intentionally closed
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`Attempting to reconnect in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        setConnectionError("Failed to reconnect after multiple attempts");
      }
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "init":
            // Initial content when joining
            if (data.content !== lastUpdateRef.current) {
              setContent(data.content);
              lastUpdateRef.current = data.content;
            }
            break;
            
          case "update":
            // Content update from other users
            if (data.content !== lastUpdateRef.current && data.user_id !== userId) {
              setContent(data.content);
              lastUpdateRef.current = data.content;
            }
            break;
            
          case "user_joined":
            console.log(`User ${data.user_id} joined`);
            setActiveUsers(data.active_users);
            break;
            
          case "user_left":
            console.log(`User ${data.user_id} left`);
            setActiveUsers(data.active_users);
            break;
            
          case "cursor_update":
            console.log("Cursor update:", data);
            break;
            
          case "selection":
            // Handle text selection from other users
            console.log("Selection update:", data);
            break;
            
          case "pong":
            // Heartbeat response
            break;
            
          case "error":
            console.error("Server error:", data.message);
            setConnectionError(data.message);
            break;
            
          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, [docId, userId, userName, setContent]);

  useEffect(() => {
    connect();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
      }
    };
  }, [connect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const heartbeat = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [isConnected]);

  const sendUpdate = useCallback((content) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // Avoid sending duplicate updates
      if (content === lastUpdateRef.current) {
        return;
      }
      
      lastUpdateRef.current = content;
      
      const message = {
        type: "update",
        content,
        user_id: userId,
        timestamp: Date.now()
      };
      
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send update");
    }
  }, [userId]);

  const sendCursorPosition = useCallback((position) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "cursor",
        position,
        user_id: userId
      }));
    }
  }, [userId]);

  const sendSelection = useCallback((selection) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "selection",
        selection,
        user_id: userId
      }));
    }
  }, [userId]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  return { 
    sendUpdate, 
    sendCursorPosition, 
    sendSelection,
    isConnected, 
    activeUsers, 
    connectionError,
    reconnect
  };
}