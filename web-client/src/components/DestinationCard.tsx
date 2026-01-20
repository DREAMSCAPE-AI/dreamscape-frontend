import React from 'react';
import { FavoriteButton } from '@/components/favorites';
import { FavoriteType } from '@/services/api/FavoritesService';

interface DestinationCardProps {
  id: string;
  title: string;
  image: string;
  description: string;
  onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ id, title, image, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg aspect-[4/5] cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Favorite Button */}
      <FavoriteButton
        entityType={FavoriteType.DESTINATION}
        entityId={id}
        entityData={{
          title,
          description,
          image,
        }}
        size="md"
        className="absolute top-4 right-4 z-10"
      />

      <div className="absolute bottom-0 p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        <button 
          className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-md transition-colors text-white"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default DestinationCard;