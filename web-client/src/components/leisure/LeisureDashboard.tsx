import React, { useState } from 'react';
import { Compass, Heart, Users, Camera, Map, Globe, Share2, MessageSquare } from 'lucide-react';
import LuxuryExperiences from '../premium/LuxuryExperiences';
import PersonalizedActivities from '../destination/PersonalizedActivities';

const destinations = [
  {
    id: 'paris',
    name: 'Paris',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80',
    description: 'The City of Light awaits with its charming streets and iconic landmarks.',
    localExperiences: ['Wine Tasting', 'Cooking Class', 'Art Walk'],
    rating: 4.8
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80',
    description: 'Immerse yourself in traditional Japanese culture and serene gardens.',
    localExperiences: ['Tea Ceremony', 'Temple Visit', 'Kimono Experience'],
    rating: 4.9
  }
];

const communityPosts = [
  {
    id: '1',
    user: {
      name: 'Emma Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'
    },
    destination: 'Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80',
    caption: 'Found this hidden waterfall off the beaten path! 🌿',
    likes: 245,
    comments: 18
  },
  {
    id: '2',
    user: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80'
    },
    destination: 'Santorini',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80',
    caption: 'Best sunset spot in Oia! 🌅',
    likes: 312,
    comments: 24
  }
];

const LeisureDashboard = () => {
  const [activeTab, setActiveTab] = useState<'explore' | 'community' | 'saved'>('explore');

  return (
    <div className="space-y-8">
      {/* Immersive Destination Showcase */}
      <div className="relative h-[400px] rounded-xl overflow-hidden group">
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80"
          alt="Featured Destination"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h2 className="text-3xl font-bold text-white mb-2">Discover Paris</h2>
          <p className="text-gray-200 mb-4 max-w-2xl">
            Experience the magic of the City of Light with authentic local experiences and hidden gems.
          </p>
          <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors">
            Start Planning
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4">
        {[
          { id: 'explore', label: 'Explore', icon: Compass },
          { id: 'community', label: 'Community', icon: Users },
          { id: 'saved', label: 'Saved', icon: Heart }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'explore' && (
            <>
              {/* Personalized Recommendations */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-6">Recommended for You</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {destinations.map((destination) => (
                    <div
                      key={destination.id}
                      className="group relative aspect-[4/3] rounded-lg overflow-hidden"
                    >
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 p-4">
                        <h4 className="text-xl font-bold text-white mb-1">{destination.name}</h4>
                        <p className="text-gray-200 text-sm mb-3">{destination.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {destination.localExperiences.map((exp, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Experiences */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-6">Authentic Local Experiences</h3>
                <PersonalizedActivities destinationId="paris" />
              </div>
            </>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              {communityPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{post.user.name}</div>
                        <div className="text-sm text-gray-500">{post.destination}</div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Post Image */}
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full aspect-[4/3] object-cover"
                  />

                  {/* Post Actions */}
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                    <p className="text-gray-600">{post.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6">Saved Experiences</h3>
              <LuxuryExperiences
                experiences={[]}
                onBook={() => {}}
                onConcierge={() => {}}
              />
            </div>
          )}
        </div>

        {/* Right Column - Trip Planning Tools */}
        <div className="space-y-6">
          {/* Trip Planning Widget */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Plan Your Next Adventure</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 p-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                <Map className="w-5 h-5" />
                <span>Create New Trip</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Globe className="w-5 h-5" />
                <span>Explore Destinations</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Camera className="w-5 h-5" />
                <span>View Travel Stories</span>
              </button>
            </div>
          </div>

          {/* Travel Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Your Travel Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">12</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">35</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">48</div>
                <div className="text-sm text-gray-600">Experiences</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">156</div>
                <div className="text-sm text-gray-600">Photos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeisureDashboard;