import React from 'react';

const DynamicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zen-white">
      {/* Soft gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-zen-white via-[#f0efe9] to-zen-gray opacity-50" />
      
      {/* Moving Mist/Smoke Layer 1 */}
      <div 
        className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-40 animate-mist blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(242,230,216,0) 60%)',
        }}
      />
      
      {/* Moving Mist/Smoke Layer 2 (Slower, reverse) */}
      <div 
        className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] opacity-30 animate-mist blur-[60px]"
        style={{
          background: 'radial-gradient(circle, rgba(224,223,219,0.5) 0%, rgba(255,255,255,0) 50%)',
          animationDirection: 'reverse',
          animationDuration: '30s'
        }}
      />

      {/* Light Shafts */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-zen-white opacity-20" />
    </div>
  );
};

export default DynamicBackground;