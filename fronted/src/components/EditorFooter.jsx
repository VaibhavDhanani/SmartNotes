import { RefreshCw, Users, Wifi, WifiOff } from "lucide-react";

const EditorFooter = ({ activeUsers, isConnected, content, isSaving }) => {
  return (
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

        <div className="text-sm text-gray-500">
          {content.length} characters •{" "}
          {content.split(/\s+/).filter((word) => word.length > 0).length} words
        </div>

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
  );
};

export default EditorFooter;
