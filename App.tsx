
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, Leaf, Loader2, AlertCircle, ChevronRight, Send, Check, Users, ArrowLeft, Heart, Sparkles, Quote } from 'lucide-react';
import { AppPhase } from './types';
import { TEXT_CONTENT, DEFAULT_AUDIO_URL, TRANSITION_AUDIO_URL, IMMERSION_DURATION, MOOD_OPTIONS, CONTEXT_OPTIONS } from './constants';
import DynamicBackground from './components/DynamicBackground';
import AudioPlayer from './components/AudioPlayer';
import Ritual from './components/Ritual';
import Dashboard from './components/Dashboard';
import { GeminiService, TreeholeResult } from './components/GeminiService';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LANDING);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  
  // AI States
  const [dailySign, setDailySign] = useState<string>("");
  
  // Treehole Multi-step State
  const [treeholeStep, setTreeholeStep] = useState<0 | 1 | 2>(0); 
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [userText, setUserText] = useState("");
  
  // New structured result state
  const [aiResult, setAiResult] = useState<TreeholeResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Social Proof State
  const [residentCount, setResidentCount] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Pre-fetch Sign when entering Ritual
  useEffect(() => {
    if (phase === AppPhase.RITUAL) {
        GeminiService.getDailySign().then(setDailySign);
    }
  }, [phase]);

  // Generate random resident count once when entering Treehole
  useEffect(() => {
    if (phase === AppPhase.TREEHOLE && residentCount === 0) {
        setResidentCount(Math.floor(Math.random() * (500 - 120 + 1)) + 120);
    }
  }, [phase]);

  // Triggered instantly when user pours tea to 100% (User Interaction Context)
  const primeAudio = () => {
      // Start playing silently
      setVolume(0);
      setIsPlaying(true);
  };

  const handleRitualComplete = () => {
    // 1. Play transition sound
    const transitionAudio = new Audio(TRANSITION_AUDIO_URL);
    transitionAudio.volume = 0.9;
    transitionAudio.play().catch(console.warn);

    // 2. Transition
    setPhase(AppPhase.IMMERSION);
    
    // 3. Fade in the background music (which was primed at volume 0)
    let currentVol = 0;
    const fadeInterval = setInterval(() => {
        currentVol += 0.05;
        if (currentVol >= 1) {
            currentVol = 1;
            clearInterval(fadeInterval);
        }
        setVolume(currentVol);
    }, 100);

    startImmersionTimer();
  };

  const startImmersionTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        handleSessionEnd();
      }, IMMERSION_DURATION);
  };

  // Called when timer ends naturally
  const handleSessionEnd = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }

    // Fade out audio
    let currentVol = volume;
    const fadeInterval = setInterval(() => {
      currentVol -= 0.05;
      if (currentVol <= 0) {
        currentVol = 0;
        clearInterval(fadeInterval);
        setIsPlaying(false);
      }
      setVolume(currentVol);
    }, 100); 

    setShowSafetyModal(false);
    setPhase(AppPhase.TREEHOLE);
  };

  // Called when user manually clicks Heart to record mood
  const handleManualMoodEntry = () => {
      // Clear timer so it doesn't interrupt the user later, 
      // but keep music playing as requested
      if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
      }
      setShowSafetyModal(false);
      setPhase(AppPhase.TREEHOLE);
      // NOTE: We do NOT stop isPlaying here
  };

  const handleBackToImmersion = () => {
      setPhase(AppPhase.IMMERSION);
      // Optionally restart timer if we want to enforce the 10min rule again,
      // or just let them chill indefinitely. Let's restart to be safe.
      startImmersionTimer();
  };

  const handleMoodSelect = (moodLabel: string) => {
      setSelectedMood(moodLabel);
      setTimeout(() => setTreeholeStep(1), 300);
  };

  const handleContextSelect = (ctx: string) => {
      setSelectedContext(ctx);
      setTimeout(() => setTreeholeStep(2), 300);
  };

  const handleFinalSubmit = async () => {
      setIsGenerating(true);
      const result = await GeminiService.getTreeHoleReply(selectedMood, selectedContext, userText);
      setAiResult(result);
      setIsGenerating(false);
  };

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
    if (!isPlaying && volume < 0.1) setVolume(1);
  };

  const handleDashboardScenarioClick = (id: string) => {
    if (id === 'relax') {
        // Reset states for a fresh session
        setVolume(1);
        setIsPlaying(false);
        setTreeholeStep(0);
        setSelectedMood("");
        setSelectedContext("");
        setUserText("");
        setAiResult(null);
        // Navigate to Ritual
        setPhase(AppPhase.RITUAL);
    }
  };

  // --- RENDERERS ---

  const renderLanding = () => (
      <Ritual onComplete={handleRitualComplete} onPrimeAudio={primeAudio} />
  );

  const renderImmersion = () => (
    <div className="absolute inset-0 z-30 overflow-y-auto no-scrollbar animate-fade-in flex flex-col font-sans">
      {isAudioLoading && isPlaying && !audioError && volume > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/30 backdrop-blur-md pointer-events-none animate-fade-in">
          <Loader2 className="w-8 h-8 text-dopamine-orange animate-spin mb-4" />
          <p className="text-xs font-bold text-ink-light tracking-[0.3em] animate-pulse">调频中...</p>
        </div>
      )}

      <div className="flex-grow flex flex-col justify-center items-center relative p-8 pt-[12vh] min-h-[90vh]">
        <div className="max-w-md w-full text-center flex flex-col items-center mix-blend-multiply">
          {(TEXT_CONTENT.immersion as string[]).map((line, idx) => {
            if (line === "") return <div key={idx} className="h-8 md:h-10" />; 
            return (
              <p 
                key={idx}
                className="text-lg md:text-xl font-serif text-ink-gray leading-relaxed tracking-[0.25em] opacity-90 animate-float my-3 drop-shadow-sm" 
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
           className="flex flex-col items-center space-y-3 group cursor-pointer transition-opacity duration-700 opacity-60 hover:opacity-100"
         >
           <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
             <Leaf strokeWidth={2} className="w-5 h-5 text-dopamine-green group-hover:rotate-12 transition-transform duration-500" />
           </div>
           <span className="text-[10px] font-bold text-ink-light tracking-[0.2em] uppercase bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
             {TEXT_CONTENT.product.entryLabel}
           </span>
         </button>
      </div>
    </div>
  );

  const renderTreehole = () => {
    return (
      <div className="fixed inset-0 z-50 bg-black/5 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in font-sans">
          
          {/* Main Card Container with Glassmorphism */}
          <div className="bg-white/80 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col relative transition-all duration-500 overflow-hidden min-h-[65vh] border border-white/60">
              
              {/* Soft Color Splash Top */}
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-dopamine-orange/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-dopamine-blue/20 rounded-full blur-3xl pointer-events-none" />

              {/* Progress Bar */}
              {!aiResult && (
                  <div className="flex justify-center space-x-2 mt-8 mb-4 relative z-10">
                      {[0, 1, 2].map(step => (
                          <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ease-spring ${treeholeStep >= step ? 'w-8 bg-dopamine-orange' : 'w-2 bg-gray-200'}`} />
                      ))}
                  </div>
              )}

              {/* Content Area */}
              <div className="flex-1 flex flex-col px-8 pb-8 relative z-10 overflow-y-auto no-scrollbar">
                  
                  {/* Step 0: Mood Selection */}
                  {treeholeStep === 0 && (
                      <div className="animate-fade-in flex flex-col h-full justify-center">
                          {/* Back Button specifically for Manual Entry from Immersion */}
                          {isPlaying && (
                            <button onClick={handleBackToImmersion} className="absolute top-0 left-6 p-2 text-ink-light hover:text-ink-gray transition-colors bg-white/50 rounded-full shadow-sm">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                          )}

                          <h3 className="text-center font-bold text-ink-gray text-2xl mb-2">此刻心情</h3>
                          <p className="text-center text-ink-light text-sm mb-10 font-medium bg-white/50 w-fit mx-auto px-4 py-1 rounded-full backdrop-blur-sm">把心事交给小屿，没关系的</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                              {MOOD_OPTIONS.map((mood) => (
                                  <button
                                      key={mood.id}
                                      onClick={() => handleMoodSelect(mood.label)}
                                      className={`
                                        group relative p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 transition-all duration-300 transform hover:scale-[1.05] active:scale-95 border border-transparent
                                        ${selectedMood === mood.label ? mood.style + ' shadow-lg border-white/50' : 'bg-white/60 text-gray-400 hover:bg-white hover:shadow-md'}
                                      `}
                                  >
                                      <span className="text-4xl transition-transform duration-300 group-hover:-translate-y-1 drop-shadow-sm">{mood.icon}</span>
                                      <span className="text-sm font-bold tracking-wide">{mood.label}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Step 1: Context Selection */}
                  {treeholeStep === 1 && (
                      <div className="animate-fade-in flex flex-col h-full justify-center">
                           <button onClick={() => setTreeholeStep(0)} className="absolute top-0 left-6 p-2 text-ink-light hover:text-ink-gray transition-colors bg-white/50 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                           </button>

                           <h3 className="text-center font-bold text-ink-gray text-2xl mb-2">因为什么呢？</h3>
                           <p className="text-center text-ink-light text-sm mb-8 font-medium">找到源头，才能更好的抱抱你</p>
                           
                           <div className="flex items-center justify-center space-x-2 text-ink-light mb-10 opacity-90 bg-orange-50/80 py-2 px-5 rounded-full mx-auto w-fit border border-orange-100 shadow-sm">
                                <Users className="w-3.5 h-3.5 text-dopamine-orange" />
                                <span className="text-xs font-bold text-dopamine-orange">
                                    {Math.floor(residentCount / 3)} 人此刻与你共鸣
                                </span>
                           </div>

                           <div className="flex flex-wrap justify-center gap-3">
                               {CONTEXT_OPTIONS.map((ctx) => (
                                   <button
                                       key={ctx}
                                       onClick={() => handleContextSelect(ctx)}
                                       className={`px-6 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all duration-300 hover:-translate-y-1 active:scale-95 ${selectedContext === ctx ? 'bg-ink-gray text-white border-ink-gray shadow-xl shadow-gray-200' : 'border-transparent text-ink-light bg-white/80 hover:bg-white hover:shadow-md'}`}
                                   >
                                       {ctx}
                                   </button>
                               ))}
                           </div>
                      </div>
                  )}

                  {/* Step 2: Text Input & Result */}
                  {treeholeStep === 2 && (
                      <div className="animate-fade-in h-full flex flex-col justify-center">
                          {aiResult ? (
                               <div className="flex flex-col items-center flex-1 h-full py-2 space-y-4">
                                    
                                    {/* Main Healing Letter */}
                                    <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-6 rounded-[2rem] w-full relative shadow-lg shadow-orange-100/50 flex flex-col animate-fade-in">
                                        <div className="absolute -top-3 left-6 bg-white p-1.5 rounded-2xl shadow-sm text-xl border border-gray-50">💌</div>
                                        <h4 className="font-bold text-ink-gray text-sm mb-2 opacity-80">小屿的回信：</h4>
                                        <p className="font-serif text-ink-gray text-base leading-relaxed text-justify relative z-10 font-medium">
                                            {aiResult.reply}
                                        </p>
                                    </div>
                                    
                                    {/* Similar Story / Social Proof - Updated Design */}
                                    <div className="bg-white/60 backdrop-blur-sm border border-white/60 p-5 rounded-[1.5rem] w-full relative animate-fade-in flex flex-col" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-dopamine-blue" />
                                            <h4 className="font-bold text-dopamine-blue text-xs tracking-wide">远方的回响</h4>
                                        </div>
                                        <div className="relative pl-3 border-l-2 border-dopamine-blue/20">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold text-dopamine-blue bg-dopamine-blue/10 px-2 py-0.5 rounded-md">
                                                    @{aiResult.nickname}
                                                </span>
                                            </div>
                                            <p className="text-xs text-ink-light leading-relaxed italic text-justify">
                                                "{aiResult.story}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1"></div>
                                    
                                    <button 
                                        onClick={() => setPhase(AppPhase.DASHBOARD)}
                                        className="w-full bg-ink-gray text-white py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-black transition-all shadow-xl shadow-gray-300 hover:scale-[1.02] active:scale-95"
                                    >
                                        <span>带着能量出发</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                               </div>
                          ) : (
                              <>
                                  <button onClick={() => setTreeholeStep(1)} className="absolute top-0 left-6 p-2 text-ink-light hover:text-ink-gray transition-colors bg-white/50 rounded-full">
                                        <ArrowLeft className="w-5 h-5" />
                                  </button>
                                  
                                  <div className="flex items-center space-x-2 mb-6 justify-center mt-2">
                                      <span className="text-xs font-bold bg-dopamine-orange/10 text-dopamine-orange px-3 py-1 rounded-full border border-orange-100">{selectedMood}</span>
                                      <span className="text-xs text-gray-300">+</span>
                                      <span className="text-xs font-bold bg-white text-ink-gray px-3 py-1 rounded-full border border-gray-100">{selectedContext}</span>
                                  </div>
                                  
                                  <h3 className="text-center font-bold text-ink-gray text-xl mb-3">还有想说的吗？</h3>
                                  <p className="text-center text-xs text-ink-light mb-4">（悄悄告诉小屿，风会带走烦恼）</p>
                                  
                                  <textarea
                                    value={userText}
                                    onChange={(e) => setUserText(e.target.value)}
                                    placeholder="可以不写哦，小屿懂你的..."
                                    className="w-full bg-gray-50/50 border-0 focus:bg-white focus:ring-2 focus:ring-orange-100 rounded-3xl p-6 text-ink-gray focus:outline-none text-center resize-none h-32 placeholder:text-ink-light/40 placeholder:font-medium transition-all shadow-inner mb-4"
                                  />

                                  <div className="flex justify-center mt-4">
                                      <button 
                                        onClick={handleFinalSubmit}
                                        disabled={isGenerating}
                                        className="w-20 h-20 rounded-full bg-gradient-to-tr from-dopamine-orange to-amber-400 text-white flex items-center justify-center hover:shadow-orange-200 transition-all disabled:opacity-50 shadow-xl hover:scale-110 active:scale-90 group"
                                      >
                                          {isGenerating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                      </button>
                                  </div>
                              </>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none bg-[#F5F5F7]">
        
      {/* Dynamic Background is now ALWAYS visible and light */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-1000 opacity-100`}>
        <DynamicBackground />
      </div>

      <AudioPlayer 
        url={DEFAULT_AUDIO_URL} 
        // Allow playing in RITUAL phase if explicitly triggered (for preloading)
        isPlaying={isPlaying && (phase === AppPhase.RITUAL || phase === AppPhase.IMMERSION || phase === AppPhase.TREEHOLE)} 
        volume={volume} 
        onLoadingStatusChange={setIsAudioLoading}
        onError={() => setAudioError(true)}
      />

      {/* Early Exit Button (Left Top) - CHANGED to Heart for Mood Entry */}
      {phase === AppPhase.IMMERSION && (
         <div className="absolute top-10 left-10 z-50 opacity-40 hover:opacity-100 transition-opacity duration-1000">
            <button onClick={handleManualMoodEntry} className="p-3 bg-white/40 backdrop-blur-md rounded-full hover:bg-white transition-colors group">
                <Heart strokeWidth={2} className="w-5 h-5 text-ink-gray group-hover:text-dopamine-pink group-hover:fill-dopamine-pink transition-colors" />
            </button>
        </div>
      )}

      {/* Control Overlay (Right Top) */}
      {phase === AppPhase.IMMERSION && (
         <div className="absolute top-10 right-10 z-50 opacity-40 hover:opacity-100 transition-opacity duration-1000">
            <button onClick={toggleAudio} className="p-3 bg-white/40 backdrop-blur-md rounded-full hover:bg-white transition-colors">
            {isPlaying ? (
                <Volume2 strokeWidth={2} className="w-5 h-5 text-ink-gray" />
            ) : (
                <VolumeX strokeWidth={2} className="w-5 h-5 text-ink-gray" />
            )}
            </button>
        </div>
      )}

      {/* Main Content Switcher */}
      {(phase === AppPhase.LANDING || phase === AppPhase.RITUAL) && renderLanding()}
      {phase === AppPhase.IMMERSION && renderImmersion()}
      {phase === AppPhase.TREEHOLE && renderTreehole()}
      {phase === AppPhase.DASHBOARD && <Dashboard onScenarioClick={handleDashboardScenarioClick} />}

      {/* Product Modal */}
      {showSafetyModal && (
        <>
          <div 
              className="fixed inset-0 bg-ink-gray/20 backdrop-blur-sm z-[60] animate-fade-in"
              onClick={() => setShowSafetyModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-surface-white/95 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] p-12 transform animate-fade-in max-h-[85vh] overflow-y-auto no-scrollbar font-sans border-t border-white/60">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowSafetyModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-ink-gray" /></button>
            </div>
            <h3 className="text-center font-bold text-2xl text-ink-gray mb-10 flex items-center justify-center gap-2">
              <Leaf className="w-6 h-6 text-dopamine-green" />
              {TEXT_CONTENT.product.modal.title}
            </h3>
            <p className="font-medium text-base text-ink-gray leading-loose mb-10 text-justify opacity-80">
              {TEXT_CONTENT.product.modal.origin.part1} <b className="text-dopamine-green bg-green-50 px-1 rounded">{TEXT_CONTENT.product.modal.origin.highlight}</b> {TEXT_CONTENT.product.modal.origin.part2}
            </p>
            <div className="space-y-4 mb-14">
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
        </>
      )}
    </div>
  );
};

export default App;
