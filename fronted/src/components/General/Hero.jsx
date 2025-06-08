import { ChevronRight } from "lucide-react";

const Hero = ({ onGetStarted }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Real-time Collaborative Document Editing
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Create, edit, and collaborate on documents with your team in
          real-time. Boost productivity with SmartNotes.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center transition-colors"
        >
          Get Started <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Hero;
