import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { getDocumentData } from "../../service/workspace.service";
import Editor from "./Editor";
import { toast } from "react-toastify";

const DocumentEditor = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState("");
  const { user } = useUser();
  const [editorAPI, setEditorAPI] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sharedAccess, setSharedAccess] = useState([]);
  const navigate = useNavigate();

  const checkAccess = (document, sharedAccess, userId) => {
    return (
      document.user_id == userId ||
      sharedAccess.some((item) => item.user_id == userId)
    );
  };
  useEffect(() => {

    if (!user) {
      return;
    }
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const { mockDocument, sharedAccess } = await getDocumentData(id);
        // const isAuthenticated = checkAccess(
        //   mockDocument,
        //   sharedAccess,
        //   user.userId
        // );

        // if (!isAuthenticated) {
        //   navigate("/workspace");
        //   toast.error("You don't have access to this document");
        //   return;
        // }

        setSharedAccess(sharedAccess);
        setDocument(mockDocument);
        setContent(mockDocument.content);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id, user]);

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
    <div className="bg-gray-50 min-h-screen">
      <Editor
        onReady={setEditorAPI}
        id={id}
        userDocument={document}
        setContent={setContent}
        userId={user.userId}
        username={user.username}
        content={content}
        sharedAccess={sharedAccess}
      />
    </div>
  );
};

export default DocumentEditor;
