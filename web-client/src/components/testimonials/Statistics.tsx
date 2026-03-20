import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView, useMotionValue, useTransform, animate, motion } from 'framer-motion';
import { Users, Globe, Star, ThumbsUp } from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  suffix: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, suffix, decimals = 0 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()
  );

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 2.2, ease: [0.22, 1, 0.36, 1] });
    }
  }, [isInView, target, count]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

const Statistics = () => {
  const { t } = useTranslation('common');

  const stats = [
    { id: '1', target: 50, suffix: 'K+', labelKey: 'home.stats.travelersServed', icon: Users, decimals: 0 },
    { id: '2', target: 100, suffix: '+', labelKey: 'home.stats.destinations', icon: Globe, decimals: 0 },
    { id: '3', target: 4.9, suffix: '/5', labelKey: 'home.stats.averageRating', icon: Star, decimals: 1 },
    { id: '4', target: 98, suffix: '%', labelKey: 'home.stats.satisfactionRate', icon: ThumbsUp, decimals: 0 },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16 md:mt-20 pt-16 border-t border-white/[0.06]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            className="text-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-4">
              <Icon className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
              <AnimatedCounter target={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
            </div>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-medium">
              {t(stat.labelKey)}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Statistics;
