import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 250]);
  const bgScale = useTransform(scrollY, [0, 800], [1, 1.15]);
  const contentOpacity = useTransform(scrollY, [0, 350], [1, 0]);
  const contentY = useTransform(scrollY, [0, 350], [0, 80]);

  const handleSearch = () => {
    navigate('/destinations', { state: { location: query } });
  };

  return (
    <section className="relative h-screen min-h-[750px] max-h-[1200px] flex items-center justify-center overflow-hidden bg-surface-950">
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: bgY, scale: bgScale }}
      >
        <img
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=2560"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlays for depth */}
        <div className="absolute inset-0 bg-surface-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-surface-950/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/40 via-transparent to-surface-950" />
      </motion.div>

      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
            top: '10%',
            left: '20%',
          }}
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            bottom: '5%',
            right: '10%',
          }}
          animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="noise-overlay absolute inset-0" />
      </div>

      {/* Centered content */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* AI badge */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] uppercase rounded-full bg-white/[0.06] backdrop-blur-md text-orange-300/80 border border-white/[0.08]">
            <Sparkles className="w-3 h-3" />
            {t('home.poweredByAI')}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-[0.9]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="block text-white"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('hero.title')}
          </motion.span>
          <motion.span
            className="block text-gradient mt-1"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('hero.titleLine2')}
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 md:mt-8 text-base sm:text-lg md:text-xl text-white/45 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Compact search bar */}
        <motion.div
          className="mt-10 md:mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-2xl">
            {/* Destination input */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                placeholder={t('hero.placeholderDestination')}
                className="w-full pl-10 pr-3 py-3.5 text-sm bg-transparent rounded-xl text-white placeholder-white/25 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Dates button */}
            <button className="hidden sm:flex items-center gap-2 px-4 py-3.5 text-sm text-white/30 hover:text-white/50 transition-colors whitespace-nowrap">
              <Calendar className="w-4 h-4" />
              <span>{t('hero.selectDates')}</span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-white/10" />

            {/* Search button */}
            <motion.button
              onClick={handleSearch}
              className="flex items-center gap-2 px-6 py-3.5 min-h-[44px] text-sm font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl whitespace-nowrap"
              whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(249,115,22,0.35)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">{t('buttons.search')}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <motion.div
            className="w-0.5 h-1.5 rounded-full bg-white/40"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
