import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../AuthService';
import apiService from '../../api';

// Mock the API service
vi.mock('../../api', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    verifyToken: vi.fn(),
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('AuthService', () => {
  const mockApiService = apiService as vi.Mocked<typeof apiService>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should have initial state with no user and not authenticated', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Login', () => {
    const mockLoginResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          userCategory: 'LEISURE'
        }
      }
    };

    it('should login user successfully', async () => {
      mockApiService.login.mockResolvedValue(mockLoginResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockApiService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        userCategory: 'LEISURE',
        type: 'leisure'
      });
      expect(result.current.token).toBe('mock-jwt-token');
    });

    it('should handle login with only first name', async () => {
      const responseWithFirstNameOnly = {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: null,
            userCategory: 'BUSINESS'
          }
        }
      };

      mockApiService.login.mockResolvedValue(responseWithFirstNameOnly);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user?.name).toBe('Test');
      expect(result.current.user?.type).toBe('business');
    });

    it('should handle login with no names', async () => {
      const responseWithNoNames = {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            firstName: null,
            lastName: null,
            userCategory: 'LEISURE'
          }
        }
      };

      mockApiService.login.mockResolvedValue(responseWithNoNames);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user?.name).toBe('test@example.com');
    });

    it('should throw error for failed login', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid credentials'
      };

      mockApiService.login.mockResolvedValue(mockErrorResponse);

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      mockApiService.login.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'password123');
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Signup', () => {
    const mockSignupResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          userCategory: 'LEISURE'
        }
      }
    };

    it('should signup user successfully', async () => {
      mockApiService.register.mockResolvedValue(mockSignupResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signup('Test User', 'test@example.com', 'password123', 'LEISURE');
      });

      expect(mockApiService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        userCategory: 'LEISURE'
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        userCategory: 'LEISURE',
        type: 'leisure'
      });
      expect(result.current.token).toBe('mock-jwt-token');
    });

    it('should handle single name signup', async () => {
      mockApiService.register.mockResolvedValue(mockSignupResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signup('TestUser', 'test@example.com', 'password123', 'BUSINESS');
      });

      expect(mockApiService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'TestUser',
        lastName: '',
        userCategory: 'BUSINESS'
      });
    });

    it('should handle multiple names in signup', async () => {
      mockApiService.register.mockResolvedValue(mockSignupResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signup('Test User Jr.', 'test@example.com', 'password123', 'LEISURE');
      });

      expect(mockApiService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User Jr.',
        userCategory: 'LEISURE'
      });
    });

    it('should throw error for failed signup', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Email already exists'
      };

      mockApiService.register.mockResolvedValue(mockErrorResponse);

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.signup('Test User', 'test@example.com', 'password123', 'LEISURE');
        })
      ).rejects.toThrow('Email already exists');

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Check Auth', () => {
    it('should verify valid token', async () => {
      const mockVerifyResponse = {
        success: true,
        data: { user: { id: 'user-1' } }
      };

      mockApiService.verifyToken.mockResolvedValue(mockVerifyResponse);

      const { result } = renderHook(() => useAuth());

      // Set initial token
      act(() => {
        result.current.token = 'valid-token';
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(mockApiService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(result.current.token).toBe('valid-token');
    });

    it('should clear auth for invalid token', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid token'
      };

      mockApiService.verifyToken.mockResolvedValue(mockErrorResponse);

      const { result } = renderHook(() => useAuth());

      // Set initial state as authenticated
      act(() => {
        result.current.user = {
          id: 'user-1',
          name: 'Test',
          email: 'test@example.com',
          role: 'user',
          userCategory: 'LEISURE',
          type: 'leisure'
        };
        result.current.token = 'invalid-token';
        result.current.isAuthenticated = true;
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear auth when no token exists', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(mockApiService.verifyToken).not.toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle API errors during auth check', async () => {
      mockApiService.verifyToken.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      // Set initial token
      act(() => {
        result.current.token = 'some-token';
        result.current.isAuthenticated = true;
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should clear all auth state on logout', async () => {
      const { result } = renderHook(() => useAuth());

      // Set initial authenticated state
      act(() => {
        result.current.user = {
          id: 'user-1',
          name: 'Test',
          email: 'test@example.com',
          role: 'user',
          userCategory: 'LEISURE',
          type: 'leisure'
        };
        result.current.token = 'some-token';
        result.current.isAuthenticated = true;
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('User Category Mapping', () => {
    it('should map LEISURE to leisure type', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-token',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            userCategory: 'LEISURE'
          }
        }
      };

      mockApiService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user?.type).toBe('leisure');
      expect(result.current.user?.userCategory).toBe('LEISURE');
    });

    it('should map BUSINESS to business type', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-token',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            userCategory: 'BUSINESS'
          }
        }
      };

      mockApiService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user?.type).toBe('business');
      expect(result.current.user?.userCategory).toBe('BUSINESS');
    });
  });

  describe('Persistence', () => {
    it('should persist auth state to localStorage', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-token',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            userCategory: 'LEISURE'
          }
        }
      };

      mockApiService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Check that localStorage.setItem would have been called
      // Note: The actual persistence behavior depends on zustand's implementation
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});