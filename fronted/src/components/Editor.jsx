import React, { useEffect, useRef, useState } from "react";
import useCollaborativeEditing from "../hooks/useCollaborativeEditing";
import EditorHeader from "./EditorHeader";
import EditorFooter from "./EditorFooter";
import { saveDocument } from "../service/workspace.service";
import { useNavigate } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { RemoteCursors } from "./RemoteCursor";

const Editor = ({ onReady, id, setContent, userId, username, content }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const isInitialized = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const {
    isConnected,
    activeUsers,
    connectionError,
    reconnect,
    sendCursorPosition,
    remoteCursors,
    sendUpdate,
  } = useCollaborativeEditing(id, setContent, userId, username);

  useEffect(() => {
    const loadQuill = async () => {
      // Load Quill CSS
      if (!document.querySelector('link[href*="quill"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css";
        document.head.appendChild(link);
      }

      // Load Quill JS
      if (!window.Quill) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js";
        script.onload = () => initializeEditor();
        document.body.appendChild(script);
      } else {
        initializeEditor();
      }
    };

    const initializeEditor = () => {
      if (isInitialized.current || !editorRef.current) return;

      const toolbarOptions = [
        [{ font: [] }, { size: [] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ header: [1, 2, false] }],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ];

      quillRef.current = new window.Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
        placeholder: "Write something amazing...",
      });

      isInitialized.current = true;
      if (content) {
        try {
          let delta;
          if (typeof content === "string") {
            delta = JSON.parse(content);
          } else {
            delta = content;
          }

          if (delta && delta.ops) {
            quillRef.current.setContents(delta);
          }
        } catch (error) {
          console.error("Error loading initial content:", error);
        }
      }

      if (onReady && typeof onReady === "function") {
        onReady({
          getDelta: () => quillRef.current.getContents(),
          getHTML: () => quillRef.current.root.innerHTML,
          getText: () => quillRef.current.getText(),
          setDelta: (delta) => quillRef.current.setContents(delta),
          insertText: (text) => {
            const index =
              quillRef.current.getSelection()?.index ||
              quillRef.current.getLength();
            quillRef.current.insertText(index, text);
          },
          clear: () => quillRef.current.setContents([]),
        });
      }
    };

    loadQuill();

    return () => {
      isInitialized.current = false;
      quillRef.current = null;
    };
  }, [onReady]);

  // Optimized cursor tracking with throttling
  useEffect(() => {
    const throttleDelay = 16; // ~60fps
    let lastSent = 0;
    let animationFrameId;

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        if (now - lastSent >= throttleDelay) {
          const rect = boxRef.current.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;

          sendCursorPosition({ offsetX, offsetY });
          lastSent = now;
        }
      });
    };

    const handleMouseLeave = () => {
      sendCursorPosition(null);
    };

    const div = boxRef.current;
    if (div) {
      div.addEventListener("mousemove", handleMouseMove);
      div.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (div) {
        div.removeEventListener("mousemove", handleMouseMove);
        div.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [sendCursorPosition]);

  const handleSave = async (isAutoSave = false) => {
    if (!document || isSaving) return;

    const content = JSON.stringify(quillRef.current.getContents());
    console.log(content);

    try {
      setIsSaving(true);
      const data = {
        doc_name: document.doc_name,
        directory_id: document.directory_id,
        content,
      };

      await saveDocument(id, data);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleInput = (e) => {
    const currentContent = quillRef.current.getContents();
    const newContent = JSON.stringify(currentContent);
    console.log("send");
    sendUpdate(newContent);
  };

  useEffect(() => {
    try {
      let delta;
      if (typeof content === "string") {
        delta = JSON.parse(content);
      } else {
        delta = content;
      }

      if (delta && delta.ops) {
        quillRef.current.setContents(delta);
      }
    } catch (error) {
      console.error("Error loading initial content:", error);
    }
  }, [content]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <EditorHeader
        isSaving={isSaving}
        document={document}
        handleBack={handleBack}
        lastSaved={lastSaved}
        handleSave={handleSave}
      />

      {connectionError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff size={20} className="text-red-500 mr-3" />
              <div>
                <p className="text-red-800 font-medium">Connection Error</p>
                <p className="text-red-600 text-sm">{connectionError}</p>
              </div>
            </div>
            <button
              onClick={reconnect}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Reconnect
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Quill Rich Text Editor
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create beautiful documents with our powerful rich text editor
            </p>
          </div>

          <div
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative"
            ref={boxRef}
          >
            <div
              ref={editorRef}
              className="min-h-[500px]"
              onInput={handleInput}
            />

            {/* Render remote cursors */}
            <RemoteCursors
              remoteCursors={remoteCursors}
              containerRef={boxRef}
              onInput={handleInput}
              currentUserId={userId}
            />
          </div>
        </div>
      </div>

      <EditorFooter
        activeUsers={activeUsers}
        isConnected={isConnected}
        content={content}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Editor;
