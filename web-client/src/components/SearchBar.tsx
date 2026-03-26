import React from 'react';
import { MapPin } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-lg max-w-4xl flex flex-col md:flex-row gap-3 md:gap-4">
      <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-md p-3 min-h-[44px]">
        <MapPin className="text-orange-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Where to?"
          className="bg-transparent outline-none w-full placeholder-gray-300 text-white text-base"
          aria-label="Search destination"
        />
      </div>
      <button className="bg-gradient-to-r from-orange-500 to-pink-600 px-6 md:px-8 py-3 min-h-[44px] rounded-md font-semibold hover:opacity-90 transition-opacity">
        Explore Now
      </button>
    </div>
  );
};

export default SearchBar;