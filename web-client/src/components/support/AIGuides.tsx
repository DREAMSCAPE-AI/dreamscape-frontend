import React, { useState } from 'react';
import { Globe, MapPin, Compass, Sparkles } from 'lucide-react';

const AIGuides = () => {
  const [destination, setDestination] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const availableInterests = [
    'Culture', 'Food', 'Adventure', 'Nature', 'History', 'Shopping'
  ];

  const guides = [
    {
      title: "Hidden Gems of Paris",
      description: "Discover lesser-known spots and local favorites",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80",
      tags: ['Culture', 'History']
    },
    {
      title: "Tokyo Tech Tour",
      description: "Explore the future in Japan's capital",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80",
      tags: ['Technology', 'Culture']
    }
  ];

  return (
    <div className="space-y-8">
      {/* AI Guide Generator */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-semibold">Generate Custom Guide</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where are you going?"
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => {
                    if (interests.includes(interest)) {
                      setInterests(interests.filter(i => i !== interest));
                    } else {
                      setInterests([...interests, interest]);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    interests.includes(interest)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity">
            Generate Guide
          </button>
        </div>
      </div>

      {/* Featured Guides */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Featured Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
                <p className="text-gray-600 mb-4">{guide.description}</p>
                <div className="flex flex-wrap gap-2">
                  {guide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIGuides;