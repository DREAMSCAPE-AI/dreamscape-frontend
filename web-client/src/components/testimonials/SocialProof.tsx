import { useTranslation } from 'react-i18next';
import SectionTitle from '../shared/SectionTitle';
import TestimonialCarousel from './TestimonialCarousel';
import Statistics from './Statistics';

const SocialProof = () => {
  const { t } = useTranslation('common');

  return (
    <section className="relative py-24 md:py-32 bg-surface-950 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      {/* Full-width decorative image strip at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          title={t('home.whatTravelersSay')}
          subtitle={t('home.whatTravelersSaySubtitle')}
          light
        />
        <TestimonialCarousel />
        <Statistics />
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
    </section>
  );
};

export default SocialProof;
