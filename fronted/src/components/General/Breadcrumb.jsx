import { ChevronLeft, Home } from "lucide-react";

const Breadcrumb = ({ path = [], onNavigate }) => {
  return (
    <div className="flex items-center text-sm mb-4">
      <button
        onClick={() => onNavigate([])}
        className="text-blue-600 hover:underline flex items-center"
      >
        <Home size={14} className="mr-1" />
        Root
      </button>

      {path.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronLeft
            size={14}
            className="text-gray-400 mx-2 transform rotate-180"
          />
          <button
            onClick={() => onNavigate(path.slice(0, index + 1))}
            className="text-blue-600 hover:underline"
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;
