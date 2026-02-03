import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, Leaf, Loader2, AlertCircle, ChevronRight, Send, Check, Users, ArrowLeft, ArrowRight, Heart, Sparkles, Quote, Sun, CloudRain, Wind, MessageCircleHeart, AlignLeft, Feather, Plus, Zap, BookOpen, Menu, ThumbsUp, MessageCircle, HeartHandshake, Moon } from 'lucide-react';
import { AppPhase } from './types';
import { TEXT_CONTENT, DEFAULT_AUDIO_URL, TRANSITION_AUDIO_URL, IMMERSION_DURATION, MOOD_OPTIONS, CONTEXT_OPTIONS, AMBIANCE_MODES, FRAGRANCE_LIST, MOCK_ECHOES_BY_MOOD, PINK_NOISE_URL, BROWN_NOISE_URL } from './constants';
import DynamicBackground from './components/DynamicBackground';
import AudioPlayer from './components/AudioPlayer';
import Ritual from './components/Ritual';
import Dashboard from './components/Dashboard';
import { GeminiService, TreeholeResult } from './components/GeminiService';

const App: React.FC = () => {
    const [phase, setPhase] = useState<AppPhase>(AppPhase.DASHBOARD);

    // Transition Control States
    const [showRitualLayer, setShowRitualLayer] = useState(true); // Is Ritual component mounted?
    const [fadeRitual, setFadeRitual] = useState(false); // Should Ritual component fade opacity to 0?

    // Audio State
    const [currentAudioUrl, setCurrentAudioUrl] = useState(DEFAULT_AUDIO_URL); // Layer 1: Scenario Base
    const [layer2AudioUrl, setLayer2AudioUrl] = useState(""); // Layer 2: Functional Noise
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
    const [myMedicine, setMyMedicine] = useState<{ content: string, date: string } | null>(null);

    // New structured result state
    const [aiResult, setAiResult] = useState<TreeholeResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Echo Waterfall State (Legacy support, initialized empty)
    const [echoes, setEchoes] = useState<any[]>([]);

    // --- Waterfall Connectivity Effect State ---
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // Replaced activeCardId with a Set of visited IDs for persistent lighting
    const [visitedCardIds, setVisitedCardIds] = useState<Set<string>>(new Set());
    const [pathPoints, setPathPoints] = useState<{ x: number, y: number }[]>([]);

    // Transition Modal State
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    // --- NEW: Treehole Semantic Flow State ---
    const [resultStep, setResultStep] = useState(0); // 0: AI Reply, 1: User Share, 2: Peer Echo
    const [matchedEcho, setMatchedEcho] = useState<any>(null);
    const [waitingForEcho, setWaitingForEcho] = useState(false);
    const [isFlyingAway, setIsFlyingAway] = useState(false);
    const [showFeedbackOverlay, setShowFeedbackOverlay] = useState(false);

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
        const points: { x: number, y: number, id: string }[] = [];

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

    // --- NEW: Sync Ambiance Choice to Layer 2 Audio ---
    useEffect(() => {
        if (activeAmbianceId === 'sleep') {
            setLayer2AudioUrl(PINK_NOISE_URL);
        } else if (activeAmbianceId === 'meditate') {
            setLayer2AudioUrl(BROWN_NOISE_URL);
        } else {
            setLayer2AudioUrl(""); // Original = No overlay (or we could have a specific overlay)
        }
    }, [activeAmbianceId]);

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
        setResultStep(0); // Ensure start from AI Reply
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
        // CHANGED: Allow any ID to proceed directly to IMMERSION (Skip Ritual)
        setVolume(1);
        setIsPlaying(true); // START AUDIO IMMEDIATELY
        setTreeholeStep(0);
        setResultStep(0); // Reset result flow
        setSelectedMood("");
        setSelectedContext("");
        setHealingText("");
        setMyMedicine(null);
        setAiResult(null);
        setActiveAmbianceId('original'); // CHANGED: Default to 'original' (White Noise)
        setCurrentAudioUrl(DEFAULT_AUDIO_URL);
        setShowSummaryModal(false); // Reset

        // Reset Waterfall State
        setVisitedCardIds(new Set());
        setPathPoints([]);

        setShowRitualLayer(false); // No ritual layer
        setFadeRitual(false);

        setPhase(AppPhase.IMMERSION); // DIRECT TO IMMERSION
    };

    const handleAmbianceChange = (e: React.MouseEvent, modeId: string) => {
        e.stopPropagation();
        setActiveAmbianceId(modeId);
        // URL update is now handled by useEffect on activeAmbianceId
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
            onClick={() => { }}
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

            {/* Ambiance Tuner (Refactored: 3 Modes + Independent Mute) */}
            <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <div
                    className="bg-[#E5E5E5]/80 backdrop-blur-xl p-1.5 rounded-full shadow-inner flex items-center gap-1 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Mode Buttons */}
                    {AMBIANCE_MODES.map((mode) => {
                        const isActive = activeAmbianceId === mode.id;

                        // Icon mapping
                        let Icon = Leaf;
                        if (mode.icon === 'moon') Icon = Moon;
                        if (mode.icon === 'wind') Icon = Wind; // Placeholder map, adjust as needed

                        return (
                            <button
                                key={mode.id}
                                onClick={(e) => {
                                    handleAmbianceChange(e, mode.id);
                                    if (!isPlaying) {
                                        setIsPlaying(true);
                                        if (volume < 0.1) setVolume(1);
                                    }
                                }}
                                className={`
                                    py-3 rounded-full flex items-center justify-center gap-1.5 transition-all duration-300
                                    ${isActive
                                        ? 'bg-white text-ink-gray shadow-sm transform scale-105 px-5'
                                        : 'text-ink-gray/40 hover:bg-white/40 hover:text-ink-gray/60 px-3'}
                                `}
                            >
                                {/* We can check id for specific icons if mapped, or use a lookup */}
                                {mode.id === 'original' && <Leaf className="w-4 h-4" strokeWidth={2} />}
                                {mode.id === 'sleep' && <Moon className="w-4 h-4" strokeWidth={2} />}
                                {mode.id === 'meditate' && <Wind className="w-4 h-4" strokeWidth={2} />}
                                {isActive && <span className="text-xs font-bold tracking-widest font-serif">{mode.label}</span>}
                            </button>
                        );
                    })}

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-300 mx-1 opacity-50"></div>

                    {/* Mute Toggle */}
                    <button
                        onClick={toggleAudio}
                        className={`
                            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                            ${!isPlaying
                                ? 'bg-red-50 text-red-400' // Muted state visual
                                : 'text-ink-gray/60 hover:bg-white/40 hover:text-ink-gray'}
                        `}
                        title={isPlaying ? "静音" : "播放"}
                    >
                        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>
            </div>

        </div>
    );

    const renderTreehole = () => {
        return (
            <div className="fixed inset-0 z-50 bg-black/5 backdrop-blur-sm flex flex-col items-center justify-center p-0 animate-fade-in font-sans">

                {/* Main Card Container */}
                <div className={`w-full h-full md:h-auto md:max-w-md md:rounded-[3rem] bg-[#F5F5F7]/95 backdrop-blur-2xl transition-all duration-1000 overflow-hidden flex flex-col relative ${aiResult ? '' : 'justify-center'} ${isFlyingAway ? 'translate-y-[-120%] opacity-0 rotate-3' : 'translate-y-0 opacity-100 rotate-0'}`}>

                    {/* Feedback Overlay */}
                    {showFeedbackOverlay && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md animate-fade-in text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-dopamine-orange/20 flex items-center justify-center mb-4 animate-bounce">
                                <Sparkles className="w-8 h-8 text-dopamine-orange" />
                            </div>
                            <h3 className="text-xl font-bold text-ink-gray mb-2">暖意已送达</h3>
                            <p className="text-ink-light font-serif">这束微光将如约照亮此刻...</p>
                        </div>
                    )}

                    {/* Soft Color Splash */}
                    <div className="absolute top-[-100px] right-[-50px] w-64 h-64 bg-dopamine-orange/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />
                    <div className="absolute bottom-[-100px] left-[-50px] w-64 h-64 bg-dopamine-blue/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />

                    {/* Content Area */}
                    <div className={`flex-1 flex flex-col relative z-20 ${aiResult ? 'h-full overflow-hidden' : 'px-8 pb-8 pt-28 overflow-y-auto no-scrollbar'}`}>

                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <Loader2 className="w-10 h-10 text-dopamine-orange animate-spin" />
                                <p className="text-ink-light text-sm tracking-widest animate-pulse">小屿正在写信...</p>
                            </div>
                        ) : aiResult ? (
                            // --- RESULT PAGE: Sequential Flow ---
                            <div className="h-full relative animate-fade-in flex flex-col bg-[#F5F5F7]">
                                {/* SVG Overlay (Background) - Kept for subtle ambiance but minimized */}
                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible opacity-10">
                                    <polyline points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                                {/* Common Header: Resident Count */}
                                <div className="px-8 pt-10 pb-2 relative z-10 flex-none text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border border-white/20 backdrop-blur-sm">
                                        <div className="w-2 h-2 rounded-full bg-dopamine-green animate-pulse" />
                                        <span className="text-xs font-bold text-ink-gray tracking-wide">
                                            此刻，山中有 {residentCount} 位邻居
                                        </span>
                                    </div>
                                </div>

                                {/* Flow Content Container */}
                                <div className="flex-1 overflow-hidden relative z-10 p-6 flex flex-col items-center justify-center">

                                    {/* STEP 0 + 1: Combined Reply & Share */}
                                    {(resultStep === 0 || resultStep === 1) && (
                                        <div className="w-full h-full flex flex-col animate-fade-in-up">
                                            {/* AI Reply Section (Top, Scrollable) */}
                                            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 p-6">
                                                <div className="bg-[#FFF9F0] p-6 rounded-[2rem] shadow-sm border border-[#F2E8D5] mb-4 relative group">
                                                    <div className="flex items-center gap-3 mb-4 opacity-80 sticky top-0 bg-[#FFF9F0]/90 backdrop-blur-sm pb-2 z-10">
                                                        <div className="w-8 h-8 rounded-full bg-dopamine-orange/20 flex items-center justify-center text-dopamine-orange">
                                                            <MessageCircleHeart className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-ink-gray text-sm">小屿的回信</h4>
                                                            <p className="text-[10px] text-ink-light">To: {selectedMood}的你</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-serif text-ink-gray text-[15px] leading-7 text-justify opacity-90 whitespace-pre-line pb-2">
                                                        {aiResult.reply}
                                                    </p>
                                                </div>

                                                {/* Optional Input Area */}
                                                <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100/50 mb-6">
                                                    <textarea
                                                        value={healingText}
                                                        onChange={(e) => setHealingText(e.target.value)}
                                                        placeholder="我也想说... (可选)"
                                                        className="w-full h-20 bg-transparent text-sm text-ink-gray placeholder:text-gray-300 focus:outline-none resize-none font-serif leading-relaxed p-2"
                                                    />
                                                </div>
                                            </div>

                                            {/* Fixed Bottom Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent z-50 flex flex-col gap-3">
                                                <button
                                                    onClick={() => {
                                                        if (healingText.trim()) {
                                                            // Send Logic
                                                            const moodGroup = MOCK_ECHOES_BY_MOOD[selectedMood];
                                                            // @ts-ignore
                                                            const contextEchoes = moodGroup ? (moodGroup[selectedContext] || moodGroup['说不清'] || []) : [];
                                                            // @ts-ignore
                                                            const fallbackEchoes = MOCK_ECHOES_BY_MOOD['小确幸']['说不清'];

                                                            const targetList = (contextEchoes.length > 0) ? contextEchoes : fallbackEchoes;
                                                            const randomEcho = targetList[Math.floor(Math.random() * targetList.length)];
                                                            setMatchedEcho(randomEcho);
                                                            setWaitingForEcho(true);
                                                            setResultStep(2);
                                                            setTimeout(() => setWaitingForEcho(false), 2500);
                                                        } else {
                                                            // No text? Just animate away
                                                            setIsFlyingAway(true);
                                                            setTimeout(() => {
                                                                setAiResult(null);
                                                                setPhase(AppPhase.DASHBOARD);
                                                                setIsFlyingAway(false);
                                                            }, 1000);
                                                        }
                                                    }}
                                                    className={`w-full py-3 rounded-full font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2
                                                        ${healingText.trim()
                                                            ? 'bg-ink-gray text-white shadow-lg'
                                                            : 'bg-white text-ink-gray border border-gray-200'}
                                                    `}
                                                >
                                                    {healingText.trim() ? (
                                                        <>
                                                            <Send className="w-4 h-4" />
                                                            <span>投递回应</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4 text-dopamine-orange" />
                                                            <span>带着能量出发</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: Peer Resonance (Echo) */}
                                    {resultStep === 2 && (
                                        <div className="w-full h-full flex flex-col animate-fade-in-up items-center justify-center">
                                            {waitingForEcho ? (
                                                <div className="text-center space-y-6">
                                                    <div className="relative w-20 h-20 mx-auto">
                                                        <div className="absolute inset-0 bg-dopamine-orange/20 rounded-full animate-ping opacity-75"></div>
                                                        <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-sm">
                                                            <Sparkles className="w-8 h-8 text-dopamine-orange animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-ink-gray font-serif text-lg tracking-widest">正在寻找同频的信号</p>
                                                        <p className="text-ink-light text-xs animate-pulse">穿越 {Math.floor(Math.random() * 500 + 100)} 公里的回响...</p>
                                                    </div>
                                                </div>
                                            ) : matchedEcho && (
                                                <div className="w-full max-w-sm relative">
                                                    {/* The Card */}
                                                    <div className="bg-[#FFFBEB] p-8 rounded-[2rem] shadow-2xl border border-[#FCD34D] relative transform rotate-1 transition-all duration-500 hover:rotate-0">

                                                        {/* Top Header: Nickname + Mood Tag */}
                                                        <div className="absolute -top-3 left-0 right-0 px-6 flex justify-between items-center">
                                                            {/* Mood Tag */}
                                                            <div className="bg-white text-dopamine-orange text-[10px] px-3 py-1 rounded-full font-bold shadow-sm border border-dopamine-orange/20 flex items-center gap-1">
                                                                <span className="opacity-60">#</span> {selectedMood}
                                                            </div>

                                                            {/* Nickname Tag */}
                                                            <div className="bg-[#FCD34D] text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm flex items-center gap-1">
                                                                <Feather className="w-3 h-3" />
                                                                来自 {matchedEcho.nickname}
                                                            </div>
                                                        </div>

                                                        <p className="font-serif text-[17px] text-[#5E5A55] leading-8 text-justify mb-8 pt-6">
                                                            “{matchedEcho.content}”
                                                        </p>

                                                        {/* Interactions - Just HUG */}
                                                        <div className="flex justify-center items-center pt-4 border-t border-[#FCD34D]/30">
                                                            <button
                                                                onClick={() => {
                                                                    setShowFeedbackOverlay(true);
                                                                    setTimeout(() => {
                                                                        setIsFlyingAway(true);
                                                                        setTimeout(() => {
                                                                            setPhase(AppPhase.DASHBOARD);
                                                                            setAiResult(null);
                                                                            setShowFeedbackOverlay(false); // Reset
                                                                            setIsFlyingAway(false);
                                                                        }, 1000);
                                                                    }, 1500); // Show overlay for 1.5s
                                                                }}
                                                                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/60 hover:bg-white text-amber-500 transition-all shadow-sm hover:scale-110 active:scale-95 group border border-amber-100/50"
                                                                title="拥抱"
                                                            >
                                                                <HeartHandshake className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                                <span className="text-xs font-bold tracking-widest">给予拥抱</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // --- SELECTION PHASE ---
                            // Step 0: Mood -> Step 1: Context (Auto Trigger)
                            <>
                                {treeholeStep === 0 && (
                                    <div className="animate-fade-in flex flex-col items-center">
                                        {isPlaying && (
                                            <button onClick={() => setPhase(AppPhase.IMMERSION)} className="absolute top-10 left-6 p-2 text-ink-light hover:text-ink-gray transition-colors bg-white/50 rounded-full shadow-sm">
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
                                                {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white" />)}
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
                key="main-audio"
                url={currentAudioUrl}
                // Allow playing in RITUAL phase if explicitly triggered (for preloading)
                isPlaying={isPlaying && (phase === AppPhase.RITUAL || phase === AppPhase.IMMERSION || phase === AppPhase.TREEHOLE || phase === AppPhase.LANDING)}
                volume={layer2AudioUrl ? volume * 0.65 : volume} // Reduce volume by 35% if Layer 2 is active
                onLoadingStatusChange={setIsAudioLoading}
                onError={() => setAudioError(true)}
            />
            {/* LAYER 2: Functional Noise Overlay */}
            <AudioPlayer
                url={layer2AudioUrl}
                isPlaying={isPlaying && layer2AudioUrl !== "" && (phase === AppPhase.IMMERSION || phase === AppPhase.TREEHOLE)}
                volume={volume * 0.8} // Slightly lower volume for overlay to blend well
            />

            {/* Early Exit Button (Left Top) - CHANGED to BookOpen for Mood Entry */}
            {phase === AppPhase.IMMERSION && (
                <div className="absolute top-10 left-10 z-50 opacity-40 hover:opacity-100 transition-opacity duration-1000">
                    <button onClick={handleManualMoodEntry} className="p-3 bg-white/40 backdrop-blur-md rounded-full hover:bg-white transition-colors group">
                        <BookOpen strokeWidth={1.5} className="w-5 h-5 text-ink-gray group-hover:text-dopamine-pink transition-colors" />
                    </button>
                </div>
            )}

            {/* Control Overlay (Right Top) - Menu (Dashboard) - Shared for Immersion & Ritual */}
            {(phase === AppPhase.IMMERSION) && (
                <div className="absolute top-10 right-10 z-[60] opacity-40 hover:opacity-100 transition-opacity duration-1000">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowRitualLayer(false); // Ensure overlay closes
                            setPhase(AppPhase.DASHBOARD);
                        }}
                        className={`p-3 backdrop-blur-md rounded-full transition-colors bg-white/40 hover:bg-white`}
                    >
                        <Menu strokeWidth={1.5} className={`w-5 h-5 text-ink-gray`} />
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
                        onBack={() => setPhase(AppPhase.DASHBOARD)}
                    />
                </div>
            )}

            {phase === AppPhase.TREEHOLE && renderTreehole()}
            {phase === AppPhase.DASHBOARD && <Dashboard onScenarioClick={handleDashboardScenarioClick} />}
        </div>
    );
};

export default App;