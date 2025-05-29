import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import WorkspaceHeader from "../components/WorkspaceHeader";
import Sidebar from "../components/Sidebar";
import WorkspaceContent from "../components/WorkspaceContent";
import CreateItemModal from "../components/CreateItemModel";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { createDirectory, createDocument } from "../service/workspace.service";

const WorkSpacePage = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const { items, setItems, loading, error, sharedItems } = useWorkspace();
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState();
  const location = useLocation();
  const deletedItems = [];
  let [rawItems, setRawItems] = useState(items);
  useEffect(() => {
    setActiveMenu(getActiveMenuFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    switch (activeMenu) {
      case "shared":
        setRawItems(sharedItems);
        break;
      case "trash":
        setRawItems(deletedItems);
        break;
      default:
        setRawItems(items);
    }
  }, [activeMenu, items, sharedItems]);

  console.log("shared", sharedItems);
  console.log("own", items);

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

  const getActiveMenuFromPath = (pathname) => {
    if (pathname.startsWith("/workspace/starred")) return "starred";
    if (pathname.startsWith("/workspace/recent")) return "recent";
    if (pathname.startsWith("/workspace/trash")) return "trash";
    if (pathname.startsWith("/workspace/shared")) return "shared";
    return "home";
  };

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

      let data = {};
      if (newItem.type === "folder") {
        newData = await createDirectory(newItem);
        newData.type = "folder";
        data.type = "folder";
        data.id = newData.dir_id;
        data.name = newData.dir_name;
        data.created_at = newData.created_at;
        data.updated_at = newData.updated_at;
        data.color = newData.color;
        data.parent_id = newData.parent_id;
      } else {
        newData = await createDocument(newItem);
        data.type = "document";
        data.id = newData.doc_id;
        data.name = newData.doc_name;
        data.created_at = newData.created_at;
        data.updated_at = newData.updated_at;
        data.parent_id = newData.directory_id;
      }
      setItems((prevItems) => {
        const updatedItems = [...prevItems, data];
        return updatedItems;
      });

      setShowCreateModal(false);
      navigate(`/workspace/${data.type}/${data.id}`);
    } catch (error) {
      console.error("Error creating item:", error.response.data.detail);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const filteredItems = Array.isArray(rawItems)
    ? rawItems.filter((item) => {
        if (searchQuery && searchQuery.trim() !== "") {
          return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }

        if (activeMenu === "shared" || activeMenu === "trash") {
          return true;
        }
        return item.parent_id === currentFolderId;
      })
    : [];

  const itemsWithPath = filteredItems.map((item) => ({
    ...item,
    ...(searchQuery?.trim()
      ? { displayPath: getItemFullPath(item), isSearchResult: true }
      : { isSearchResult: false }),
  }));

  console.log("object,", itemsWithPath);
  console.log("object,", rawItems);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading workspace...</div>
      </div>
    );
  }

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
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
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
