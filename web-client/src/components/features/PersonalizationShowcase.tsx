import { Brain, Zap, Calendar, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const PersonalizationShowcase = () => {
  const { t } = useTranslation('common');

  const features = [
    { icon: Brain, title: t('home.aiRecommendations'), description: t('home.aiRecommendationsDesc') },
    { icon: Zap, title: t('home.realTimePersonalization'), description: t('home.realTimePersonalizationDesc') },
    { icon: Calendar, title: t('home.seamlessBooking'), description: t('home.seamlessBookingDesc') },
  ];

  const steps = [
    { num: '01', title: t('home.stepTellUs'), desc: t('home.stepTellUsDesc') },
    { num: '02', title: t('home.stepGetMatched'), desc: t('home.stepGetMatchedDesc') },
    { num: '03', title: t('home.stepBookAndGo'), desc: t('home.stepBookAndGoDesc') },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-surface-950 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-orange-500/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-pink-500/[0.04] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── Top: Split layout — text left, visual right ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — text + features */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 text-[11px] font-semibold tracking-widest uppercase rounded-full bg-white/[0.06] text-orange-400 border border-white/[0.06]"
              variants={fadeUp}
            >
              <Sparkles className="w-3 h-3" />
              {t('home.poweredByAI')}
            </motion.span>

            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5"
              variants={fadeUp}
            >
              <span className="text-gradient">{t('home.travelTailored')}</span>
            </motion.h2>

            <motion.p
              className="text-gray-400 text-base md:text-lg leading-relaxed mb-10 max-w-lg"
              variants={fadeUp}
            >
              {t('home.travelTailoredSubtitle')}
            </motion.p>

            {/* Feature list */}
            <div className="space-y-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    className="flex gap-4 items-start group"
                    variants={fadeUp}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:from-orange-500/30 group-hover:to-pink-500/30 transition-colors">
                      <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              className="mt-10 inline-flex items-center gap-2.5 px-7 py-3.5 min-h-[44px] text-sm font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg shadow-orange-500/15"
              variants={fadeUp}
              whileHover={{ scale: 1.03, boxShadow: '0 16px 40px rgba(249,115,22,0.25)' }}
              whileTap={{ scale: 0.97 }}
            >
              {t('home.howItWorks')}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Right — visual: "how it works" steps as a vertical timeline */}
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } } }}
          >
            {/* Timeline line */}
            <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-orange-500/30 via-pink-500/20 to-transparent hidden md:block" />

            <div className="space-y-6 md:space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  className="relative flex gap-5 items-start"
                  variants={fadeUp}
                >
                  {/* Step indicator */}
                  <div className="relative z-10 w-10 h-10 rounded-full bg-surface-950 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gradient">{step.num}</span>
                    <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-pulse-glow" />
                  </div>

                  {/* Card */}
                  <div className="flex-1 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                    <h4 className="text-white font-semibold mb-1.5">{step.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Completion indicator */}
            <motion.div
              className="flex items-center gap-3 mt-8 ml-14 text-sm"
              variants={fadeUp}
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-500">Your perfect trip — ready in under 2 minutes</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PersonalizationShowcase;
