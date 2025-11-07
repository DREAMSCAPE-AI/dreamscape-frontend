import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

interface OnboardingStepWrapperProps {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
  isCompleted?: boolean;
  isOptional?: boolean;
}

const OnboardingStepWrapper: React.FC<OnboardingStepWrapperProps> = ({
  title,
  description,
  icon,
  children,
  isCompleted = false,
  isOptional = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {isOptional && (
                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                  Optionnel
                </span>
              )}
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default OnboardingStepWrapper;