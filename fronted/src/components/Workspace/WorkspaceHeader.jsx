import { File as FileIcon, LogOut, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WorkspaceHeader = ({
  onSearch,
  searchQuery,
  onClearSearch,
  user,
  logout,
}) => {
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-grow">
          <div className="bg-blue-500 text-white p-1.5 rounded">
            <FileIcon size={18} />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">SmartNotes</h1>

          <div className="ml-6 relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery || ""}
              className="pl-10 pr-12 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => onSearch(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-md transition-colors"
                title="Clear search"
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center ml-4">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex justify-end p-2">
          <button
            onClick={() => {
              logout();
              navigate("/auth");
            }}
            className="flex items-center gap-2 bg-red-400 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};


export default WorkspaceHeader;
