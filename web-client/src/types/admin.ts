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
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  lastLoginAt: string | null;
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
  revenueGenerated: number;
  bookingsCount: number;
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

export interface SuspendUserData {
  reason?: string;
}

export interface UserActivityItem {
  id: string;
  type: 'history' | 'booking' | 'payment';
  label: string;
  detail: string;
  status?: string;
  amount?: number;
  currency?: string;
  createdAt: string;
}

export interface UserActivityResponse {
  items: UserActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Bookings
export type BookingStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type BookingType = 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'PACKAGE' | 'TRANSFER';

export interface AdminBookingUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminBooking {
  id: string;
  userId: string;
  type: BookingType;
  reference: string;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  paymentIntentId: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  destination: string | null;
  user: AdminBookingUser;
}

export interface AdminBookingDetail extends AdminBooking {
  data: Record<string, any>;
  payment: AdminPayment | null;
}

export interface CancelBookingData {
  refund: boolean;
  reason: string;
}

export interface ModifyBookingData {
  totalAmount?: number;
  notes?: string;
  data?: Record<string, any>;
}

export interface BookingsListResponse {
  bookings: AdminBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Payments
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export interface AdminPayment {
  id: string;
  paymentIntentId: string;
  bookingId: string;
  bookingReference: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  failureReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  user: AdminBookingUser | null;
}

export interface AdminPaymentDetail extends AdminPayment {
  metadata: Record<string, any> | null;
  booking: {
    id: string;
    reference: string;
    type: BookingType;
    status: BookingStatus;
    totalAmount: number;
    currency: string;
    createdAt: string;
  } | null;
}

export interface PaymentsListResponse {
  payments: AdminPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
