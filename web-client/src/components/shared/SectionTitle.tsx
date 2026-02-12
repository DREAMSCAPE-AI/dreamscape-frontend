import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
        {title}
      </h2>
      <p className="text-base md:text-lg lg:text-xl text-gray-600">
        {subtitle}
      </p>
    </div>
  );
};

export default SectionTitle;