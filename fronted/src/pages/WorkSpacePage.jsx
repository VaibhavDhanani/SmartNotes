import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WorkspaceHeader from "../components/WorkspaceHeader";
import Sidebar from "../components/Sidebar";
import WorkspaceContent from "../components/WorkspaceContent";
import CreateItemModal from "../components/CreateItemModel";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { createDirectory, createDocument } from "../service/workspace.service";
import flattenData from "../utils/flatten";

const WorkSpacePage = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const { items, setItems, loading, error } = useWorkspace();
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const calculatePath = (folderId) => {
    if (!items || !Array.isArray(items)) return [];

    const path = [];
    let currentId = folderId;
    while (currentId) {
      const folder = items.find(
        (item) => item.id === currentId && item.type === "folder"
      );

      if (folder) {
        path.unshift(folder);
        currentId = folder.parent_id;
      } else {
        break;
      }
    }
    return path;
  };

  // Helper function to get the full path of an item for display
  const getItemFullPath = (item) => {
    if (!item.parent_id) return item.name;

    const path = [];
    let currentId = item.parent_id;

    while (currentId) {
      const folder = items.find(
        (f) => f.id === currentId && f.type === "folder"
      );
      if (folder) {
        path.unshift(folder.name);
        currentId = folder.parent_id;
      } else {
        break;
      }
    }

    return path.length > 0 ? `${path.join("/")}/${item.name}` : item.name;
  };

  useEffect(() => {
    if (!items || !Array.isArray(items)) return;
    // console.log(items);

    const targetFolder = items.find(
      (item) => item.id === id && item.type === "folder"
    );
    if (targetFolder) {
      setCurrentFolderId(id);
      setCurrentPath(calculatePath(id));
    } else {
      setCurrentFolderId(null);
      setCurrentPath([]);
    }
  }, [type, id, items, navigate]);

  // Modified filtering logic for global search
  const filteredItems =
    items && Array.isArray(items)
      ? items.filter((item) => {
          // If there's a search query, search globally
          if (searchQuery && searchQuery.trim() !== "") {
            return item.name.toLowerCase().includes(searchQuery.toLowerCase());
          }

          // If no search query, show items in current folder only
          return item.parent_id === currentFolderId;
        })
      : [];

  // Add full path information to filtered items when searching
  const itemsWithPath =
    searchQuery && searchQuery.trim() !== ""
      ? filteredItems.map((item) => ({
          ...item,
          displayPath: getItemFullPath(item),
          isSearchResult: true,
        }))
      : filteredItems.map((item) => ({
          ...item,
          isSearchResult: false,
        }));

  const handleItemDoubleClick = (item) => {
    if (item.type === "folder") {
      navigate(`/workspace/folder/${item.id}`);
    } else {
      navigate(`/workspace/document/${item.id}`);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleNavigate = (path) => {
    if (path.length === 0) {
      navigate("/workspace");
    } else {
      const lastFolder = path[path.length - 1];
      navigate(`/workspace/folder/${lastFolder.id}`);
    }
  };

  const handleCreateItem = async (newItem) => {
  try {
    let newData;
    
    if (newItem.type === "folder") {
      newData = await createDirectory(newItem);
      newData.type = "folder";
    } else {
      newData = await createDocument(newItem);
      newData.type = "document";
    }
    const updatedItem = flattenData(newData);
    setItems((prevItems) => {
      // console.log(updatedItem)
      const updatedItems = [...prevItems, ...updatedItem];
      return updatedItems;
    });
    
    setShowCreateModal(false);
    // console.log(updatedItem[0])
    navigate(`/workspace/${updatedItem[0].type}/${updatedItem[0].id}`);
  } catch (error) {
    console.error("Error creating item:", error.response.data.detail);
    
  }
};

  // Clear search when navigating
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading workspace...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading workspace: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <WorkspaceHeader
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onClearSearch={handleClearSearch}
      />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar activeMenu="home" />
        <div className="flex-grow w-full">
          <WorkspaceContent
            items={itemsWithPath}
            currentPath={currentPath}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onCreateNewClick={() => setShowCreateModal(true)}
            onNavigate={handleNavigate}
            selectedItem={selectedItem}
            isSearchMode={searchQuery && searchQuery.trim() !== ""}
            searchQuery={searchQuery}
          />
        </div>

        <CreateItemModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateItem={handleCreateItem}
          parentFolderId={currentFolderId}
        />
      </div>
    </div>
  );
};

export default WorkSpacePage;
