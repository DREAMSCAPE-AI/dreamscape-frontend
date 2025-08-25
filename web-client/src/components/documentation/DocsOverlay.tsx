import React, { useState } from 'react';
import DocsBubble from './DocsBubble';
import { X } from 'lucide-react';

const DocsOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const documentationPoints = [
    {
      id: 'logo',
      title: 'Brand Identity',
      description: 'DreamScape logo with custom plane icon',
      position: { top: '20px', left: '90px' }
    },
    {
      id: 'search',
      title: 'Smart Search',
      description: 'AI-powered search with destination suggestions',
      position: { top: '550px', left: '50%' }
    },
    {
      id: 'hero',
      title: 'Dynamic Hero Section',
      description: 'Engaging headline with gradient text effect',
      position: { top: '300px', left: '50%' }
    },
    {
      id: 'nav',
      title: 'Navigation',
      description: 'Main navigation with key sections',
      position: { top: '20px', right: '200px' }
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full pointer-events-auto hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {documentationPoints.map((point, index) => (
        <DocsBubble
          key={point.id}
          {...point}
          isActive={currentStep === index}
          onClick={() => setCurrentStep(index)}
        />
      ))}
    </div>
  );
};

export default DocsOverlay;