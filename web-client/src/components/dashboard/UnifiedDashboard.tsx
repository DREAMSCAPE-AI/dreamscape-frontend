import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  Map, 
  Globe, 
  Share2, 
  MessageSquare,
  Shield,
  AlertCircle,
  FileText,
  MapPin,
  Filter,
  Settings
} from 'lucide-react';

// Import existing components
import WelcomeSection from './WelcomeSection';
import RecommendationsSection from './RecommendationsSection';
import SavedItineraries from './SavedItineraries';
import TravelPreferences from './TravelPreferences';
import TripHistory from './TripHistory';
import QuickActions from './QuickActions';
import TravelStats from './TravelStats';
import PriceAlerts from './PriceAlerts';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

// Import specialized components
import BusinessItinerary from '../business/BusinessItinerary';
import ExpenseTracker from '../business/ExpenseTracker';
import RebookingOptions from '../business/RebookingOptions';
import LuxuryExperiences from '../premium/LuxuryExperiences';
import PersonalizedActivities from '../destination/PersonalizedActivities';

type UserCategory = 'LEISURE' | 'BUSINESS';
type DashboardView = 'overview' | 'itinerary' | 'expenses' | 'documents' | 'community' | 'saved';

interface UnifiedDashboardProps {
  userCategory?: UserCategory;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ userCategory: propUserCategory }) => {
  const { t } = useTranslation('dashboard');
  const { user, isAuthenticated } = useAuth();
  const {
    profile,
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
    createPriceAlert,
    updateProfile
  } = useDashboard();

  // Determine user category from props, user profile, or default to LEISURE
  const userCategory = propUserCategory || user?.userCategory || 'LEISURE';
  
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [showRebooking, setShowRebooking] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);

  // Mock data for business features
  const meetings = [
    {
      id: '1',
      title: 'Client Meeting',
      location: 'Paris Office',
      startTime: '2024-03-20T10:00:00',
      endTime: '2024-03-20T11:30:00',
      participants: ['John Doe', 'Sarah Smith']
    },
    {
      id: '2',
      title: 'Team Workshop',
      location: 'Innovation Hub',
      startTime: '2024-03-20T14:00:00',
      endTime: '2024-03-20T16:00:00',
      participants: ['Team Alpha', 'Team Beta']
    }
  ];

  const travelPolicies = [
    {
      category: 'Flights',
      rules: [
        'Business class allowed for flights over 6 hours',
        'Booking required 14 days in advance',
        'Preferred airlines: Star Alliance members'
      ]
    },
    {
      category: 'Hotels',
      rules: [
        'Maximum rate: $300/night',
        '4-star hotels or below',
        'Room service limit: $50/day'
      ]
    }
  ];

  // Mock data for leisure features
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

  // Dynamic navigation based on user category
  const navigationTabs = useMemo(() => {
    const baseNav = [
      { id: 'overview', label: t('unified.tabs.overview'), icon: Globe }
    ];

    if (userCategory === 'BUSINESS') {
      return [
        ...baseNav,
        { id: 'itinerary', label: t('unified.tabs.businessItinerary'), icon: Calendar },
        { id: 'expenses', label: t('unified.tabs.expenseManagement'), icon: DollarSign },
        { id: 'documents', label: t('unified.tabs.travelDocuments'), icon: FileText }
      ];
    } else {
      return [
        ...baseNav,
        { id: 'community', label: t('unified.tabs.community'), icon: Users },
        { id: 'saved', label: t('unified.tabs.saved'), icon: Heart }
      ];
    }
  }, [userCategory, t]);

  // Dynamic stats based on user category
  const dashboardStats = useMemo(() => {
    if (userCategory === 'BUSINESS') {
      return [
        { title: t('unified.businessStats.nextMeeting'), value: '10:00 AM', icon: Clock, color: 'bg-blue-50 text-blue-600' },
        { title: t('unified.businessStats.monthlyExpenses'), value: '$2,450', icon: DollarSign, color: 'bg-green-50 text-green-600' },
        { title: t('unified.businessStats.policyCompliance'), value: '98%', icon: Shield, color: 'bg-orange-50 text-orange-600' },
        { title: t('unified.businessStats.pendingReports'), value: '2', icon: FileText, color: 'bg-purple-50 text-purple-600' }
      ];
    } else {
      return [
        { title: t('unified.leisureStats.countriesVisited'), value: '12', icon: Globe, color: 'bg-blue-50 text-blue-600' },
        { title: t('unified.leisureStats.citiesExplored'), value: '35', icon: Map, color: 'bg-green-50 text-green-600' },
        { title: t('unified.leisureStats.experiences'), value: '48', icon: Camera, color: 'bg-orange-50 text-orange-600' },
        { title: t('unified.leisureStats.photosShared'), value: '156', icon: Share2, color: 'bg-purple-50 text-purple-600' }
      ];
    }
  }, [userCategory, t]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('unified.loginRequired')}</h2>
          <p className="text-gray-600">{t('unified.loginDescription')}</p>
        </div>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const renderOverviewContent = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection 
        user={user} 
        upcomingTrips={upcomingTrips}
        userCategory={userCategory}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <QuickActions onSearch={quickSearch} userCategory={userCategory} />
          <RecommendationsSection 
            recommendations={recommendations}
            recentSearches={recentSearches}
            onRefresh={refreshRecommendations}
            userCategory={userCategory}
          />
          {userCategory === 'LEISURE' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6">{t('unified.featuredDestinations')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destinations.map((destination) => (
                  <div key={destination.id} className="group cursor-pointer">
                    <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h4 className="text-lg font-semibold">{destination.name}</h4>
                        <div className="flex items-center gap-1 text-sm">
                          <span>★ {destination.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{destination.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {destination.localExperiences.map((experience, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full"
                        >
                          {experience}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <TravelStats stats={stats} userCategory={userCategory} />
          <SavedItineraries bookings={recentBookings} onRefresh={refreshBookings} />
          <PriceAlerts alerts={priceAlerts} onCreate={createPriceAlert} />
        </div>
      </div>
    </div>
  );

  const renderBusinessItinerary = () => (
    <BusinessItinerary
      meetings={meetings}
      flights={[
        {
          id: 'flight1',
          itineraries: [{
            segments: [{
              departure: { iataCode: 'CDG', at: '2024-03-20T08:00:00' },
              arrival: { iataCode: 'LHR', at: '2024-03-20T09:00:00' },
              carrierCode: 'AF',
              number: '1234'
            }]
          }]
        }
      ]}
      hotels={[
        {
          id: 'hotel1',
          name: 'Business Hotel Paris',
          chainCode: 'HIL',
          rating: '4'
        }
      ]}
      experiences={[]}
      onRebookFlight={() => setShowRebooking(true)}
    />
  );

  const renderExpenseManagement = () => (
    <ExpenseTracker />
  );

  const renderTravelDocuments = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
        <div className="flex items-center gap-2 text-orange-600 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-medium">Travel Policy Highlights</h3>
        </div>
        <div className="space-y-4">
          {travelPolicies.map((policy, index) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Travel Insurance', type: 'PDF', date: '2024-02-15' },
          { title: 'Visa Documents', type: 'PDF', date: '2024-02-10' },
          { title: 'Company Policy', type: 'PDF', date: '2024-01-20' },
          { title: 'Emergency Contacts', type: 'PDF', date: '2024-01-15' }
        ].map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium">{doc.title}</div>
                <div className="text-sm text-gray-500">
                  {doc.type} • Updated {doc.date}
                </div>
              </div>
            </div>
            <button className="text-orange-500 hover:text-orange-600">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCommunity = () => (
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
            <button className="text-gray-400 hover:text-gray-600">
              <Share2 className="w-5 h-5" />
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
  );

  const renderSavedContent = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-6">{t('unified.savedExperiences')}</h3>
      <LuxuryExperiences
        experiences={[]}
        onBook={() => {}}
        onConcierge={() => {}}
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
      default:
        return renderOverviewContent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {userCategory === 'BUSINESS' ? t('unified.businessDashboard') : t('unified.travelDashboard')}
            </h1>
            <p className="text-gray-600 mt-1">
              {userCategory === 'BUSINESS'
                ? t('unified.businessSubtitle')
                : t('unified.leisureSubtitle')
              }
            </p>
          </div>
          
          {/* User Category Badge */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              userCategory === 'BUSINESS'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {userCategory === 'BUSINESS' ? <Briefcase className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
              {userCategory === 'BUSINESS' ? t('unified.badges.business') : t('unified.badges.leisure')}
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as DashboardView)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors whitespace-nowrap ${
                activeView === tab.id
                  ? userCategory === 'BUSINESS'
                    ? 'bg-blue-500 text-white'
                    : 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
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
              itineraries: [{
                segments: [{
                  departure: { iataCode: 'CDG', at: '2024-03-20T08:00:00' },
                  arrival: { iataCode: 'LHR', at: '2024-03-20T09:00:00' },
                  carrierCode: 'AF',
                  number: '1234'
                }]
              }]
            }}
            alternativeFlights={[
              {
                id: 'flight2',
                itineraries: [{
                  segments: [{
                    departure: { iataCode: 'CDG', at: '2024-03-20T10:00:00' },
                    arrival: { iataCode: 'LHR', at: '2024-03-20T11:00:00' },
                    carrierCode: 'BA',
                    number: '5678'
                  }]
                }]
              }
            ]}
            onClose={() => setShowRebooking(false)}
            onSelect={() => {
              setShowRebooking(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedDashboard;
