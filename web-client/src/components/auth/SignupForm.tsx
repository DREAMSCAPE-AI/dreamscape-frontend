import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SignupFormProps {
  onSubmit: (name: string, email: string, password: string) => void;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
}


const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, onSwitchToLogin, isLoading }) => {
  const { t } = useTranslation('auth');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!firstName.trim()) {
      newErrors.firstName = t('validation.required');
    }

    if (!lastName.trim()) {
      newErrors.lastName = t('validation.required');
    }

    if (!email) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    if (!password) {
      newErrors.password = t('validation.required');
    } else if (password.length < 8) {
      newErrors.password = t('validation.passwordMin');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const fullName = `${firstName} ${lastName}`.trim();
      onSubmit(fullName, email, password);
    }
  };


  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-8">{t('signup.title')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* First Name Input */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              {t('signup.firstName')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('signup.firstNamePlaceholder')}
              />
              <User className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-xs md:text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name Input */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              {t('signup.lastName')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('signup.lastNamePlaceholder')}
              />
              <User className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-xs md:text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              {t('signup.email')}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('signup.emailPlaceholder')}
              />
              <Mail className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs md:text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              {t('signup.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                  errors.password ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('signup.passwordPlaceholder')}
              />
              <Lock className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 p-1.5 md:p-1 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Eye className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs md:text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              {t('signup.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-2 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('signup.confirmPasswordPlaceholder')}
              />
              <Lock className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs md:text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] py-3 text-sm md:text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              t('signup.submit')
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-xs md:text-sm text-gray-600">
            {t('signup.hasAccount')}{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-orange-500 hover:text-orange-600 font-medium min-h-[44px] md:min-h-0 inline-flex items-center py-2 md:py-0"
            >
              {t('signup.signIn')}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;