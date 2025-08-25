import React from 'react';
import { Star, Clock, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ExperienceCardProps {
  id?: string;
  image: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  priceRange: string;
  rating: number;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  id,
  image,
  title,
  location,
  type,
  duration,
  priceRange,
  rating
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/experiences/${id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-orange-500">{type}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span className="text-sm text-gray-700">{rating}</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-1 text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{location}</p>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{priceRange}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;