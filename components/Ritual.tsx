
import React, { useEffect, useRef, useState } from 'react';
import { TEXT_CONTENT, POUR_AUDIO_URL } from '../constants';
import { ChevronUp } from 'lucide-react';

interface RitualProps {
  onComplete: () => void;
  onPrimeAudio?: () => void; // New prop to prime background audio during interaction
}

const Ritual: React.FC<RitualProps> = ({ onComplete, onPrimeAudio }) => {
  const [fillLevel, setFillLevel] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false); // Track if we've unlocked audio context
  const isDragging = useRef(false);
  const lastY = useRef(0);
  
  // Use a ref for fillLevel to access inside event handlers without dependencies
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
      
      // Unlock Audio Context on first interaction
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
          // Sensitivity: adjust divisor to change "weight" of the water
          const increment = deltaY * 0.4; 
          
          const nextLevel = Math.min(100, fillLevelRef.current + increment);
          fillLevelRef.current = nextLevel;
          setFillLevel(nextLevel);

          // Play audio when actively pouring (moving up)
          if (audioRef.current && audioRef.current.paused) {
             const playPromise = audioRef.current.play();
             if (playPromise !== undefined) {
                 playPromise.catch(error => {
                     // Ignore AbortError which happens if we pause too quickly
                     // console.warn("Playback prevented", error);
                 });
             }
          }

          if (nextLevel >= 100) {
              handleCompleteLogic();
          }
      } else {
          // If moving down or staying still, pause audio
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

  // Touch Events
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientY);
  const onTouchEnd = handleEnd;

  // Mouse Events
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
      
      // Stop pouring sound
      if (audioRef.current) audioRef.current.pause();
      
      // Haptic feedback
      if (navigator.vibrate) try { navigator.vibrate([20, 30, 20]); } catch(e) {}

      // PRIME AUDIO HERE: Trigger background music while we still have user interaction
      if (onPrimeAudio) {
          onPrimeAudio();
      }
      
      // Wait for visual transition
      setTimeout(onComplete, 1200);
  };

  // Curvier, cuter wave path
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
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full pointer-events-none">
        
        {/* Text Container - Always Visible initially */}
        <div className="relative z-30 mix-blend-overlay pointer-events-none">
            <div className="flex space-x-4 md:space-x-8">
            {TEXT_CONTENT.ritual.main.map((char, index) => (
                <span 
                    key={index} 
                    className="text-5xl md:text-7xl font-serif font-bold transition-all duration-700 select-none"
                    style={{ 
                        opacity: isCompleted ? 0 : 1,
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

        {/* Interaction Guide - New Minimalist Design */}
        <div 
            className={`absolute bottom-24 transition-all duration-700 flex flex-col items-center pointer-events-none ${fillLevel > 5 ? 'opacity-0 translate-y-10' : 'opacity-70 translate-y-0'}`}
        >
             {/* Icon Group */}
            <div className="flex flex-col items-center gap-3 mb-4">
                 {/* Arrow */}
                <ChevronUp className="w-6 h-6 text-ink-light animate-bounce" strokeWidth={1.5} />
                
                {/* Vertical Line */}
                <div className="w-[1px] h-12 bg-gradient-to-t from-transparent via-ink-light/50 to-transparent rounded-full"></div>
            </div>

            {/* Text */}
            <p className="text-xs font-bold tracking-[0.2em] text-ink-light font-sans text-center">
                向上滑动 斟茶
            </p>
        </div>
      </div>

      {/* Liquid Container */}
      <div 
         className="absolute bottom-0 left-0 right-0 z-10 transition-all duration-75 ease-linear flex items-end overflow-hidden pointer-events-none"
         style={{ height: `${fillLevel}%` }}
      >
          {/* Liquid Body - Warm Amber Gradient */}
          <div className="w-full h-full bg-gradient-to-t from-dopamine-orange via-amber-300 to-yellow-200 opacity-90 relative">
             
             {/* Sparkles / Bubbles in liquid */}
             <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>

             {/* Wave Animation SVG */}
             <div className="absolute top-[-50px] left-0 w-[200%] h-[80px] animate-wave origin-bottom flex">
                <svg className="w-[50%] h-full fill-yellow-200" viewBox="0 0 1350 120" preserveAspectRatio="none">
                    <path d={wavePath} />
                </svg>
                <svg className="w-[50%] h-full fill-yellow-200" viewBox="0 0 1350 120" preserveAspectRatio="none">
                    <path d={wavePath} />
                </svg>
             </div>
             
             {/* Secondary Wave */}
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
