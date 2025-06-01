import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocument, saveDocument } from "../service/workspace.service";
import { throttle } from "lodash";
import {
  ArrowLeft,
  Save,
  Users,
  Share,
  MoreVertical,
  Star,
  File as FileIcon,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import useCollaborativeEditing from "../hooks/useCollaborativeEditing";
import { useUser } from "../contexts/UserContext";
import RemoteSelection from "./RemoteSelection";
import RemoteCursor from "./RemoteCursor";
import Editor from "./Editor";

// Remote Cursor Component

// Remote Selection Component

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const { user } = useUser();

  const [editorAPI, setEditorAPI] = useState(null);
  const [savedDelta, setSavedDelta] = useState(null);
  const [htmlPreview, setHtmlPreview] = useState('');

  const handleSave = () => {
    if (!editorAPI) return;
    const delta = editorAPI.getDelta();
    const html = editorAPI.getHTML();

    setSavedDelta(delta);
    setHtmlPreview(html);

    console.log('Delta saved to DB:', delta); // Save this to your backend
  };

  const handleLoad = () => {
    if (editorAPI && savedDelta) {
      editorAPI.setDelta(savedDelta);
    }
  };

  const handleInsertText = () => {
    if (editorAPI) {
      editorAPI.insertText('🔥 Inserted from Parent! ');
    }
  };

  const handleClear = () => {
    editorAPI?.clear();
  };

  const {
    sendUpdate,
    sendCursorPosition,
    sendSelection,
    isConnected,
    activeUsers,
    connectionError,
    remoteCursors,
    remoteSelections,
    reconnect,
    userId,
  } = useCollaborativeEditing(id, setContent, user?.userId, user?.username);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const mockDocument = await getDocument(id);
        setDocument(mockDocument);
        setContent(mockDocument.content);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // const handleSave = async (isAutoSave = false) => {
  //   if (!document || isSaving) return;

  //   try {
  //     setIsSaving(true);
  //     const data = {
  //       doc_name: document.doc_name,
  //       directory_id: document.directory_id,
  //       content,
  //     };

  //     await saveDocument(document.doc_id, data);
  //     setLastSaved(new Date());

  //     if (!isAutoSave) {
  //       console.log("Document saved manually");
  //     }
  //   } catch (error) {
  //     console.error("Error saving document:", error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Document Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <FileIcon size={18} />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800 text-lg">
                  {document?.name}
                </h1>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>
                    Last updated{" "}
                    {document?.updated_at
                      ? new Date(document.updated_at).toLocaleString()
                      : "Never"}
                  </span>
                  {lastSaved && (
                    <span>• Auto-saved {lastSaved.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Real-time Collaborators from WebSocket */}

            {/* Action buttons */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Star size={20} className="text-gray-400 hover:text-yellow-500" />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share size={20} className="text-gray-700" />
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save
                </>
              )}
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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

      {/* Document Editor */}
      <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Rich Text Editor with Quill</h1>

      <Editor onReady={setEditorAPI} />

      <div className="mt-6 flex gap-4 flex-wrap">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
          Save Delta
        </button>
        <button onClick={handleLoad} className="px-4 py-2 bg-green-600 text-white rounded">
          Load Delta
        </button>
        <button onClick={handleInsertText} className="px-4 py-2 bg-purple-600 text-white rounded">
          Insert Text
        </button>
        <button onClick={handleClear} className="px-4 py-2 bg-red-600 text-white rounded">
          Clear
        </button>
      </div>
    </div>

      {/* Enhanced Status Bar */}
      <footer className="bg-white border-t border-gray-200 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            {isConnected ? (
              <Wifi size={16} className="text-green-500" />
            ) : (
              <WifiOff size={16} className="text-red-500" />
            )}
          </div>

          {/* Document Stats */}
          <div className="text-sm text-gray-500">
            {content.length} characters •{" "}
            {content.split(/\s+/).filter((word) => word.length > 0).length}{" "}
            words
          </div>

          {/* Save Status */}
          {isSaving && (
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              <RefreshCw size={12} className="animate-spin" />
              <span>Saving...</span>
            </div>
          )}
        </div>

        {/* Active Users */}
        <div className="flex items-center space-x-2">
          <Users size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">
            {activeUsers} user{activeUsers !== 1 ? "s" : ""} online
          </span>
        </div>
      </footer>
    </div>
  );
};

export default DocumentEditor;
