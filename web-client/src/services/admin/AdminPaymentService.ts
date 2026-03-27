import axios, { AxiosInstance } from 'axios';
import type { AdminPaymentDetail, PaymentsListResponse } from '@/types/admin';

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

interface ListPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class AdminPaymentService {
  async listPayments(params: ListPaymentsParams = {}): Promise<PaymentsListResponse> {
    const response = await api.get('/v1/admin/payments', { params });
    return response.data.data;
  }

  async getPayment(id: string): Promise<AdminPaymentDetail> {
    const response = await api.get(`/v1/admin/payments/${id}`);
    return response.data.data;
  }

  async updatePaymentStatus(id: string, status: string): Promise<AdminPaymentDetail> {
    const response = await api.put(`/v1/admin/payments/${id}/status`, { status });
    return response.data.data;
  }
}

export const adminPaymentService = new AdminPaymentService();
