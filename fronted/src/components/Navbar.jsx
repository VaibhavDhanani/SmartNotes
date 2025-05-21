import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  
  const profileRef = useRef(null);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implementation for search functionality
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section - Logo and Project Name */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
            
            {/* Project Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                P
              </div>
              <span className="ml-2 font-bold text-gray-900 text-lg hidden md:block">
                SmartNotes
              </span>
            </div>
          </div>
          
          {/* Center section - Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Right section - Notifications and Profile */}
          <div className="flex items-center">
            {/* Invitation/Notification Icon */}
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center transform -translate-y-1/3 translate-x-1/3">
                  {notifications}
                </span>
              )}
            </button>
            
            {/* Profile Dropdown */}
            <div className="ml-4 relative flex-shrink-0" ref={profileRef}>
              <div>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">JD</span>
                  </div>
                  <div className="hidden md:flex md:items-center ml-2">
                    <span className="text-sm font-medium text-gray-700 mr-1">John Doe</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              </div>
              
              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    Your Profile
                  </button>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    Settings
                  </button>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
          >
            Dashboard
          </button>
          <button
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
          >
            Projects
          </button>
          <button
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
          >
            Teams
          </button>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-5">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-medium">JD</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">John Doe</div>
              <div className="text-sm font-medium text-gray-500">john@example.com</div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <button
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
            >
              Your Profile
            </button>
            <button
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
            >
              Settings
            </button>
            <button
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar
