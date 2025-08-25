import React, { useState, useEffect } from 'react';
import TestimonialCard from './TestimonialCard';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
  verifiedBooking?: boolean;
}

const TestimonialCarousel = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from a reviews/testimonials API
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For now, we'll use curated testimonials but in a real implementation
        // this would come from a reviews API or CMS
        const reviewData: Testimonial[] = [
          {
            id: '1',
            name: "Sarah Johnson",
            location: "New York, USA",
            rating: 5,
            text: "The AI recommendations were spot-on! Found hidden gems I would've never discovered otherwise.",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
            verifiedBooking: true
          },
          {
            id: '2',
            name: "Marco Rossi",
            location: "Milan, Italy",
            rating: 5,
            text: "Seamless booking experience and incredible personalization. Every trip feels unique!",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80",
            verifiedBooking: true
          },
          {
            id: '3',
            name: "Emma Chen",
            location: "Singapore",
            rating: 5,
            text: "The cultural experiences were perfectly matched to my interests. Truly exceptional service.",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80",
            verifiedBooking: true
          }
        ];
        
        setTestimonials(reviewData);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        // Fallback to empty array
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} {...testimonial} />
      ))}
    </div>
  );
};

export default TestimonialCarousel;