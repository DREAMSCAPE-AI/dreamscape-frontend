import React from 'react';
import { Space as Spa, Sunset, Coffee, Heart, Waves, Cloud } from 'lucide-react';
import ExperienceCard from '../features/ExperienceCard';

const RelaxationTravel = () => {
  const experiences = [
    {
      id: "maldives-relax",
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80",
      title: "Maldives Paradise",
      location: "Maldives",
      type: "Relaxation",
      duration: "7 days",
      priceRange: "1500-2500",
      rating: 4.9
    },
    {
      id: "bali-retreat",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80",
      title: "Bali Wellness Retreat",
      location: "Bali, Indonesia",
      type: "Relaxation",
      duration: "5 days",
      priceRange: "800-1200",
      rating: 4.8
    }
  ];

  const features = [
    {
      icon: Spa,
      title: "Wellness Activities",
      description: "Yoga, meditation, and spa treatments"
    },
    {
      icon: Heart,
      title: "Personal Care",
      description: "Tailored wellness programs and consultations"
    },
    {
      icon: Coffee,
      title: "Peaceful Settings",
      description: "Tranquil environments for complete relaxation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80"
          alt="Relaxation Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-3xl px-4">
            <h1 className="text-5xl font-bold text-white mb-6">Relaxation & Wellness</h1>
            <p className="text-xl text-gray-200">
              Unwind and rejuvenate with our curated wellness experiences
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
        <h2 className="text-3xl font-bold mb-8">Featured Wellness Experiences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} {...experience} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelaxationTravel;