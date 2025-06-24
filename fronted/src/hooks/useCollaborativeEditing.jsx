import { useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";

export default function useCollaborativeEditing(docId, setContent) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [connectionError, setConnectionError] = useState(null);
  const [remoteCursors, setRemoteCursors] = useState(new Map());
  const lastUpdateRef = useRef("");
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const { user } = useUser();
  const currentUserId = user.userId;
  const currentUserName = user.username;
  const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

  
  const connect = () => {               // NOTE: Connect to WebSocket
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${WEBSOCKET_URL}/ws/${docId}?user_id=${encodeURIComponent(
      currentUserId
    )}&user_name=${encodeURIComponent(currentUserName)}`;

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
      setRemoteCursors(new Map());
      
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
            if (data.content !== lastUpdateRef.current) {
              setContent(data.content);
              lastUpdateRef.current = data.content;
            }
            setActiveUsers(data.active_users || 0);
            break;

          case "update":
            if (data.content !== lastUpdateRef.current && data.user_id !== currentUserId) {
              setContent(data.content);
              lastUpdateRef.current = data.content;
            }
            break;

          case "user_joined":
            console.log(`User ${data.user_name || data.user_id} joined`);
            setActiveUsers(data.active_users);
            break;

          case "user_left":
            console.log(`User ${data.user_name || data.user_id} left`);
            setActiveUsers(data.active_users);
            break;

          case "cursor_update":
            if (String(data.user_id) !== String(currentUserId)) {
              setRemoteCursors((prev) => {
                const newCursors = new Map(prev);
                if (data.position) {
                  newCursors.set(data.user_id, {
                    position: data.position,
                    user_name: data.user_name || "Anonymous",
                    color: data.color || "#3b82f6",
                    timestamp: Date.now(),
                  });
                }
                return newCursors;
              });
            }
            break;

          case "cursor_removed":
            setRemoteCursors((prev) => {
              const newCursors = new Map(prev);
              newCursors.delete(data.user_id);
              return newCursors;
            });
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
  };

  
  useEffect(() => {
    
    if (currentUserId && currentUserName) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
      }
    };
  }, [docId, currentUserId, currentUserName]);

  
  useEffect(() => {                                     //NOTE: Clean up stale cursors
    const cleanup = setInterval(() => {
      const now = Date.now();
      const timeout = 30000;

      setRemoteCursors((prev) => {
        const newCursors = new Map();
        for (const [userId, cursor] of prev) {
          if (now - cursor.timestamp < timeout) {
            newCursors.set(userId, cursor);
          }
        }
        return newCursors;
      });
    }, 10000); 

    return () => clearInterval(cleanup);
  }, []);

  const sendUpdate = (content) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      if (content === lastUpdateRef.current) {
        return;
      }

      lastUpdateRef.current = content;

      socketRef.current.send(JSON.stringify({
        type: "update",
        content,
        user_id: currentUserId,
        timestamp: Date.now(),
      }));
    } else {
      console.warn("WebSocket not connected, cannot send update");
    }
  };


  const sendCursorPosition = (position) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && position) {
      socketRef.current.send(JSON.stringify({
        type: "cursor",
        position,
        user_id: currentUserId,
        timestamp: Date.now(),
      }));
    }
  };


  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    reconnectAttempts.current = 0;
    connect();
  };

  return {
    isConnected,
    activeUsers,
    connectionError,
    remoteCursors,
    sendCursorPosition,
    sendUpdate,
    reconnect,
  };
}