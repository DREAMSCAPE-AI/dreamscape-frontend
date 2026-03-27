import KPICard from './KPICard';
import type { DashboardStats } from '@/types/admin';

interface KPICardsGridProps {
  stats: DashboardStats;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
};

const KPICardsGrid = ({ stats }: KPICardsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Utilisateurs"
        value={stats.users.total.toLocaleString('fr-FR')}
        evolution={stats.users.evolution}
        color="blue"
        subtitle={`${stats.users.active} actifs`}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      />

      <KPICard
        title="Reservations"
        value={stats.bookings.total.toLocaleString('fr-FR')}
        evolution={stats.bookings.evolution}
        color="green"
        subtitle="total"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />

      <KPICard
        title="Revenus"
        value={formatCurrency(stats.revenue.total, stats.revenue.currency)}
        evolution={stats.revenue.evolution}
        color="orange"
        subtitle="vs periode precedente"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <KPICard
        title="Taux de conversion"
        value={`${stats.conversionRate.rate.toFixed(1)}%`}
        evolution={stats.conversionRate.evolution}
        color="purple"
        subtitle={`Moy. ${formatCurrency(stats.avgBookingValue.amount, stats.avgBookingValue.currency)}`}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
    </div>
  );
};

export default KPICardsGrid;
