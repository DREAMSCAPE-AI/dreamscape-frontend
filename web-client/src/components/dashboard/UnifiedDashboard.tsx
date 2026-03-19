import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '@/services/auth/AuthService';
import { useDashboard } from '../../hooks/useDashboard';
import {
  Briefcase,
  Compass,
  Calendar,
  DollarSign,
  Clock,
  Heart,
  Map,
  Globe,
  Plane,
  Settings
} from 'lucide-react';

// Import existing components
import WelcomeSection from './WelcomeSection';
import RecommendationsSection from './RecommendationsSection';
import SavedItineraries from './SavedItineraries';
import TravelStats from './TravelStats';
import PriceAlerts from './PriceAlerts';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

// Import specialized components
import BusinessItinerary from '../business/BusinessItinerary';
import ExpenseTracker from '../business/ExpenseTracker';
import RebookingOptions from '../business/RebookingOptions';
import LuxuryExperiences from '../premium/LuxuryExperiences';

type UserCategory = 'LEISURE' | 'BUSINESS';
type DashboardView = 'overview' | 'itinerary' | 'expenses' | 'saved';

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
    trendingDestinations,
    stats,
    priceAlerts,
    loading,
    error,
    refreshBookings,
    refreshRecommendations,
    createPriceAlert,
  } = useDashboard();

  // Determine user category from props, user profile, or default to LEISURE
  const userCategory = propUserCategory || (user as any)?.userCategory || 'LEISURE';

  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [showRebooking, setShowRebooking] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Transform real bookings into BusinessItinerary format
  const flightBookings = recentBookings.filter(b => b.type === 'flight');
  const hotelBookings = recentBookings.filter(b => b.type === 'hotel');

  const flights = flightBookings.map(b => ({
    id: b.id,
    itineraries: [{
      segments: [{
        departure: { iataCode: b.details?.departure?.iataCode || b.details?.origin || '???', at: b.departureDate },
        arrival: { iataCode: b.details?.arrival?.iataCode || b.details?.destination || b.destination || '???', at: b.returnDate || b.departureDate },
        carrierCode: b.details?.carrierCode || b.details?.airline || '',
        number: b.details?.flightNumber || b.details?.number || ''
      }]
    }]
  }));

  const hotels = hotelBookings.map(b => ({
    id: b.id,
    name: b.details?.hotelName || b.details?.name || b.destination || 'Hotel',
    chainCode: b.details?.chainCode || '',
    rating: b.details?.rating || '0'
  }));

  // Use trending destinations from AI recommendations
  const featuredDestinations = (trendingDestinations.length > 0 ? trendingDestinations : recommendations).slice(0, 4);

  // Dynamic navigation based on user category
  const navigationTabs = useMemo(() => {
    const baseNav = [
      { id: 'overview', label: t('unified.tabs.overview'), icon: Globe }
    ];

    if (userCategory === 'BUSINESS') {
      return [
        ...baseNav,
        { id: 'itinerary', label: t('unified.tabs.businessItinerary'), icon: Calendar },
        { id: 'expenses', label: t('unified.tabs.expenseManagement'), icon: DollarSign }
      ];
    } else {
      return [
        ...baseNav,
        { id: 'saved', label: t('unified.tabs.saved'), icon: Heart }
      ];
    }
  }, [userCategory, t]);

  // Dynamic stats from real data
  const dashboardStats = useMemo(() => {
    if (userCategory === 'BUSINESS') {
      return [
        { title: t('unified.businessStats.nextMeeting'), value: upcomingTrips.length > 0 ? new Date(upcomingTrips[0].departureDate).toLocaleDateString() : '-', icon: Clock, color: 'bg-gradient-to-br from-blue-500/15 to-indigo-500/15 text-blue-600 border border-blue-500/10' },
        { title: t('unified.businessStats.monthlyExpenses'), value: `$${(stats?.totalSpent ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-gradient-to-br from-green-500/15 to-emerald-500/15 text-green-600 border border-green-500/10' },
        { title: 'Total Bookings', value: String(stats?.totalBookings ?? 0), icon: Plane, color: 'bg-gradient-to-br from-orange-500/15 to-pink-500/15 text-orange-600 border border-orange-500/10' },
        { title: 'Upcoming Trips', value: String(stats?.upcomingTrips ?? upcomingTrips.length), icon: Calendar, color: 'bg-gradient-to-br from-purple-500/15 to-violet-500/15 text-purple-600 border border-purple-500/10' }
      ];
    } else {
      return [
        { title: t('unified.leisureStats.countriesVisited'), value: String(stats?.countriesVisited ?? 0), icon: Globe, color: 'bg-gradient-to-br from-blue-500/15 to-indigo-500/15 text-blue-600 border border-blue-500/10' },
        { title: 'Total Trips', value: String(stats?.totalBookings ?? 0), icon: Map, color: 'bg-gradient-to-br from-green-500/15 to-emerald-500/15 text-green-600 border border-green-500/10' },
        { title: 'Avg. Duration', value: `${stats?.averageTripDuration ?? 0}d`, icon: Clock, color: 'bg-gradient-to-br from-orange-500/15 to-pink-500/15 text-orange-600 border border-orange-500/10' },
        { title: 'Upcoming', value: String(stats?.upcomingTrips ?? upcomingTrips.length), icon: Calendar, color: 'bg-gradient-to-br from-purple-500/15 to-violet-500/15 text-purple-600 border border-purple-500/10' }
      ];
    }
  }, [userCategory, t, stats, upcomingTrips]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 mb-4">{t('unified.loginRequired')}</h2>
          <p className="text-gray-500">{t('unified.loginDescription')}</p>
        </div>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 flex items-center justify-center">
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
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-6"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-2xl font-bold tracking-tight text-surface-900 mt-1">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
<<<<<<< HEAD
          <QuickActions onSearch={quickSearch} userCategory={userCategory} />
=======
>>>>>>> e7c6461 (feat: redesign Homepage UI with improved components and styling)
          <RecommendationsSection
            recommendations={recommendations}
            recentSearches={recentSearches}
            onRefresh={refreshRecommendations}
          />
          {userCategory === 'LEISURE' && featuredDestinations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-6">
              <h3 className="text-xl font-bold tracking-tight text-surface-900 mb-6">{t('unified.featuredDestinations')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredDestinations.map((destination) => (
                  <div key={destination.id} className="group cursor-pointer">
                    <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                      <img
                        src={destination.image}
                        alt={destination.title || destination.location}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h4 className="text-lg font-bold tracking-tight">{destination.title || destination.location}</h4>
                        {destination.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <span>&#9733; {destination.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{destination.description}</p>
                    {destination.tags && destination.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {destination.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/15 text-orange-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <TravelStats stats={stats} />
          <SavedItineraries bookings={recentBookings} onRefresh={refreshBookings} />
          <PriceAlerts alerts={priceAlerts} onCreateAlert={createPriceAlert} />
        </div>
      </div>
    </div>
  );

  const renderBusinessItinerary = () => (
    flights.length > 0 || hotels.length > 0 ? (
      <BusinessItinerary
        meetings={[]}
        flights={flights as any}
        hotels={hotels as any}
        experiences={[]}
        onRebookFlight={() => {
          setSelectedFlight(flights.length > 0 ? flights[0] : null);
          setShowRebooking(true);
        }}
      />
    ) : (
      <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-12 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-bold tracking-tight text-surface-900 mb-2">No Business Trips</h3>
        <p className="text-gray-500">Your upcoming business itinerary will appear here once you book flights or hotels.</p>
      </div>
    )
  );

  const renderExpenseManagement = () => (
    <ExpenseTracker onSave={() => {}} onCancel={() => {}} />
  );

  const renderSavedContent = () => (
    <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-6">
      <h3 className="text-xl font-bold tracking-tight text-surface-900 mb-6">{t('unified.savedExperiences')}</h3>
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
      case 'saved':
        return renderSavedContent();
      default:
        return renderOverviewContent();
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-surface-900">
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
                ? 'bg-gradient-to-r from-blue-500/15 to-indigo-500/15 border border-blue-500/15 text-blue-700'
                : 'bg-gradient-to-r from-orange-500/15 to-pink-500/15 border border-orange-500/15 text-orange-700'
            }`}>
              {userCategory === 'BUSINESS' ? <Briefcase className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
              {userCategory === 'BUSINESS' ? t('unified.badges.business') : t('unified.badges.leisure')}
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white border border-transparent hover:border-surface-200/50 transition-all">
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
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeView === tab.id
                  ? userCategory === 'BUSINESS'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-surface-200/50 rounded-xl'
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
        {showRebooking && selectedFlight && (
          <RebookingOptions
            originalFlight={selectedFlight}
            alternativeFlights={[]}
            onClose={() => setShowRebooking(false)}
            onSelect={() => {
              setShowRebooking(false);
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default UnifiedDashboard;
