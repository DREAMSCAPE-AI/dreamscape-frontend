import React from 'react';
import { useTranslation } from 'react-i18next';
import SectionTitle from '../shared/SectionTitle';
import TestimonialCarousel from './TestimonialCarousel';
import Statistics from './Statistics';

const SocialProof = () => {
  const { t } = useTranslation('common');

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <SectionTitle
          title={t('home.whatTravelersSay')}
          subtitle={t('home.whatTravelersSaySubtitle')}
        />
        <TestimonialCarousel />
        <Statistics />
      </div>
    </section>
  );
};

export default SocialProof;