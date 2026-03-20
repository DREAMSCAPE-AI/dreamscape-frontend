import { useMemo } from 'react';
import { motion } from 'framer-motion';

const BackgroundOverlay = () => {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 12,
      duration: Math.random() * 10 + 14,
      opacity: Math.random() * 0.25 + 0.05,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large ambient orbs — atmospheric depth */}
      <motion.div
        className="absolute w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
          top: '-15%',
          left: '-10%',
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] md:w-[700px] md:h-[700px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
          bottom: '-10%',
          right: '-5%',
        }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)',
          top: '40%',
          left: '50%',
        }}
        animate={{ x: [0, 40, 0], y: [0, -50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Rising particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/60"
          style={{
            left: p.left,
            bottom: '-2%',
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -window.innerHeight * 1.3],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Noise grain */}
      <div className="noise-overlay absolute inset-0" />
    </div>
  );
};

export default BackgroundOverlay;
