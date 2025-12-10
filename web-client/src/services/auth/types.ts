export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    tokens: {
      accessToken: string;
      refreshToken?: string;
    };
    user: User;
  };
  message?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: 'ADMIN' | 'USER';
  isVerified: boolean;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
}
