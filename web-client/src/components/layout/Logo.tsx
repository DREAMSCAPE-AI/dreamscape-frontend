import React from 'react';
import { Plane } from 'lucide-react';

interface LogoProps {
  onClick: () => void;
}

const Logo: React.FC<LogoProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      <Plane className="h-8 w-8 text-orange-400" />
      <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
        DreamScape
      </span>
    </button>
  );
};

export default Logo;