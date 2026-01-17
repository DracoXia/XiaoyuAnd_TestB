
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, ChevronDown, Leaf, Loader2, AlertCircle } from 'lucide-react';
import { AppPhase } from './types';
import { TEXT_CONTENT, DEFAULT_AUDIO_URL, IMMERSION_DURATION } from './constants';
import DynamicBackground from './components/DynamicBackground';
import AudioPlayer from './components/AudioPlayer';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LANDING);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showStory, setShowStory] = useState(false);

  const timerRef = useRef<number | null>(null);

  const handleStart = () => {
    setIsPlaying(true);
    setPhase(AppPhase.IMMERSION);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      handleSessionEnd();
    }, IMMERSION_DURATION);
  };

  const handleSessionEnd = () => {
    let vol = 1;
    const fadeInterval = setInterval(() => {
      vol -= 0.05;
      if (vol <= 0) {
        vol = 0;
        clearInterval(fadeInterval);
        setIsPlaying(false);
      }
      setVolume(vol);
    }, 150); 

    setShowSafetyModal(false);
    setPhase(AppPhase.ENDING);
  };

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
    if (!isPlaying && volume < 0.1) setVolume(1);
  };

  const renderLanding = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-fade-in px-6">
      <button 
        onClick={handleStart}
        className="group relative px-12 py-6 overflow-hidden rounded-full border border-white/20 bg-black/40 backdrop-blur-md shadow-2xl transition-all duration-1000 hover:bg-white/10 hover:border-white/40 focus:outline-none cursor-pointer"
      >
        <div className="absolute inset-0 w-0 bg-white/5 transition-all duration-[800ms] ease-out group-hover:w-full"></div>
        <span className="relative text-xl md:text-2xl font-serif text-white tracking-[0.5em] font-light group-hover:tracking-[0.6em] transition-all duration-1000 block text-center">
          {TEXT_CONTENT.landing}
        </span>
      </button>
      
      {audioError && (
        <div className="absolute bottom-12 flex items-center space-x-2 text-white/40 text-[10px] tracking-widest font-serif">
          <AlertCircle className="w-3 h-3" />
          <span>( 远山寂寂，未闻余响。请检查音频文件是否存在 )</span>
        </div>
      )}
    </div>
  );

  const renderImmersion = () => (
    <div className="absolute inset-0 z-10 overflow-y-auto no-scrollbar animate-fade-in flex flex-col">
      {isAudioLoading && isPlaying && !audioError && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zen-white/60 backdrop-blur-sm pointer-events-none animate-fade-in">
          <Loader2 className="w-5 h-5 text-ink-gray/20 animate-spin mb-4" />
          <p className="text-xs font-serif text-ink-gray/40 tracking-[0.3em] animate-pulse">听山语...</p>
        </div>
      )}

      <div className="flex-grow flex flex-col justify-center items-center relative p-8 min-h-[85vh]">
        <div className="max-w-md w-full text-center flex flex-col items-center">
          {(TEXT_CONTENT.immersion as string[]).map((line, idx) => {
            if (line === "") return <div key={idx} className="h-10 md:h-12" />; 
            return (
              <p 
                key={idx}
                className="text-lg md:text-xl font-serif text-ink-gray leading-relaxed tracking-[0.2em] opacity-80 animate-float my-3" 
                style={{ animationDelay: `${idx * 0.4}s`, animationDuration: '12s' }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      <div className="pb-12 flex justify-center w-full opacity-0 animate-fade-in" style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
         <button 
           onClick={() => setShowSafetyModal(true)}
           className="flex flex-col items-center space-y-3 group cursor-pointer transition-opacity duration-700 opacity-40 hover:opacity-100"
         >
           <Leaf strokeWidth={1} className="w-4 h-4 text-ink-gray/50 group-hover:rotate-12 transition-transform duration-1000" />
           <span className="text-[10px] font-serif text-ink-gray/60 tracking-[0.3em] uppercase">
             {TEXT_CONTENT.product.entryLabel}
           </span>
         </button>
      </div>
    </div>
  );

  const renderEnding = () => (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center transition-all duration-[1500ms] bg-black/70 backdrop-blur-lg">
      <div className="bg-zen-white w-[92%] max-w-md p-10 md:p-14 shadow-2xl rounded-sm transition-all duration-1000 max-h-[80vh] overflow-y-auto no-scrollbar">
        <h2 className="text-left text-lg font-serif text-ink-gray tracking-[0.4em] mb-10 border-b border-zen-gray/50 pb-6 sticky top-0 bg-zen-white z-10">
          {TEXT_CONTENT.ending.title}
        </h2>
        
        {!showStory ? (
          <div 
            className="flex flex-col items-start cursor-pointer group w-full"
            onClick={() => setShowStory(true)}
          >
            <p className="text-lg text-left font-serif italic text-ink-gray/90 mb-8 leading-relaxed tracking-wide">
              {TEXT_CONTENT.ending.quote}
            </p>
            <div className="flex items-center space-x-4 animate-pulse opacity-40 group-hover:opacity-80 transition-opacity">
              <span className="text-[10px] tracking-[0.4em] text-ink-gray uppercase">阅读全文</span>
              <ChevronDown className="w-4 h-4 text-ink-gray" />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col items-start w-full">
            <div className="mb-10 w-full space-y-4">
               {(TEXT_CONTENT.ending.body as string[]).map((line, idx) => {
                 if (line === "") return <div key={idx} className="h-6" />;
                 return (
                   <p key={idx} className="text-sm md:text-base text-left font-serif text-ink-gray leading-loose tracking-[0.1em]">
                     {line}
                   </p>
                 );
               })}
            </div>
            <button className="w-full py-5 border border-ink-gray text-ink-gray font-serif tracking-[0.4em] hover:bg-ink-gray hover:text-zen-white transition-all duration-700 rounded-sm text-xs uppercase">
              {TEXT_CONTENT.ending.cta}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className={`relative w-full h-[100dvh] overflow-hidden select-none transition-colors duration-[2000ms] ease-in-out ${
        phase === AppPhase.LANDING ? 'bg-black' : 'bg-zen-white'
      }`}
    >
      <div className={`absolute inset-0 transition-opacity duration-[2500ms] ${phase === AppPhase.LANDING ? 'opacity-0' : 'opacity-100'}`}>
        <DynamicBackground />
      </div>

      <AudioPlayer 
        url={DEFAULT_AUDIO_URL} 
        isPlaying={isPlaying} 
        volume={volume} 
        onLoadingStatusChange={setIsAudioLoading}
        onError={() => setAudioError(true)}
      />

      <div className="absolute top-8 right-8 z-40 flex space-x-6 opacity-40 hover:opacity-100 transition-opacity duration-700">
        {phase !== AppPhase.ENDING && (
          <button onClick={toggleAudio} className="p-2">
            {isPlaying ? (
              <Volume2 strokeWidth={1.5} className={`w-4 h-4 ${phase === AppPhase.LANDING ? 'text-white' : 'text-ink-gray'}`} />
            ) : (
              <VolumeX strokeWidth={1.5} className={`w-4 h-4 ${phase === AppPhase.LANDING ? 'text-white' : 'text-ink-gray'}`} />
            )}
          </button>
        )}
      </div>

      {phase === AppPhase.LANDING && renderLanding()}
      {phase === AppPhase.IMMERSION && renderImmersion()}
      {phase === AppPhase.ENDING && renderEnding()}

      {/* Safety Modal Logic - Keep as is but with fixed Z-index */}
      {showSafetyModal && (
        <>
          <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-[4px] z-40 animate-fade-in"
              onClick={() => setShowSafetyModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-zen-white rounded-t-[2.5rem] shadow-2xl p-10 transform animate-fade-in max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowSafetyModal(false)} className="p-2 opacity-40 hover:opacity-100"><X className="w-5 h-5" /></button>
            </div>
            <h3 className="text-center font-serif text-lg text-ink-gray tracking-[0.2em] mb-12">
              {TEXT_CONTENT.product.modal.title}
            </h3>
            <p className="font-serif text-sm text-ink-gray leading-loose mb-8 text-justify">
              {TEXT_CONTENT.product.modal.origin.part1} <b>{TEXT_CONTENT.product.modal.origin.highlight}</b> {TEXT_CONTENT.product.modal.origin.part2}
            </p>
            <div className="space-y-4 mb-12">
              {TEXT_CONTENT.product.modal.ingredients.list.map((item, idx) => (
                <div key={idx} className="flex justify-between border-b border-zen-gray pb-2">
                  <span className="text-sm font-serif text-ink-gray">{item.name}</span>
                  <span className="text-[10px] font-serif text-ink-light italic">{item.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-ink-light italic">{TEXT_CONTENT.product.modal.footer}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
