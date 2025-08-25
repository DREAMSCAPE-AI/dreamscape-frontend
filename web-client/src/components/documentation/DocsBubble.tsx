import React from 'react';
import { motion } from 'framer-motion';

interface DocsBubbleProps {
  title: string;
  description: string;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const DocsBubble: React.FC<DocsBubbleProps> = ({
  title,
  description,
  position,
  isActive,
  onClick
}) => {
  return (
    <motion.div
      className="absolute pointer-events-auto"
      style={position}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: { type: 'spring', stiffness: 100 }
      }}
    >
      <button
        onClick={onClick}
        className={`
          relative p-3 rounded-xl backdrop-blur-md
          ${isActive 
            ? 'bg-white/20 shadow-lg shadow-orange-500/20' 
            : 'bg-white/10 hover:bg-white/15'
          }
          transition-all duration-300
        `}
      >
        <div className="w-3 h-3 rounded-full bg-orange-400" />
        
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-2 left-0 w-64 p-4 rounded-lg bg-black/90 backdrop-blur-md"
          >
            <h3 className="text-lg font-semibold mb-2 text-orange-400">{title}</h3>
            <p className="text-sm text-gray-300">{description}</p>
          </motion.div>
        )}
      </button>
    </motion.div>
  );
};

export default DocsBubble;