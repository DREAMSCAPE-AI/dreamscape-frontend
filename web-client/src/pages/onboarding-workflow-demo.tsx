import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  ArrowRight,
  CheckCircle,
  SkipForward,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import useOnboardingStore from '@/store/onboardingStore';
import OnboardingPrompt from '@/components/onboarding/OnboardingPrompt';

const OnboardingWorkflowDemo: React.FC = () => {
  const { getOnboardingStatus, getCompletionPercentage, skipOnboarding, resetOnboarding } = useOnboardingStore();

  const onboardingStatus = getOnboardingStatus();
  const completionPercentage = getCompletionPercentage();

  const steps = [
    {
      id: 'new-user',
      title: '1. Nouvel utilisateur',
      description: 'L\'utilisateur crée son compte',
      status: 'completed'
    },
    {
      id: 'redirect',
      title: '2. Redirection automatique',
      description: 'Redirection vers l\'onboarding au premier accès à une page protégée',
      status: onboardingStatus !== 'not_started' ? 'completed' : 'current'
    },
    {
      id: 'questionnaire',
      title: '3. Questionnaire',
      description: 'L\'utilisateur peut compléter ou passer le questionnaire',
      status: onboardingStatus === 'completed' ? 'completed' :
              onboardingStatus === 'skipped' ? 'skipped' :
              onboardingStatus === 'in_progress' ? 'current' : 'pending'
    },
    {
      id: 'access',
      title: '4. Accès à l\'app',
      description: 'Accès complet avec invitations à compléter le profil si skippé',
      status: onboardingStatus === 'completed' || onboardingStatus === 'skipped' ? 'completed' : 'pending'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'current':
        return <UserCheck className="w-6 h-6 text-blue-600" />;
      case 'skipped':
        return <SkipForward className="w-6 h-6 text-orange-600" />;
      default:
        return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-300 bg-green-50';
      case 'current':
        return 'border-blue-300 bg-blue-50';
      case 'skipped':
        return 'border-orange-300 bg-orange-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Workflow d'onboarding DreamScape
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Démonstration du système d'onboarding obligatoire avec possibilité de skip
          </p>

          {/* Current Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">État actuel de l'onboarding</h2>
            <div className="flex items-center justify-center gap-4">
              <div className={`px-4 py-2 rounded-full border-2 ${getStatusColor(onboardingStatus)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(onboardingStatus)}
                  <span className="font-medium">
                    {onboardingStatus === 'not_started' && 'Non commencé'}
                    {onboardingStatus === 'in_progress' && `En cours (${Math.round(completionPercentage)}%)`}
                    {onboardingStatus === 'completed' && 'Complété'}
                    {onboardingStatus === 'skipped' && 'Passé'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Étapes du workflow</h2>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                  {step.status === 'skipped' && (
                    <p className="text-orange-600 text-xs mt-1 font-medium">
                      Questionnaire passé - L'utilisateur sera invité à le compléter plus tard
                    </p>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-400 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Onboarding Prompt Demo */}
        {(onboardingStatus === 'skipped' || onboardingStatus === 'in_progress') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Invitation à compléter l'onboarding
            </h2>
            <OnboardingPrompt />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions de test</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/onboarding"
              className="flex items-center gap-3 p-4 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Settings className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Aller à l'onboarding</div>
                <div className="text-sm text-blue-700">Commencer ou continuer le questionnaire</div>
              </div>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-3 p-4 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Tester le Dashboard</div>
                <div className="text-sm text-green-700">Page protégée par OnboardingGuard</div>
              </div>
            </Link>

            <button
              onClick={() => skipOnboarding()}
              className="flex items-center gap-3 p-4 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <SkipForward className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">Simuler Skip</div>
                <div className="text-sm text-orange-700">Marquer l'onboarding comme passé</div>
              </div>
            </button>

            <button
              onClick={() => {
                resetOnboarding();
                window.location.reload();
              }}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-6 h-6 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Reset</div>
                <div className="text-sm text-gray-700">Réinitialiser l'onboarding</div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Implementation Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-50 rounded-xl p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails d'implémentation</h2>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <strong>OnboardingGuard :</strong> Composant qui protège les routes et redirige vers l'onboarding si nécessaire
            </div>
            <div>
              <strong>État 'skipped' :</strong> Stocké dans le store Zustand avec persistance localStorage
            </div>
            <div>
              <strong>Re-proposition :</strong> OnboardingPrompt s'affiche sur les pages principales si l'onboarding est skippé
            </div>
            <div>
              <strong>Flexibilité :</strong> Certaines routes peuvent être exemptées avec requireOnboarding={false}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingWorkflowDemo;