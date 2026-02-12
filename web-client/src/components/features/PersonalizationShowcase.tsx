import React from 'react';
import { Brain, Zap, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionTitle from '../shared/SectionTitle';

const PersonalizationShowcase = () => {
  const { t } = useTranslation('common');

  const benefits = [
    {
      icon: <Brain className="w-10 h-10 md:w-12 md:h-12 text-orange-400" />,
      title: t('home.aiRecommendations'),
      description: t('home.aiRecommendationsDesc')
    },
    {
      icon: <Zap className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />,
      title: t('home.realTimePersonalization'),
      description: t('home.realTimePersonalizationDesc')
    },
    {
      icon: <Calendar className="w-10 h-10 md:w-12 md:h-12 text-pink-400" />,
      title: t('home.seamlessBooking'),
      description: t('home.seamlessBookingDesc')
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-amber-50 to-sky-50">
      <div className="container mx-auto px-4">
        <SectionTitle
          title={t('home.travelTailored')}
          subtitle={t('home.travelTailoredSubtitle')}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-4 md:p-6 rounded-xl bg-white shadow-md">
              <div className="mb-4 md:mb-6 inline-block p-3 md:p-4 rounded-full bg-gray-50">
                {benefit.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">{benefit.title}</h3>
              <p className="text-sm md:text-base text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 md:mt-12">
          <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 md:px-8 py-2.5 md:py-3 min-h-[44px] text-sm md:text-base rounded-md font-semibold hover:opacity-90 transition-opacity">
            {t('home.howItWorks')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PersonalizationShowcase;