export interface DashboardStats {
  users: { total: number; active: number; inactive: number; newInPeriod: number; evolution: number };
  bookings: { total: number; byStatus: Record<string, number>; evolution: number };
  revenue: { total: number; currency: string; evolution: number };
  conversionRate: { rate: number; evolution: number };
  avgBookingValue: { amount: number; currency: string };
}

export interface RevenueChartData {
  date: string;
  revenue: number;
}

export interface DestinationBooking {
  destination: string;
  count: number;
}

export interface RecentTransaction {
  id: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  bookingReference: string;
  createdAt: string;
}

export type PeriodType = '24h' | '7d' | '30d' | 'custom';
