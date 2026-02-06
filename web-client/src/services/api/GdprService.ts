import axios, { AxiosInstance } from 'axios';

const USER_API_BASE_URL = import.meta.env.VITE_USER_SERVICE_API_URL;

export interface PrivacyPolicy {
  id: string;
  version: string;
  title: string;
  content: string;
  effectiveAt: string;
  createdAt: string;
}

export interface UserConsent {
  id: string;
  userId: string;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  preferences: boolean;
  lastUpdatedAt: string;
  ipAddress?: string;
}

export interface ConsentHistory {
  id: string;
  consentId: string;
  userId: string;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  preferences: boolean;
  changedAt: string;
  changeReason?: string;
}

export interface UpdateConsentRequest {
  analytics?: boolean;
  marketing?: boolean;
  preferences?: boolean;
}

export interface GdprRequest {
  id: string;
  userId: string;
  requestType: 'DATA_EXPORT' | 'DATA_DELETION' | 'DATA_RECTIFICATION' | 'ACCESS_REQUEST';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  reason?: string;
  notes?: string;
}

class GdprService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${USER_API_BASE_URL}/users/gdpr`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.api.interceptors.request.use((config) => {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          const token = authData?.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('[GdprService] Failed to parse auth storage:', error);
        }
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[GdprService] API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('auth-storage');
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  async getCurrentPolicy(): Promise<{ success: boolean; data: PrivacyPolicy }> {
    const response = await this.api.get('/privacy-policy');
    return response.data;
  }

  async getAllPolicyVersions(): Promise<{ success: boolean; data: PrivacyPolicy[] }> {
    const response = await this.api.get('/privacy-policy/versions');
    return response.data;
  }

  async acceptPolicy(policyId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post('/privacy-policy/accept', { policyId });
    return response.data;
  }

  async getConsent(): Promise<{ success: boolean; data: UserConsent }> {
    const response = await this.api.get('/consent');
    return response.data;
  }

  async updateConsent(data: UpdateConsentRequest): Promise<{ success: boolean; data: UserConsent; message: string }> {
    const response = await this.api.put('/consent', data);
    return response.data;
  }

  async getConsentHistory(): Promise<{ success: boolean; data: ConsentHistory[] }> {
    const response = await this.api.get('/consent/history');
    return response.data;
  }

  async requestDataExport(): Promise<{ success: boolean; data: GdprRequest; message: string }> {
    const response = await this.api.post('/data-export');
    return response.data;
  }

  async requestDataDeletion(reason?: string): Promise<{ success: boolean; data: GdprRequest; message: string }> {
    const response = await this.api.post('/data-deletion', { reason });
    return response.data;
  }

  async getRequests(): Promise<{ success: boolean; data: GdprRequest[] }> {
    const response = await this.api.get('/requests');
    return response.data;
  }

  async getRequestById(id: string): Promise<{ success: boolean; data: GdprRequest }> {
    const response = await this.api.get(`/requests/${id}`);
    return response.data;
  }

  async downloadExport(id: string): Promise<Blob> {
    const response = await this.api.get(`/data-export/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new GdprService();
