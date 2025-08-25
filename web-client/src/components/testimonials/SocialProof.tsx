import React from 'react';
import SectionTitle from '../shared/SectionTitle';
import TestimonialCarousel from './TestimonialCarousel';
import Statistics from './Statistics';

const SocialProof = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title="What Our Travelers Say"
          subtitle="Join thousands of satisfied adventurers"
        />
        <TestimonialCarousel />
        <Statistics />
      </div>
    </section>
  );
};

export default SocialProof;