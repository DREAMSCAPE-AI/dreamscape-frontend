import axios, { AxiosInstance } from 'axios';
import type { UsersListResponse, AdminUserDetail, UpdateUserData } from '@/types/admin';

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

interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class AdminUserService {
  async listUsers(params: ListUsersParams = {}): Promise<UsersListResponse> {
    const response = await api.get('/v1/admin/users', { params });
    return response.data.data;
  }

  async getUser(id: string): Promise<AdminUserDetail> {
    const response = await api.get(`/v1/admin/users/${id}`);
    return response.data.data;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<AdminUserDetail> {
    const response = await api.put(`/v1/admin/users/${id}`, data);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/v1/admin/users/${id}`);
  }
}

export const adminUserService = new AdminUserService();
