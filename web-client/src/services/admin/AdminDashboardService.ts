import axios, { AxiosInstance } from 'axios';
import type { DashboardStats, RevenueChartData, DestinationBooking, RecentTransaction, PeriodType } from '@/types/admin';

const resolveBaseUrl = (envValue?: string, fallbackPath = '/api') => {
  const trimmed = (envValue || '').trim();
  return trimmed || fallbackPath;
};

const USER_SERVICE_URL = resolveBaseUrl(
  import.meta.env.VITE_USER_SERVICE_API_URL || import.meta.env.VITE_USER_SERVICE_URL
);

const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

const createApi = (baseURL: string): AxiosInstance => {
  const instance = axios.create({ baseURL, timeout: 15000 });
  instance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
};

const api = createApi(USER_SERVICE_URL);

class AdminDashboardService {
  async getStats(period: PeriodType, startDate?: string, endDate?: string): Promise<DashboardStats> {
    const response = await api.get('/v1/admin/dashboard/stats', {
      params: { period, startDate, endDate },
    });
    return response.data.data;
  }

  async getRevenueChart(period: PeriodType, startDate?: string, endDate?: string): Promise<RevenueChartData[]> {
    const response = await api.get('/v1/admin/dashboard/revenue-chart', {
      params: { period, startDate, endDate },
    });
    return response.data.data;
  }

  async getBookingsByDestination(limit: number = 5, period?: PeriodType, startDate?: string, endDate?: string): Promise<DestinationBooking[]> {
    const response = await api.get('/v1/admin/dashboard/bookings-by-destination', {
      params: { limit, period, startDate, endDate },
    });
    return response.data.data;
  }

  async getRecentTransactions(limit: number = 10, period?: PeriodType, startDate?: string, endDate?: string): Promise<RecentTransaction[]> {
    const response = await api.get('/v1/admin/dashboard/recent-transactions', {
      params: { limit, period, startDate, endDate },
    });
    return response.data.data;
  }
}

export const adminDashboardService = new AdminDashboardService();
