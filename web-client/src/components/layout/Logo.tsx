import React from 'react';
import { Plane } from 'lucide-react';

interface LogoProps {
  onClick: () => void;
}

const Logo: React.FC<LogoProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 md:gap-2 hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]"
      aria-label="DreamScape Home"
    >
      <Plane className="h-7 w-7 md:h-8 md:w-8 text-orange-400 flex-shrink-0" />
      <span className="hidden sm:inline text-lg md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
        DreamScape
      </span>
    </button>
  );
};

export default Logo;