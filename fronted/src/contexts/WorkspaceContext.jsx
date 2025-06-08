import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { getWorkspaces } from "../service/workspace.service";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { user, loading: userLoading } = useUser();
  const [items, setItems] = useState([]);
  const [sharedItems, setSharedItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkspaceItems = async () => {
    if (!user || !user.userId) {
      console.log("User not available yet");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, sharedData } = await getWorkspaces(user.userId);
      setItems(() => data || []);
      setSharedItems(() => sharedData || []);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setError(error.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) {
      return;
    }

    if (!isInitialized && user && user.userId) {
      fetchWorkspaceItems();
    }
  }, [user, userLoading, isInitialized]);

  return (
    <WorkspaceContext.Provider
      value={{
        items,
        sharedItems,
        setItems,
        setSharedItems,
        loading,
        error,
        refetch: fetchWorkspaceItems,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
