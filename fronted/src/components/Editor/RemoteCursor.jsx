import { useEffect, useState } from "react";

const RemoteCursor = ({ cursor, userId, currentUserId }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (userId === currentUserId) {
    return null;
  }

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [cursor.position, cursor.timestamp]);

  if (!cursor.position || !isVisible) {
    return null;
  }

  const { offsetX, offsetY } = cursor.position;

  return (
    <div
      className="absolute pointer-events-none z-10 transition-all duration-150 ease-out"
      style={{
        left: `${offsetX}px`,
        top: `${offsetY}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      
      <div
        className="relative"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
        }}
      >
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

        <div
          className="absolute top-4 left-4 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap transform transition-all duration-200"
          style={{
            backgroundColor: cursor.color,
            fontSize: "10px",
            minWidth: "max-content",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {cursor.user_name || "Anonymous"}
        </div>

        <div
          className="absolute w-1 h-1 rounded-full opacity-60 animate-ping"
          style={{
            backgroundColor: cursor.color,
            left: "8px",
            top: "8px",
          }}
        />
      </div>
    </div>
  );
};

const RemoteCursors = ({ remoteCursors, currentUserId }) => {
  if (!remoteCursors || remoteCursors.size === 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
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
