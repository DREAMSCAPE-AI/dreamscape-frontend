import React from 'react';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle: string;
  align?: 'center' | 'left';
  light?: boolean;
  badge?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  align = 'center',
  light = false,
  badge,
}) => {
  return (
    <motion.div
      className={`max-w-3xl ${align === 'center' ? 'text-center mx-auto' : 'text-left'}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {badge && (
        <motion.span
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase rounded-full bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-500 border border-orange-500/20"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {badge}
        </motion.span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
        <span className="text-gradient">{title}</span>
      </h2>
      <p className={`mt-4 text-lg md:text-xl leading-relaxed ${light ? 'text-gray-400' : 'text-gray-500'}`}>
        {subtitle}
      </p>
      <motion.div
        className={`h-[3px] mt-8 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-orange-400 bg-[length:200%_100%] animate-shimmer ${align === 'center' ? 'mx-auto' : ''}`}
        initial={{ width: 0 }}
        whileInView={{ width: 64 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
};

export default SectionTitle;
