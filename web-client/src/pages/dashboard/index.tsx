import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import UserDashboard from '@/components/dashboard/UserDashboard';
import BusinessDashboard from '@/components/business/BusinessDashboard';
import LeisureDashboard from '@/components/leisure/LeisureDashboard';
import BleisureDashboard from '@/components/bleisure/BleisureDashboard';
import { useAuth } from '@/services/auth/AuthService';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Show business dashboard for business users
  if (user?.type === 'business') {
    return (
      <main>
        <BusinessDashboard />
      </main>
    );
  }

  // Show leisure dashboard for leisure users
  if (user?.type === 'leisure') {
    return (
      <main>
        <LeisureDashboard />
      </main>
    );
  }

  // Show bleisure dashboard for bleisure users
  if (user?.type === 'bleisure') {
    return (
      <main>
        <BleisureDashboard />
      </main>
    );
  }

  return (
    <main>
      <UserDashboard />
    </main>
  );
}
