import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VRPreviewProps {
  destinationId: string;
  onClose: () => void;
}

const VRPreview: React.FC<VRPreviewProps> = ({ destinationId, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <button
          onClick={() => {}} // Handle fullscreen
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <Maximize2 className="w-6 h-6" />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl font-semibold mb-4">VR Experience</p>
          <p className="text-gray-400">VR content will be loaded here</p>
        </div>
      </div>
    </motion.div>
  );
};

export default VRPreview;