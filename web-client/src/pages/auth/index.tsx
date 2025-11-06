import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/services/auth/AuthService';
import { onboardingService } from '@/services/onboarding/onboardingService';
import { AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signup } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);

      // Check onboarding status to determine where to redirect
      try {
        const response = await onboardingService.getProgress();

        // If onboarding is completed (100%), go to dashboard
        if (response.success && response.data && response.data.progressPercentage === 100) {
          navigate('/dashboard');
        } else {
          // Otherwise, go to dashboard (which will show onboarding modal if needed)
          navigate('/dashboard');
        }
      } catch (onboardingError) {
        // If we can't check onboarding status (e.g., JWT not configured on backend),
        // default to dashboard which will handle onboarding display
        console.log('Could not check onboarding status, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signup(name, email, password);

      // After signup, go to dashboard (which will show onboarding modal)
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        setError(validationErrors);
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Authentication Info */}
          <div className="mb-8 p-6 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-2 text-orange-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Authentication System</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="text-gray-700">
                <p><strong>✅ Connected to Real API</strong></p>
                <p>• Registration: POST /api/v1/auth/register</p>
                <p>• Login: POST /api/v1/auth/login</p>
                <p>• JWT Token authentication</p>
                <p>• User categories: LEISURE & BUSINESS</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-600">
                💡 <strong>Ready:</strong> Create a new account or login with your existing credentials!
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-600 font-medium">Authentication Error</p>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            </div>
          )}

          {isLogin ? (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToSignup={() => setIsLogin(false)}
              isLoading={isLoading}
            />
          ) : (
            <SignupForm
              onSubmit={handleSignup}
              onSwitchToLogin={() => setIsLogin(true)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}