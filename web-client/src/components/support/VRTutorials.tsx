import React from 'react';
import { Headset, Play, Book, Download } from 'lucide-react';

const VRTutorials = () => {
  const tutorials = [
    {
      title: "Getting Started with VR",
      duration: "5 min",
      level: "Beginner",
      description: "Learn the basics of using our VR features for immersive travel experiences",
      image: "https://images.unsplash.com/photo-1626387346567-68d0c49ce1e5?auto=format&fit=crop&q=80"
    },
    {
      title: "Advanced VR Navigation",
      duration: "8 min",
      level: "Intermediate",
      description: "Master the art of navigating virtual destinations and interactive features",
      image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Quick Start Guide */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Start Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Headset,
              title: "Setup Your Device",
              description: "Connect your VR headset or enable 360° view"
            },
            {
              icon: Play,
              title: "Launch Experience",
              description: "Start your virtual journey with one click"
            },
            {
              icon: Book,
              title: "Follow Tutorial",
              description: "Learn the basics with our interactive guide"
            }
          ].map((step, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <step.icon className="w-8 h-8 text-orange-500 mb-3" />
              <h3 className="font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tutorial Videos */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Tutorial Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={tutorial.image}
                  alt={tutorial.title}
                  className="w-full h-full object-cover"
                />
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors">
                  <Play className="w-12 h-12 text-white" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{tutorial.title}</h3>
                  <span className="text-sm text-gray-500">{tutorial.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-500">{tutorial.level}</span>
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors">
                    <Download className="w-4 h-4" />
                    Download Resources
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VRTutorials;