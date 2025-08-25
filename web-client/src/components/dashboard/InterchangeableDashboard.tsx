import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/auth/AuthService';
import { useDashboard } from '../../hooks/useDashboard';
import { 
  Briefcase, 
  Compass, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Heart, 
  Camera, 
  Globe, 
  Share2, 
  MessageSquare,
  Shield,
  AlertCircle,
  FileText,
  MapPin,
  Filter,
  Shuffle,
  Star,
  Coffee
} from 'lucide-react';

// Import existing components
import WelcomeSection from './WelcomeSection';
import RecommendationsSection from './RecommendationsSection';
import SavedItineraries from './SavedItineraries';
import QuickActions from './QuickActions';
import TravelStats from './TravelStats';
import PriceAlerts from './PriceAlerts';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

// Import specialized components
import BusinessItinerary from '../business/BusinessItinerary';
import ExpenseTracker from '../business/ExpenseTracker';
import RebookingOptions from '../business/RebookingOptions';

type DashboardMode = 'business' | 'bleisure' | 'leisure';
type DashboardView = 'overview' | 'itinerary' | 'expenses' | 'documents' | 'community' | 'saved' | 'experiences' | 'networking';

interface DashboardModeConfig {
  id: DashboardMode;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
  primaryViews: DashboardView[];
  secondaryViews: DashboardView[];
}

const dashboardModes: DashboardModeConfig[] = [
  {
    id: 'business',
    label: 'Business Travel',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    description: 'Optimize your corporate travel with policy compliance and expense management',
    primaryViews: ['overview', 'itinerary', 'expenses', 'documents'],
    secondaryViews: ['saved', 'experiences']
  },
  {
    id: 'bleisure',
    label: 'Bleisure Travel',
    icon: Coffee,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    description: 'Blend business and leisure for the perfect work-life balance',
    primaryViews: ['overview', 'itinerary', 'experiences', 'networking'],
    secondaryViews: ['expenses', 'documents', 'community', 'saved']
  },
  {
    id: 'leisure',
    label: 'Leisure Travel',
    icon: Compass,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    description: 'Discover amazing destinations and create unforgettable memories',
    primaryViews: ['overview', 'experiences', 'community', 'saved'],
    secondaryViews: ['itinerary', 'networking']
  }
];

const viewConfigs = {
  overview: { label: 'Overview', icon: Globe },
  itinerary: { label: 'Itinerary', icon: Calendar },
  expenses: { label: 'Expenses', icon: DollarSign },
  documents: { label: 'Documents', icon: FileText },
  community: { label: 'Community', icon: Users },
  saved: { label: 'Saved', icon: Heart },
  experiences: { label: 'Experiences', icon: Star },
  networking: { label: 'Networking', icon: MessageSquare }
};

const InterchangeableDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    upcomingTrips,
    recentBookings,
    recentSearches,
    recommendations,
    stats,
    priceAlerts,
    loading,
    error,
    refreshProfile,
    refreshBookings,
    refreshRecommendations,
    quickSearch,
    createPriceAlert
  } = useDashboard();

  // State management
  const [currentMode, setCurrentMode] = useState<DashboardMode>('leisure');
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showRebooking, setShowRebooking] = useState(false);

  // Initialize mode based on user preference or context
  useEffect(() => {
    // Check for saved user preference
    const savedMode = localStorage.getItem('dashboardMode') as DashboardMode;
    if (savedMode && dashboardModes.find(m => m.id === savedMode)) {
      setCurrentMode(savedMode);
    } else if (user?.userCategory === 'BUSINESS') {
      setCurrentMode('business');
    } else {
      setCurrentMode('leisure');
    }
  }, [user]);

  // Save mode preference when changed
  useEffect(() => {
    localStorage.setItem('dashboardMode', currentMode);
  }, [currentMode]);

  const currentModeConfig = dashboardModes.find(m => m.id === currentMode)!;
  const availableViews = [...currentModeConfig.primaryViews, ...currentModeConfig.secondaryViews];

  // Ensure active view is available in current mode
  useEffect(() => {
    if (!availableViews.includes(activeView)) {
      setActiveView(currentModeConfig.primaryViews[0]);
    }
  }, [currentMode, activeView, availableViews, currentModeConfig.primaryViews]);

  const handleModeChange = (newMode: DashboardMode) => {
    setCurrentMode(newMode);
    setShowModeSelector(false);
    // Reset to overview when switching modes
    setActiveView('overview');
  };

  // Mock data for different modes
  const getMockData = () => {
    const businessData = {
      meetings: [
        {
          id: '1',
          title: 'Client Meeting',
          location: 'Paris Office',
          startTime: '2024-03-20T10:00:00',
          endTime: '2024-03-20T11:30:00',
          participants: ['John Doe', 'Sarah Smith']
        }
      ],
      travelPolicies: [
        {
          category: 'Flights',
          rules: ['Business class allowed for flights over 6 hours', 'Booking required 14 days in advance']
        }
      ]
    };

    const leisureData = {
      destinations: [
        {
          id: 'paris',
          name: 'Paris',
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80',
          description: 'The City of Light awaits with its charming streets and iconic landmarks.',
          localExperiences: ['Wine Tasting', 'Cooking Class', 'Art Walk'],
          rating: 4.8
        }
      ],
      communityPosts: [
        {
          id: '1',
          user: { name: 'Emma Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80' },
          destination: 'Santorini',
          content: 'Just watched the most incredible sunset from Oia! The blue domes and white buildings create such a magical atmosphere.',
          image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80',
          likes: 42,
          comments: 8,
          timestamp: '2 hours ago'
        }
      ]
    };

    return { ...businessData, ...leisureData };
  };

  const mockData = getMockData();

  // Render functions for different views
  const renderOverviewContent = () => (
    <div className="space-y-8">
      <WelcomeSection 
        user={user} 
        upcomingTrips={upcomingTrips} 
        userCategory={currentMode === 'business' ? 'BUSINESS' : 'LEISURE'}
      />
      
      {/* Mode-specific quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {currentMode === 'business' && [
          { title: 'Next Meeting', value: '10:00 AM', icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { title: 'Monthly Expenses', value: '$2,450', icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { title: 'Policy Compliance', value: '98%', icon: Shield, color: 'bg-orange-50 text-orange-600' },
          { title: 'Pending Reports', value: '2', icon: FileText, color: 'bg-purple-50 text-purple-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}

        {currentMode === 'bleisure' && [
          { title: 'Business Days', value: '3', icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
          { title: 'Leisure Days', value: '2', icon: Heart, color: 'bg-pink-50 text-pink-600' },
          { title: 'Local Experiences', value: '5', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
          { title: 'Networking Events', value: '2', icon: Users, color: 'bg-green-50 text-green-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}

        {currentMode === 'leisure' && [
          { title: 'Destinations Visited', value: '12', icon: MapPin, color: 'bg-orange-50 text-orange-600' },
          { title: 'Photos Shared', value: '156', icon: Camera, color: 'bg-purple-50 text-purple-600' },
          { title: 'Local Friends', value: '28', icon: Users, color: 'bg-green-50 text-green-600' },
          { title: 'Experiences Rated', value: '45', icon: Star, color: 'bg-yellow-50 text-yellow-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickActions onQuickSearch={quickSearch} />
        <RecommendationsSection 
          recommendations={recommendations} 
          recentSearches={recentSearches}
          onRefresh={refreshRecommendations}
        />
      </div>

      {currentMode !== 'business' && (
        <TravelStats stats={stats} />
      )}
    </div>
  );

  const renderBusinessItinerary = () => (
    <BusinessItinerary
      meetings={mockData.meetings}
      flights={[]}
      hotels={[]}
      experiences={[]}
      onRebookFlight={() => setShowRebooking(true)}
    />
  );

  const renderExpenseManagement = () => (
    <ExpenseTracker 
      onSave={(expense) => console.log('Saving expense:', expense)}
      onCancel={() => console.log('Cancelled expense entry')}
    />
  );

  const renderTravelDocuments = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
        <div className="flex items-center gap-2 text-orange-600 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-medium">Travel Policy Highlights</h3>
        </div>
        <div className="space-y-4">
          {mockData.travelPolicies.map((policy, index) => (
            <div key={index}>
              <h4 className="font-medium text-gray-900 mb-2">{policy.category}</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {policy.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex}>{rule}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Travel Community</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Share2 className="w-4 h-4" />
          Share Experience
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockData.communityPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <img 
              src={post.image} 
              alt={post.destination}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={post.user.avatar} 
                  alt={post.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-gray-900">{post.user.name}</div>
                  <div className="text-sm text-gray-500">{post.destination} • {post.timestamp}</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    {post.comments}
                  </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExperiences = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {currentMode === 'business' ? 'Business Experiences' : 'Local Experiences'}
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>All Categories</option>
            <option>Food & Dining</option>
            <option>Culture & Arts</option>
            <option>Adventure</option>
            <option>Wellness</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockData.destinations.map((destination) => (
          <div key={destination.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <img 
              src={destination.image} 
              alt={destination.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{destination.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{destination.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{destination.description}</p>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">Popular Experiences:</div>
                <div className="flex flex-wrap gap-2">
                  {destination.localExperiences.map((experience, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                    >
                      {experience}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNetworking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Professional Networking</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
          <Users className="w-4 h-4" />
          Join Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Networking Events</h3>
          <div className="space-y-4">
            {[
              { title: 'Tech Meetup Paris', date: 'Mar 25, 2024', attendees: 45 },
              { title: 'Business Breakfast', date: 'Mar 27, 2024', attendees: 23 },
              { title: 'Industry Conference', date: 'Mar 30, 2024', attendees: 120 }
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-500">{event.date} • {event.attendees} attendees</div>
                </div>
                <button className="text-purple-500 hover:text-purple-600 text-sm font-medium">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Connections</h3>
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', role: 'Product Manager', company: 'TechCorp', mutual: 5 },
              { name: 'Michael Chen', role: 'Designer', company: 'Creative Studio', mutual: 3 },
              { name: 'Emma Wilson', role: 'Developer', company: 'StartupXYZ', mutual: 8 }
            ].map((connection, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {connection.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{connection.name}</div>
                    <div className="text-sm text-gray-500">{connection.role} at {connection.company}</div>
                    <div className="text-xs text-gray-400">{connection.mutual} mutual connections</div>
                  </div>
                </div>
                <button className="text-purple-500 hover:text-purple-600 text-sm font-medium">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSavedContent = () => (
    <div className="space-y-8">
      <SavedItineraries 
        bookings={recentBookings} 
        onRefresh={refreshBookings}
      />
      <PriceAlerts 
        alerts={priceAlerts} 
        onCreateAlert={createPriceAlert}
      />
    </div>
  );

  const renderActiveContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverviewContent();
      case 'itinerary':
        return renderBusinessItinerary();
      case 'expenses':
        return renderExpenseManagement();
      case 'documents':
        return renderTravelDocuments();
      case 'community':
        return renderCommunity();
      case 'saved':
        return renderSavedContent();
      case 'experiences':
        return renderExperiences();
      case 'networking':
        return renderNetworking();
      default:
        return renderOverviewContent();
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refreshProfile} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header with Mode Selector */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentModeConfig.label}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentModeConfig.description}
            </p>
          </div>
          
          {/* Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModeSelector(!showModeSelector)}
              className={`flex items-center gap-3 px-4 py-2 ${currentModeConfig.bgColor} text-white rounded-lg hover:opacity-90 transition-opacity`}
            >
              <currentModeConfig.icon className="w-5 h-5" />
              {currentModeConfig.label}
              <Shuffle className="w-4 h-4" />
            </button>

            {showModeSelector && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Switch Dashboard Mode</h3>
                  <p className="text-sm text-gray-600 mt-1">Choose the view that fits your current travel context</p>
                </div>
                <div className="p-2">
                  {dashboardModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        currentMode === mode.id 
                          ? 'bg-gray-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 ${mode.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                        <mode.icon className={`w-5 h-5 ${mode.color}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{mode.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{mode.description}</div>
                      </div>
                      {currentMode === mode.id && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {/* Primary Views */}
          {currentModeConfig.primaryViews.map((viewId) => {
            const view = viewConfigs[viewId];
            return (
              <button
                key={viewId}
                onClick={() => setActiveView(viewId)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  activeView === viewId
                    ? `${currentModeConfig.bgColor} text-white`
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <view.icon className="w-5 h-5" />
                {view.label}
              </button>
            );
          })}
          
          {/* Separator */}
          {currentModeConfig.secondaryViews.length > 0 && (
            <div className="w-px bg-gray-200 mx-2 self-stretch"></div>
          )}
          
          {/* Secondary Views */}
          {currentModeConfig.secondaryViews.map((viewId) => {
            const view = viewConfigs[viewId];
            return (
              <button
                key={viewId}
                onClick={() => setActiveView(viewId)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  activeView === viewId
                    ? `${currentModeConfig.bgColor} text-white`
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'
                }`}
              >
                <view.icon className="w-5 h-5" />
                {view.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {renderActiveContent()}
        </div>

        {/* Modals */}
        {showRebooking && (
          <RebookingOptions
            originalFlight={{
              id: 'flight1',
              source: 'GDS',
              instantTicketingRequired: false,
              nonHomogeneous: false,
              oneWay: false,
              lastTicketingDate: '2024-03-25',
              numberOfBookableSeats: 9,
              itineraries: [{
                duration: 'PT1H',
                segments: [{
                  id: 'segment1',
                  departure: { iataCode: 'CDG', at: '2024-03-20T08:00:00' },
                  arrival: { iataCode: 'LHR', at: '2024-03-20T09:00:00' },
                  carrierCode: 'AF',
                  number: '1234',
                  aircraft: { code: '320' },
                  duration: 'PT1H',
                  numberOfStops: 0,
                  blacklistedInEU: false
                }]
              }],
              price: {
                currency: 'EUR',
                total: '200.00',
                base: '150.00',
                fees: [{
                  amount: '50.00',
                  type: 'SUPPLIER'
                }],
                grandTotal: '200.00'
              },
              pricingOptions: {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true
              },
              validatingAirlineCodes: ['AF'],
              travelerPricings: []
            }}
            alternativeFlights={[]}
            onClose={() => setShowRebooking(false)}
            onSelect={() => setShowRebooking(false)}
          />
        )}
      </div>

      {/* Click outside to close mode selector */}
      {showModeSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowModeSelector(false)}
        />
      )}
    </div>
  );
};

export default InterchangeableDashboard;
