import { useState, useEffect } from 'react';

interface LastUpdatedIndicatorProps {
  dataUpdatedAt: number;
  onRefresh: () => void;
}

const LastUpdatedIndicator = ({ dataUpdatedAt, onRefresh }: LastUpdatedIndicatorProps) => {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const update = () => {
      if (!dataUpdatedAt) {
        setLabel('');
        return;
      }
      const diff = Math.floor((Date.now() - dataUpdatedAt) / 1000);
      if (diff < 60) setLabel('il y a quelques secondes');
      else if (diff < 3600) setLabel(`il y a ${Math.floor(diff / 60)} min`);
      else setLabel(`il y a ${Math.floor(diff / 3600)}h`);
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  if (!label) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span>Mis a jour {label}</span>
      <button
        onClick={onRefresh}
        className="hover:text-gray-600 transition-colors"
        title="Rafraichir"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
};

export default LastUpdatedIndicator;
