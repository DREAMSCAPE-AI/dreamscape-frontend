import React, { useState } from 'react';
import { Camera, Leaf, DollarSign, Compass, Heart, Share2, MapPin, Clock, Users } from 'lucide-react';
import type { Experience } from '@/services/voyage/types';

interface ExperienceDiscoveryProps {
  experiences: Experience[];
  onSave: (experienceId: string) => void;
  onShare: (experienceId: string) => void;
  onBook: (experience: Experience) => void;
}

const ExperienceDiscovery: React.FC<ExperienceDiscoveryProps> = ({
  experiences,
  onSave,
  onShare,
  onBook
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { id: 'all', label: 'All', icon: Compass },
    { id: 'instagram', label: 'Instagram-worthy', icon: Camera },
    { id: 'eco', label: 'Eco-friendly', icon: Leaf },
    { id: 'budget', label: 'Budget-friendly', icon: DollarSign }
  ];

  const filteredExperiences = experiences.filter(experience => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'instagram') return experience.category.includes('photo');
    if (activeFilter === 'eco') return experience.category.includes('eco');
    if (activeFilter === 'budget') return parseFloat(experience.price.total) < 50;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiences.map((experience) => (
          <div
            key={experience.id}
            className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={experience.images[0]}
                alt={experience.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Action Buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => onSave(experience.id)}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Heart className="w-5 h-5 text-orange-500" />
                </button>
                <button
                  onClick={() => onShare(experience.id)}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Share2 className="w-5 h-5 text-orange-500" />
                </button>
              </div>

              {/* Sustainability Badge */}
              {experience.category.includes('eco') && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-green-500/90 text-white rounded-full text-sm flex items-center gap-1">
                  <Leaf className="w-4 h-4" />
                  <span>Eco-friendly</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-orange-500">{experience.category}</span>
                <div className="text-sm font-medium text-gray-900">
                  {experience.price.currency} {experience.price.total}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">{experience.title}</h3>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{experience.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{experience.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Small group</span>
                </div>
              </div>

              {/* Carbon Footprint */}
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Leaf className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Carbon footprint: 2.5 kg CO₂e</span>
              </div>

              <button
                onClick={() => onBook(experience)}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Book Experience
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceDiscovery;