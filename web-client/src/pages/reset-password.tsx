import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { authApiService } from '@/services/auth/AuthService';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

function getPasswordStrengthErrors(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Au moins 8 caractères');
  if (!/[a-z]/.test(password)) errors.push('Une lettre minuscule');
  if (!/[A-Z]/.test(password)) errors.push('Une lettre majuscule');
  if (!/\d/.test(password)) errors.push('Un chiffre');
  if (!/[@$!%*?&]/.test(password)) errors.push('Un caractère spécial (@$!%*?&)');
  return errors;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const strengthErrors = getPasswordStrengthErrors(newPassword);
  const isValid =
    strengthErrors.length === 0 &&
    newPassword === confirmPassword &&
    newPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token) return;
    setError('');
    setIsLoading(true);
    try {
      await authApiService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/auth', { replace: true }), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || '';
      if (msg === 'Invalid or expired token') {
        setError('Ce lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande.');
      } else {
        setError(msg || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Mot de passe réinitialisé !</h2>
            <p className="text-gray-500 text-sm">
              Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            <Link to="/auth" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-700 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Nouveau mot de passe"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && strengthErrors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {strengthErrors.map((err) => (
                    <li key={err} className="text-xs text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                      {err}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirmer le mot de passe"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-2">
                <p>{error}</p>
                {error.includes('invalide ou a expiré') && (
                  <Link to="/forgot-password" className="text-orange-500 hover:text-orange-700 underline text-xs">
                    Faire une nouvelle demande
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Réinitialiser mon mot de passe'
              )}
            </button>

            <Link
              to="/forgot-password"
              className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
