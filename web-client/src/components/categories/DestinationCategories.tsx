import React from 'react';
import { useTranslation } from 'react-i18next';
import CategoryCard from './CategoryCard';
import SectionTitle from '../shared/SectionTitle';

const DestinationCategories = () => {
  const { t } = useTranslation('common');

  const categories = [
    {
      name: t('home.categories.adventure'),
      image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80",
      experienceCount: 42
    },
    {
      name: t('home.categories.cultural'),
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80",
      experienceCount: 56
    },
    {
      name: t('home.categories.foodWine'),
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80",
      experienceCount: 38
    },
    {
      name: t('home.categories.wellness'),
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80",
      experienceCount: 24
    },
    {
      name: t('home.categories.urban'),
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80",
      experienceCount: 45
    },
    {
      name: t('home.categories.eco'),
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80",
      experienceCount: 31
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50">
      <div className="container mx-auto px-4">
        <SectionTitle
          title={t('home.exploreByCategory')}
          subtitle={t('home.exploreByCategorySubtitle')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {categories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationCategories;