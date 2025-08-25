import React from 'react';
import SearchBar from './SearchBar';

const HeroSection = () => {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80"
          alt="Hero Background"
          className="w-full h-full object-cover"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0))',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0))'
          }}
        />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80')] bg-cover">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-transparent to-[#1a1a1a]" />
          <div className="absolute inset-0">
            {/* Futuristic circular overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-2 border-orange-400/30 animate-[spin_20s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-2 border-cyan-400/30 animate-[spin_15s_linear_infinite_reverse]" />
          </div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
          Travel Beyond
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-2xl text-cyan-100">
          Experience the future of travel with our curated destinations
        </p>
        
        <SearchBar />
      </div>
    </div>
  );
};

export default HeroSection;