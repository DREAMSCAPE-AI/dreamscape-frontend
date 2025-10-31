import axios from 'axios';
import type {
  TravelOnboardingProfile,
  OnboardingStepRequest,
  OnboardingProgressResponse,
  OnboardingResponse
} from '@/types/onboarding';

const API_BASE_URL = import.meta.env.VITE_USER_SERVICE_API_URL || 'http://localhost:3002/api/v1';

// Create axios instance with default config
const onboardingAPI = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
onboardingAPI.interceptors.request.use((config) => {
  // Try to get token from Zustand store first, fallback to localStorage
  let token = null;
  try {
    const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    token = authState.state?.token;
  } catch {
    // Fallback to direct localStorage access
    token = localStorage.getItem('auth_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
onboardingAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Onboarding API Error:', error);

    if (error.response?.status === 401) {
      // Handle unauthorized - clear both possible token locations
      localStorage.removeItem('auth_token');
      try {
        const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        if (authState.state) {
          authState.state.token = null;
          authState.state.isAuthenticated = false;
          authState.state.user = null;
          localStorage.setItem('auth-storage', JSON.stringify(authState));
        }
      } catch {
        // If parsing fails, remove the entire auth storage
        localStorage.removeItem('auth-storage');
      }
    }

    return Promise.reject(error);
  }
);

export const onboardingService = {
  /**
   * Get current onboarding profile state
   */
  async getCurrentProfile(): Promise<TravelOnboardingProfile | null> {
    try {
      const response = await onboardingAPI.get<OnboardingResponse>('/onboarding');
      return response.data.profile || null;
    } catch (error: any) {
      // If profile doesn't exist yet (404), return null instead of throwing
      if (error?.response?.status === 404) {
        console.log('No onboarding profile found');
        return null;
      }
      console.error('Failed to fetch onboarding profile:', error);
      throw new Error('Impossible de récupérer votre profil. Veuillez réessayer.');
    }
  },

  /**
   * Save a single step of the onboarding process
   */
  async saveStep(stepData: OnboardingStepRequest): Promise<OnboardingResponse> {
    try {
      const response = await onboardingAPI.put<OnboardingResponse>('/onboarding/step', stepData);
      return response.data;
    } catch (error) {
      console.error('Failed to save onboarding step:', error);
      throw new Error('Impossible de sauvegarder cette étape. Veuillez réessayer.');
    }
  },

  /**
   * Get onboarding progress information
   */
  async getProgress(): Promise<OnboardingProgressResponse | null> {
    try {
      const response = await onboardingAPI.get<OnboardingProgressResponse>('/onboarding/progress');
      return response.data;
    } catch (error: any) {
      // If profile doesn't exist yet (404), return null
      if (error?.response?.status === 404) {
        console.log('No onboarding progress found');
        return null;
      }
      console.error('Failed to fetch onboarding progress:', error);
      throw new Error('Impossible de récupérer votre progression. Veuillez réessayer.');
    }
  },

  /**
   * Complete the onboarding process
   */
  async completeOnboarding(): Promise<OnboardingResponse> {
    try {
      const response = await onboardingAPI.post<OnboardingResponse>('/onboarding/complete');
      return response.data;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw new Error('Impossible de finaliser votre profil. Veuillez réessayer.');
    }
  },

  /**
   * Delete/reset onboarding profile
   */
  async resetProfile(): Promise<void> {
    try {
      await onboardingAPI.delete('/onboarding');
    } catch (error) {
      console.error('Failed to reset onboarding profile:', error);
      throw new Error('Impossible de réinitialiser votre profil. Veuillez réessayer.');
    }
  },

  /**
   * Create initial onboarding profile
   */
  async initializeProfile(): Promise<OnboardingResponse> {
    try {
      const response = await onboardingAPI.post<OnboardingResponse>('/onboarding', {
        completedSteps: [],
        isComplete: false
      });
      return response.data;
    } catch (error: any) {
      // If profile already exists (409), get the existing one instead
      if (error?.response?.status === 409) {
        console.log('Profile already exists, fetching existing profile');
        const existingProfile = await this.getCurrentProfile();
        const progress = await this.getProgress();
        return {
          profile: existingProfile,
          progress,
          message: 'Profile already exists'
        };
      }
      console.error('Failed to initialize onboarding profile:', error);
      throw error;
    }
  }
};

export default onboardingService;