import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, ChevronDown, Leaf, Loader2, AlertCircle } from 'lucide-react';
import { AppPhase } from './types';
import { TEXT_CONTENT, DEFAULT_AUDIO_URL, TRANSITION_AUDIO_URL, IMMERSION_DURATION } from './constants';
import DynamicBackground from './components/DynamicBackground';
import AudioPlayer from './components/AudioPlayer';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LANDING);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showStory, setShowStory] = useState(false);

  const timerRef = useRef<number | null>(null);

  const handleStart = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const transitionAudio = new Audio(TRANSITION_AUDIO_URL);
    transitionAudio.volume = 0.9;
    transitionAudio.play().catch(e => {
      console.warn("Transition audio blocked or not found", e);
    });
    
    setTimeout(() => {
      setPhase(AppPhase.IMMERSION);
      setIsPlaying(true);
      setIsTransitioning(false);
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        handleSessionEnd();
      }, IMMERSION_DURATION);
    }, 2000);
  };

  const handleSessionEnd = () => {
    // Smooth fade out: 5 seconds total (50 steps of 100ms each)
    let currentVol = volume;
    const fadeInterval = setInterval(() => {
      currentVol -= 0.02;
      if (currentVol <= 0) {
        currentVol = 0;
        clearInterval(fadeInterval);
        setIsPlaying(false);
      }
      setVolume(currentVol);
    }, 100); 

    setShowSafetyModal(false);
    setPhase(AppPhase.ENDING);
  };

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
    if (!isPlaying && volume < 0.1) setVolume(1);
  };

  const renderLanding = () => (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-40 transition-all duration-[1200ms] ease-out px-6 ${isTransitioning ? 'opacity-0 scale-105 blur-sm pointer-events-none' : 'opacity-100'}`}>
      <button 
        onClick={handleStart}
        className="group relative px-14 py-7 overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl transition-all duration-1000 hover:bg-white/10 hover:border-white/30 focus:outline-none cursor-pointer"
      >
        <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-[800ms] ease-out group-hover:w-full"></div>
        <span className="relative text-xl md:text-2xl font-serif text-white tracking-[0.6em] font-light group-hover:tracking-[0.7em] transition-all duration-1000 block text-center">
          {TEXT_CONTENT.landing}
        </span>
      </button>
      
      {audioError && !isTransitioning && (
        <div className="absolute bottom-12 flex items-center space-x-2 text-white/20 text-[10px] tracking-widest font-serif animate-pulse">
          <AlertCircle className="w-3 h-3" />
          <span>( 音声未加载，然意境长存 )</span>
        </div>
      )}
    </div>
  );

  const renderImmersion = () => (
    <div className="absolute inset-0 z-30 overflow-y-auto no-scrollbar animate-fade-in flex flex-col">
      {isAudioLoading && isPlaying && !audioError && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none animate-fade-in">
          <Loader2 className="w-5 h-5 text-white/20 animate-spin mb-4" />
          <p className="text-xs font-serif text-white/40 tracking-[0.3em] animate-pulse">听山语...</p>
        </div>
      )}

      {/* Container adjusted to push text down from top edge (pt-24 and justify-center) */}
      <div className="flex-grow flex flex-col justify-center items-center relative p-8 pt-[12vh] min-h-[90vh]">
        <div className="max-w-md w-full text-center flex flex-col items-center">
          {(TEXT_CONTENT.immersion as string[]).map((line, idx) => {
            if (line === "") return <div key={idx} className="h-8 md:h-10" />; 
            return (
              <p 
                key={idx}
                className="text-lg md:text-xl font-serif text-white leading-relaxed tracking-[0.25em] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] opacity-95 animate-float my-3" 
                style={{ animationDelay: `${idx * 0.5}s`, animationDuration: '14s' }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      <div className="pb-16 flex justify-center w-full opacity-0 animate-fade-in" style={{ animationDelay: '3s', animationFillMode: 'forwards' }}>
         <button 
           onClick={() => setShowSafetyModal(true)}
           className="flex flex-col items-center space-y-4 group cursor-pointer transition-opacity duration-700 opacity-60 hover:opacity-100"
         >
           <Leaf strokeWidth={1} className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-1000" />
           <span className="text-[10px] font-serif text-white tracking-[0.4em] uppercase">
             {TEXT_CONTENT.product.entryLabel}
           </span>
         </button>
      </div>
    </div>
  );

  const renderEnding = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-[2000ms] bg-black/90 backdrop-blur-2xl">
      <div className="bg-zen-white w-[92%] max-w-md p-10 md:p-14 shadow-2xl rounded-sm transition-all duration-1000 max-h-[85vh] overflow-y-auto no-scrollbar">
        <h2 className="text-left text-lg font-serif text-ink-gray tracking-[0.4em] mb-10 border-b border-zen-gray/50 pb-6 sticky top-0 bg-zen-white z-10">
          {TEXT_CONTENT.ending.title}
        </h2>
        
        {!showStory ? (
          <div 
            className="flex flex-col items-start cursor-pointer group w-full"
            onClick={() => setShowStory(true)}
          >
            <p className="text-lg text-left font-serif italic text-ink-gray/90 mb-10 leading-relaxed tracking-wide">
              {TEXT_CONTENT.ending.quote}
            </p>
            <div className="flex items-center space-x-4 animate-pulse opacity-40 group-hover:opacity-80 transition-opacity">
              <span className="text-[10px] tracking-[0.4em] text-ink-gray uppercase">阅读全文</span>
              <ChevronDown className="w-4 h-4 text-ink-gray" />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col items-start w-full">
            <div className="mb-10 w-full space-y-5">
               {(TEXT_CONTENT.ending.body as string[]).map((line, idx) => {
                 if (line === "") return <div key={idx} className="h-8" />;
                 return (
                   <p key={idx} className="text-sm md:text-base text-left font-serif text-ink-gray leading-loose tracking-[0.12em]">
                     {line}
                   </p>
                 );
               })}
            </div>
            <button className="w-full py-5 mt-4 border border-ink-gray text-ink-gray font-serif tracking-[0.5em] hover:bg-ink-gray hover:text-zen-white transition-all duration-700 rounded-sm text-xs uppercase">
              {TEXT_CONTENT.ending.cta}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none bg-black">
      <div 
        className={`absolute inset-0 z-0 transition-opacity duration-[2500ms] bg-cover bg-center bg-no-repeat ${
          phase !== AppPhase.LANDING ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: "url('https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/BG%20%281%29.png')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className={`absolute inset-0 z-10 transition-opacity duration-[3000ms] ${phase === AppPhase.LANDING ? 'opacity-0' : 'opacity-100'}`}>
        <DynamicBackground />
      </div>

      <AudioPlayer 
        url={DEFAULT_AUDIO_URL} 
        isPlaying={isPlaying && (phase === AppPhase.IMMERSION || phase === AppPhase.ENDING)} 
        volume={volume} 
        onLoadingStatusChange={setIsAudioLoading}
        onError={() => setAudioError(true)}
      />

      <div className={`absolute top-10 right-10 z-50 transition-opacity duration-1000 ${phase === AppPhase.IMMERSION ? 'opacity-40 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={toggleAudio} className="p-3">
          {isPlaying ? (
            <Volume2 strokeWidth={1} className="w-5 h-5 text-white" />
          ) : (
            <VolumeX strokeWidth={1} className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {phase === AppPhase.LANDING && renderLanding()}
      {phase === AppPhase.IMMERSION && renderImmersion()}
      {phase === AppPhase.ENDING && renderEnding()}

      {showSafetyModal && (
        <>
          <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-[6px] z-[60] animate-fade-in"
              onClick={() => setShowSafetyModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-zen-white rounded-t-[3rem] shadow-2xl p-12 transform animate-fade-in max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowSafetyModal(false)} className="p-2 opacity-40 hover:opacity-100 transition-transform hover:scale-110"><X className="w-6 h-6 text-ink-gray" /></button>
            </div>
            <h3 className="text-center font-serif text-xl text-ink-gray tracking-[0.3em] mb-12">
              {TEXT_CONTENT.product.modal.title}
            </h3>
            <p className="font-serif text-base text-ink-gray leading-loose mb-10 text-justify opacity-80">
              {TEXT_CONTENT.product.modal.origin.part1} <b className="text-ink-gray">{TEXT_CONTENT.product.modal.origin.highlight}</b> {TEXT_CONTENT.product.modal.origin.part2}
            </p>
            <div className="space-y-5 mb-14">
              {TEXT_CONTENT.product.modal.ingredients.list.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline border-b border-zen-gray/50 pb-3">
                  <span className="text-base font-serif text-ink-gray">{item.name}</span>
                  <span className="text-xs font-serif text-ink-light italic tracking-wider">{item.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-center text-ink-light italic tracking-[0.1em] opacity-60">
              {TEXT_CONTENT.product.modal.footer}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default App;