import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FavoriteButton } from '@/components/favorites';
import { FavoriteType } from '@/services/user/FavoritesService';

interface DestinationCardProps {
  id: string;
  title: string;
  image: string;
  description: string;
  onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ id, title, image, description, onClick }) => {
  const { t } = useTranslation('destinations');

  return (
    <motion.div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Favorite button */}
      <FavoriteButton
        entityType={FavoriteType.DESTINATION}
        entityId={id}
        entityData={{ title, description, image }}
        size="md"
        className="absolute top-4 right-4 z-10"
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-1">
          {t('card.explore')}
        </p>
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-white/50 leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {/* CTA */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-white text-xs font-semibold group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {t('card.learnMore')}
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DestinationCard;
