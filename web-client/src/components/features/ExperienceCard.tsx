import React from 'react';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ExperienceCardProps {
  id?: string;
  image: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  priceRange: string;
  rating: number;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  id,
  image,
  title,
  location,
  type,
  duration,
  priceRange,
  rating,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) navigate(`/experiences/${id}`);
  };

  return (
    <motion.article
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white cursor-pointer h-full"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6 }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Type badge — top-left */}
        <span className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white glass rounded-full">
          {type}
        </span>

        {/* Rating — top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full">
          <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
          <span className="text-xs font-semibold text-white">{rating.toFixed(1)}</span>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
          <h3 className="text-lg font-semibold text-white leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between p-4 mt-auto">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{duration}</p>
          <p className="text-lg font-bold text-gray-900">
            ${priceRange}
          </p>
        </div>
        <motion.div
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
        >
          <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
        </motion.div>
      </div>
    </motion.article>
  );
};

export default ExperienceCard;
