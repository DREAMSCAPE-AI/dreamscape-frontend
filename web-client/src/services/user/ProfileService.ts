import axios, { AxiosInstance } from 'axios';

const resolveBaseUrl = (envValue?: string, fallbackPath = '/api') => {
  const trimmed = (envValue || '').trim();
  if (trimmed) return trimmed;
  return fallbackPath;
};

const PROFILE_API_BASE_URL = resolveBaseUrl(import.meta.env.VITE_USER_SERVICE_URL);

export interface ChannelPreference {
  inApp: boolean;
  email: boolean;
}

export interface NotificationPreferences {
  booking_confirmed: ChannelPreference;
  booking_cancelled: ChannelPreference;
  payment_succeeded: ChannelPreference;
  payment_failed: ChannelPreference;
  refund_processed: ChannelPreference;
  promo_offer: ChannelPreference;
  platform_update: ChannelPreference;
}

export interface UserProfileData {
  profile: {
    name: string;
    email: string;
    photo: string | null;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
  };
  notifications: {
    dealAlerts: boolean;
    tripReminders: boolean;
    priceAlerts: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisibility: string;
    dataSharing: boolean;
    marketing: boolean;
  };
  travel: {
    preferredDestinations: string[];
    accommodationType: string[];
    activities: string[];
    dietary: string[];
  };
}

class ProfileService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: PROFILE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // Get token from Zustand auth storage (same as AuthService)
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const authData = JSON.parse(authStorage);
            const token = authData?.state?.token;
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Failed to parse auth storage:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Profile API Error:', error.response?.data || error.message);

        // Handle unauthorized errors
        if (error.response?.status === 401) {
          localStorage.removeItem('auth-storage');
          window.location.href = '/auth';
        }

        return Promise.reject(error);
      }
    );
  }

  // Get user profile and settings
  async getProfile(): Promise<UserProfileData> {
    const response = await this.api.get('/v1/users/profile');
    return response.data;
  }

  // Update user profile and settings
  async updateProfile(profileData: UserProfileData): Promise<UserProfileData> {
    const response = await this.api.put('/v1/users/profile', profileData);
    return response.data;
  }

  // Upload profile photo
  async uploadPhoto(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.api.post('/v1/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    // Utiliser le service auth pour changer le mot de passe
    const authResponse = await axios.post(
      `${resolveBaseUrl(import.meta.env.VITE_AUTH_SERVICE_URL, '/api')}/v1/auth/change-password`,
      {
        currentPassword,
        newPassword
      }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });
    return authResponse.data;
  }

  // Get notification preferences (DR-447)
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await this.api.get('/v1/users/notification-preferences');
    return response.data.data;
  }

  // Update notification preferences (DR-447)
  async updateNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
    const response = await this.api.put('/v1/users/notification-preferences', prefs);
    return response.data.data;
  }

  // Helper pour récupérer le token d'auth
  private getAuthToken(): string | null {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        return authData?.state?.token || null;
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
        return null;
      }
    }
    return null;
  }
}

export default new ProfileService();
