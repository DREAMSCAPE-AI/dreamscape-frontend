import axios from 'axios';
import type {
  TravelOnboardingProfile,
  OnboardingStepRequest,
  OnboardingProgressResponse,
  OnboardingResponse
} from '@/types/onboarding';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const onboardingAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/users`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
onboardingAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
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
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
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
    } catch (error) {
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
  async getProgress(): Promise<OnboardingProgressResponse> {
    try {
      const response = await onboardingAPI.get<OnboardingProgressResponse>('/onboarding/progress');
      return response.data;
    } catch (error) {
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
    } catch (error) {
      console.error('Failed to initialize onboarding profile:', error);
      throw new Error('Impossible d\'initialiser votre profil. Veuillez réessayer.');
    }
  }
};

export default onboardingService;