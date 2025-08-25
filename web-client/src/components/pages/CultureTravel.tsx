import React from 'react';
import { Globe, Book, Camera, Utensils, Landmark, Users } from 'lucide-react';
import ExperienceCard from '../features/ExperienceCard';

const CultureTravel = () => {
  const experiences = [
    {
      id: "paris-culture",
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80",
      title: "Paris Art & History",
      location: "Paris, France",
      type: "Cultural",
      duration: "3 days",
      priceRange: "300-500",
      rating: 4.9
    },
    {
      id: "kyoto-culture",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80",
      title: "Traditional Kyoto",
      location: "Kyoto, Japan",
      type: "Cultural",
      duration: "4 days",
      priceRange: "400-600",
      rating: 4.8
    }
  ];

  const features = [
    {
      icon: Landmark,
      title: "Historical Sites",
      description: "Visit UNESCO World Heritage sites and ancient landmarks"
    },
    {
      icon: Utensils,
      title: "Culinary Experiences",
      description: "Taste authentic local cuisine and cooking classes"
    },
    {
      icon: Users,
      title: "Local Interactions",
      description: "Connect with local communities and traditions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80"
          alt="Cultural Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-3xl px-4">
            <h1 className="text-5xl font-bold text-white mb-6">Cultural Experiences</h1>
            <p className="text-xl text-gray-200">
              Immerse yourself in authentic local traditions, art, and history
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
        <h2 className="text-3xl font-bold mb-8">Featured Cultural Experiences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} {...experience} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CultureTravel;