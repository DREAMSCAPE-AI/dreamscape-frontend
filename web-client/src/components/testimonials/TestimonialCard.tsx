import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
  id?: string;
  verifiedBooking?: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  location,
  rating,
  text,
  image,
}) => {
  return (
    <motion.div
      className="relative p-6 md:p-8 rounded-2xl glass border border-white/[0.06] h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative quote mark */}
      <div className="absolute -top-3 -left-1 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
        <Quote className="w-4 h-4 text-white" />
      </div>

      {/* Stars */}
      <motion.div
        className="flex gap-1 mb-5 mt-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, scale: 0 },
              visible: { opacity: 1, scale: 1 },
            }}
          >
            <Star
              className={`w-4 h-4 ${i < rating ? 'fill-orange-400 text-orange-400' : 'text-gray-700'}`}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Quote text */}
      <p className="text-gray-300 leading-relaxed text-sm md:text-base flex-1 mb-6">
        &ldquo;{text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
        <div className="relative">
          <div className="absolute -inset-[2px] bg-gradient-to-br from-orange-400 to-pink-500 rounded-full opacity-60" />
          <img
            src={image}
            alt={name}
            className="relative w-10 h-10 rounded-full object-cover"
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">{name}</h4>
          <p className="text-xs text-gray-500">{location}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
