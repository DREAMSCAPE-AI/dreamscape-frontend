import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { RegisterData, LoginCredentials } from './types';
import { useItineraryStore } from '@/store/itineraryStore';
import i18n from '@/i18n';
import { languageNameToCode } from '@/i18n/languageMapping';

const resolveBaseUrl = (envValue?: string, fallbackPath = '/api') => {
  const trimmed = (envValue || '').trim();
  if (trimmed) return trimmed;
  return fallbackPath;
};

const AUTH_API_BASE_URL = resolveBaseUrl(import.meta.env.VITE_AUTH_SERVICE_URL);

// Auth API Service Class
class AuthApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: AUTH_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Auth API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('Auth API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async register(userData: RegisterData): Promise<any> {
    const response = await this.api.post('/v1/auth/register', userData);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<any> {
    const response = await this.api.post('/v1/auth/login', credentials);
    return response.data;
  }

  async getUserProfile(token: string): Promise<any> {
    const response = await this.api.get('/v1/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateProfile(token: string, profileData: any): Promise<any> {
    const response = await this.api.put('/v1/auth/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async verifyToken(token: string): Promise<any> {
    const response = await this.api.post('/v1/auth/verify-token', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getUserSettings(token: string): Promise<any> {
    try {
      // Fetch from user service
      const userServiceUrl = resolveBaseUrl(import.meta.env.VITE_USER_SERVICE_URL);
      const response = await axios.get(`${userServiceUrl}/v1/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.warn('Could not fetch user settings:', error);
      return null;
    }
  }
}

// Create singleton instance
const authApiService = new AuthApiService();

// User interface for Zustand store
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  username?: string;
  isVerified?: boolean;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

// Zustand Store
const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const response = await authApiService.login({ email, password });

          if (response.success && response.data) {
            const { tokens, user } = response.data;
            const token = tokens?.accessToken;

            const userData = {
              id: user.id,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
              email: user.email,
              role: user.role === 'ADMIN' ? 'admin' as const : 'user' as const,
              username: user.username,
              isVerified: user.isVerified,
              onboardingCompleted: user.onboardingCompleted,
              onboardingCompletedAt: user.onboardingCompletedAt
            };

            set({
              user: userData,
              token,
              isAuthenticated: true
            });

            // Fetch user settings and sync language preference
            try {
              const userSettings = await authApiService.getUserSettings(token);
              if (userSettings?.preferences?.language) {
                const languageName = userSettings.preferences.language;
                const languageCode = languageNameToCode[languageName];
                if (languageCode) {
                  await i18n.changeLanguage(languageCode);
                  console.log(`Language synced: ${languageName} (${languageCode})`);
                }
              }
            } catch (langError) {
              console.warn('Could not sync language preference:', langError);
              // Non-critical error, don't fail login
            }
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          throw new Error(error instanceof Error ? error.message : 'Login failed');
        }
      },
      signup: async (name: string, email: string, password: string) => {
        try {
          const [firstName, ...lastNameParts] = name.split(' ');
          const lastName = lastNameParts.join(' ');

          const userData: RegisterData = {
            email,
            password,
            firstName: firstName || '',
            lastName: lastName || ''
          };

          const response = await authApiService.register(userData);

          if (response.success && response.data) {
            const { tokens, user } = response.data;
            const token = tokens?.accessToken;

            const transformedUser = {
              id: user.id,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
              email: user.email,
              role: user.role === 'ADMIN' ? 'admin' as const : 'user' as const,
              username: user.username,
              isVerified: user.isVerified,
              onboardingCompleted: user.onboardingCompleted,
              onboardingCompletedAt: user.onboardingCompletedAt
            };

            set({
              user: transformedUser,
              token,
              isAuthenticated: true
            });

            // For new users, language preference is not set yet
            // They will use the default language from i18next-browser-languagedetector
            // (either from localStorage or browser navigator language)
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error: any) {
          console.error('Signup error:', error);
          if (error?.response?.data) {
            throw error;
          }
          throw new Error(error instanceof Error ? error.message : 'Registration failed');
        }
      },
      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await authApiService.verifyToken(token);
          if (!response.success) {
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Clear user-specific data from other stores
        useItineraryStore.getState().reset();
      },
      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

export { useAuth, authApiService };
