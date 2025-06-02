import React, { useState, useEffect } from 'react';

const RemoteCursor = ({ cursor, userId, currentUserId }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Don't show cursor for current user
  if (userId === currentUserId) {
    return null;
  }

  // Handle cursor visibility (fade out after inactivity)
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // Hide after 5 seconds of inactivity

    return () => clearTimeout(timer);
  }, [cursor.position, cursor.timestamp]);

  if (!cursor.position || !isVisible) {
    return null;
  }

  const { offsetX, offsetY } = cursor.position;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-150 ease-out"
      style={{
        left: `${offsetX}px`,
        top: `${offsetY}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Cursor pointer */}
      <div
        className="relative"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      >
        {/* Main cursor shape */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer"
        >
          <path
            d="M2 2L18 8L10 10L8 18L2 2Z"
            fill={cursor.color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* User name label */}
        <div
          className="absolute top-4 left-4 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap transform transition-all duration-200"
          style={{
            backgroundColor: cursor.color,
            fontSize: '10px',
            minWidth: 'max-content',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {cursor.user_name || 'Anonymous'}
        </div>

        {/* Cursor tail/trail effect */}
        <div
          className="absolute w-1 h-1 rounded-full opacity-60 animate-ping"
          style={{
            backgroundColor: cursor.color,
            left: '8px',
            top: '8px',
          }}
        />
      </div>
    </div>
  );
};

// Container component to render all cursors
const RemoteCursors = ({ remoteCursors, containerRef, currentUserId }) => {
  if (!remoteCursors || remoteCursors.size === 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
      }}
    >
      {Array.from(remoteCursors.entries()).map(([userId, cursor]) => (
        <RemoteCursor
          key={userId}
          cursor={cursor}
          userId={userId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export { RemoteCursor, RemoteCursors };