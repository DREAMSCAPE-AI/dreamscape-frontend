import axios, { AxiosInstance } from 'axios';
import type { AdminBooking, AdminBookingDetail, BookingsListResponse } from '@/types/admin';

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

interface ListBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class AdminBookingService {
  async listBookings(params: ListBookingsParams = {}): Promise<BookingsListResponse> {
    const response = await api.get('/v1/admin/bookings', { params });
    return response.data.data;
  }

  async getBooking(id: string): Promise<AdminBookingDetail> {
    const response = await api.get(`/v1/admin/bookings/${id}`);
    return response.data.data;
  }

  async updateBookingStatus(id: string, status: string): Promise<AdminBooking> {
    const response = await api.put(`/v1/admin/bookings/${id}/status`, { status });
    return response.data.data;
  }

  async bulkUpdateBookingStatus(ids: string[], status: string): Promise<{ updated: number }> {
    const response = await api.put('/v1/admin/bookings/bulk/status', { ids, status });
    return response.data.data;
  }
}

export const adminBookingService = new AdminBookingService();
