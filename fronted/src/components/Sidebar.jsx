import { Clock, Home, Menu, Settings, Share2, Star, Trash, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/workspace' },
    { icon: <Share2 size={20} />, label: 'Shared', path: '/workspace/shared' },
    { icon: <Star size={20} />, label: 'Starred', path: '/workspace/starred' },
    { icon: <Clock size={20} />, label: 'Recent', path: '/workspace/recent' },
    { icon: <Trash size={20} />, label: 'Trash', path: '/workspace/trash' },
  ];

  return (
    <div className={`bg-gray-100 border-r border-gray-200 h-full flex flex-col ${collapsed ? 'w-16' : 'w-72'} transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        {!collapsed && <h2 className=" text-xl font-semibold text-gray-800">Workspace</h2>}
        <button 
          className="text-gray-500 hover:bg-gray-200 rounded p-1" 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      <div className="flex flex-col flex-grow overflow-y-auto">
        <nav className="p-2">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              onClick={() => setActiveMenu(item.label.toLowerCase())}
              className={`flex items-center space-x-2 p-2 rounded-md ${activeMenu === item.label.toLowerCase() ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-200'} mb-1`}
            >
              <div>{item.icon}</div>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Settings size={20} className="text-gray-600" />
            <span className="text-gray-700">Settings</span>
          </div>
        )}
        {collapsed && <Settings size={20} className="text-gray-600" />}
      </div>
    </div>
  );
};

export default Sidebar;