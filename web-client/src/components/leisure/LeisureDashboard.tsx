import { useState } from 'react';
import { Compass, Heart, Map, Globe, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import LuxuryExperiences from '../premium/LuxuryExperiences';
import PersonalizedActivities from '../destination/PersonalizedActivities';

const LeisureDashboard = () => {
  const {
    recommendations,
    trendingDestinations,
    stats,
    loading,
    error
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<'explore' | 'saved'>('explore');

  // Use trending destinations or recommendations for the destination showcase
  const destinations = (trendingDestinations.length > 0 ? trendingDestinations : recommendations).slice(0, 4);
  const featuredDestination = destinations[0];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Immersive Destination Showcase */}
      <div className="relative h-[400px] rounded-xl overflow-hidden group">
        <img
          src={featuredDestination?.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80'}
          alt={featuredDestination?.title || 'Featured Destination'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {featuredDestination ? `Discover ${featuredDestination.title || featuredDestination.location}` : 'Discover Your Next Destination'}
          </h2>
          <p className="text-gray-200 mb-4 max-w-2xl">
            {featuredDestination?.description || 'Explore personalized recommendations and find your perfect getaway.'}
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
                {destinations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {destinations.map((destination) => (
                      <div
                        key={destination.id}
                        className="group relative aspect-[4/3] rounded-lg overflow-hidden"
                      >
                        <img
                          src={destination.image}
                          alt={destination.title || destination.location}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 p-4">
                          <h4 className="text-xl font-bold text-white mb-1">{destination.title || destination.location}</h4>
                          <p className="text-gray-200 text-sm mb-3">{destination.description}</p>
                          {destination.tags && destination.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {destination.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Compass className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recommendations yet. Start searching to get personalized suggestions!</p>
                  </div>
                )}
              </div>

              {/* Local Experiences */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-6">Authentic Local Experiences</h3>
                <PersonalizedActivities destinationId="paris" />
              </div>
            </>
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
            </div>
          </div>

          {/* Travel Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Your Travel Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">{stats?.countriesVisited ?? 0}</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">{stats?.totalBookings ?? 0}</div>
                <div className="text-sm text-gray-600">Trips</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">{stats?.averageTripDuration ?? 0}</div>
                <div className="text-sm text-gray-600">Avg. Days</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">{stats?.upcomingTrips ?? 0}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeisureDashboard;
