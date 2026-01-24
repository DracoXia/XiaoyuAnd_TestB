import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, Leaf, Loader2, AlertCircle, ChevronRight, Send, Check, Users, ArrowLeft, ArrowRight, Heart, Sparkles, Quote, Sun, CloudRain, Wind, MessageCircleHeart, AlignLeft, Feather, Plus, Zap } from 'lucide-react';
import { AppPhase } from './types';
import { TEXT_CONTENT, DEFAULT_AUDIO_URL, TRANSITION_AUDIO_URL, IMMERSION_DURATION, MOOD_OPTIONS, CONTEXT_OPTIONS, AMBIANCE_MODES, FRAGRANCE_LIST, MOCK_ECHOES } from './constants';
import DynamicBackground from './components/DynamicBackground';
import AudioPlayer from './components/AudioPlayer';
import Ritual from './components/Ritual';
import Dashboard from './components/Dashboard';
import { GeminiService, TreeholeResult } from './components/GeminiService';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LANDING);
  
  // Transition Control States
  const [showRitualLayer, setShowRitualLayer] = useState(true); // Is Ritual component mounted?
  const [fadeRitual, setFadeRitual] = useState(false); // Should Ritual component fade opacity to 0?

  // Audio State
  const [currentAudioUrl, setCurrentAudioUrl] = useState(DEFAULT_AUDIO_URL);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [volume, setVolume] = useState(1);
  
  // Fragrance & Ambiance State
  // Default to the first owned fragrance
  const [activeFragranceId, setActiveFragranceId] = useState(FRAGRANCE_LIST[0].id);
  const [activeAmbianceId, setActiveAmbianceId] = useState('default');
  
  // Ref to track volume in closures (fixes stale closure bug in timers)
  const volumeRef = useRef(1);

  // AI States
  const [dailySign, setDailySign] = useState<string>("");
  
  // Treehole Multi-step State
  const [treeholeStep, setTreeholeStep] = useState<0 | 1>(0); 
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedContext, setSelectedContext] = useState<string>("");
  
  // User Medicine Input
  const [healingText, setHealingText] = useState("");
  const [isSubmittingMedicine, setIsSubmittingMedicine] = useState(false);
  const [myMedicine, setMyMedicine] = useState<{content: string, date: string} | null>(null);
  
  // New structured result state
  const [aiResult, setAiResult] = useState<TreeholeResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Echo Waterfall State
  const [echoes, setEchoes] = useState(MOCK_ECHOES);
  
  // --- Waterfall Connectivity Effect State ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Replaced activeCardId with a Set of visited IDs for persistent lighting
  const [visitedCardIds, setVisitedCardIds] = useState<Set<string>>(new Set());
  const [pathPoints, setPathPoints] = useState<{x: number, y: number}[]>([]);
  
  // Transition Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Refs to store DOM elements for line calculation
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dotRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Social Proof State
  const [residentCount, setResidentCount] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Sync ref with state
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Pre-fetch Sign when entering Ritual
  useEffect(() => {
    if (phase === AppPhase.RITUAL || phase === AppPhase.LANDING) {
        GeminiService.getDailySign().then(setDailySign);
    }
  }, [phase]);

  // Generate random resident count once when entering Treehole
  useEffect(() => {
    if (phase === AppPhase.TREEHOLE && residentCount === 0) {
        setResidentCount(Math.floor(Math.random() * (1500 - 800 + 1)) + 800);
    }
  }, [phase]);

  // --- Waterfall Scroll Logic ---
  useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container || !aiResult) return; 

      // REMOVED: The logic that automatically added cards to visitedCardIds on scroll.
      // Now, connections are strictly based on User Actions (Clicking Heart) or Submission.
      // We only keep the listener to trigger line re-draws if layout shifts (though usually not needed for pure scroll if SVG scrolls with content).
      
      const handleScroll = () => {
          // Placeholder for any future scroll effects (e.g. parallax)
          // Currently empty to fix the "slide lights up everything" bug.
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
  }, [aiResult, myMedicine]); 

  // --- Calculate Line Path (The Flow) ---
  useEffect(() => {
      // Re-calculate the SVG path whenever visited cards change
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const points: {x: number, y: number, id: string}[] = [];

      visitedCardIds.forEach(id => {
          const dotEl = dotRefs.current.get(id);
          if (dotEl) {
              const dotRect = dotEl.getBoundingClientRect();
              // Calculate relative to scroll container content
              const relX = dotRect.left - containerRect.left + (dotRect.width / 2);
              const relY = dotRect.top - containerRect.top + (dotRect.height / 2) + container.scrollTop;
              points.push({ x: relX, y: relY, id });
          }
      });

      // Sort points by Y position so the line flows down (waterfall style)
      // This ensures that even if I like the bottom card then top card, the line flows Top -> Bottom
      points.sort((a, b) => a.y - b.y);

      setPathPoints(points);

  }, [visitedCardIds, aiResult, echoes]); // Recalc when visited set changes or UI updates

  const handleFragranceChange = (id: string) => {
      setActiveFragranceId(id);
      // Optional: Change audio URL based on fragrance if defined
      const frag = FRAGRANCE_LIST.find(f => f.id === id);
      if (frag && frag.audioUrl) {
          setCurrentAudioUrl(frag.audioUrl);
      }
  };

  // --- NEW: Handle Start of Interaction on Ritual Page ---
  const handleRitualInteractionStart = () => {
      if (!isPlaying) {
          setVolume(0); // Ensure silence
          setIsPlaying(true); // Start the stream (Unlock Audio Context)
      }
  };

  const handleRitualComplete = () => {
    const transitionAudio = new Audio(TRANSITION_AUDIO_URL);
    transitionAudio.volume = 0.9;
    transitionAudio.play().catch(console.warn);

    setPhase(AppPhase.IMMERSION);
    setFadeRitual(true);

    let currentVol = 0;
    const fadeInterval = setInterval(() => {
        currentVol += 0.05;
        if (currentVol >= 1) {
            currentVol = 1;
            clearInterval(fadeInterval);
        }
        setVolume(currentVol);
    }, 100);

    setTimeout(() => {
        setShowRitualLayer(false);
    }, 3000); 

    startImmersionTimer();
  };

  const startImmersionTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        handleSessionEnd();
      }, IMMERSION_DURATION);
  };

  const handleSessionEnd = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }

    let currentVol = volumeRef.current;
    
    const fadeInterval = setInterval(() => {
      currentVol -= 0.05;
      if (currentVol <= 0) {
        currentVol = 0;
        clearInterval(fadeInterval);
        setIsPlaying(false);
      }
      setVolume(currentVol);
    }, 100); 
    
    setTimeout(() => {
        setPhase(AppPhase.TREEHOLE);
    }, 1500);
  };

  const handleManualMoodEntry = () => {
      if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
      }
      setPhase(AppPhase.TREEHOLE);
  };

  const handleMoodSelect = (moodLabel: string) => {
      setSelectedMood(moodLabel);
      setTimeout(() => setTreeholeStep(1), 300);
  };

  // Step 1: Context Selection -> Triggers AI immediately (Skipping Venting Input)
  const handleContextSelect = async (ctx: string) => {
      setSelectedContext(ctx);
      setIsGenerating(true);
      // Generate result immediately
      const result = await GeminiService.getTreeHoleReply(selectedMood, ctx);
      setAiResult(result);
      setIsGenerating(false);
  };

  // Handle Healing Medicine Submission
  const handleMedicineSubmit = async () => {
      if (!healingText.trim()) return;
      setIsSubmittingMedicine(true);
      
      const isValid = await GeminiService.validateHealingContent(healingText);
      
      if (isValid) {
          // Success: Add to local state
          const newId = 'my-new';
          setMyMedicine({
              content: healingText,
              date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          
          // Add to echoes list
          setEchoes(prev => [{
              id: newId,
              content: healingText,
              nickname: "我",
              hugs: 0,
              isLiked: false
          }, ...prev]);

          // Case 2 Trigger: Auto-light "My Medicine" card immediately
          // This starts the "Waterfall" flow.
          // Because the user submitted, "my-new" is added.
          // The line will now draw from "my-new" (Top) to any ALREADY liked cards (Bottom).
          setVisitedCardIds(prev => new Set(prev).add(newId));

          setHealingText("");
      } else {
          alert("抱抱你。试着多描述一下那个治愈你的具体画面吧，比如热茶、夕阳...");
      }
      setIsSubmittingMedicine(false);
  };

  const handleHug = (id: string) => {
      // 1. Update visual count and state
      setEchoes(prev => prev.map(e => {
          if (e.id === id) {
              return { 
                  ...e, 
                  isLiked: true,
                  hugs: (e.hugs || 0) + 1 
              };
          }
          return e;
      }));

      // 2. Case 1 Trigger: Clicking 'Hug' manually lights up the card
      // This works BOTH before and after submission.
      setVisitedCardIds(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
      });
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
    if (!isPlaying && volume < 0.1) setVolume(1);
  };

  const handleDashboardScenarioClick = (id: string) => {
    if (id === 'relax') {
        setVolume(1);
        setIsPlaying(false);
        setTreeholeStep(0);
        setSelectedMood("");
        setSelectedContext("");
        setHealingText("");
        setMyMedicine(null);
        setAiResult(null);
        setActiveAmbianceId('default');
        setCurrentAudioUrl(DEFAULT_AUDIO_URL);
        setShowSummaryModal(false); // Reset
        
        // Reset Waterfall State
        setVisitedCardIds(new Set()); 
        setPathPoints([]);
        
        setShowRitualLayer(true);
        setFadeRitual(false);
        
        setPhase(AppPhase.RITUAL);
    }
  };

  const handleAmbianceChange = (e: React.MouseEvent, modeId: string) => {
      e.stopPropagation();
      const mode = AMBIANCE_MODES.find(m => m.id === modeId);
      if (mode) {
          setActiveAmbianceId(modeId);
          if (currentAudioUrl !== mode.audioUrl) {
              setCurrentAudioUrl(mode.audioUrl);
          }
      }
  };

  const handleFinishJourney = () => {
    // If no interaction (no likes/lights), skip the summary modal
    if (visitedCardIds.size === 0) {
        setPhase(AppPhase.DASHBOARD);
    } else {
        setShowSummaryModal(true);
    }
  };

  const confirmExitToDashboard = () => {
    setShowSummaryModal(false);
    setPhase(AppPhase.DASHBOARD);
  };

  const currentTheme = AMBIANCE_MODES.find(m => m.id === activeAmbianceId)?.theme || 'warm';

  // --- RENDERERS ---

  const renderImmersion = () => (
    <div 
        className="absolute inset-0 z-30 overflow-y-auto no-scrollbar animate-fade-in flex flex-col font-sans cursor-pointer"
        onClick={() => {}} 
    >
      {isAudioLoading && isPlaying && !audioError && volume > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/30 backdrop-blur-md pointer-events-none animate-fade-in">
          <Loader2 className="w-8 h-8 text-dopamine-orange animate-spin mb-4" />
          <p className="text-xs font-bold text-ink-light tracking-[0.3em] animate-pulse">调频中...</p>
        </div>
      )}

      {/* Main Poem Area */}
      <div className="flex-grow flex flex-col justify-center items-center relative p-8 pt-32 pb-48 min-h-[85vh]">
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

      {/* Ambiance Tuner (Moved to Bottom) */}
      <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div 
            className="bg-white/40 backdrop-blur-xl hover:bg-white/60 transition-all duration-500 p-1.5 rounded-full shadow-sm border border-white/20 flex items-center gap-2 scale-90 md:scale-100 pointer-events-auto"
            onClick={(e) => e.stopPropagation()} 
          >
              {AMBIANCE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={(e) => handleAmbianceChange(e, mode.id)}
                    className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative group
                        ${activeAmbianceId === mode.id ? 'bg-ink-gray text-white shadow-md' : 'bg-transparent text-ink-gray/40 hover:text-ink-gray hover:bg-white/30'}
                    `}
                  >
                      {mode.icon === 'tea' && <Leaf className="w-5 h-5" strokeWidth={activeAmbianceId === mode.id ? 2 : 1.5} />}
                      {mode.icon === 'rain' && <CloudRain className="w-5 h-5" strokeWidth={activeAmbianceId === mode.id ? 2 : 1.5} />}
                      {mode.icon === 'wind' && <Wind className="w-5 h-5" strokeWidth={activeAmbianceId === mode.id ? 2 : 1.5} />}
                      
                      {/* Tooltip */}
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {mode.label}
                      </span>
                  </button>
              ))}
          </div>
      </div>

    </div>
  );

  const renderTreehole = () => {
    return (
      <div className="fixed inset-0 z-50 bg-black/5 backdrop-blur-sm flex flex-col items-center justify-center p-0 animate-fade-in font-sans">
          
          {/* Main Card Container */}
          <div className={`w-full h-full md:h-auto md:max-w-md md:rounded-[3rem] bg-[#F5F5F7]/95 backdrop-blur-2xl transition-all duration-500 overflow-hidden flex flex-col relative ${aiResult ? '' : 'justify-center'}`}>
              
              {/* Soft Color Splash */}
              <div className="absolute top-[-100px] right-[-50px] w-64 h-64 bg-dopamine-orange/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />
              <div className="absolute bottom-[-100px] left-[-50px] w-64 h-64 bg-dopamine-blue/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />
              
              {/* Progress Bar (Only during selection) */}
              {!aiResult && !isGenerating && (
                  <div className="absolute top-12 left-0 right-0 flex justify-center space-x-2 z-10">
                      {[0, 1].map(step => (
                          <div key={step} className={`h-1 rounded-full transition-all duration-500 ease-spring ${treeholeStep >= step ? 'w-8 bg-dopamine-orange' : 'w-2 bg-gray-300/50'}`} />
                      ))}
                  </div>
              )}

              {/* Content Area */}
              <div className={`flex-1 flex flex-col relative z-20 ${aiResult ? 'h-full overflow-hidden' : 'px-8 pb-8 pt-28 overflow-y-auto no-scrollbar'}`}>
                  
                  {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-4">
                          <Loader2 className="w-10 h-10 text-dopamine-orange animate-spin" />
                          <p className="text-ink-light text-sm tracking-widest animate-pulse">小屿正在写信...</p>
                      </div>
                  ) : aiResult ? (
                    // --- RESULT PAGE: Echo Waterfall & Healing Medicine ---
                       <div className="h-full relative animate-fade-in">
                            
                            {/* Scroll Container with Ref for Waterfall Effect */}
                            <div 
                                ref={scrollContainerRef}
                                className="absolute inset-0 overflow-y-auto no-scrollbar pb-32 scroll-smooth"
                            >
                                {/* SVG Overlay for Constellation Lines */}
                                <svg 
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible"
                                >
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <polyline 
                                        points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
                                        fill="none"
                                        stroke="#F59E0B" // Amber-500 Warm Yellow
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeOpacity="0.5"
                                        filter="url(#glow)"
                                        className="animate-pulse"
                                    />
                                </svg>
                                
                                {/* 1. AI Reply Section */}
                                <div className="px-6 pt-10 pb-6 relative z-10">
                                    <div className="flex items-center gap-2 mb-6 opacity-60">
                                        <div className="w-2 h-2 rounded-full bg-dopamine-green animate-pulse" />
                                        <span className="text-xs font-bold text-ink-gray tracking-wide">
                                            此刻，还有 {residentCount} 位邻居在山中
                                        </span>
                                    </div>

                                    {/* AI Letter Card */}
                                    <div className="w-full bg-[#FFF9F0] p-8 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(255,160,0,0.1)] border border-[#F2E8D5] relative mb-8">
                                        <div className="flex items-center gap-3 mb-4 opacity-80">
                                            <div className="w-8 h-8 rounded-full bg-dopamine-orange/20 flex items-center justify-center text-dopamine-orange">
                                                <MessageCircleHeart className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-ink-gray text-sm tracking-wide">小屿的回信</span>
                                        </div>
                                        <p className="font-serif text-ink-gray text-[17px] leading-8 text-justify opacity-90">
                                            {aiResult.reply}
                                        </p>
                                        <div className="self-end mt-4 flex items-center justify-end gap-2 opacity-60">
                                            <span className="font-serif text-xs italic text-ink-light">Yours, Xiaoyu</span>
                                            <Leaf className="w-4 h-4 text-dopamine-green" />
                                        </div>
                                    </div>

                                    {/* 2. Share Invitation Card */}
                                    {!myMedicine ? (
                                        <div className="w-full bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm relative overflow-hidden transition-all">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="p-2 bg-dopamine-green/10 rounded-full text-dopamine-green">
                                                    <Feather className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-ink-gray text-base">什么小事治愈过你？</h4>
                                                    <p className="text-xs text-ink-light mt-1">
                                                        便利店的热关东煮、路边的猫...<br/>
                                                        留下你的“药方”，治愈远方的人。
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <textarea 
                                                value={healingText}
                                                onChange={(e) => setHealingText(e.target.value)}
                                                placeholder="写下那个瞬间..."
                                                className="w-full bg-white/50 rounded-xl p-4 text-sm text-ink-gray placeholder:text-gray-300 focus:outline-none focus:bg-white focus:ring-1 focus:ring-dopamine-green/30 resize-none h-24 mb-4 transition-colors"
                                            />
                                            
                                            <div className="flex justify-end">
                                                <button 
                                                    onClick={handleMedicineSubmit}
                                                    disabled={isSubmittingMedicine || !healingText.trim()}
                                                    className="bg-ink-gray text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
                                                >
                                                    {isSubmittingMedicine ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                                    分享给远方的人
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="hidden" /> 
                                    )}
                                </div>

                                {/* 3. Echo Waterfall */}
                                <div className="px-4 relative z-10">
                                    <div className="flex items-center justify-between mb-6 px-2">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-dopamine-blue" />
                                            {/* Dynamic Mood Title */}
                                            <h4 className="font-bold text-ink-gray text-lg">远方的回响 · {selectedMood || "共鸣"}</h4>
                                        </div>
                                    </div>

                                    <div className="columns-2 gap-4 space-y-4">
                                        {echoes.map((echo) => {
                                            const isActive = visitedCardIds.has(echo.id);
                                            
                                            return (
                                                <div 
                                                    key={echo.id}
                                                    ref={el => { if (el) cardRefs.current.set(echo.id, el); }}
                                                    className={`break-inside-avoid mb-4 p-5 rounded-[1.5rem] transition-all duration-700 ease-out relative
                                                        ${isActive 
                                                            // Warm Amber/Yellow Theme for Active State
                                                            ? 'bg-[#FFFBEB] shadow-[0_4px_20px_-4px_rgba(251,191,36,0.5)] scale-100 z-20 border-[#FCD34D] opacity-100 ring-2 ring-[#FCD34D]/50' 
                                                            : 'bg-white/80 shadow-sm border-[#F0EBE3] opacity-60 scale-95 grayscale-[0.3]'
                                                        }
                                                        border
                                                    `}
                                                >
                                                    
                                                    {/* Special styling for My Own Medicine */}
                                                    {echo.id === 'my-new' && (
                                                        <div className="absolute -top-2 -right-2 bg-dopamine-green text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-30">
                                                            我
                                                        </div>
                                                    )}

                                                    <p className="text-sm text-[#5E5A55] leading-6 text-justify mb-4 font-normal font-serif">
                                                        {echo.content}
                                                    </p>
                                                    
                                                    {/* Footer: Nickname + Heart Icon */}
                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50/50">
                                                        <span className="text-[10px] text-[#9CA3AF] font-serif truncate max-w-[80px]">
                                                            @{echo.nickname}
                                                        </span>
                                                        
                                                        <button 
                                                            onClick={() => handleHug(echo.id)}
                                                            className="flex items-center gap-1 group relative z-30" // z-30 to ensure clickable
                                                        >
                                                            <div className={`
                                                                p-1.5 rounded-full transition-all duration-300
                                                                ${echo.isLiked ? 'bg-dopamine-pink/10 text-dopamine-pink' : 'text-gray-300 group-hover:text-dopamine-pink'}
                                                            `}>
                                                                <Heart className={`w-3.5 h-3.5 ${echo.isLiked ? 'fill-current' : ''}`} />
                                                            </div>
                                                            <span className={`text-[10px] tabular-nums transition-colors ${echo.isLiked ? 'text-dopamine-pink font-bold' : 'text-gray-300'}`}>
                                                                {echo.hugs || 0}
                                                            </span>
                                                            
                                                            {/* INVISIBLE CONNECTION ANCHOR - Inside the button for perfect alignment */}
                                                            {/* This solves the visual offset issue caused by glassmorphism cards */}
                                                            <div 
                                                                ref={el => { if (el) dotRefs.current.set(echo.id, el); }}
                                                                className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0" 
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="py-12 text-center opacity-30">
                                        <Leaf className="w-6 h-6 mx-auto mb-2 text-ink-light" />
                                        <p className="text-[10px] text-ink-light tracking-widest">THE END</p>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Fixed Bottom Action Button */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7]/95 to-transparent z-40 flex justify-center pointer-events-none">
                                <button 
                                    onClick={handleFinishJourney}
                                    className="pointer-events-auto w-full max-w-sm bg-ink-gray text-white py-4 rounded-[2rem] font-bold text-lg flex items-center justify-center space-x-2 hover:bg-black transition-all shadow-2xl shadow-gray-300 hover:scale-[1.02] active:scale-95 group"
                                >
                                    <span>带着能量出发</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {/* 5. Summary/Exit Modal */}
                            {showSummaryModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-gray/30 backdrop-blur-sm px-6 animate-fade-in">
                                    {/* Removed animate-bounce-gentle and transform transitions */}
                                    <div className="w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] border border-white flex flex-col items-center text-center relative overflow-hidden">
                                        
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-dopamine-yellow/20 rounded-full blur-[50px] pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-dopamine-pink/10 rounded-full blur-[50px] pointer-events-none"></div>

                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-dopamine-orange to-dopamine-yellow flex items-center justify-center shadow-lg shadow-orange-200 mb-6 relative z-10">
                                            <Zap className="w-8 h-8 text-white fill-current" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-ink-gray mb-2 relative z-10">能量收集完毕</h3>
                                        
                                        <p className="text-sm font-medium text-ink-gray leading-relaxed mb-8 opacity-80 relative z-10 max-w-[240px]">
                                            你今天点亮了 <span className="text-dopamine-orange font-bold text-lg mx-0.5">{visitedCardIds.size}</span> 个节点，<br/>
                                            与 <span className="text-dopamine-pink font-bold text-lg mx-0.5">{visitedCardIds.size}</span> 位陌生人的治愈时刻相遇。
                                        </p>

                                        <button 
                                            onClick={confirmExitToDashboard}
                                            className="w-full bg-ink-gray text-white py-3.5 rounded-2xl font-bold text-base shadow-xl hover:bg-black active:scale-95 transition-all relative z-10 flex items-center justify-center gap-2 group"
                                        >
                                            <span>前往下一站</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        
                                        <button 
                                            onClick={() => setShowSummaryModal(false)}
                                            className="mt-4 text-xs font-medium text-ink-light hover:text-ink-gray transition-colors"
                                        >
                                            再停留一会儿
                                        </button>
                                    </div>
                                </div>
                            )}

                       </div>
                  ) : (
                      // --- SELECTION PHASE ---
                      // Step 0: Mood -> Step 1: Context (Auto Trigger)
                      <>
                      {treeholeStep === 0 && (
                          <div className="animate-fade-in flex flex-col items-center">
                              {isPlaying && (
                                <button onClick={handleManualMoodEntry} className="absolute top-10 left-6 p-2 text-ink-light hover:text-ink-gray transition-colors bg-white/50 rounded-full shadow-sm">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                              )}

                              <h3 className="text-center font-bold text-ink-gray text-3xl mb-3 mt-2">此刻心情</h3>
                              <p className="text-center text-ink-light text-sm mb-12 font-medium bg-white/60 px-5 py-2 rounded-full backdrop-blur-sm shadow-sm border border-white/40">把心事交给小屿，没关系的</p>
                              
                              <div className="grid grid-cols-2 gap-5 w-full">
                                  {MOOD_OPTIONS.map((mood) => (
                                      <button
                                          key={mood.id}
                                          onClick={() => handleMoodSelect(mood.label)}
                                          className={`
                                            group relative p-6 rounded-[2rem] flex flex-col items-center justify-center space-y-3 transition-all duration-300 transform active:scale-95 border
                                            ${selectedMood === mood.label ? mood.style + ' shadow-xl scale-[1.02] border-white' : 'bg-white/70 text-gray-400 border-white/40 hover:bg-white hover:shadow-lg hover:shadow-gray-100/50'}
                                          `}
                                      >
                                          <span className="text-5xl transition-transform duration-300 group-hover:-translate-y-2 drop-shadow-sm filter grayscale-[0.2] group-hover:grayscale-0">{mood.icon}</span>
                                          <span className="text-base font-bold tracking-wide">{mood.label}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      {treeholeStep === 1 && (
                          <div className="animate-fade-in flex flex-col items-center">
                               <button onClick={() => setTreeholeStep(0)} className="absolute top-10 left-6 p-2 text-ink-light hover:text-ink-gray transition-colors bg-white/50 rounded-full shadow-sm">
                                    <ArrowLeft className="w-5 h-5" />
                               </button>

                               <h3 className="text-center font-bold text-ink-gray text-3xl mb-3 mt-2">因为什么呢？</h3>
                               <p className="text-center text-ink-light text-sm mb-10 font-medium">找到源头，才能更好的抱抱你</p>
                               
                               <div className="flex items-center space-x-2 mb-10 bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm border border-white/60">
                                    <div className="flex -space-x-1.5">
                                        {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white" />)}
                                    </div>
                                    <span className="text-xs font-bold text-ink-light">
                                        {Math.floor(residentCount / 3)} 人此刻与你共鸣
                                    </span>
                               </div>

                               <div className="flex flex-wrap justify-center gap-3 w-full">
                                   {CONTEXT_OPTIONS.map((ctx) => (
                                       <button
                                           key={ctx}
                                           onClick={() => handleContextSelect(ctx)}
                                           className={`px-6 py-4 rounded-2xl text-sm font-bold border transition-all duration-300 hover:-translate-y-1 active:scale-95 ${selectedContext === ctx ? 'bg-ink-gray text-white border-ink-gray shadow-xl shadow-gray-200' : 'border-white/50 text-ink-light bg-white/70 hover:bg-white hover:shadow-md'}`}
                                       >
                                           {ctx}
                                       </button>
                                   ))}
                               </div>
                          </div>
                      )}
                      </>
                  )}
              </div>
          </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none bg-[#F5F5F7]">
        
      {/* Dynamic Background is now ALWAYS visible and light (z-10) */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-1000 opacity-100`}>
        <DynamicBackground theme={currentTheme} />
      </div>

      <AudioPlayer 
        url={currentAudioUrl} 
        // Allow playing in RITUAL phase if explicitly triggered (for preloading)
        isPlaying={isPlaying && (phase === AppPhase.RITUAL || phase === AppPhase.IMMERSION || phase === AppPhase.TREEHOLE || phase === AppPhase.LANDING)} 
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

      {/* 
          Main Content Switcher 
      */}

      {phase === AppPhase.IMMERSION && renderImmersion()}

      {showRitualLayer && (
          <div className={`absolute inset-0 z-50 transition-opacity duration-[3000ms] ease-in-out ${fadeRitual ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <Ritual 
                onComplete={handleRitualComplete} 
                onInteractionStart={handleRitualInteractionStart}
                activeFragranceId={activeFragranceId}
                onFragranceChange={handleFragranceChange}
              />
          </div>
      )}

      {phase === AppPhase.TREEHOLE && renderTreehole()}
      {phase === AppPhase.DASHBOARD && <Dashboard onScenarioClick={handleDashboardScenarioClick} />}
    </div>
  );
};

export default App;