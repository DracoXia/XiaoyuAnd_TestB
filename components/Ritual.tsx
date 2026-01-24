
import React, { useEffect, useRef, useState } from 'react';
import { TEXT_CONTENT, POUR_AUDIO_URL, FRAGRANCE_LIST } from '../constants';
import { ChevronUp, Archive, Lock, CheckCircle2, Leaf, ArrowRight } from 'lucide-react';

interface RitualProps {
  onComplete: () => void;
  onPrimeAudio?: () => void;
  activeFragranceId: string;
  onFragranceChange: (id: string) => void;
}

// --- Particle System Types ---
class SmokeParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    growth: number;
    life: number;
    maxLife: number;
    alpha: number;
    wobble: number;

    constructor(w: number, h: number, intensity: number) {
        // Define "Idle" state as very low intensity
        const isIdle = intensity < 3;

        // Spawn position
        const spread = isIdle ? 10 : 20 + (intensity * 3); 
        this.x = w / 2 + (Math.random() - 0.5) * spread; 
        this.y = h + 10; 
        
        if (isIdle) {
             // --- IDLE STATE: Zen, Slow, Faint ---
             // Very slow upward float
             this.vy = - (Math.random() * 0.4 + 0.2); 
             // Minimal horizontal drift
             this.vx = (Math.random() - 0.5) * 0.2;   
             // Start smaller
             this.size = Math.random() * 15 + 5;     
             // Grow very slowly
             this.growth = 0.05; 
             // Live longer to allow slow floating to reach top
             this.maxLife = 400 + Math.random() * 200; 
             // Extremely low opacity (2% - 10%) for "barely there" look
             this.alpha = Math.random() * 0.08 + 0.02; 
        } else {
             // --- ACTIVE STATE: Intense, Fast, Thick ---
             const speedBoost = 1 + (intensity / 30); 
             this.vy = - (Math.random() * 1.5 + 0.5) * speedBoost;
             this.vx = (Math.random() - 0.5) * 0.5;
             this.size = Math.random() * 20 + 10 + (intensity / 4);
             this.growth = 0.3;
             this.maxLife = 100 + intensity * 2;
             // Visible smoke
             this.alpha = Math.random() * 0.4 + 0.2; 
        }

        this.life = this.maxLife;
        this.wobble = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.vx + Math.sin(this.wobble) * 0.5;
        this.y += this.vy;
        this.life--;
        this.wobble += 0.05;
        this.size += this.growth;
        
        // Gentle fade out
        if (this.life < 100) {
            this.alpha *= 0.96;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        // Draw a soft circle (simulating a puff of smoke)
        // Using radial gradient for soft edges
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        // Smoke color: Slightly warm white for better contrast on dark bg
        gradient.addColorStop(0, 'rgba(240, 240, 235, 0.5)'); 
        gradient.addColorStop(1, 'rgba(240, 240, 235, 0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const Ritual: React.FC<RitualProps> = ({ onComplete, onPrimeAudio, activeFragranceId, onFragranceChange }) => {
  const [fillLevel, setFillLevel] = useState(0); // 0 to 100
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Fragrance Box State
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [showFragranceDetail, setShowFragranceDetail] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);
  const isDragging = useRef(false);
  const lastY = useRef(0);
  
  const fillLevelRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const particlesRef = useRef<SmokeParticle[]>([]);

  const activeFragrance = FRAGRANCE_LIST.find(f => f.id === activeFragranceId) || FRAGRANCE_LIST[0];

  useEffect(() => {
    audioRef.current = new Audio(POUR_AUDIO_URL);
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // --- CANVAS SMOKE ANIMATION LOOP ---
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const animate = () => {
          // Resize handling (basic)
          if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
          }

          // Clear screen
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 1. Spawn Particles
          const currentLevel = fillLevelRef.current;
          
          let spawnCount = 0;
          if (currentLevel < 3) {
              // Idle smoke: Very sparse, like a single incense stick
              // Chance reduced to ~8% per frame (at 60fps ~5 puffs/sec)
              if (Math.random() > 0.92) spawnCount = 1; 
          } else {
              // Active smoke: proportional to level
              spawnCount = Math.floor(currentLevel / 10) + 1;
              
              // CRITICAL: Boost smoke significantly at high levels to create "whiteout" feel
              if (currentLevel > 90) spawnCount = 15; 
              else if (spawnCount > 6) spawnCount = 6;
          }

          for (let i = 0; i < spawnCount; i++) {
              particlesRef.current.push(new SmokeParticle(canvas.width, canvas.height, currentLevel));
          }

          // 2. Update & Draw Particles
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
              const p = particlesRef.current[i];
              p.update();
              p.draw(ctx);
              
              if (p.life <= 0 || (currentLevel < 80 && p.y < -50)) {
                  particlesRef.current.splice(i, 1);
              }
          }

          requestRef.current = requestAnimationFrame(animate);
      };

      requestRef.current = requestAnimationFrame(animate);

      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, []);

  // --- INTERACTION LOGIC (Swipe Up) ---
  
  const handleStart = (y: number) => {
      if (isCompleted || isBoxOpen) return; 
      
      if (onPrimeAudio) onPrimeAudio();

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
      if (!isDragging.current || isCompleted || isBoxOpen) return;
      
      const deltaY = lastY.current - y; // Positive when moving UP
      lastY.current = y;
      
      if (deltaY > 0) {
          const increment = deltaY * 0.3; // Sensitivity
          const nextLevel = Math.min(100, fillLevelRef.current + increment);
          fillLevelRef.current = nextLevel;
          setFillLevel(nextLevel);

          if (audioRef.current) {
             if (audioRef.current.paused) audioRef.current.play().catch(() => {});
             audioRef.current.volume = Math.min(1, 0.1 + (nextLevel / 100) * 0.9);
          }

          if (nextLevel >= 100) {
              handleCompleteLogic();
          }
      } else {
          // If moving down, reduce level slightly (cool down)
          if (fillLevelRef.current > 0) {
             const nextLevel = Math.max(0, fillLevelRef.current - 1);
             fillLevelRef.current = nextLevel;
             setFillLevel(nextLevel);
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

      // Whiteout transition is handled by the smoke filling screen
      setTimeout(() => {
          onComplete();
      }, 1500); 
  };

  return (
    <div 
        className="absolute inset-0 z-50 flex flex-col overflow-hidden font-serif transition-opacity duration-1000 select-none cursor-ns-resize bg-[#121212]" 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
    >
      {/* 1. Canvas Layer (Smoke) */}
      <canvas 
          ref={canvasRef}
          className="absolute inset-0 z-30 pointer-events-none touch-none"
      />
      
      {/* 2. Content Layer */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full pointer-events-none">
        
        {/* Poem Text - Fades out as Smoke rises */}
        <div 
            className="flex space-x-4 md:space-x-8 transition-all duration-1000"
            style={{ 
                opacity: Math.max(0, 1 - fillLevel / 60), 
                transform: `translateY(${fillLevel * -0.5}px) scale(${1 + fillLevel/500})`,
                filter: `blur(${fillLevel / 20}px)`
            }}
        >
            {TEXT_CONTENT.ritual.main.map((char, index) => (
                <span 
                    key={index} 
                    className="text-5xl md:text-7xl font-serif font-bold text-stone-200 select-none drop-shadow-md"
                >
                    {char}
                </span>
            ))}
        </div>
      </div>

      {/* 3. Bottom Interaction Area (Controls) */}
      {!isCompleted && (
            <div 
                className={`absolute bottom-[18%] w-full flex flex-col items-center gap-8 transition-all duration-500 z-40 ${fillLevel > 20 ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}
            >
                {/* Gesture Hint */}
                <div className="flex flex-col items-center gap-3 opacity-40 animate-pulse pointer-events-none select-none">
                    <ChevronUp className="w-5 h-5 text-stone-300" strokeWidth={1} />
                    <p className="text-[10px] font-bold tracking-[0.4em] text-stone-300 font-sans opacity-80">
                        向上滑动 燃香
                    </p>
                </div>

                {/* Fragrance Selector - Text Updated for Dark Mode */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsBoxOpen(true); }}
                    className="flex items-center justify-center gap-4 group py-2 pointer-events-auto"
                >
                    <div className="w-6 opacity-0 pointer-events-none" aria-hidden="true"><Archive className="w-4 h-4" /></div>
                    <span className="text-2xl font-serif font-bold text-stone-200 tracking-widest leading-none">
                        {activeFragrance.name}
                    </span>
                    <div className="w-6 flex justify-center items-center">
                        <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors backdrop-blur-sm">
                            <Archive className="w-3.5 h-3.5 text-stone-300" strokeWidth={1.5} />
                        </div>
                    </div>
                </button>
            </div>
      )}

      {/* Fragrance Box Modal (Drawer) - Keeps light theme for "opening the box" feeling */}
      {isBoxOpen && (
        <div 
            className="fixed inset-0 z-[100] cursor-default"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={() => { setIsBoxOpen(false); setShowFragranceDetail(false); }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-surface-white/95 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-30px_80px_rgba(255,255,255,0.05)] pt-8 pb-12 px-6 transform animate-slide-up transition-transform duration-300 border-t border-white/60 max-h-[85vh] overflow-y-auto no-scrollbar">
                
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full opacity-50"></div>
                </div>

                {showFragranceDetail ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-2 mb-6 cursor-pointer opacity-70 hover:opacity-100" onClick={() => setShowFragranceDetail(false)}>
                            <div className="p-1 rounded-full bg-gray-100"><ArrowRight className="w-4 h-4 text-ink-gray rotate-180" /></div>
                            <span className="text-sm font-bold text-ink-gray">返回选择</span>
                        </div>
                        <h3 className="text-center font-bold text-2xl text-ink-gray mb-8 flex items-center justify-center gap-2">
                            <Leaf className="w-6 h-6 text-dopamine-green" />
                            {TEXT_CONTENT.product.modal.title}
                        </h3>
                        <p className="font-medium text-base text-ink-gray leading-loose mb-10 text-justify opacity-80">
                            {TEXT_CONTENT.product.modal.origin.part1} <b className="text-dopamine-green bg-green-50 px-1 rounded">{TEXT_CONTENT.product.modal.origin.highlight}</b> {TEXT_CONTENT.product.modal.origin.part2}
                        </p>
                        <div className="space-y-4 mb-10">
                            {TEXT_CONTENT.product.modal.ingredients.list.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50/80 p-5 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                    <span className="text-base font-bold text-ink-gray">{item.name}</span>
                                    <span className="text-xs font-medium text-ink-light tracking-wide bg-white px-2 py-1 rounded-md shadow-sm">{item.desc}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-center text-ink-light font-medium tracking-wide opacity-50">
                            {TEXT_CONTENT.product.modal.footer}
                        </p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-ink-gray mb-1 flex items-center gap-2">
                                <Archive className="w-6 h-6 text-dopamine-orange" strokeWidth={2} />
                                小屿的香匣
                            </h3>
                            <p className="text-xs text-ink-light">今日，燃哪一支？</p>
                        </div>
                        <div className="space-y-4">
                            {FRAGRANCE_LIST.map((fragrance) => (
                                <div 
                                    key={fragrance.id}
                                    onClick={() => {
                                        if (fragrance.status === 'owned') {
                                            onFragranceChange(fragrance.id);
                                            setIsBoxOpen(false);
                                        }
                                    }}
                                    className={`relative p-5 rounded-3xl flex items-center justify-between border transition-all duration-300 ${fragrance.status === 'owned' ? 'bg-white border-orange-100 shadow-md shadow-orange-50 cursor-pointer hover:bg-orange-50/50 group' : 'bg-gray-50 border-transparent opacity-80'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-serif shadow-inner ${fragrance.color}`}>
                                            {fragrance.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-ink-gray text-base mb-1">{fragrance.name}</h4>
                                            <p className="text-xs text-ink-light font-medium">{fragrance.desc}</p>
                                        </div>
                                    </div>
                                    {fragrance.status === 'owned' ? (
                                        <div className="flex flex-col items-end gap-1">
                                            {activeFragranceId === fragrance.id ? (
                                                <div className="flex items-center gap-1 text-white bg-ink-gray px-3 py-1.5 rounded-xl shadow-lg">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold">已选</span>
                                                </div>
                                            ) : (
                                                 <span className="text-xs font-bold text-ink-light/50 px-2">点击选择</span>
                                            )}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setShowFragranceDetail(true); }}
                                                className="flex items-center text-[10px] text-ink-light/60 font-medium hover:text-dopamine-orange transition-colors mt-1 px-2 py-1"
                                            >
                                                <span>查看香方</span>
                                                <ChevronUp className="w-3 h-3 ml-0.5 rotate-90" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="flex items-center gap-1.5 bg-gray-200 text-gray-500 px-3 py-2 rounded-xl text-xs font-bold cursor-not-allowed">
                                            <Lock className="w-3.5 h-3.5" />
                                            待解锁
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Ritual;
