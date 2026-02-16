import React from 'react';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBox = () => {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/search');
  };

  return (
    <div className="bg-white/90 shadow-lg backdrop-blur-md p-4 rounded-lg max-w-4xl flex flex-col md:flex-row gap-4">
      <SearchInput icon={<MapPin />} placeholder="Where to?" />
      <SearchInput icon={<Calendar />} placeholder="Select dates" />
      <SearchInput icon={<Users />} placeholder="Travelers" />
      <button 
        onClick={handleSearch}
        className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
      >
        Explore Now
      </button>
    </div>
  );
};

const SearchInput = ({ icon, placeholder }: { icon: React.ReactNode; placeholder: string }) => (
  <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-md p-3">
    <span className="text-orange-500">{icon}</span>
    <input 
      type="text" 
      placeholder={placeholder}
      className="bg-transparent outline-none w-full placeholder-gray-400 text-gray-700"
    />
  </div>
);

export default SearchBox;