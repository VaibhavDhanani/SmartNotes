import { File as FileIcon, Folder } from "lucide-react";
import { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { toast } from "react-toastify";

const CreateItemModal = ({ isOpen, onClose, onCreateItem, parentFolderId }) => {
  const {user} = useUser();
  const [itemType, setItemType] = useState('folder');
  const [itemName, setItemName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if(itemType === "document" && (parentFolderId === null || parentFolderId === undefined)){
      toast.warn("Please create document in inside any directory");
      onClose();
      return
    }
    if (itemName.trim() && user) {
      onCreateItem({
        userId: user.userId,
        name: itemName,
        type: itemType,
        color: "#99e810",
        parentId: parentFolderId,
      });
      setItemName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Create New {itemType === 'folder' ? 'Folder' : 'Document'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={itemType === 'folder'}
                  onChange={() => setItemType('folder')}
                  className="mr-2"
                />
                <Folder size={16} className="mr-1 text-yellow-500" />
                Folder
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={itemType === 'document'}
                  onChange={() => setItemType('document')}
                  className="mr-2"
                />
                <FileIcon size={16} className="mr-1 text-blue-500" />
                Document
              </label>
            </div>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={`Enter ${itemType} name`}
              className="w-full border border-gray-300 rounded-md p-2"
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItemModal;