const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create a Workspace",
      description: "Set up your collaborative environment for your team."
    },
    {
      number: "02",
      title: "Invite Team Members",
      description: "Add your colleagues to collaborate on documents together."
    },
    {
      number: "03",
      title: "Start Editing",
      description: "Create and edit documents with real-time updates."
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className=" mx-auto bg-blue-600 text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;