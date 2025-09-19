import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, User, Bell, Lock, Globe } from 'lucide-react';

const SettingsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Démonstration Settings - Travel Preferences
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            L'onglet "Travel Preferences" utilise maintenant le nouveau système d'onboarding
          </p>

          <Link
            to="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Settings className="w-5 h-5" />
            Aller aux Settings
          </Link>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Nouvelles fonctionnalités</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Intégration avec le système d'onboarding</h3>
                <p className="text-gray-600">Les préférences de voyage utilisent maintenant les nouvelles routes API d'onboarding</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Affichage du profil complet</h3>
                <p className="text-gray-600">Visualisation de toutes les données du questionnaire d'onboarding</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Progression visuelle</h3>
                <p className="text-gray-600">Barre de progression et indicateurs de completion</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Accès direct au questionnaire</h3>
                <p className="text-gray-600">Boutons pour commencer ou continuer le questionnaire d'onboarding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tabs Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Onglets Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { id: 'profile', label: 'Profile', icon: User, status: 'normal' },
              { id: 'account', label: 'Account', icon: Settings, status: 'normal' },
              { id: 'notifications', label: 'Notifications', icon: Bell, status: 'normal' },
              { id: 'privacy', label: 'Privacy', icon: Lock, status: 'normal' },
              { id: 'travel', label: 'Travel Preferences', icon: Globe, status: 'updated' }
            ].map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    section.status === 'updated'
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    section.status === 'updated' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                  <div className={`font-medium text-sm ${
                    section.status === 'updated' ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {section.label}
                  </div>
                  {section.status === 'updated' && (
                    <div className="text-xs text-green-700 mt-1 font-medium">
                      ✨ Mis à jour
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <div className="flex justify-center gap-4">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Settings className="w-5 h-5" />
              Tester les Settings
            </Link>

            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Globe className="w-5 h-5" />
              Questionnaire d'onboarding
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Allez dans Settings → Travel Preferences pour voir l'intégration
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsDemo;