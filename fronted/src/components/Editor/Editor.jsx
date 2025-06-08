import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { throttle } from "lodash";
import { toast } from "react-toastify";
import { WifiOff } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import useCollaborativeEditing from "../../hooks/useCollaborativeEditing";
import EditorHeader from "./EditorHeader";
import EditorFooter from "./EditorFooter";
import { RemoteCursors } from "./RemoteCursor";
import { saveDocument, inviteUser } from "../../service/workspace.service";

const QUILL_CDN = {
  css: "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css",
  js: "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js",
};

const TOOLBAR_OPTIONS = [
  [{ font: [] }, { size: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ header: [1, 2, false] }],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link"],
  ["clean"],
];

const Editor = ({
  onReady,
  id,
  userDocument,
  setContent,
  userId,
  username,
  content,
  sharedAccess,
}) => {
  // Refs
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const boxRef = useRef(null);
  const isInitialized = useRef(false);
  const throttledUpdate = useRef(null);
  const handleChange = useRef(() => {});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const {
    isConnected,
    activeUsers,
    connectionError,
    reconnect,
    sendCursorPosition,
    remoteCursors,
    sendUpdate,
  } = useCollaborativeEditing(id, setContent, userId, username);

  // Utility functions
  const loadQuillCSS = useCallback(() => {
    if (!document.querySelector('link[href*="quill"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = QUILL_CDN.css;
      document.head.appendChild(link);
    }
  }, []);

  const parseContent = useCallback((content) => {
    try {
      return typeof content === "string" ? JSON.parse(content) : content;
    } catch (err) {
      console.error("Error parsing content:", err);
      return null;
    }
  }, []);

  const setupQuillEditor = useCallback(() => {
    if (isInitialized.current || !editorRef.current || !window.Quill) return;

    try {
      quillRef.current = new window.Quill(editorRef.current, {
        theme: "snow",
        modules: { toolbar: TOOLBAR_OPTIONS },
        placeholder: "Write something amazing...",
      });

      // Setup throttled update function
      throttledUpdate.current = throttle(() => {
        if (!quillRef.current) return;

        const currentContent = quillRef.current.getContents();
        const newContent = JSON.stringify(currentContent);
        const plainText = quillRef.current.getText();

        setTextContent(plainText);
        sendUpdate(newContent);
      }, 300);

      // Setup change handler
      handleChange.current = () => {
        throttledUpdate.current?.();
      };

      quillRef.current.on("text-change", handleChange.current);
      isInitialized.current = true;

      // Load initial content
      if (content) {
        const delta = parseContent(content);
        if (delta && delta.ops) {
          quillRef.current.setContents(delta);
        }
      }

      // Call onReady callback
      if (onReady && typeof onReady === "function") {
        onReady({
          getDelta: () => quillRef.current?.getContents(),
          getHTML: () => quillRef.current?.root.innerHTML,
          getText: () => quillRef.current?.getText(),
          setDelta: (delta) => quillRef.current?.setContents(delta),
          clear: () => quillRef.current?.setContents([]),
        });
      }
    } catch (error) {
      console.error("Error setting up Quill editor:", error);
    }
  }, [ onReady, parseContent]);

  const loadQuillJS = useCallback(() => {
    if (window.Quill) {
      setupQuillEditor();
      return;
    }

    const script = document.createElement("script");
    script.src = QUILL_CDN.js;
    script.onload = setupQuillEditor;
    script.onerror = () => {
      console.error("Failed to load Quill.js");
    };
    document.body.appendChild(script);
  }, [setupQuillEditor]);

  // Setup mouse tracking for collaborative cursors
  const setupMouseTracking = useCallback(() => {
    const throttleDelay = 16; // ~60fps
    let lastSent = 0;
    let animationFrameId;

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        if (now - lastSent >= throttleDelay && boxRef.current) {
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

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        div.removeEventListener("mousemove", handleMouseMove);
        div.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [sendCursorPosition]);

  // Event handlers
  const handleSave = useCallback(async () => {
    if (!document || isSaving || !quillRef.current) return;

    const content = JSON.stringify(quillRef.current.getContents());
    const textcontent = quillRef.current.getText();
    setTextContent(textcontent);

    try {
      setIsSaving(true);
      const data = {
        doc_name: document.doc_name,
        directory_id: document.directory_id,
        content,
      };

      await saveDocument(id, data);
      setLastSaved(new Date());
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  }, [document, isSaving, id]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleInput = useCallback(() => {
    if (!quillRef.current) return;

    const currentContent = quillRef.current.getContents();
    const newContent = JSON.stringify(currentContent);
    sendUpdate(newContent);
  }, [sendUpdate]);

  const handleShareAccess = useCallback(
    async (e) => {
      e.preventDefault();
      const toastId = toast.loading("Inviting...");
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const permission = formData.get("permission");

      try {
        console.log(id,email,permission)
        await inviteUser(id, email, permission);
        toast.update(toastId, {
          render: "Invited successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        e.target.reset();
      } catch (error) {
        console.error("Error sharing access:", error);
        toast.update(toastId, {
          render: error.response?.data?.detail || "Failed to invite user",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    },
    [id]
  );

  const handleDownloadPDF = async (document) => {
    if (!quillRef.current) return;

    setIsGenerating(true);

    try {
      const element = quillRef.current.root;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (doc) => {
          const editor = doc.querySelector(".ql-editor");
          if (editor) {
            editor.style.padding = "20px";
            editor.style.fontFamily = "Arial, sans-serif";
            editor.style.fontSize = "14px";
            editor.style.lineHeight = "1.6";
          }
        },
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdfHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }
      console.log(document)

      pdf.save(`${document?.doc_name || "document"}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF Download Error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDOCX = () => {

    let delta = quillRef.current.getContents();
    if (!delta || !delta.ops) return;

    const paragraphs = [];
    let currentChildren = [];

    delta.ops.forEach((op) => {
      if (typeof op.insert === "string") {
        const text = op.insert;
        const attrs = op.attributes || {};

        const lines = text.split("\n");
        lines.forEach((line, index) => {
          if (line.length > 0) {
            currentChildren.push(
              new TextRun({
                text: line,
                bold: attrs.bold,
                italics: attrs.italic,
                underline: attrs.underline ? {} : undefined,
                size: 24,
                color: attrs.color?.replace("#", ""),
              })
            );
          }

          // If not last line, push paragraph and reset
          if (index < lines.length - 1) {
            paragraphs.push(
              new Paragraph({
                children: currentChildren.length
                  ? currentChildren
                  : [new TextRun("")],
                heading: attrs.header
                  ? HeadingLevel[`HEADING_${attrs.header}`]
                  : undefined,
              })
            );
            currentChildren = [];
          }
        });
      }
    });

    if (currentChildren.length) {
      paragraphs.push(new Paragraph({ children: currentChildren }));
    }

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${document?.doc_name || "document"}.docx`);
      toast.success("DOCX downloaded successfully!");
    });
  };

  // Effects
  useEffect(() => {
    loadQuillCSS();
    loadQuillJS();

    return () => {
      if (quillRef.current && handleChange.current) {
        quillRef.current.off("text-change", handleChange.current);
      }
      throttledUpdate.current?.cancel();
      quillRef.current = null;
      isInitialized.current = false;
    };
  }, [loadQuillCSS, loadQuillJS]);

  useEffect(() => {
    if (!quillRef.current || !content) return;

    const delta = parseContent(content);
    if (delta && delta.ops) {
      quillRef.current.setContents(delta);
    }
  }, [content, parseContent]);

  useEffect(() => {
    return setupMouseTracking();
  }, [setupMouseTracking]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <EditorHeader
        isSaving={isSaving}
        document={userDocument}
        isGenerating={isGenerating}
        handleBack={handleBack}
        lastSaved={lastSaved}
        handleSave={handleSave}
        sharedAccess={sharedAccess}
        handleShareAccess={handleShareAccess}
        remoteCursors={remoteCursors}
        handleDownloadDocs={handleDownloadDOCX}
        handleDownloadPdf={handleDownloadPDF}
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
              SmartNote Text Editor
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create beautiful documents with our powerful rich text editor
            </p>
          </div>

          <div
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative"
            ref={boxRef}
          >
            <div ref={editorRef} className="min-h-[500px]" />

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
        content={textContent}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Editor;
