import { File as FileIcon, Folder, MoreVertical } from "lucide-react";

const WorkspaceItem = ({ item, onItemClick, onItemDoubleClick }) => {
  const isFolder = item.type === 'folder';
  
  return (
    <div 
      className="border border-gray-200 rounded-md p-3 flex flex-col items-center hover:bg-gray-50 cursor-pointer"
      onClick={() => onItemClick(item)}
      onDoubleClick={() => onItemDoubleClick(item)}
    >
      <div className="w-full flex justify-end mb-2">
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={16} />
        </button>
      </div>
      <div className={`mb-2 ${isFolder ? '' : 'text-blue-500'}`}
          style={isFolder ? { color: item.color } : {}}
      >
        {isFolder ? <Folder size={40} /> : <FileIcon size={40} />}
      </div>
      <div className="text-center truncate w-full">
        <div className="font-medium text-gray-800 truncate">{item.name}</div>
        <div className="text-xs text-gray-500"> 
          {new Date(item.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceItem;