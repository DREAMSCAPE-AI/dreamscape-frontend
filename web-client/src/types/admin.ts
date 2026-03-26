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

// Users CRUD
export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  isVerified: boolean;
  userCategory: 'LEISURE' | 'BUSINESS';
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    searches: number;
    favorites: number;
    notifications: number;
  };
}

export interface AdminUserDetail extends AdminUser {
  phoneNumber: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  onboardingCompletedAt: string | null;
  _count: {
    searches: number;
    favorites: number;
    history: number;
    notifications: number;
  };
}

export interface UsersListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  userCategory?: string;
}
