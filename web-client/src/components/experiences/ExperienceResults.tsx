import React from 'react';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import type { Experience } from '../../services/api/types';

interface ExperienceResultsProps {
  experiences: Experience[];
  onSelect: (experience: Experience) => void;
}

const ExperienceResults: React.FC<ExperienceResultsProps> = ({ experiences, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experiences.map((experience) => (
        <div
          key={experience.id}
          className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Image */}
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={experience.images[0]}
              alt={experience.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-500">{experience.category}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                <span className="text-sm text-gray-700">{experience.rating}</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2">{experience.title}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{experience.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{experience.duration}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-lg font-semibold">
                  {experience.price.currency}{experience.price.amount}
                </span>
              </div>
              <button
                onClick={() => onSelect(experience)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}

      {experiences.length === 0 && (
        <div className="col-span-full text-center py-12 bg-white rounded-xl">
          <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Experiences Found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or exploring different categories
          </p>
        </div>
      )}
    </div>
  );
};

export default ExperienceResults;