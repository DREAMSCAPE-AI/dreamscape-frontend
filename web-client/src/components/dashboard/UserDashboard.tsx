import { motion } from 'framer-motion';
import { useAuth } from '@/services/auth/AuthService';
import { useDashboard } from '../../hooks/useDashboard';
import WelcomeSection from './WelcomeSection';
import RecommendationsSection from './RecommendationsSection';
import SavedItineraries from './SavedItineraries';
import TravelPreferences from './TravelPreferences';
import TripHistory from './TripHistory';
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
    refreshBookings,
    refreshRecommendations,
    createPriceAlert,
    updateProfile
  } = useDashboard();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 mb-4">Please log in to view your dashboard</h2>
          <p className="text-gray-500">Access your personalized travel dashboard by logging in.</p>
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

  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="container mx-auto px-4 py-8"
      >
        <WelcomeSection
          user={user}
          upcomingTrips={upcomingTrips}
          onRefresh={refreshBookings}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
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
          <div className="lg:col-span-1 space-y-6">
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
      </motion.div>
    </div>
  );
};

export default UserDashboard;
