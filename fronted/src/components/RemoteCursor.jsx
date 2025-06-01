import { useEffect, useState } from "react";

const RemoteCursor = ({ cursor, textareaRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!textareaRef.current || !cursor.position) return;

    const textarea = textareaRef.current;
    const { start } = cursor.position;

    // Create a temporary div to measure text position
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordWrap = 'break-word';
    tempDiv.style.font = window.getComputedStyle(textarea).font;
    tempDiv.style.width = textarea.clientWidth + 'px';
    tempDiv.style.padding = window.getComputedStyle(textarea).padding;
    tempDiv.style.border = window.getComputedStyle(textarea).border;
    tempDiv.style.lineHeight = window.getComputedStyle(textarea).lineHeight;

    document.body.appendChild(tempDiv);

    const textBeforeCursor = textarea.value.substring(0, start);
    tempDiv.textContent = textBeforeCursor;

    const span = document.createElement('span');
    span.textContent = '|';
    tempDiv.appendChild(span);

    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const tempDivRect = tempDiv.getBoundingClientRect();

    setPosition({
      top: spanRect.top - rect.top + textarea.scrollTop - 2,
      left: spanRect.left - tempDivRect.left + rect.left - rect.left
    });

    document.body.removeChild(tempDiv);
  }, [cursor.position, textareaRef]);

  return (
    <div
      className="absolute pointer-events-none z-10 transition-all duration-150"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        borderLeft: `2px solid ${cursor.color}`,
        height: '20px',
      }}
    >
      <div
        className="absolute -top-6 -left-1 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.user_name}
      </div>
    </div>
  );
};

export default RemoteCursor;