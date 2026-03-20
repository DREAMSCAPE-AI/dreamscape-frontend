import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Zap,
  Globe,
  Star,
  ChevronRight,
  Plane,
  Hotel,
  Compass,
  Palmtree,
  Mountain,
  UtensilsCrossed,
} from 'lucide-react';
import HeroSection from '@/components/hero/HeroSection';

/* ═══════════════════════════════════════════════════════════════
   DESTINATION MARQUEE — Infinite horizontal scroll ribbon
   ═══════════════════════════════════════════════════════════════ */
const destinations = [
  { name: 'Tokyo', emoji: '🇯🇵', img: 'photo-1540959733332-eab4deabeeaf' },
  { name: 'Santorini', emoji: '🇬🇷', img: 'photo-1613395877344-13d4a8e0d49e' },
  { name: 'Marrakech', emoji: '🇲🇦', img: 'photo-1597212618440-806262de4f6b' },
  { name: 'Bali', emoji: '🇮🇩', img: 'photo-1537996194471-e657df975ab4' },
  { name: 'New York', emoji: '🇺🇸', img: 'photo-1496442226666-8d4d0e62e6e9' },
  { name: 'Paris', emoji: '🇫🇷', img: 'photo-1502602898657-3e91760cbb34' },
  { name: 'Cape Town', emoji: '🇿🇦', img: 'photo-1580060839134-75a5edca2e99' },
  { name: 'Kyoto', emoji: '🇯🇵', img: 'photo-1493976040374-85c8e12f0c0e' },
];

const DestinationMarquee = () => (
  <section className="py-6 bg-surface-950 border-y border-white/[0.04] overflow-hidden">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...destinations, ...destinations].map((d, i) => (
        <div
          key={`${d.name}-${i}`}
          className="inline-flex items-center gap-3 mx-6 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-orange-500/40 transition-all">
            <img
              src={`https://images.unsplash.com/${d.img}?auto=format&fit=crop&q=60&w=80&h=80`}
              alt={d.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-medium text-white/40 group-hover:text-white/80 transition-colors tracking-wide">
            {d.emoji} {d.name}
          </span>
        </div>
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   IMMERSIVE SHOWCASE — Large staggered destination cards
   ═══════════════════════════════════════════════════════════════ */
const showcaseDestinations = [
  {
    name: 'Santorini',
    country: 'Greece',
    tag: 'Trending',
    img: 'photo-1613395877344-13d4a8e0d49e',
    price: '€890',
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    tag: 'Cultural',
    img: 'photo-1493976040374-85c8e12f0c0e',
    price: '€1,240',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    tag: 'Wellness',
    img: 'photo-1537996194471-e657df975ab4',
    price: '€720',
  },
  {
    name: 'Patagonia',
    country: 'Argentina',
    tag: 'Adventure',
    img: 'photo-1464822759023-fed622ff2c3b',
    price: '€1,580',
  },
];

const ImmersiveShowcase = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 md:py-32 bg-surface-50" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3 block">
              {t('home.featuredExperiences')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-surface-900 tracking-tight">
              {t('home.exploreByCategory')}
            </h2>
          </div>
          <motion.a
            href="/destinations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors group"
            whileHover={{ x: 4 }}
          >
            {t('home.viewAllExperiences')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>

        {/* Cards grid — asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {showcaseDestinations.map((dest, i) => {
            const isLarge = i === 0 || i === 3;
            return (
              <motion.div
                key={dest.name}
                onClick={() => navigate(`/destination/${dest.name.toLowerCase()}`)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                  isLarge ? 'lg:col-span-7' : 'lg:col-span-5'
                } ${i === 0 ? 'min-h-[380px] md:min-h-[480px]' : 'min-h-[320px] md:min-h-[420px]'}`}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Image */}
                <img
                  src={`https://images.unsplash.com/${dest.img}?auto=format&fit=crop&q=80&w=1200`}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Tag */}
                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10">
                    {dest.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-1">
                    {dest.country}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {dest.name}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-white/60">
                      from <span className="text-white font-semibold">{dest.price}</span>
                    </span>
                    <motion.div
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AI FEATURES — Dark section with floating feature cards
   ═══════════════════════════════════════════════════════════════ */
const aiFeatures = [
  { icon: Brain, titleKey: 'home.aiRecommendations', descKey: 'home.aiRecommendationsDesc' },
  { icon: Zap, titleKey: 'home.realTimePersonalization', descKey: 'home.realTimePersonalizationDesc' },
  { icon: Globe, titleKey: 'home.seamlessBooking', descKey: 'home.seamlessBookingDesc' },
];

const AIFeaturesSection = () => {
  const { t } = useTranslation('common');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="relative py-24 md:py-36 bg-surface-950 overflow-hidden">
      {/* Background image — right side bleed */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full hidden lg:block"
        style={{ y: imageY }}
      >
        <img
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1200"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-950/80 to-transparent" />
        <div className="absolute inset-0 bg-surface-950/20" />
      </motion.div>

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="noise-overlay absolute inset-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          {/* Label */}
          <motion.span
            className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-400 mb-4 block"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t('home.poweredByAI')}
          </motion.span>

          {/* Title */}
          <motion.h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('home.travelTailored')}
          </motion.h2>

          <motion.p
            className="mt-5 text-base md:text-lg text-white/40 leading-relaxed max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t('home.travelTailoredSubtitle')}
          </motion.p>

          {/* Feature cards */}
          <div className="mt-12 space-y-4">
            {aiFeatures.map((f, i) => (
              <motion.div
                key={f.titleKey}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-orange-500/20 transition-all duration-300 cursor-default"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.3 + i * 0.12,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-orange-500/15 to-pink-500/15 flex items-center justify-center border border-orange-500/10 group-hover:from-orange-500/25 group-hover:to-pink-500/25 transition-colors">
                    <f.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-orange-300 transition-colors">
                      {t(f.titleKey)}
                    </h3>
                    <p className="mt-1.5 text-sm text-white/35 leading-relaxed">
                      {t(f.descKey)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS — Horizontal numbered steps
   ═══════════════════════════════════════════════════════════════ */
const HowItWorks = () => {
  const { t } = useTranslation('common');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const steps = [
    { num: '01', title: t('home.stepTellUs'), desc: t('home.stepTellUsDesc'), icon: Compass },
    { num: '02', title: t('home.stepGetMatched'), desc: t('home.stepGetMatchedDesc'), icon: Brain },
    { num: '03', title: t('home.stepBookAndGo'), desc: t('home.stepBookAndGoDesc'), icon: Plane },
  ];

  return (
    <section ref={ref} className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3 block">
            {t('home.howItWorks')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-surface-900 tracking-tight">
            {t('home.stepTellUs').split(' ')[0]}. {t('home.stepGetMatched').split(' ')[0]}.{' '}
            {t('home.stepBookAndGo').split(' ')[0]}.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-orange-200 via-pink-200 to-orange-200" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="text-center relative"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Number circle */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white text-lg font-bold shadow-lg shadow-orange-500/20 mb-6">
                {step.num}
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 hover:opacity-10 transition-opacity" />
              </div>

              <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-orange-50 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-orange-500" />
              </div>

              <h3 className="text-lg font-bold text-surface-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CATEGORY PILLS — Horizontal scroll with icons
   ═══════════════════════════════════════════════════════════════ */
const categories = [
  { key: 'adventure', icon: Mountain, img: 'photo-1464822759023-fed622ff2c3b' },
  { key: 'cultural', icon: Compass, img: 'photo-1493976040374-85c8e12f0c0e' },
  { key: 'foodWine', icon: UtensilsCrossed, img: 'photo-1414235077428-338989a2e8c0' },
  { key: 'wellness', icon: Palmtree, img: 'photo-1540555700478-4be289fbec6d' },
  { key: 'urban', icon: Hotel, img: 'photo-1496442226666-8d4d0e62e6e9' },
  { key: 'eco', icon: Globe, img: 'photo-1441974231531-c6227db76b6e' },
];

const CategorySection = () => {
  const { t } = useTranslation('common');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-surface-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-surface-900 tracking-tight">
            {t('home.exploreByCategory')}
          </h2>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {t('home.exploreByCategorySubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.key}
              href={`/destinations?category=${cat.key}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -4 }}
            >
              <img
                src={`https://images.unsplash.com/${cat.img}?auto=format&fit=crop&q=70&w=400&h=600`}
                alt={t(`home.categories.${cat.key}`)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 mb-2.5 group-hover:bg-orange-500/80 group-hover:border-orange-500 transition-all duration-300">
                  <cat.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-semibold text-white">
                  {t(`home.categories.${cat.key}`)}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SOCIAL PROOF — Testimonials + Stats bar
   ═══════════════════════════════════════════════════════════════ */
const testimonials = [
  { key: 'sarah', name: 'Sarah L.', loc: 'Tokyo, Japan', rating: 5 },
  { key: 'marco', name: 'Marco P.', loc: 'Santorini, Greece', rating: 5 },
  { key: 'emma', name: 'Emma K.', loc: 'Bali, Indonesia', rating: 5 },
];

const stats = [
  { key: 'travelersServed', value: '50K+' },
  { key: 'destinations', value: '100+' },
  { key: 'averageRating', value: '4.9/5' },
  { key: 'satisfactionRate', value: '98%' },
];

const SocialProofSection = () => {
  const { t } = useTranslation('common');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-surface-950 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="noise-overlay absolute inset-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-400 mb-3 block">
            {t('home.whatTravelersSay')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {t('home.whatTravelersSaySubtitle')}
          </h2>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {testimonials.map((tm, i) => (
            <motion.div
              key={tm.key}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/15 transition-colors duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: tm.rating }).map((_, s) => (
                  <Star
                    key={s}
                    className="w-4 h-4 fill-orange-400 text-orange-400"
                  />
                ))}
              </div>

              <p className="text-sm md:text-base text-white/50 leading-relaxed italic mb-6">
                "{t(`home.testimonials.${tm.key}.text`)}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {tm.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{tm.name}</p>
                  <p className="text-xs text-white/30">{tm.loc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-12 border-t border-white/[0.06]">
          {stats.map((s, i) => (
            <motion.div
              key={s.key}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-gradient">{s.value}</p>
              <p className="mt-1.5 text-xs font-medium tracking-widest uppercase text-white/30">
                {t(`home.stats.${s.key}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CTA — Full-bleed cinematic closing
   ═══════════════════════════════════════════════════════════════ */
const CTASection = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden">
      {/* Background */}
      <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2560"
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-surface-950/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-950/50 via-transparent to-surface-950/30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            {t('home.ctaTitle')}
          </h2>
          <p className="mt-5 text-base md:text-lg text-white/45 max-w-lg mx-auto leading-relaxed">
            {t('home.ctaSubtitle')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate('/planner')}
              className="inline-flex items-center gap-2.5 px-10 py-4 min-h-[48px] text-sm font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/25"
              whileHover={{ scale: 1.04, boxShadow: '0 20px 50px rgba(249,115,22,0.35)' }}
              whileTap={{ scale: 0.97 }}
            >
              {t('home.ctaButton')}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => navigate('/destinations')}
              className="inline-flex items-center gap-2 px-8 py-4 min-h-[48px] text-sm font-semibold text-white border border-white/15 rounded-xl hover:bg-white/[0.06] transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {t('hero.exploreDestinations')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOMEPAGE — Assembled
   ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <DestinationMarquee />
      <ImmersiveShowcase />
      <AIFeaturesSection />
      <HowItWorks />
      <CategorySection />
      <SocialProofSection />
      <CTASection />
    </main>
  );
}
