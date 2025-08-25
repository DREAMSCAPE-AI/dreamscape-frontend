import React, { useState } from 'react';
import { MapPin, Calendar, Star, Clock, Globe, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import PhotoGallery from './PhotoGallery';
import InteractiveMap from './InteractiveMap';
import BookingWidget from './BookingWidget';
import VRPreview from './VRPreview';
import DestinationReviews from './DestinationReviews';
import PersonalizedActivities from './PersonalizedActivities';

interface DestinationDetailProps {
  destination: {
    id: string;
    name: string;
    location: string;
    description: string;
    rating: number;
    reviewCount: number;
    price: {
      from: number;
      currency: string;
    };
    images: string[];
    coordinates: {
      lat: number;
      lng: number;
    };
    pointsOfInterest: Array<{
      name: string;
      type: string;
      description: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    }>;
  };
}

const DestinationDetail: React.FC<DestinationDetailProps> = ({ destination }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVR, setShowVR] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={destination.images[currentImageIndex]}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-8">
          <button
            onClick={() => setCurrentImageIndex(prev => (prev === 0 ? destination.images.length - 1 : prev - 1))}
            className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => setCurrentImageIndex(prev => (prev === destination.images.length - 1 ? 0 : prev + 1))}
            className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-5xl font-bold text-white mb-4">{destination.name}</h1>
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{destination.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
                    <span>{destination.rating} ({destination.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowVR(true)}
                className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Experience in VR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <h2 className="text-3xl font-bold mb-6">About {destination.name}</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 leading-relaxed">{destination.description}</p>
              </div>
            </section>

            {/* Photo Gallery */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Photo Gallery</h2>
              <PhotoGallery images={destination.images} />
            </section>

            {/* Points of Interest */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Points of Interest</h2>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <InteractiveMap
                  center={destination.coordinates}
                  points={destination.pointsOfInterest}
                />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.pointsOfInterest.map((poi, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">{poi.name}</h3>
                    <p className="text-gray-600">{poi.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Traveler Reviews</h2>
              <DestinationReviews destinationId={destination.id} />
            </section>
          </div>

          {/* Right Column - Booking & Recommendations */}
          <div className="lg:col-span-1 space-y-8">
            {/* Booking Widget */}
            <div className="sticky top-24">
              <BookingWidget
                price={destination.price}
                rating={destination.rating}
                reviewCount={destination.reviewCount}
              />

              {/* Personalized Activities */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Recommended for You</h3>
                <PersonalizedActivities destinationId={destination.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VR Preview Modal */}
      {showVR && (
        <VRPreview
          destinationId={destination.id}
          onClose={() => setShowVR(false)}
        />
      )}
    </div>
  );
};

export default DestinationDetail;