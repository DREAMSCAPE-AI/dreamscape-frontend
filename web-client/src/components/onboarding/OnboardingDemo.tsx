import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, DollarSign, Plane, Settings, CheckCircle } from 'lucide-react';
import useOnboardingStore from '@/store/onboardingStore';

const OnboardingDemo: React.FC = () => {
  const { progress, getCurrentStep, getCompletionPercentage } = useOnboardingStore();

  const currentStep = getCurrentStep();
  const completionPercentage = getCompletionPercentage();
  const completedSteps = progress?.completedSteps || [];

  const features = [
    {
      icon: <User className="w-6 h-6" />,
      title: "Profil personnalisé",
      description: "Créez votre profil de voyage unique en 13 étapes simples"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Destinations préférées",
      description: "Partagez vos destinations visitées et votre bucket list"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Budget intelligent",
      description: "Définissez votre budget avec flexibilité et suggestions"
    },
    {
      icon: <Plane className="w-6 h-6" />,
      title: "Types de voyage",
      description: "Sélectionnez parmi 16 types de voyages différents"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Préférences détaillées",
      description: "Hébergement, transport, activités et plus encore"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Sauvegarde automatique",
      description: "Vos réponses sont sauvegardées à chaque étape"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Questionnaire d'onboarding DreamScape
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Personnalisez votre expérience de voyage en quelques minutes
          </p>

          {/* Progress indicator */}
          {progress && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Progression actuelle
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(completionPercentage)}% complété
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              <div className="text-sm text-gray-600">
                <strong>{completedSteps.length}</strong> étapes complétées •{' '}
                Étape actuelle: <strong>{currentStep.title}</strong>
              </div>
            </div>
          )}

          <Link
            to="/onboarding"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {completionPercentage > 0 ? 'Continuer le questionnaire' : 'Commencer le questionnaire'}
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-600">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fonctionnalités techniques</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• React 18 + TypeScript</li>
                <li>• Zustand pour la gestion d'état</li>
                <li>• Framer Motion pour les animations</li>
                <li>• Tailwind CSS pour le design</li>
                <li>• Vite pour le build</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 13 étapes de questionnaire</li>
                <li>• Sauvegarde automatique par étape</li>
                <li>• Navigation libre entre étapes</li>
                <li>• Validation intelligente</li>
                <li>• Design responsive mobile-first</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">API Integration</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm text-gray-800">
                <div>GET /api/v1/users/onboarding - Récupérer profil</div>
                <div>PUT /api/v1/users/onboarding/step - Sauvegarder étape</div>
                <div>POST /api/v1/users/onboarding/complete - Finaliser</div>
              </code>
            </div>
          </div>
        </motion.div>

        {/* Demo Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Prêt à découvrir votre profil de voyage personnalisé ?
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Démarrer l'onboarding
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingDemo;