import { useState } from "react";
import { FileText, Users, Shield, Zap, Menu, X, ChevronRight } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const features = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Smart Documents",
      
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Team Collaboration",
      
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Secure Storage",
      
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Lightning Fast",
      
    }
  ];
  
  return (
    <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo and Brand */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
            
            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shadow-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <span className="font-bold text-white text-2xl tracking-tight">
                  SmartNotes
                </span>
                <div className="text-blue-100 text-xs font-medium">
                  Your Digital Workspace
                </div>
              </div>
            </div>
          </div>
          
          {/* Center section - Features (Hidden on mobile) */}
          <div className="hidden lg:flex items-center space-x-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors group cursor-pointer">
                <div className="text-blue-200 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{feature.title}</div>
                  <div className="text-xs text-blue-100">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right section - CTA */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-semibold text-sm">
                  Welcome to the Future
                </div>
                <div className="text-blue-100 text-xs">
                  of Document Management
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ChevronRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-4 pb-6 space-y-4 bg-white/10 backdrop-blur-sm">
          {/* Mobile Features */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
              Why Choose SmartNotes?
            </h3>
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-blue-200 mt-0.5">
                  {feature.icon}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{feature.title}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile CTA */}
          <div className="pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-white font-semibold">
                Ready to get started?
              </div>
              <div className="text-blue-100 text-sm mt-1">
                Organize your digital life today
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </nav>
  );
}

export default Navbar;