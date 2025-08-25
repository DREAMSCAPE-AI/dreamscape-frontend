import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

// Pages
import HomePage from '@/pages/index';
import AuthPage from '@/pages/auth';
import HotelsPage from '@/pages/hotels';
import FlightsPage from '@/pages/flights';
import MapPage from '@/pages/map';
import DestinationPage from '@/pages/destination/[id]';
import DestinationsPage from '@/pages/destinations';
import ExperiencesPage from '@/pages/experiences';
import ExperiencePage from '@/pages/experiences/[id]';
import ActivitiesPage from '@/pages/activities';
import ActivityPage from '@/pages/activities/[id]';
import AboutPage from '@/pages/about';
import PlannerPage from '@/pages/planner';
import DashboardPage from '@/pages/dashboard';
import SettingsPage from '@/pages/settings';
import SupportPage from '@/pages/support';
import ProfileSetup from '@/components/profile/ProfileSetup';
import RootLayout from '@/layouts/RootLayout';

// New API Component Pages
import AnalyticsPage from '@/pages/analytics';
import FlightStatusPage from '@/pages/flight-status';
import AirportsPage from '@/pages/airports';
import AirlinesPage from '@/pages/airlines';
import TransfersPage from '@/pages/transfers';
import InsightsPage from '@/pages/insights';
import DashboardDemo from '@/components/demo/DashboardDemo';
import UnifiedDashboardPage from '@/pages/dashboard/unified';
import InterchangeableDashboardPage from '@/pages/dashboard/interchangeable';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destination/:id" element={<DestinationPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/experiences/:id" element={<ExperiencePage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/unified" element={<UnifiedDashboardPage />} />
            <Route path="/dashboard/interchangeable" element={<InterchangeableDashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<SupportPage />} />
            
            {/* New API Component Routes */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/flight-status" element={<FlightStatusPage />} />
            <Route path="/airports" element={<AirportsPage />} />
            <Route path="/airlines" element={<AirlinesPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/dashboard/demo" element={<DashboardDemo />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;