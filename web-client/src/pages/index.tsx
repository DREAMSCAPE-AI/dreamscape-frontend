import React from 'react';
import HeroSection from '@/components/hero/HeroSection';
import FeaturedExperiences from '@/components/features/FeaturedExperiences';
import PersonalizationShowcase from '@/components/features/PersonalizationShowcase';
import DestinationCategories from '@/components/categories/DestinationCategories';
import SocialProof from '@/components/testimonials/SocialProof';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedExperiences />
      <PersonalizationShowcase />
      <DestinationCategories />
      <SocialProof />
    </main>
  );
}