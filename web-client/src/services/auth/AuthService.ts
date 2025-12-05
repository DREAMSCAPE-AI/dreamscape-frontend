import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '../api';

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


const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const response = await apiService.login({ email, password });

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
          
          const userData = {
            email,
            password,
            firstName: firstName || '',
            lastName: lastName || ''
          };
          
          const response = await apiService.register(userData);
          
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
          const response = await apiService.verifyToken(token);
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

export { useAuth };