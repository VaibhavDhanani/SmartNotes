import { FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white p-1 rounded-full mr-2">
                <FileText size={16} />
              </div>
              <h3 className="font-bold">SmartNotes</h3>
            </div>
            <p className="text-sm mt-2">© 2025 SmartNotes. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;