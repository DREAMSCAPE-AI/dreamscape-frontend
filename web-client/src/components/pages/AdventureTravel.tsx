import React from 'react';
import { Mountain, Compass, Wind, Map, Shield, Award } from 'lucide-react';
import ExperienceCard from '../features/ExperienceCard';

const AdventureTravel = () => {
  const experiences = [
    {
      id: "alps-adventure",
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80",
      title: "Swiss Alps Expedition",
      location: "Swiss Alps",
      type: "Adventure",
      duration: "5 days",
      priceRange: "800-1200",
      rating: 4.9
    },
    {
      id: "safari-adventure",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80",
      title: "African Safari",
      location: "Tanzania",
      type: "Adventure",
      duration: "7 days",
      priceRange: "1200-1800",
      rating: 4.8
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Expert Guides",
      description: "Professional guides with years of experience"
    },
    {
      icon: Award,
      title: "Quality Equipment",
      description: "Top-tier gear and safety equipment provided"
    },
    {
      icon: Map,
      title: "Unique Routes",
      description: "Off-the-beaten-path destinations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80"
          alt="Adventure Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-3xl px-4">
            <h1 className="text-5xl font-bold text-white mb-6">Adventure Awaits</h1>
            <p className="text-xl text-gray-200">
              Push your limits with thrilling outdoor experiences
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="inline-block p-3 bg-orange-50 rounded-full mb-4">
                <feature.icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Featured Experiences */}
        <h2 className="text-3xl font-bold mb-8">Featured Adventures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} {...experience} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdventureTravel;