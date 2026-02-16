import { useAuth } from '@/services/auth/AuthService';
import { useDashboard } from '../../hooks/useDashboard';
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

const UserDashboard = () => {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Please log in to view your dashboard</h2>
          <p className="text-gray-600">Access your personalized travel dashboard by logging in.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <WelcomeSection 
          user={user}
          upcomingTrips={upcomingTrips}
          onRefresh={refreshBookings}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <QuickActions onQuickSearch={quickSearch} />
            
            <RecommendationsSection 
              recentSearches={recentSearches}
              recommendations={recommendations}
              onRefresh={refreshRecommendations}
            />
            
            <SavedItineraries 
              bookings={recentBookings}
              onRefresh={refreshBookings}
            />
            
            <TripHistory 
              bookings={recentBookings}
              onRefresh={refreshBookings}
            />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <TravelStats stats={stats} />
            
            <TravelPreferences 
              profile={profile}
              onUpdateProfile={updateProfile}
            />
            
            <PriceAlerts 
              alerts={priceAlerts}
              onCreateAlert={createPriceAlert}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;