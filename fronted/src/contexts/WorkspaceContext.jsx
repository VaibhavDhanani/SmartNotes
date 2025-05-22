import { createContext, useContext, useEffect, useState } from "react";
import { getWorkspaces } from "../service/workspace.service";
import { useUser } from "./UserContext";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { user, loading: userLoading } = useUser();
  const [items, setItems] = useState([]);
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
      // console.log("Fetching workspaces for user:", user.userId);
      const data = await getWorkspaces(user.userId);
      // console.log("Workspace data:", data);
      setItems(data || []);
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
    // console.log("WorkspaceContext useEffect - user:", user, "userLoading:", userLoading);
    
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
        setItems, 
        loading, 
        error, 
        refetch: fetchWorkspaceItems 
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