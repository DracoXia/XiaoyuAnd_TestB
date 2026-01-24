import React from 'react';

const DynamicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white/50">
      
      {/* Base Background Image - Blurred for Atmosphere */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/BG%20%281%29.png" 
            alt="Atmosphere" 
            className="w-full h-full object-cover filter blur-[80px] opacity-40 scale-110 mix-blend-multiply transition-opacity duration-1000"
        />
      </div>

      {/* Dopamine Blobs - Layered on top for color variation */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-50 z-10">
        
        {/* Warm Orange Blob */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-dopamine-orange/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        
        {/* Soft Pink Blob */}
        <div className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] bg-dopamine-pink/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        
        {/* Calming Blue/Green Blob */}
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-dopamine-blue/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Yellow Accent */}
        <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-dopamine-yellow/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-3000"></div>

      </div>
      
      {/* Noise overlay for texture (very subtle) */}
      <div className="absolute inset-0 opacity-[0.03] z-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};

export default DynamicBackground;