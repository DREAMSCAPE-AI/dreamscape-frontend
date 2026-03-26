import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  image: string;
  name: string;
  experienceCount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ image, name, experienceCount }) => {
  const { t } = useTranslation('common');

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl cursor-pointer h-full min-h-[280px] lg:min-h-[320px]"
      whileHover="hover"
    >
      {/* Image with parallax zoom */}
      <motion.img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
        variants={{
          hover: { scale: 1.08 },
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Gradient overlay — darkens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 group-hover:from-black/90 group-hover:via-black/40 transition-all duration-500" />

      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500/0 via-orange-500/60 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-orange-400/80 mb-1.5">
            {experienceCount} {t('home.experiences')}
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
            {name}
          </h3>
        </div>

        {/* Hover reveal CTA */}
        <motion.div
          className="flex items-center gap-2 mt-3 overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          variants={{
            hover: { opacity: 1, height: 'auto' },
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm font-medium text-orange-400">Explore</span>
          <ArrowUpRight className="w-4 h-4 text-orange-400" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
