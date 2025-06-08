import { FileText, Users, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Users size={24} className="text-blue-500" />,
      title: "Real-time Collaboration",
      description:
        "Work together with your team members simultaneously on the same document.",
    },
    {
      icon: <FileText size={24} className="text-blue-500" />,
      title: "Rich Text Editing",
      description:
        "Format your documents with a wide range of styling options and media embeddings.",
    },
    {
      icon: <Zap size={24} className="text-blue-500" />,
      title: "Instant Updates",
      description:
        "See changes in real-time with WebSocket technology powering the collaboration.",
    },
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex-col"
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <div className="flex justify-center">
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
