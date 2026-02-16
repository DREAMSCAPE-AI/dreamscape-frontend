import React from 'react';
import { HelpCircle } from 'lucide-react';

interface DocsButtonProps {
  onClick: () => void;
}

const DocsButton: React.FC<DocsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90 transition-opacity shadow-lg"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
};

export default DocsButton;