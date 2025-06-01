import React, { useEffect, useRef } from "react";

const Editor = ({ onReady }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const isInitialized = useRef(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Quill Rich Text Editor
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Create beautiful documents with our powerful rich text editor
          </p>
        </div>

        {/* Editor Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
          {/* Editor */}
          <div
            ref={editorRef}
            className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
            style={{
              minHeight: "400px",
            }}
          />
        </div>

        
      </div>
    </div>
  );
};

export default Editor;
