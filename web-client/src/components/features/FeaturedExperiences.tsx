import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowUpRight, ArrowRight, Clock } from 'lucide-react';
import SectionTitle from '../shared/SectionTitle';
import imageService from '@/services/utility/imageService';

interface FeaturedExperience {
  id: string;
  image: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  priceRange: string;
  rating: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const FeaturedExperiences = () => {
  const { t } = useTranslation('common');
  const [experiences, setExperiences] = useState<FeaturedExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setExperiences(await getDefaultExperiences());
      } catch {
        setExperiences(await getDefaultExperiences());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getDefaultExperiences = async (): Promise<FeaturedExperience[]> => {
    const data = [
      { title: "Eiffel Tower Experience", location: "Paris, France", type: "Cultural", duration: "3h", priceRange: "89-120", rating: 4.8 },
      { title: "Desert Safari Adventure", location: "Dubai, UAE", type: "Adventure", duration: "6h", priceRange: "95-130", rating: 4.7 },
      { title: "Gondola Ride", location: "Venice, Italy", type: "Romantic", duration: "45min", priceRange: "80-100", rating: 4.6 },
      { title: "Alpine Adventure", location: "Swiss Alps", type: "Nature", duration: "Full day", priceRange: "150-200", rating: 4.9 },
    ];
    return Promise.all(
      data.map(async (a, i) => ({
        id: `featured-${i + 1}`,
        image: await imageService.getActivityImage(a.title, a.type, a.location),
        ...a,
      }))
    );
  };

  const hero = experiences[0];
  const rest = experiences.slice(1);

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-surface-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={t('home.featuredExperiences')} subtitle={t('home.featuredExperiencesSubtitle')} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-14">
            <div className="rounded-2xl shimmer-skeleton h-[400px] lg:h-full" />
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl shimmer-skeleton h-[120px]" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!hero) return null;

  return (
    <section className="py-20 md:py-28 bg-surface-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-100/30 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionTitle title={t('home.featuredExperiences')} subtitle={t('home.featuredExperiencesSubtitle')} />

        {/* Editorial layout: 1 hero card + 3 side cards */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {/* ─── Hero card (large) ─── */}
          <motion.div
            className="group relative rounded-2xl overflow-hidden cursor-pointer min-h-[400px] lg:min-h-0"
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.35 }}
          >
            <motion.img
              src={hero.image}
              alt={hero.title}
              className="absolute inset-0 w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 group-hover:from-black/90 transition-all duration-500" />

            {/* Badges */}
            <span className="absolute top-4 left-4 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white glass rounded-full">
              {hero.type}
            </span>
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-black/30 backdrop-blur-md rounded-full">
              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
              <span className="text-xs font-semibold text-white">{hero.rating}</span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-1.5 text-white/60 text-xs mb-2">
                <MapPin className="w-3 h-3" />
                <span>{hero.location}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{hero.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{hero.duration}</span>
                  <span className="text-white font-semibold">${hero.priceRange}</span>
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 backdrop-blur-md transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Side cards (3 horizontal) ─── */}
          <div className="flex flex-col gap-5">
            {rest.map((exp) => (
              <motion.div
                key={exp.id}
                className="group flex gap-4 p-3 rounded-2xl bg-white shadow-glass cursor-pointer"
                variants={fadeUp}
                whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.3 }}
              >
                {/* Thumbnail */}
                <div className="relative w-28 md:w-36 flex-shrink-0 rounded-xl overflow-hidden">
                  <motion.img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover min-h-[100px]"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-black/30 backdrop-blur-md rounded-full">
                    {exp.type}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{exp.location}</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors">
                      {exp.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                        {exp.rating}
                      </span>
                      <span>{exp.duration}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">${exp.priceRange}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className="inline-flex items-center gap-2 px-7 py-3.5 min-h-[44px] text-sm font-semibold rounded-xl border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('home.viewAllExperiences')}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedExperiences;
