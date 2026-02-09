import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { useAuth } from '@/services/auth/AuthService';
import { FavoritesBatchProvider } from '@/contexts/FavoritesBatchContext';

// Pages
import HomePage from '@/pages/index';
import AuthPage from '@/pages/auth';
import HotelsPage from '@/pages/hotels';
import FlightsPage from '@/pages/flights';
import MapPage from '@/pages/map';
import DestinationPage from '@/pages/destination/[id]';
import DestinationsPage from '@/pages/destinations';
import VRViewerPage from '@/pages/vr/[id]';
import ExperiencesPage from '@/pages/experiences';
import ExperiencePage from '@/pages/experiences/[id]';
import ActivitiesPage from '@/pages/activities';
import ActivityPage from '@/pages/activities/[id]';
import AboutPage from '@/pages/about';
import PlannerPage from '@/pages/planner';
import ItineraryDetailPage from '@/pages/planner/[id]';
import DashboardPage from '@/pages/dashboard';
import SettingsPage from '@/pages/settings';
import SupportPage from '@/pages/support';
import ProfileSetup from '@/components/profile/ProfileSetup';
import OnboardingPage from '@/pages/onboarding';
import OnboardingGuard from '@/components/auth/OnboardingGuard';
import RootLayout from '@/layouts/RootLayout';

// New API Component Pages
import AnalyticsPage from '@/pages/analytics';
import FlightStatusPage from '@/pages/flight-status';
import AirportsPage from '@/pages/airports';
import AirlinesPage from '@/pages/airlines';
import TransfersPage from '@/pages/transfers';
import InsightsPage from '@/pages/insights';
import UnifiedDashboardPage from '@/pages/dashboard/unified';
import InterchangeableDashboardPage from '@/pages/dashboard/interchangeable';

// Payment Pages
import CheckoutPage from '@/pages/checkout';
import PaymentConfirmationPage from '@/pages/payment/confirmation';

// User History Page
import HistoryPage from '@/pages/history';

// User Favorites Page
import FavoritesPage from '@/pages/favorites';

// User Bookings Pages
import BookingsPage from '@/pages/bookings';
import BookingDetailPage from '@/pages/bookings/[reference]';

// Legal Pages
import PrivacyPolicyPage from '@/pages/legal/PrivacyPolicy';

// GDPR
import CookieConsent from '@/components/gdpr/CookieConsent';

// Auth checker component that runs on app mount
// Memoized to prevent unnecessary re-renders
const AuthChecker = React.memo(() => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Check if stored token is still valid on app mount
    checkAuth();
  }, [checkAuth]);

  return null;
});

function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthChecker />
      <CookieConsent />
      <FavoritesBatchProvider>
        <ErrorBoundary>
          <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destination/:id" element={<DestinationPage />} />
            <Route path="/vr/:id" element={<VRViewerPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/experiences/:id" element={<ExperiencePage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/planner" element={
              <OnboardingGuard requireOnboarding={false}>
                <PlannerPage />
              </OnboardingGuard>
            } />
            <Route path="/planner/:id" element={
              <OnboardingGuard requireOnboarding={false}>
                <ItineraryDetailPage />
              </OnboardingGuard>
            } />
            <Route path="/dashboard" element={
              <OnboardingGuard>
                <DashboardPage />
              </OnboardingGuard>
            } />
            <Route path="/dashboard/unified" element={
              <OnboardingGuard>
                <UnifiedDashboardPage />
              </OnboardingGuard>
            } />
            <Route path="/dashboard/interchangeable" element={
              <OnboardingGuard>
                <InterchangeableDashboardPage />
              </OnboardingGuard>
            } />
            <Route path="/settings" element={
              <OnboardingGuard requireOnboarding={false}>
                <SettingsPage />
              </OnboardingGuard>
            } />
            <Route path="/history" element={
              <OnboardingGuard requireOnboarding={false}>
                <HistoryPage />
              </OnboardingGuard>
            } />
            <Route path="/favorites" element={
              <OnboardingGuard requireOnboarding={false}>
                <FavoritesPage />
              </OnboardingGuard>
            } />
            <Route path="/bookings" element={
              <OnboardingGuard requireOnboarding={false}>
                <BookingsPage />
              </OnboardingGuard>
            } />
            <Route path="/bookings/:reference" element={
              <OnboardingGuard requireOnboarding={false}>
                <BookingDetailPage />
              </OnboardingGuard>
            } />
            <Route path="/support" element={<SupportPage />} />

            {/* Legal Routes */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            {/* New API Component Routes */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/flight-status" element={<FlightStatusPage />} />
            <Route path="/airports" element={<AirportsPage />} />
            <Route path="/airlines" element={<AirlinesPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            <Route path="/insights" element={<InsightsPage />} />

            {/* Payment Routes */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/confirmation" element={<PaymentConfirmationPage />} />
          </Route>
          </Routes>
        </ErrorBoundary>
      </FavoritesBatchProvider>
    </BrowserRouter>
    </Suspense>
  );
}

export default App;