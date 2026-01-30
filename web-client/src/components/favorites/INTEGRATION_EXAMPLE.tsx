/**
 * INTEGRATION EXAMPLE
 * This file shows how to integrate FavoriteButton into existing card components
 *
 * DO NOT USE THIS FILE DIRECTLY - It's for reference only
 * Copy the relevant parts to your actual card components
 */

import React from 'react';
import { FavoriteButton } from '@/components/favorites';
import { FavoriteType } from '@/services/api/FavoritesService';

// ========== EXAMPLE 1: DestinationCard with FavoriteButton ==========

interface DestinationCardProps {
  id: string; // ADD: Unique ID for the destination
  title: string;
  image: string;
  description: string;
  onClick?: () => void;
}

const DestinationCardExample: React.FC<DestinationCardProps> = ({
  id,  // ADD: ID prop
  title,
  image,
  description,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg aspect-[4/5] cursor-pointer"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* ADD: FavoriteButton in top-right corner */}
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

// ========== EXAMPLE 2: Flight Card with FavoriteButton ==========

interface FlightCardProps {
  flight: {
    id: string;
    flightNumber: string;
    airline: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    currency: string;
  };
  onSelect?: () => void;
}

const FlightCardExample: React.FC<FlightCardProps> = ({ flight, onSelect }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200">
      {/* ADD: FavoriteButton in top-right corner */}
      <FavoriteButton
        entityType={FavoriteType.FLIGHT}
        entityId={flight.id}
        entityData={{
          title: `${flight.origin} → ${flight.destination}`,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          origin: flight.origin,
          destination: flight.destination,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          price: flight.price,
          currency: flight.currency,
        }}
        size="sm"
        className="absolute top-2 right-2"
      />

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{flight.airline}</h3>
          <span className="text-sm text-gray-500">{flight.flightNumber}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">From</p>
          <p className="font-semibold text-xl">{flight.origin}</p>
          <p className="text-xs text-gray-500">{flight.departureTime}</p>
        </div>

        <div className="flex-1 px-4">
          <div className="border-t-2 border-dashed border-gray-300 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
              ✈️
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">To</p>
          <p className="font-semibold text-xl">{flight.destination}</p>
          <p className="text-xs text-gray-500">{flight.arrivalTime}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
            {flight.currency} {flight.price.toFixed(2)}
          </span>
        </div>
        <button
          onClick={onSelect}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  );
};

// ========== EXAMPLE 3: Hotel Card with FavoriteButton ==========

interface HotelCardProps {
  hotel: {
    id: string;
    name: string;
    location: string;
    rating: number;
    pricePerNight: number;
    currency: string;
    imageUrl: string;
    amenities?: string[];
  };
  onSelect?: () => void;
}

const HotelCardExample: React.FC<HotelCardProps> = ({ hotel, onSelect }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Hotel Image */}
      <div className="relative h-48">
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />

        {/* ADD: FavoriteButton on image */}
        <FavoriteButton
          entityType={FavoriteType.HOTEL}
          entityId={hotel.id}
          entityData={{
            name: hotel.name,
            location: hotel.location,
            rating: hotel.rating,
            pricePerNight: hotel.pricePerNight,
            currency: hotel.currency,
            imageUrl: hotel.imageUrl,
            amenities: hotel.amenities,
          }}
          size="md"
          className="absolute top-3 right-3"
        />

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="font-semibold text-yellow-500">⭐ {hotel.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Hotel Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
        <p className="text-sm text-gray-600 mb-3">📍 {hotel.location}</p>

        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500">From</p>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
              {hotel.currency} {hotel.pricePerNight.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">/night</span>
          </div>
          <button
            onClick={onSelect}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-sm hover:from-orange-600 hover:to-pink-600 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== EXAMPLE 4: Activity Card with FavoriteButton ==========

interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    location: string;
    description: string;
    price: number;
    currency: string;
    duration: string;
    imageUrl: string;
  };
  onSelect?: () => void;
}

const ActivityCardExample: React.FC<ActivityCardProps> = ({ activity, onSelect }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Activity Image */}
      <div className="relative h-44">
        <img
          src={activity.imageUrl}
          alt={activity.title}
          className="w-full h-full object-cover"
        />

        {/* ADD: FavoriteButton */}
        <FavoriteButton
          entityType={FavoriteType.ACTIVITY}
          entityId={activity.id}
          entityData={{
            title: activity.title,
            location: activity.location,
            description: activity.description,
            price: activity.price,
            currency: activity.currency,
            duration: activity.duration,
            imageUrl: activity.imageUrl,
          }}
          size="sm"
          className="absolute top-2 right-2"
        />
      </div>

      {/* Activity Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{activity.title}</h3>
        <p className="text-sm text-gray-600 mb-2">📍 {activity.location}</p>
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{activity.description}</p>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-orange-600">
              {activity.currency} {activity.price.toFixed(2)}
            </span>
            <p className="text-xs text-gray-500">⏱️ {activity.duration}</p>
          </div>
          <button
            onClick={onSelect}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-sm hover:from-orange-600 hover:to-pink-600 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export {
  DestinationCardExample,
  FlightCardExample,
  HotelCardExample,
  ActivityCardExample,
};
