import { useEffect, useState } from "react";

const RemoteSelection = ({ selection, textareaRef }) => {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    if (!textareaRef.current || !selection.selection) return;

    const textarea = textareaRef.current;
    const { start, end } = selection.selection;

    if (start === end) {
      setHighlights([]);
      return;
    }

    // Create temporary div to measure text positions
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordWrap = 'break-word';
    tempDiv.style.font = window.getComputedStyle(textarea).font;
    tempDiv.style.width = textarea.clientWidth + 'px';
    tempDiv.style.padding = window.getComputedStyle(textarea).padding;
    tempDiv.style.lineHeight = window.getComputedStyle(textarea).lineHeight;

    document.body.appendChild(tempDiv);

    const lines = textarea.value.split('\n');
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const newHighlights = [];

    let currentPos = 0;
    let startLine = -1, endLine = -1;
    let startLinePos = 0, endLinePos = 0;

    // Find which lines contain the selection
    for (let i = 0; i < lines.length; i++) {
      const lineStart = currentPos;
      const lineEnd = currentPos + lines[i].length;

      if (startLine === -1 && start >= lineStart && start <= lineEnd) {
        startLine = i;
        startLinePos = start - lineStart;
      }

      if (endLine === -1 && end >= lineStart && end <= lineEnd) {
        endLine = i;
        endLinePos = end - lineStart;
        break;
      }

      currentPos = lineEnd + 1; // +1 for newline character
    }

    // Create highlights for each line in the selection
    for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
      const lineText = lines[lineNum];
      const isFirstLine = lineNum === startLine;
      const isLastLine = lineNum === endLine;

      let lineStartPos = isFirstLine ? startLinePos : 0;
      let lineEndPos = isLastLine ? endLinePos : lineText.length;

      if (lineStartPos < lineEndPos) {
        // Measure position of selection start and end in this line
        tempDiv.textContent = lineText.substring(0, lineStartPos);
        const startX = tempDiv.getBoundingClientRect().width;

        tempDiv.textContent = lineText.substring(0, lineEndPos);
        const endX = tempDiv.getBoundingClientRect().width;

        const rect = textarea.getBoundingClientRect();
        newHighlights.push({
          top: lineNum * lineHeight + 2,
          left: startX,
          width: endX - startX,
          height: lineHeight
        });
      }
    }

    document.body.removeChild(tempDiv);
    setHighlights(newHighlights);
  }, [selection.selection, textareaRef]);

  return (
    <>
      {highlights.map((highlight, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            top: `${highlight.top}px`,
            left: `${highlight.left}px`,
            width: `${highlight.width}px`,
            height: `${highlight.height}px`,
            backgroundColor: `${selection.color}20`,
            border: `1px solid ${selection.color}40`
          }}
        />
      ))}
    </>
  );
};

export default RemoteSelection;