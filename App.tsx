import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Settings, X, ChevronDown, Leaf } from 'lucide-react';
import { AppPhase } from './types';
import { TEXT_CONTENT, DEFAULT_AUDIO_URL, IMMERSION_DURATION } from './constants';
import DynamicBackground from './components/DynamicBackground';
import AudioPlayer from './components/AudioPlayer';

const App: React.FC = () => {
  // --- State ---
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LANDING);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState(DEFAULT_AUDIO_URL);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [tempAudioUrl, setTempAudioUrl] = useState(DEFAULT_AUDIO_URL);

  // Safety Modal State
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Ending State
  const [showStory, setShowStory] = useState(false);

  // Refs for timers
  const timerRef = useRef<number | null>(null);

  // --- Handlers ---

  const handleStart = () => {
    setPhase(AppPhase.IMMERSION);
    setIsPlaying(true);
    
    // Start the timer for the session
    timerRef.current = setTimeout(() => {
      handleSessionEnd();
    }, IMMERSION_DURATION);
  };

  const handleSessionEnd = () => {
    // Fade out audio over 5 seconds
    let vol = 1;
    const fadeInterval = setInterval(() => {
      vol -= 0.05;
      if (vol <= 0) {
        vol = 0;
        clearInterval(fadeInterval);
        setIsPlaying(false);
      }
      setVolume(vol);
    }, 250); // 20 steps * 250ms = 5000ms fade

    // Close any open modals
    setShowSafetyModal(false);
    setShowSettings(false);
    
    setPhase(AppPhase.ENDING);
  };

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
    // Reset volume if toggling back on
    if (!isPlaying && volume < 0.1) setVolume(1);
  };

  const updateAudioUrl = () => {
    setAudioUrl(tempAudioUrl);
    setShowSettings(false);
  };

  // --- Render Helpers ---

  // Landing Page
  const renderLanding = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-fade-in">
      <button 
        onClick={handleStart}
        className="group relative px-10 py-5 overflow-hidden rounded-full border border-white/30 bg-black/30 backdrop-blur-sm shadow-sm transition-all duration-700 hover:bg-white/10 hover:shadow-md hover:border-white/50 focus:outline-none cursor-pointer"
      >
        <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-[500ms] ease-out group-hover:w-full"></div>
        <span className="relative text-xl md:text-2xl font-serif text-white tracking-[0.4em] font-light group-hover:tracking-[0.5em] transition-all duration-700 block text-center">
          {TEXT_CONTENT.landing}
        </span>
      </button>
    </div>
  );

  // Immersion Page
  const renderImmersion = () => (
    <div className="absolute inset-0 z-10 overflow-y-auto scroll-smooth no-scrollbar animate-fade-in flex flex-col">
      {/* Screen 1: Poem & Mood (Expanded to take up most space) */}
      <div className="flex-grow flex flex-col justify-center items-center relative p-8 min-h-[80vh]">
        <div className="max-w-md w-full text-center flex flex-col items-center">
          {(TEXT_CONTENT.immersion as string[]).map((line, idx) => {
            if (line === "") {
              return <div key={idx} className="h-8 md:h-10" />; // Spacer
            }
            return (
              <p 
                key={idx}
                className="text-lg md:text-xl font-serif text-ink-gray leading-relaxed tracking-[0.15em] opacity-90 animate-float my-2" 
                style={{ animationDelay: `${idx * 0.3}s` }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Minimal Entry for Safety Info */}
      <div className="pb-16 flex justify-center w-full opacity-0 animate-fade-in" style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
         <button 
           onClick={() => setShowSafetyModal(true)}
           className="flex flex-col items-center space-y-2 group cursor-pointer transition-opacity duration-500 opacity-60 hover:opacity-100"
         >
           {/* Simple Icon (Feather/Leaf concept) */}
           <Leaf strokeWidth={1} className="w-4 h-4 text-ink-gray/60" />
           <span className="text-xs font-serif text-ink-gray/80 tracking-[0.2em] border-b border-transparent group-hover:border-ink-gray/30 pb-0.5 transition-all">
             {TEXT_CONTENT.product.entryLabel}
           </span>
         </button>
      </div>
    </div>
  );

  // Safety Bottom Sheet Modal
  const renderSafetyModal = () => {
    return (
      <>
        {/* Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-500 ${showSafetyModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setShowSafetyModal(false)}
        />
        
        {/* Bottom Sheet */}
        <div 
          className={`fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transform transition-transform duration-500 ease-out flex flex-col max-h-[85vh] overflow-hidden ${showSafetyModal ? 'translate-y-0' : 'translate-y-full'}`}
        >
          {/* Header / Close */}
          <div className="flex justify-end p-6 pb-2">
            <button onClick={() => setShowSafetyModal(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors">
              <X className="w-5 h-5 text-ink-light" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="px-8 pb-12 overflow-y-auto scroll-smooth no-scrollbar">
            <h3 className="text-center font-serif text-lg text-ink-gray tracking-[0.15em] mb-10">
              {TEXT_CONTENT.product.modal.title}
            </h3>

            {/* Section 1: Origin */}
            <div className="mb-10 text-center space-y-6">
              <span className="block text-xs font-serif text-ink-light tracking-[0.2em] mb-4">
                {TEXT_CONTENT.product.modal.origin.title}
              </span>
              <p className="font-serif text-sm md:text-base text-ink-gray leading-loose text-justify md:text-center">
                {TEXT_CONTENT.product.modal.origin.part1}
                <span className="mx-1 text-[#8C7A6B] font-medium">
                  {TEXT_CONTENT.product.modal.origin.highlight}
                </span>
                {TEXT_CONTENT.product.modal.origin.part2}
              </p>
              <p className="font-serif text-sm md:text-base text-ink-gray leading-loose text-justify md:text-center">
                {TEXT_CONTENT.product.modal.origin.part3}
              </p>
            </div>

            {/* Section 2: Detailed Ingredients (New) */}
            <div className="mb-10 text-center">
               <span className="block text-xs font-serif text-ink-light tracking-[0.2em] mb-6">
                {TEXT_CONTENT.product.modal.ingredients.title}
              </span>
              <div className="flex flex-col space-y-3 items-center">
                {TEXT_CONTENT.product.modal.ingredients.list.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 text-sm font-serif">
                        <span className="text-ink-gray font-medium tracking-wide">{item.name}</span>
                        <span className="hidden md:inline text-ink-gray/30">|</span>
                        <span className="text-ink-gray/70 tracking-wider text-xs md:text-sm italic">{item.desc}</span>
                    </div>
                ))}
              </div>
            </div>

            {/* Visual Separator */}
            <div className="w-12 h-[1px] bg-ink-gray/20 mx-auto mb-10"></div>

            {/* Section 3: Reminder */}
            <div className="mb-12 text-center">
               <span className="block text-xs font-serif text-ink-light tracking-[0.2em] mb-4">
                {TEXT_CONTENT.product.modal.reminder.title}
              </span>
              <p className="font-serif text-sm md:text-base text-ink-gray leading-loose">
                {TEXT_CONTENT.product.modal.reminder.text}
              </p>
            </div>

            {/* Footer Warning */}
            <div className="text-center">
               <p className="text-[10px] text-ink-light/50 font-serif tracking-wider">
                 {TEXT_CONTENT.product.modal.footer}
               </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Ending Page
  const renderEnding = () => (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center transition-all duration-1000 bg-black/40 backdrop-blur-sm">
      
      {/* Central Module */}
      <div className="bg-zen-white w-[90%] max-w-lg p-8 md:p-12 shadow-2xl rounded-sm transition-all duration-700 max-h-[85vh] overflow-y-auto no-scrollbar">
        <h2 className="text-left text-xl font-serif text-ink-gray tracking-[0.3em] mb-8 border-b border-zen-gray pb-4 sticky top-0 bg-zen-white z-10">
          {TEXT_CONTENT.ending.title}
        </h2>
        
        {!showStory ? (
          <div 
            className="flex flex-col items-start cursor-pointer group w-full"
            onClick={() => setShowStory(true)}
          >
            <p className="text-lg text-left font-serif italic text-ink-gray mb-6 leading-relaxed">
              {TEXT_CONTENT.ending.quote}
            </p>
            <div className="mt-4 animate-bounce opacity-60 self-center md:self-start">
              <ChevronDown className="w-6 h-6 text-ink-gray" />
            </div>
            <span className="text-xs tracking-widest text-ink-light mt-2 group-hover:text-ink-gray transition-colors self-center md:self-start">
              阅读制香故事
            </span>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col items-start w-full">
            <div className="mb-8 w-full">
               {(TEXT_CONTENT.ending.body as string[]).map((line, idx) => {
                 if (line === "") return <div key={idx} className="h-6" />;
                 return (
                   <p key={idx} className="text-base text-left font-serif text-ink-gray leading-loose tracking-wide my-1">
                     {line}
                   </p>
                 );
               })}
            </div>
            <button className="w-full py-4 bg-ink-gray text-zen-white font-serif tracking-widest hover:bg-black transition-colors duration-500 rounded-sm">
              {TEXT_CONTENT.ending.cta}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Settings Modal
  const renderSettings = () => {
    if (!showSettings) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-md shadow-xl w-[90%] max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-ink-gray">音频设置</h3>
            <button onClick={() => setShowSettings(false)}><X className="w-5 h-5 text-ink-light" /></button>
          </div>
          <div className="space-y-4">
            <label className="block text-xs text-ink-light uppercase tracking-wide">音频链接 (MP3/OGG)</label>
            <input 
              type="text" 
              value={tempAudioUrl}
              onChange={(e) => setTempAudioUrl(e.target.value)}
              className="w-full p-2 border border-zen-gray text-sm text-ink-gray focus:outline-none focus:border-ink-gray rounded-sm bg-zen-white"
            />
            <button 
              onClick={updateAudioUrl}
              className="w-full py-2 bg-ink-gray text-white text-sm tracking-wide rounded-sm"
            >
              更新音频
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`relative w-full h-[100dvh] overflow-hidden select-none transition-colors duration-[1500ms] ease-in-out ${
        phase === AppPhase.LANDING ? 'bg-black' : 'bg-zen-white'
      }`}
    >
      {/* Background Layer: Only visible in Immersion/Ending */}
      <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${phase === AppPhase.LANDING ? 'opacity-0' : 'opacity-100'}`}>
        <DynamicBackground />
      </div>

      <AudioPlayer url={audioUrl} isPlaying={isPlaying} volume={volume} />

      {/* Top Controls (Only visible in immersion phase or landing) */}
      <div className="absolute top-6 right-6 z-40 flex space-x-4 opacity-60 hover:opacity-100 transition-opacity">
        {phase !== AppPhase.ENDING && (
            <>
                <button onClick={() => setShowSettings(true)} className="p-2 transition-transform hover:rotate-90">
                <Settings className={`w-5 h-5 ${phase === AppPhase.LANDING ? 'text-white' : 'text-ink-gray'}`} />
                </button>
                <button onClick={toggleAudio} className="p-2">
                {isPlaying ? (
                    <Volume2 className={`w-5 h-5 ${phase === AppPhase.LANDING ? 'text-white' : 'text-ink-gray'}`} />
                ) : (
                    <VolumeX className={`w-5 h-5 ${phase === AppPhase.LANDING ? 'text-white' : 'text-ink-gray'}`} />
                )}
                </button>
            </>
        )}
      </div>

      {/* Main Content Switcher */}
      {phase === AppPhase.LANDING && renderLanding()}
      {phase === AppPhase.IMMERSION && renderImmersion()}
      {phase === AppPhase.ENDING && renderEnding()}

      {/* Modals */}
      {renderSettings()}
      {renderSafetyModal()}
    </div>
  );
};

export default App;