import { Folder, Plus, Search, X } from "lucide-react";
import WorkspaceItem from "./WorkspaceItem";
import Breadcrumb from "./Breadcrumb";

const WorkspaceContent = ({
  items,
  currentPath,
  onItemDoubleClick,
  onCreateNewClick,
  onNavigate,
  selectedItem,
  onItemClick,
  isSearchMode,
  searchQuery,
}) => {
  
  return (
    <div className="flex-grow p-6 h-full flex flex-col">
      {!isSearchMode && (
        <Breadcrumb path={currentPath} onNavigate={onNavigate} />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isSearchMode ? (
            <div className="flex items-center">
              <Search size={24} className="mr-2 text-blue-600" />
              <span>Search Results</span>
              {searchQuery && (
                <span className="ml-2 text-lg font-normal text-gray-600">
                  for "{searchQuery}"
                </span>
              )}
            </div>
          ) : currentPath.length > 0 ? (
            currentPath[currentPath.length - 1].name
          ) : (
            "My Workspace"
          )}
        </h1>

        {/* Only show New button when not in search mode */}
        {!isSearchMode && (
          <button
            onClick={onCreateNewClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-1" /> New
          </button>
        )}
      </div>

      {/* Show search results count */}
      {isSearchMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800">
            <span className="font-semibold">{items.length}</span> item
            {items.length !== 1 ? "s" : ""} found
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center p-10 text-gray-500">
          {isSearchMode ? (
            <div>
              <Search size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p>Try searching with different keywords</p>
            </div>
          ) : (
            <div>
              <Folder size={48} className="mx-auto mb-4" />
              <p>This folder is empty.</p>
              <button
                className="mt-4 text-blue-600 hover:underline"
                onClick={onCreateNewClick}
              >
                Create new item
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {items.map((item) => (
              <div key={item.id} className="">
                <div>
                  <WorkspaceItem
                    item={item}
                    onItemClick={onItemClick}
                    onItemDoubleClick={onItemDoubleClick}
                    isSelected={selectedItem?.id === item.id}
                  />

                  {/* Show path for search results */}
                  {isSearchMode && item.displayPath && (
                    <div tooltip={item.displayPath}>
                      <div className="mt-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 truncate">
                        <span className="font-medium">📁 Path:</span>{" "}
                        {item.displayPath}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceContent;
