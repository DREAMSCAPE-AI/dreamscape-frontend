import React from 'react';

const BackgroundOverlay = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Circular HUD elements - Responsive sizes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] rounded-full border border-orange-400/20 animate-[spin_30s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] md:w-[600px] h-[220px] md:h-[600px] rounded-full border border-cyan-400/20 animate-[spin_20s_linear_infinite_reverse]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] md:w-[400px] h-[160px] md:h-[400px] rounded-full border border-white/10 animate-[spin_25s_linear_infinite]" />
      
      {/* Floating elements animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute top-20 left-20 w-16 h-16 opacity-30">
          <div className="w-full h-full border border-white/20 rounded-full" />
        </div>
        <div className="animate-float-slow absolute top-40 right-40 w-20 h-20 opacity-20">
          <div className="w-full h-full border border-orange-400/20 rotate-45" />
        </div>
      </div>
    </div>
  );
};

export default BackgroundOverlay;