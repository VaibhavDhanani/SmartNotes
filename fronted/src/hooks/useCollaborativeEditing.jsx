import { useEffect, useRef, useState, useCallback } from "react";
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

  //   useEffect(() => {
  //   console.log("Remote cursors updated:", remoteCursors);
  // }, [remoteCursors]);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    const wsUrl = `ws://127.0.0.1:8000/ws/${docId}?user_id=${encodeURIComponent(
      currentUserId
    )}&user_name=${encodeURIComponent(currentUserName)}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setActiveUsers(prev => prev + 1);
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
      if (
        event.code !== 1000 &&
        reconnectAttempts.current < maxReconnectAttempts
      ) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          30000
        );
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
        // console.log(data);
        switch (data.type) {
          case "init":
            if (data.content !== lastUpdateRef.current) {
              setContent(data.content);
              lastUpdateRef.current = data.content;
            }
            break;

          case "update":
            if (
              data.content !== lastUpdateRef.current &&
              data.user_id !== currentUserId
            ) {
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
            if (String((data.user_id)) !== String(currentUserId)) {

              setRemoteCursors((prev) => {
                const newCursors = new Map(prev);

                if (data.position && typeof data.position === "object") {
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
            // Remove cursor when user disconnects
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
  }, [docId, currentUserId, currentUserName, setContent]);

  useEffect(() => {
    connect();

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

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const timeout = 30000; // 30 seconds

      setRemoteCursors((prev) => {
        const newCursors = new Map();
        for (const [userId, cursor] of prev) {
          if (now - cursor.timestamp < timeout) {
            newCursors.set(userId, cursor);
          }
        }
        return newCursors;
      });

    }, 10000); // Check every 10 seconds

    return () => clearInterval(cleanup);
  }, []);

  const sendUpdate = useCallback((content) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      if (content === lastUpdateRef.current) {
        return;
      }

      lastUpdateRef.current = content;

      const message = {
        type: "update",
        content,
        user_id: currentUserId,
        timestamp: Date.now(),
      };

      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send update");
    }
  }, []);

  const sendCursorPosition = useCallback(
    (position) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        
        if (
          position &&
          typeof position.offsetX === "number" &&
          typeof position.offsetY === "number"
        ) {
          socketRef.current.send(
            JSON.stringify({
              type: "cursor",
              position,
              user_id: currentUserId,
              timestamp: Date.now(),
            })
          );
        }
      }
    },
    [currentUserId]
  );

  const sendSelection = useCallback((selection) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "selection",
          selection,
          user_id: currentUserId,
        })
      );
    }
  }, []);

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
    remoteCursors,
    reconnect,
  };
}
