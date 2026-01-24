
import React, { useEffect, useRef, useState } from 'react';
import { TEXT_CONTENT, POUR_AUDIO_URL } from '../constants';
import { ChevronUp, LogIn } from 'lucide-react';

interface RitualProps {
  onComplete: () => void;
  onPrimeAudio?: () => void;
}

const Ritual: React.FC<RitualProps> = ({ onComplete, onPrimeAudio }) => {
  const [fillLevel, setFillLevel] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showEnterButton, setShowEnterButton] = useState(false); // New state for the button
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);
  const isDragging = useRef(false);
  const lastY = useRef(0);
  
  const fillLevelRef = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio(POUR_AUDIO_URL);
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // --- INTERACTION LOGIC (Swipe Up) ---
  
  const handleStart = (y: number) => {
      if (isCompleted) return;
      
      // Unlock Pouring Audio locally
      if (!audioUnlocked.current && audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
              playPromise.then(() => {
                  audioRef.current?.pause();
                  audioUnlocked.current = true;
              }).catch(e => console.log("Audio silent unlock failed", e));
          }
      }

      isDragging.current = true;
      lastY.current = y;
  };

  const handleMove = (y: number) => {
      if (!isDragging.current || isCompleted) return;
      
      const deltaY = lastY.current - y; // Positive when moving UP
      lastY.current = y; // Update for next frame
      
      if (deltaY > 0) {
          const increment = deltaY * 0.4; 
          const nextLevel = Math.min(100, fillLevelRef.current + increment);
          fillLevelRef.current = nextLevel;
          setFillLevel(nextLevel);

          if (audioRef.current && audioRef.current.paused) {
             const playPromise = audioRef.current.play();
             if (playPromise !== undefined) {
                 playPromise.catch(() => {});
             }
          }

          if (nextLevel >= 100) {
              handleCompleteLogic();
          }
      } else {
          if (audioRef.current && !audioRef.current.paused) {
              audioRef.current.pause();
          }
      }
  };

  const handleEnd = () => {
      isDragging.current = false;
      if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
      }
  };

  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientY);
  const onTouchEnd = handleEnd;

  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientY);
  const onMouseMove = (e: React.MouseEvent) => {
      if (e.buttons === 1) handleMove(e.clientY);
  };
  const onMouseUp = handleEnd;
  const onMouseLeave = handleEnd;

  const handleCompleteLogic = () => {
      if (isCompleted) return;
      setIsCompleted(true);
      isDragging.current = false;
      
      if (audioRef.current) audioRef.current.pause();
      
      if (navigator.vibrate) try { navigator.vibrate([20, 30, 20]); } catch(e) {}

      // Instead of auto-transition, show the enter button
      setTimeout(() => {
          setShowEnterButton(true);
      }, 500);
  };

  const handleEnterClick = () => {
      // Trigger the main audio priming (if needed) and completion logic inside a User Click Event
      if (onPrimeAudio) onPrimeAudio();
      onComplete();
  };

  const wavePath = "M0,60 C150,80 300,40 450,60 C600,80 750,40 900,60 C1050,80 1200,40 1350,60 V120 H0 V60 Z";

  return (
    <div 
        className="absolute inset-0 z-50 flex flex-col overflow-hidden font-serif transition-opacity duration-1000 select-none cursor-ns-resize"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
    >
      
      {/* Content Layer */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full">
        
        {/* Text Container */}
        <div className="relative z-30 mix-blend-overlay pointer-events-none transition-all duration-700" style={{ transform: showEnterButton ? 'translateY(-50px) scale(0.9)' : 'none', opacity: showEnterButton ? 0.8 : 1 }}>
            <div className="flex space-x-4 md:space-x-8">
            {TEXT_CONTENT.ritual.main.map((char, index) => (
                <span 
                    key={index} 
                    className="text-5xl md:text-7xl font-serif font-bold transition-all duration-700 select-none"
                    style={{ 
                        opacity: isCompleted ? (showEnterButton ? 0.5 : 0) : 1,
                        transform: isCompleted ? 'translateY(-30px)' : 'translateY(0)',
                        color: fillLevel > 60 ? '#FFFFFF' : '#2C2C2E',
                        textShadow: fillLevel > 60 ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    {char}
                </span>
            ))}
            </div>
        </div>

        {/* Interaction Guide - Auto hide on complete */}
        <div 
            className={`absolute bottom-24 transition-all duration-700 flex flex-col items-center pointer-events-none ${fillLevel > 5 ? 'opacity-0 translate-y-10' : 'opacity-70 translate-y-0'}`}
        >
            <div className="flex flex-col items-center gap-3 mb-4">
                <ChevronUp className="w-6 h-6 text-ink-light animate-bounce" strokeWidth={1.5} />
                <div className="w-[1px] h-12 bg-gradient-to-t from-transparent via-ink-light/50 to-transparent rounded-full"></div>
            </div>
            <p className="text-xs font-bold tracking-[0.2em] text-ink-light font-sans text-center">
                向上滑动 斟茶
            </p>
        </div>

        {/* Enter Button - Appears after pouring is complete */}
        {showEnterButton && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-fade-in">
                 <button
                    onClick={handleEnterClick}
                    className="group relative px-8 py-4 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center space-x-3 transition-all duration-500 hover:scale-105 active:scale-95 animate-bounce-gentle ring-1 ring-white/50"
                 >
                    <span className="text-lg font-serif font-bold text-ink-gray tracking-[0.2em] pl-1">推门，见山色</span>
                    <LogIn className="w-5 h-5 text-dopamine-orange group-hover:translate-x-1 transition-transform" />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping group-hover:opacity-20"></div>
                 </button>
             </div>
        )}
      </div>

      {/* Liquid Container */}
      <div 
         className="absolute bottom-0 left-0 right-0 z-10 transition-all duration-75 ease-linear flex items-end overflow-hidden pointer-events-none"
         style={{ height: `${fillLevel}%` }}
      >
          {/* Liquid Body */}
          <div className="w-full h-full bg-gradient-to-t from-dopamine-orange via-amber-300 to-yellow-200 opacity-90 relative">
             <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
             <div className="absolute top-[-50px] left-0 w-[200%] h-[80px] animate-wave origin-bottom flex">
                <svg className="w-[50%] h-full fill-yellow-200" viewBox="0 0 1350 120" preserveAspectRatio="none">
                    <path d={wavePath} />
                </svg>
                <svg className="w-[50%] h-full fill-yellow-200" viewBox="0 0 1350 120" preserveAspectRatio="none">
                    <path d={wavePath} />
                </svg>
             </div>
             <div className="absolute top-[-70px] left-[-20%] w-[200%] h-[90px] animate-wave-slow opacity-60 flex">
                <svg className="w-[50%] h-full fill-dopamine-orange" viewBox="0 0 1350 120" preserveAspectRatio="none">
                    <path d={wavePath} />
                </svg>
                <svg className="w-[50%] h-full fill-dopamine-orange" viewBox="0 0 1350 120" preserveAspectRatio="none">
                    <path d={wavePath} />
                </svg>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Ritual;
