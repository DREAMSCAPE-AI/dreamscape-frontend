import React, { useState } from 'react';
import { Crown, Star, MapPin, Clock, Users, Shield, Wine, Sparkles } from 'lucide-react';
import type { Experience } from '@/services/voyage/types';

interface LuxuryExperiencesProps {
  experiences: Experience[];
  onBook: (experience: Experience) => void;
  onConcierge: (experience: Experience) => void;
}

const LuxuryExperiences: React.FC<LuxuryExperiencesProps> = ({
  experiences,
  onBook,
  onConcierge
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Experiences', icon: Crown },
    { id: 'culinary', label: 'Fine Dining', icon: Wine },
    { id: 'cultural', label: 'Cultural', icon: Sparkles },
    { id: 'exclusive', label: 'VIP Access', icon: Shield }
  ];

  const filteredExperiences = experiences.filter(experience => 
    selectedCategory === 'all' || experience.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <div className="flex items-center gap-6 overflow-x-auto pb-4">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="whitespace-nowrap">{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExperiences.map((experience) => (
          <div
            key={experience.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={experience.images[0]}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              
              {/* VIP Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-orange-500 text-white rounded-full text-sm flex items-center gap-1">
                <Crown className="w-4 h-4" />
                <span>VIP Experience</span>
              </div>

              {/* Rating */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full text-sm flex items-center gap-1">
                <Star className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{experience.rating}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">{experience.title}</h3>
              
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
                  <span>Private Group</span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Starting from</div>
                  <div className="text-2xl font-bold">
                    {experience.price.currency} {experience.price.total}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onConcierge(experience)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Contact Concierge
                  </button>
                  <button
                    onClick={() => onBook(experience)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LuxuryExperiences;