import React, { useState } from 'react';
import { Baby, Heart, Star, MapPin, Clock, Users, Accessibility, Sun, Shield } from 'lucide-react';
import type { Experience } from '@/services/voyage/types';

interface FamilyExperiencesProps {
  experiences: FamilyExperience[];
  onBook: (experience: FamilyExperience) => void;
  onSave: (experience: FamilyExperience) => void;
}

interface FamilyExperience extends Experience {
  ageGroups: string[];
  accessibility: {
    wheelchairAccessible: boolean;
    strollerAccessible: boolean;
    quietSpaces: boolean;
    familyRestrooms: boolean;
  };
  familyFeatures: string[];
  duration: string;
  maxGroupSize: number;
  childPrice?: number;
  cancellationPolicy: string;
}

const FamilyExperiences: React.FC<FamilyExperiencesProps> = ({
  experiences,
  onBook,
  onSave
}) => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [showAccessible, setShowAccessible] = useState(false);

  const ageGroups = [
    'all',
    'toddler',
    'preschool',
    'school-age',
    'teen'
  ];

  const filteredExperiences = experiences.filter(exp => 
    (selectedAgeGroup === 'all' || exp.ageGroups.includes(selectedAgeGroup)) &&
    (!showAccessible || exp.accessibility.wheelchairAccessible)
  );

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Age Groups */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Group
            </label>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map(age => (
                <button
                  key={age}
                  onClick={() => setSelectedAgeGroup(age)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedAgeGroup === age
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Baby className="w-4 h-4" />
                  <span className="capitalize">{age === 'all' ? 'All Ages' : age}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggle */}
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showAccessible}
                onChange={(e) => setShowAccessible(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Accessible Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiences.map((experience) => (
          <div
            key={experience.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={experience.images[0]}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Age Range Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-orange-500 text-white rounded-full text-sm flex items-center gap-1">
                <Baby className="w-4 h-4" />
                <span>{experience.ageGroups.join(', ')}</span>
              </div>

              {/* Accessibility Badge */}
              {experience.accessibility.wheelchairAccessible && (
                <div className="absolute top-4 right-4 p-2 bg-white/90 rounded-full">
                  <Accessibility className="w-5 h-5 text-blue-500" />
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={() => onSave(experience)}
                className="absolute bottom-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Heart className="w-5 h-5 text-orange-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="font-medium">{experience.rating}</span>
                </div>
                <span className="text-sm text-gray-500">Family-friendly</span>
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
                  <span>Up to {experience.maxGroupSize}</span>
                </div>
              </div>

              {/* Family Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {experience.familyFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Pricing & Booking */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm text-gray-500">Price per person</div>
                  <div className="text-lg font-bold">
                    {experience.price.currency} {experience.price.amount}
                  </div>
                  {experience.childPrice && (
                    <div className="text-sm text-orange-500">
                      Children: {experience.price.currency} {experience.childPrice}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onBook(experience)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Book Now
                </button>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>{experience.cancellationPolicy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyExperiences;