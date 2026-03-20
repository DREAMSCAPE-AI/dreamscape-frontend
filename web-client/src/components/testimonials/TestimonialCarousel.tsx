import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TestimonialCard from './TestimonialCard';

const testimonialData = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'New York, USA',
    rating: 5,
    textKey: 'home.testimonials.sarah.text',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    verifiedBooking: true,
  },
  {
    id: '2',
    name: 'Marco Rossi',
    location: 'Milan, Italy',
    rating: 5,
    textKey: 'home.testimonials.marco.text',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    verifiedBooking: true,
  },
  {
    id: '3',
    name: 'Emma Chen',
    location: 'Singapore',
    rating: 5,
    textKey: 'home.testimonials.emma.text',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    verifiedBooking: true,
  },
];

const TestimonialCarousel = () => {
  const { t } = useTranslation('common');
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const advance = useCallback((dir: number) => {
    setDirection(dir);
    setActiveIndex((prev) => (prev + dir + testimonialData.length) % testimonialData.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => advance(1), 6000);
    return () => clearInterval(timer);
  }, [advance]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <div className="mt-12 md:mt-16">
      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
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

      {/* Mobile: single-card carousel */}
      <div className="md:hidden relative">
        <div className="overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <TestimonialCard
                id={testimonialData[activeIndex].id}
                name={testimonialData[activeIndex].name}
                location={testimonialData[activeIndex].location}
                rating={testimonialData[activeIndex].rating}
                text={t(testimonialData[activeIndex].textKey)}
                image={testimonialData[activeIndex].image}
                verifiedBooking={testimonialData[activeIndex].verifiedBooking}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => advance(-1)}
              className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full glass border border-white/[0.06] text-white/60 hover:text-white hover:border-white/20 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => advance(1)}
              className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full glass border border-white/[0.06] text-white/60 hover:text-white hover:border-white/20 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonialData.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Go to testimonial ${i + 1}`}
              >
                <motion.div
                  className="rounded-full"
                  animate={{
                    width: i === activeIndex ? 24 : 8,
                    height: 8,
                    backgroundColor: i === activeIndex ? '#f97316' : 'rgba(255,255,255,0.15)',
                  }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
