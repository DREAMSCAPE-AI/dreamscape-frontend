import axios, { AxiosInstance } from 'axios';
import type {
  OnboardingProfile,
  OnboardingProgress,
  StepUpdateData,
  CreateOnboardingProfileData,
  OnboardingServiceResponse
} from '@/types/onboarding';

const API_BASE_URL = import.meta.env.VITE_USER_SERVICE_API_URL;

class OnboardingService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/v1/users/onboarding`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use(
      (config) => {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const { state } = JSON.parse(authStorage);
            if (state?.token) {
              config.headers.Authorization = `Bearer ${state.token}`;
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
        console.error('Onboarding API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get user's onboarding profile
   */
  async getProfile(): Promise<OnboardingServiceResponse<OnboardingProfile>> {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch onboarding profile'
      };
    }
  }

  /**
   * Create new onboarding profile
   */
  async createProfile(data?: CreateOnboardingProfileData): Promise<OnboardingServiceResponse<OnboardingProfile>> {
    try {
      const response = await this.api.post('/', data || {});
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create onboarding profile'
      };
    }
  }

  /**
   * Update a specific onboarding step
   */
  async updateStep(stepData: StepUpdateData): Promise<OnboardingServiceResponse<OnboardingProfile>> {
    try {
      const response = await this.api.put('/step', stepData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update onboarding step'
      };
    }
  }

  /**
   * Get onboarding progress
   */
  async getProgress(): Promise<OnboardingServiceResponse<OnboardingProgress>> {
    try {
      const response = await this.api.get('/progress');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch onboarding progress'
      };
    }
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<OnboardingServiceResponse<{ message: string; user: any }>> {
    try {
      const response = await this.api.post('/complete');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to complete onboarding'
      };
    }
  }

  /**
   * Delete onboarding profile (reset)
   */
  async resetProfile(): Promise<OnboardingServiceResponse<{ message: string }>> {
    try {
      const response = await this.api.delete('/');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset onboarding profile'
      };
    }
  }
}

export const onboardingService = new OnboardingService();
export default onboardingService;
