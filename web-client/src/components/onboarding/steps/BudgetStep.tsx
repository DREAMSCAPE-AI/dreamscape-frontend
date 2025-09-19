import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import OnboardingStepWrapper from '../OnboardingStepWrapper';
import { RangeSlider, RadioGroup } from '../FormComponents';
import { BudgetFlexibility } from '@/types/onboarding';
import useOnboardingStore from '@/store/onboardingStore';

const BudgetStep: React.FC = () => {
  const { profile, updateProfile } = useOnboardingStore();

  const budgetRange = profile.globalBudgetRange || { min: 1000, max: 5000, currency: 'EUR' };
  const budgetFlexibility = profile.budgetFlexibility;

  const handleBudgetRangeChange = (range: [number, number]) => {
    updateProfile({
      globalBudgetRange: {
        min: range[0],
        max: range[1],
        currency: budgetRange.currency
      }
    });
  };

  const handleCurrencyChange = (currency: string) => {
    updateProfile({
      globalBudgetRange: {
        ...budgetRange,
        currency
      }
    });
  };

  const handleFlexibilityChange = (flexibility: string) => {
    updateProfile({
      budgetFlexibility: flexibility as BudgetFlexibility
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: budgetRange.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const budgetCategories = [
    {
      range: [500, 2000],
      label: 'Budget serré',
      icon: '💰',
      description: 'Voyages économiques, auberges, transports locaux',
      color: 'green'
    },
    {
      range: [2000, 5000],
      label: 'Budget modéré',
      icon: '🏨',
      description: 'Hôtels 3-4 étoiles, vols directs, restaurants locaux',
      color: 'blue'
    },
    {
      range: [5000, 10000],
      label: 'Budget confortable',
      icon: '✈️',
      description: 'Hôtels de qualité, business class occasionnelle',
      color: 'purple'
    },
    {
      range: [10000, 50000],
      label: 'Budget premium',
      icon: '🥂',
      description: 'Hôtels de luxe, première classe, expériences exclusives',
      color: 'gold'
    }
  ];

  const getCurrentCategory = () => {
    const avgBudget = (budgetRange.min + budgetRange.max) / 2;
    return budgetCategories.find(cat =>
      avgBudget >= cat.range[0] && avgBudget <= cat.range[1]
    ) || budgetCategories[1];
  };

  const flexibilityOptions = [
    {
      value: BudgetFlexibility.STRICT,
      label: 'Budget strict',
      icon: '🔒',
      description: 'Je ne peux pas dépasser mon budget'
    },
    {
      value: BudgetFlexibility.SOMEWHAT_FLEXIBLE,
      label: 'Légèrement flexible',
      icon: '📊',
      description: 'Je peux dépasser de 10-20% pour une belle opportunité'
    },
    {
      value: BudgetFlexibility.FLEXIBLE,
      label: 'Flexible',
      icon: '📈',
      description: 'Je peux dépasser de 30-50% pour un voyage exceptionnel'
    },
    {
      value: BudgetFlexibility.VERY_FLEXIBLE,
      label: 'Très flexible',
      icon: '💎',
      description: 'Le budget peut varier selon la qualité de l\'expérience'
    }
  ];

  const currencies = [
    { value: 'EUR', label: '€ Euro', flag: '🇪🇺' },
    { value: 'USD', label: '$ Dollar US', flag: '🇺🇸' },
    { value: 'GBP', label: '£ Livre Sterling', flag: '🇬🇧' },
    { value: 'CAD', label: '$ Dollar Canadien', flag: '🇨🇦' },
    { value: 'CHF', label: 'CHF Franc Suisse', flag: '🇨🇭' }
  ];

  return (
    <OnboardingStepWrapper
      title="Budget de voyage"
      description="Définissez votre budget habituel pour mieux personnaliser vos recommandations"
      icon="💰"
    >
      <div className="space-y-8">
        {/* Currency Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Devise préférée
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {currencies.map((currency) => (
              <motion.button
                key={currency.value}
                onClick={() => handleCurrencyChange(currency.value)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  budgetRange.currency === currency.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-xl mb-1">{currency.flag}</div>
                <div className={`text-sm font-medium ${
                  budgetRange.currency === currency.value ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {currency.label}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Budget par voyage (tout compris)
          </h3>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <RangeSlider
              min={500}
              max={50000}
              step={250}
              value={[budgetRange.min, budgetRange.max]}
              onChange={handleBudgetRangeChange}
              formatLabel={formatCurrency}
            />
          </div>

          {/* Budget Category Display */}
          <motion.div
            key={getCurrentCategory().label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border-2 ${
              getCurrentCategory().color === 'green' ? 'border-green-200 bg-green-50' :
              getCurrentCategory().color === 'blue' ? 'border-blue-200 bg-blue-50' :
              getCurrentCategory().color === 'purple' ? 'border-purple-200 bg-purple-50' :
              'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getCurrentCategory().icon}</span>
              <div>
                <h4 className={`font-semibold ${
                  getCurrentCategory().color === 'green' ? 'text-green-900' :
                  getCurrentCategory().color === 'blue' ? 'text-blue-900' :
                  getCurrentCategory().color === 'purple' ? 'text-purple-900' :
                  'text-yellow-900'
                }`}>
                  {getCurrentCategory().label}
                </h4>
                <p className={`text-sm ${
                  getCurrentCategory().color === 'green' ? 'text-green-700' :
                  getCurrentCategory().color === 'blue' ? 'text-blue-700' :
                  getCurrentCategory().color === 'purple' ? 'text-purple-700' :
                  'text-yellow-700'
                }`}>
                  {getCurrentCategory().description}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Budget Flexibility */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Flexibilité budgétaire
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            À quel point êtes-vous flexible avec votre budget si une opportunité exceptionnelle se présente ?
          </p>

          <RadioGroup
            options={flexibilityOptions}
            value={budgetFlexibility}
            onChange={handleFlexibilityChange}
            name="budgetFlexibility"
          />
        </div>

        {/* Budget Breakdown Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition budgétaire suggérée
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { category: 'Transport', percentage: 40, icon: '✈️' },
              { category: 'Hébergement', percentage: 30, icon: '🏨' },
              { category: 'Repas', percentage: 20, icon: '🍽️' },
              { category: 'Activités', percentage: 10, icon: '🎯' }
            ].map((item) => {
              const amount = ((budgetRange.min + budgetRange.max) / 2) * (item.percentage / 100);
              return (
                <div key={item.category} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-medium text-gray-900">{item.category}</div>
                  <div className="text-sm text-gray-600">{item.percentage}%</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-4"
        >
          <h4 className="font-medium text-blue-900 mb-2">Résumé de votre budget</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              Budget habituel : <strong>{formatCurrency(budgetRange.min)} - {formatCurrency(budgetRange.max)}</strong>
            </p>
            <p>
              Flexibilité : <strong>{flexibilityOptions.find(f => f.value === budgetFlexibility)?.label || 'Non définie'}</strong>
            </p>
            <p>
              Catégorie : <strong>{getCurrentCategory().label}</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </OnboardingStepWrapper>
  );
};

export default BudgetStep;