import {
  AlertCircle,
  Check,
  Edit3,
  MoreVertical,
  Star,
  StarOff,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import documentIcon from "../../assets/document.png";
import folderIcon from "../../assets/folder.png";

const WorkspaceItem = ({
  item,
  onItemClick,
  onItemDoubleClick,
  onDelete,
  onStar,
  onRename,
  isSelected,
  existingNames = [],
}) => {
  const isFolder = item.type === "folder";
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const [error, setError] = useState("");

  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        handleCloseMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleOpenMenu = () => {
    setMenuOpen(true);
    setIsMenuAnimating(true);
  };

  const handleCloseMenu = () => {
    setIsMenuAnimating(false);
    setTimeout(() => setMenuOpen(false), 150);
  };

  const handleMenuAction = (action, item) => {
    action(item);
    handleCloseMenu();
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(item.name);
    setError("");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue(item.name);
    setError("");
  };

  const validateName = (name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return "Name cannot be empty";
    }

    if (trimmedName === item.name) {
      return "";
    }

    if (existingNames.includes(trimmedName)) {
      return "A file or folder with this name already exists";
    }

    if (trimmedName.length > 255) {
      return "Name is too long (maximum 255 characters)";
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedName)) {
      return "Name contains invalid characters";
    }

    return "";
  };

  const saveEdit = () => {
    const validationError = validateName(editValue);

    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedName = editValue.trim();
    if (trimmedName !== item.name) {
      onRename && onRename(item, trimmedName);
    }

    setIsEditing(false);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const handleNameDoubleClick = (e) => {
    e.stopPropagation();
    startEditing();
  };

  return (
    <div
      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer relative transition-all duration-200
          ${
            isSelected
              ? "bg-blue-100 border-2 border-blue-500"
              : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          } 
          ${isSelected ? "" : "hover:shadow-sm"}
        `}
      onClick={() => !isEditing && onItemClick(item)}
      onDoubleClick={() => !isEditing && onItemDoubleClick(item)}
    >
      <div className="w-full flex justify-end mb-3 relative" ref={menuRef}>
        <button
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            menuOpen ? handleCloseMenu() : handleOpenMenu();
          }}
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <div
            className={`absolute right-0 top-8 bg-white shadow-xl border border-gray-200 rounded-lg z-20 min-w-[140px] overflow-hidden transition-all duration-150 ${
              isMenuAnimating
                ? "opacity-100 transform translate-y-0 scale-100"
                : "opacity-0 transform -translate-y-2 scale-95"
            }`}
            style={{
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div className="py-1">
              <button
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-200 w-full text-left text-sm text-gray-700 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing();
                  handleCloseMenu();
                }}
              >
                <Edit3 size={14} className="text-gray-500" />
                <span>Rename</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-200 w-full text-left text-sm text-gray-700 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuAction(onStar, {
                    ...item,
                    isStared: !item.isStared,
                  });
                }}
              >
                {item.isStared ? (
                  <>
                    <StarOff size={14} className="text-gray-500" />
                    <span>Remove star</span>
                  </>
                ) : (
                  <>
                    <Star size={14} className="text-gray-500" />
                    <span>Add star</span>
                  </>
                )}
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-200 w-full text-left text-sm text-red-600 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuAction(onDelete, item);
                }}
              >
                <Trash2 size={14} className="text-red-500" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`mb-3 transition-transform duration-200 ${
          isFolder ? "" : "text-blue-500"
        }`}
        style={isFolder ? { color: item.color } : {}}
      >
        {isFolder ? (
          <img
            src={folderIcon}
            width={48}
            height={48}
            alt="Folder"
            className="drop-shadow-sm"
          />
        ) : (
          <img
            src={documentIcon}
            width={48}
            height={48}
            alt="Document"
            className="drop-shadow-sm"
          />
        )}
      </div>

      <div className="text-center w-full">
        <div className="flex justify-center mb-1">
          {isEditing ? (
            <div className="w-full">
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  className={`flex-1 px-2 py-1 text-sm font-medium text-gray-800 bg-white border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveEdit();
                  }}
                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelEditing();
                  }}
                  className="p-1 text-gray-500 hover:bg-gray-50 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="font-medium text-gray-800 truncate cursor-text"
              title={item.name}
              onDoubleClick={handleNameDoubleClick}
            >
              {item.name}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          {new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        {item.starred && (
          <div className="mt-2">
            <Star size={12} className="text-yellow-400 fill-current mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceItem;
