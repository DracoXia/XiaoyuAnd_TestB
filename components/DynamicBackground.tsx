import React from 'react';

const DynamicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-transparent">
      {/* Soft gradient base - even more subtle to let the image shine through */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 opacity-20" />
      
      {/* Moving Mist/Smoke Layer 1 - Reduced opacity */}
      <div 
        className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 animate-mist blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 65%)',
        }}
      />
      
      {/* Moving Mist/Smoke Layer 2 - Reduced opacity and reversed */}
      <div 
        className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] opacity-15 animate-mist blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 55%)',
          animationDirection: 'reverse',
          animationDuration: '35s'
        }}
      />
    </div>
  );
};

export default DynamicBackground;