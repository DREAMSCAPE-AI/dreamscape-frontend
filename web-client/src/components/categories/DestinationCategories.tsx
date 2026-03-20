import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CategoryCard from './CategoryCard';
import SectionTitle from '../shared/SectionTitle';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const DestinationCategories = () => {
  const { t } = useTranslation('common');

  const categories = [
    { name: t('home.categories.adventure'), image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80", experienceCount: 42 },
    { name: t('home.categories.cultural'), image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80", experienceCount: 56 },
    { name: t('home.categories.foodWine'), image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80", experienceCount: 38 },
    { name: t('home.categories.wellness'), image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80", experienceCount: 24 },
    { name: t('home.categories.urban'), image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80", experienceCount: 45 },
    { name: t('home.categories.eco'), image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", experienceCount: 31 },
  ];

  // Bento grid classes: varied sizes for visual interest
  // Layout: [large] [medium] [medium] / [medium] [medium] [large]
  const gridClasses = [
    'md:col-span-2 md:row-span-2',  // Adventure — big
    'md:col-span-1 md:row-span-1',  // Cultural
    'md:col-span-1 md:row-span-1',  // Food & Wine
    'md:col-span-1 md:row-span-1',  // Wellness
    'md:col-span-1 md:row-span-1',  // Urban
    'md:col-span-2 md:row-span-1',  // Eco — wide
  ];

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-50/60 blur-3xl pointer-events-none -translate-x-1/3" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionTitle
          title={t('home.exploreByCategory')}
          subtitle={t('home.exploreByCategorySubtitle')}
        />

        <motion.div
          className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[220px] md:auto-rows-[200px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              className={gridClasses[index]}
              variants={fadeUp}
            >
              <CategoryCard {...category} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DestinationCategories;
