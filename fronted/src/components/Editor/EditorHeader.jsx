import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  File,
  MoreVertical,
  RefreshCw,
  Save,
  Share,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import ShareModal from "./ShareModal";
import { updateItem } from "../../service/workspace.service";
import { toast } from "react-toastify";

const getPermissionIcon = (type) => {
  const icons = {
    owner: <Shield size={14} className="text-blue-600" />,
    edit: <Edit3 size={14} className="text-green-600" />,
    view: <Eye size={14} className="text-gray-500" />,
  };
  return icons[type] || <User size={14} className="text-gray-400" />;
};

const getPermissionColor = (type) => {
  const colors = {
    owner: "text-blue-600 bg-blue-50",
    edit: "text-green-600 bg-green-50",
    view: "text-gray-600 bg-gray-50",
  };
  return colors[type] || "text-gray-500 bg-gray-50";
};

const EditorHeader = ({
  isSaving,
  document,
  handleBack,
  handleSave,
  handleShareAccess,
  handleDownloadDocs,
  handleDownloadPdf,
  sharedAccess = [],
  remoteCursors = new Map(),
}) => {
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);
  const [showShareModel, setShowShareModel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("view");
  const [isInviting, setIsInviting] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [isStared,setIsStared] = useState(document.is_stared);

  const toggleDownloadDropdown = () => {
    setShowDownloadDropdown((prev) => !prev);
  };

  const toggleShareModal = () => setShowShareModel((prev) => !prev);
  const toggleAccessDropdown = () => setShowAccessDropdown((prev) => !prev);
  const activeUsers = Array.from(remoteCursors.entries()).map(
    ([userId, cursorData]) => ({
      user_id: userId,
      username: cursorData.user_name,
      color: cursorData.color,
    })
  );

  const getUserColor = (userId, providedColor) => {
    if (providedColor) {
      // Convert hex color to Tailwind gradient classes
      return `bg-[${providedColor}]`;
    }
    const colors = [
      "from-red-500 to-pink-500",
      "from-blue-500 to-indigo-500",
      "from-green-500 to-emerald-500",
      "from-purple-500 to-violet-500",
      "from-yellow-500 to-orange-500",
      "from-cyan-500 to-teal-500",
      "from-rose-500 to-red-500",
      "from-amber-500 to-yellow-500",
    ];
    const hash =
      userId
        ?.toString()
        .split("")
        .reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0) || 0;
    return `bg-gradient-to-r ${colors[Math.abs(hash) % colors.length]}`;
  };

  const handleStar = async () =>{
    const toastId = toast.loading("Toggling star...");
    try {
      // console.log(document)
      const item = {
        id: document.doc_id,
        name: document.doc_name,
        isStared: !isStared,
        content:document.content,
        parent_id: document.directory_id

      }
      const response = await updateItem(item); 
      setIsStared(prev => !prev);
      toast.update(toastId, {
        render: "Item starred successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
    } catch (error) {
      console.log("Error in star",error);
    }
  }

  // console.log(document)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <File size={18} />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-gray-800">
                {document?.name}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>
                  Last updated{" "}
                  {document?.updated_at
                    ? new Date(document.updated_at).toLocaleString()
                    : "Never"}
                </span>
                {/* {lastSaved && <span>• Auto-saved {lastSaved.toLocaleTimeString()}</span>} */}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3">
          {/* render remote cursors  */}
          {activeUsers.length > 0 && (
            <div className="flex items-center -space-x-2">
              {activeUsers.slice(0, 4).map((cursor, index) => (
                <div
                  key={cursor.user_id}
                  className="relative group"
                  style={{ zIndex: activeUsers.length - index }}
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${getUserColor(
                      cursor.user_id
                    )} border-2 border-white shadow-sm flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:scale-110 transition-transform`}
                  >
                    {cursor.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {cursor.username}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              ))}
              {activeUsers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-medium">
                  +{activeUsers.length - 4}
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <button
              onClick={toggleAccessDropdown}
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gradient-to-tr from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-sm"
            >
              <Users size={16} />
              <span className="font-extrabold">{sharedAccess.length}</span>
              <ChevronDown size={14} />
            </button>

            {showAccessDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-20 py-2">
                <div className="px-4 py-2 border-b">
                  <h3 className="font-medium text-sm text-gray-900">
                    Document Access
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {sharedAccess.length}{" "}
                    {sharedAccess.length === 1 ? "person has" : "people have"}{" "}
                    access
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {sharedAccess.length > 0 ? (
                    sharedAccess.map((user, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium">
                            {user.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.username}
                            </p>
                            {user.email && (
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPermissionIcon(user.permission)}
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getPermissionColor(
                              user.permission
                            )}`}
                          >
                            {user.permission}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <Users size={24} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No shared access yet</p>
                      <p className="text-xs">Click share to invite others</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t">
                  <button
                    onClick={toggleShareModal}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                  >
                    <Share size={14} />
                    <span>Share Document</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full" onClick={handleStar}>
            <Star size={20} className={ `text-gray-400 ${isStared ? "text-yellow-400" : ""}`} />
          </button>

          <button
            onClick={handleSave ? () => handleSave(false) : undefined}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md flex items-center text-sm font-medium"
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

          <div className="relative">
            <button
              onClick={toggleDownloadDropdown}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical size={20} />
            </button>

            {showDownloadDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white shadow-xl border border-gray-200 rounded-lg z-20 min-w-[160px] overflow-hidden">
                <div className="py-1">
                  <button
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-left text-sm text-gray-700 transition-colors duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDownloadDropdown(false);
                      handleDownloadPdf(document);
                    }}
                  >
                    <Download size={14} className="text-gray-500" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-left text-sm text-gray-700 transition-colors duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDownloadDropdown(false);
                      handleDownloadDocs()
                    }}
                  >
                    <BookOpen size={14} className="text-gray-500" />
                    <span>Download Word</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlays */}
      {showAccessDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowAccessDropdown(false)}
        />
      )}
      {showDownloadDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDownloadDropdown(false)}
        />
      )}

      {showShareModel && (
        <ShareModal
          onClose={toggleShareModal}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          selectedPermission={selectedPermission}
          setSelectedPermission={setSelectedPermission}
          handleShareAccess={handleShareAccess}
          isInviting={isInviting}
        />
      )}
    </header>
  );
};

export default EditorHeader;
