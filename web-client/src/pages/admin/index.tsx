import { useState } from 'react';
import KPICardsGrid from '@/components/admin/dashboard/KPICardsGrid';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import BookingsByDestinationChart from '@/components/admin/dashboard/BookingsByDestinationChart';
import BookingStatusPieChart from '@/components/admin/dashboard/BookingStatusPieChart';
import PeriodFilter from '@/components/admin/dashboard/PeriodFilter';
import RecentTransactionsTable from '@/components/admin/dashboard/RecentTransactionsTable';
import LastUpdatedIndicator from '@/components/admin/dashboard/LastUpdatedIndicator';
import {
  useAdminStats,
  useRevenueChart,
  useBookingsByDestination,
  useRecentTransactions,
  useRefreshDashboard,
} from '@/hooks/useAdminDashboard';
import type { PeriodType } from '@/types/admin';

const AdminDashboardPage = () => {
  const [period, setPeriod] = useState<PeriodType>('7d');
  const [customStart, setCustomStart] = useState<string | undefined>();
  const [customEnd, setCustomEnd] = useState<string | undefined>();

  const activePeriod = period === 'custom' ? 'custom' : period;
  const { data: stats, isLoading: statsLoading, error: statsError, dataUpdatedAt } = useAdminStats(activePeriod, customStart, customEnd);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart(activePeriod, customStart, customEnd);
  const { data: destinationsData, isLoading: destinationsLoading } = useBookingsByDestination();
  const { data: transactionsData, isLoading: transactionsLoading } = useRecentTransactions();
  const refresh = useRefreshDashboard();

  const handlePeriodChange = (p: PeriodType) => {
    setPeriod(p);
    if (p !== 'custom') {
      setCustomStart(undefined);
      setCustomEnd(undefined);
    }
  };

  const handleCustomRange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de l'activite</p>
        </div>
        <LastUpdatedIndicator dataUpdatedAt={dataUpdatedAt} onRefresh={refresh} />
      </div>

      {/* Period Filter */}
      <div className="mb-6">
        <PeriodFilter period={period} onPeriodChange={handlePeriodChange} onCustomRange={handleCustomRange} />
      </div>

      {/* KPI Cards */}
      {statsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {statsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-red-700">Erreur lors du chargement des statistiques.</p>
        </div>
      )}

      {stats && (
        <div className="mb-8">
          <KPICardsGrid stats={stats} />
        </div>
      )}

      {/* Charts row 1: Revenue + Booking status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData || []} isLoading={revenueLoading} />
        </div>
        <div>
          <BookingStatusPieChart byStatus={stats?.bookings.byStatus || {}} isLoading={statsLoading} />
        </div>
      </div>

      {/* Charts row 2: Destinations + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingsByDestinationChart data={destinationsData || []} isLoading={destinationsLoading} />
        <RecentTransactionsTable data={transactionsData || []} isLoading={transactionsLoading} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
