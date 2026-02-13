import React from 'react';
import { useTranslation } from 'react-i18next';

interface CategoryCardProps {
  image: string;
  name: string;
  experienceCount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ image, name, experienceCount }) => {
  const { t } = useTranslation('common');
  return (
    <div className="group relative overflow-hidden rounded-xl cursor-pointer">
      <div className="aspect-[3/4]">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-2xl font-bold mb-2 text-white">{name}</h3>
        <p className="text-sm text-gray-300">{experienceCount} {t('home.experiences')}</p>
      </div>
    </div>
  );
};

export default CategoryCard;