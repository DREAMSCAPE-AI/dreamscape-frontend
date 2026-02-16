import React from 'react';
import { useTranslation } from 'react-i18next';
import TestimonialCard from './TestimonialCard';

const testimonialData = [
  {
    id: '1',
    name: "Sarah Johnson",
    location: "New York, USA",
    rating: 5,
    textKey: 'home.testimonials.sarah.text',
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    verifiedBooking: true
  },
  {
    id: '2',
    name: "Marco Rossi",
    location: "Milan, Italy",
    rating: 5,
    textKey: 'home.testimonials.marco.text',
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80",
    verifiedBooking: true
  },
  {
    id: '3',
    name: "Emma Chen",
    location: "Singapore",
    rating: 5,
    textKey: 'home.testimonials.emma.text',
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80",
    verifiedBooking: true
  }
];

const TestimonialCarousel = () => {
  const { t } = useTranslation('common');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {testimonialData.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          id={testimonial.id}
          name={testimonial.name}
          location={testimonial.location}
          rating={testimonial.rating}
          text={t(testimonial.textKey)}
          image={testimonial.image}
          verifiedBooking={testimonial.verifiedBooking}
        />
      ))}
    </div>
  );
};

export default TestimonialCarousel;
