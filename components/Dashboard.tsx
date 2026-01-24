import React, { useState, useEffect, useMemo } from 'react';
import { Leaf, Flame, Moon, Snowflake, ArrowRight, Heart, Sparkles, Lock, X, Calendar, TrendingUp, Archive, ScanLine, CheckCircle2, Info, ChevronRight, Quote, ChevronDown, ChevronUp, Feather, MessageCircleHeart } from 'lucide-react';
import { DASHBOARD_DATA, MOOD_OPTIONS, CONTEXT_OPTIONS, FRAGRANCE_LIST, TEXT_CONTENT } from '../constants';

interface DashboardProps {
    onScenarioClick: (id: string) => void;
}

// Helper to generate mock data
interface MoodRecord {
    date: string;
    day: number;
    moodId: string;
    context: string;
    isToday: boolean;
}

// Mock Data for "My Echoes" - User submitted content history
const MY_SUBMISSIONS_MOCK = [
    { 
        id: 'm1', 
        content: '暴雨天点了外卖，小哥全身湿透了还笑着说用餐愉快。给了他打赏，希望他今晚能喝碗热汤。', 
        date: '10.24', 
        time: '22:30',
        hugs: 232, 
        mood: 'joy' 
    },
    { 
        id: 'm2', 
        content: '在地铁上忍不住哭了，旁边的小女孩递给我一颗大白兔奶糖，没说话，就塞我手里。糖很甜。', 
        date: '10.20', 
        time: '18:45',
        hugs: 89, 
        mood: 'sad' 
    },
    { 
        id: 'm3', 
        content: '周末一个人去看了海，海浪的声音很大，把心里的嘈杂都盖过去了。', 
        date: '10.15', 
        time: '14:20',
        hugs: 12, 
        mood: 'calm' 
    }
];

const Dashboard: React.FC<DashboardProps> = ({ onScenarioClick }) => {
    const [activeAlert, setActiveAlert] = useState<string | null>(null);
    const [timeGreeting, setTimeGreeting] = useState("安好");
    const [userCounts, setUserCounts] = useState<Record<string, number>>({});
    const [hasNotification, setHasNotification] = useState(true);
    const [showMoodMap, setShowMoodMap] = useState(false);
    
    // Mood Map View Mode: 'calendar' | 'echoes'
    const [moodMapView, setMoodMapView] = useState<'calendar' | 'echoes'>('calendar');
    
    // Fragrance Box State
    const [showFragranceBox, setShowFragranceBox] = useState(false);
    const [showFragranceDetail, setShowFragranceDetail] = useState(false); // To toggle product detail view
    const [showStory, setShowStory] = useState(false); // To toggle perfumer story

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 11) setTimeGreeting("早安");
        else if (hour < 18) setTimeGreeting("午安");
        else setTimeGreeting("晚安");

        const counts: Record<string, number> = {};
        DASHBOARD_DATA.scenarios.forEach(s => {
            counts[s.id] = Math.floor(Math.random() * (800 - 100) + 100);
        });
        setUserCounts(counts);
    }, []);

    // Generate Mock Mood History (Last 30 days)
    const moodHistory = useMemo(() => {
        const history: MoodRecord[] = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            // Randomly assign a mood (70% chance to have a record)
            const hasRecord = Math.random() > 0.3 || i === 0; // Today always has record
            
            if (hasRecord) {
                const randomMood = MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)];
                const randomContext = CONTEXT_OPTIONS[Math.floor(Math.random() * CONTEXT_OPTIONS.length)];
                
                history.push({
                    date: `${date.getMonth() + 1}.${date.getDate()}`,
                    day: date.getDate(),
                    moodId: randomMood.id,
                    context: randomContext,
                    isToday: i === 0
                });
            } else {
                history.push({
                    date: `${date.getMonth() + 1}.${date.getDate()}`,
                    day: date.getDate(),
                    moodId: 'empty',
                    context: '',
                    isToday: false
                });
            }
        }
        return history;
    }, []);

    const recentRecords = useMemo(() => {
        return moodHistory.filter(h => h.moodId !== 'empty').reverse().slice(0, 4);
    }, [moodHistory]);

    const handleCardClick = (card: any, e: React.MouseEvent) => {
        // Prevent event bubbling if clicking a button inside the card
        if ((e.target as HTMLElement).closest('button')) return;

        if (card.status === 'locked') {
            setActiveAlert(`${card.title}模式 即将上线`);
            setTimeout(() => setActiveAlert(null), 2500);
        } else {
            if (card.id === 'relax') {
                onScenarioClick(card.id);
            }
        }
    };

    const handleFragranceBoxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowFragranceBox(true);
        setShowFragranceDetail(false); // Reset to list view
        setShowStory(false);
    };

    const handleScanClick = (fragranceName: string) => {
        setActiveAlert(`请扫描"${fragranceName}"包装盒内的二维码`);
        setTimeout(() => setActiveAlert(null), 3000);
    };

    const handleLifestyleClick = () => {
        setActiveAlert("小屿和生活 即将上线");
        setTimeout(() => setActiveAlert(null), 2500);
    };

    const handleHeartClick = () => {
        setHasNotification(false);
        setShowMoodMap(true);
        setMoodMapView('calendar'); // Default to calendar
    };

    const getIcon = (type: string, className: string) => {
        switch(type) {
            case 'leaf': return <Leaf className={className} strokeWidth={2.5} />;
            case 'flame': return <Flame className={className} strokeWidth={2.5} />;
            case 'moon': return <Moon className={className} strokeWidth={2.5} />;
            case 'snowflake': return <Snowflake className={className} strokeWidth={2.5} />;
            default: return <Leaf className={className} strokeWidth={2.5} />;
        }
    };

    const getMoodConfig = (id: string) => {
        return MOOD_OPTIONS.find(m => m.id === id) || { icon: '', style: 'bg-gray-100', label: '' };
    };

    return (
        <div className="absolute inset-0 bg-apple-gray z-50 overflow-y-auto no-scrollbar pb-32 animate-fade-in font-sans">
            {/* Header with blurred backdrop effect */}
            <div className="sticky top-0 z-10 px-8 py-6 bg-apple-gray/80 backdrop-blur-xl flex justify-between items-center transition-all duration-300">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-ink-light tracking-wider uppercase mb-1">Healing Map</span>
                    <h2 className="text-3xl font-bold text-ink-gray flex items-center gap-2">
                        {timeGreeting}，小屿
                    </h2>
                </div>
                <button 
                    onClick={handleHeartClick}
                    className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-105 transition-transform border border-gray-100 active:scale-95 group"
                >
                    <div className="relative">
                         {hasNotification && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-dopamine-pink rounded-full border-2 border-white animate-pulse"></div>
                         )}
                         <Heart className={`w-6 h-6 transition-colors ${hasNotification ? 'text-ink-gray' : 'text-dopamine-pink fill-dopamine-pink'}`} strokeWidth={2} />
                    </div>
                </button>
            </div>

            {/* Main Content */}
            <div className="px-6 mt-2 space-y-8">
                
                {/* Hero / Scenarios Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {DASHBOARD_DATA.scenarios.map((card: any, idx) => (
                        <div 
                            key={card.id}
                            onClick={(e) => handleCardClick(card, e)}
                            className={`
                                group relative aspect-[3.5/5] p-6 rounded-[2rem] flex flex-col justify-between transition-all duration-500 ease-out
                                ${card.status === 'active' 
                                    ? `bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadow} scale-100` 
                                    : 'bg-white/50 border border-white/40 grayscale-[0.3] opacity-80'}
                                hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden
                            `}
                        >
                            {/* Decorative background blob */}
                            {card.status === 'active' && (
                                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${card.iconBg} blur-2xl opacity-60 pointer-events-none`}></div>
                            )}

                            <div className="relative z-10 flex justify-between items-start">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.iconBg} backdrop-blur-sm transition-transform group-hover:rotate-6 duration-500`}>
                                    {getIcon(card.iconType, `w-7 h-7 ${card.accent}`)}
                                </div>
                                {card.status === 'locked' && <Lock className="w-4 h-4 text-ink-light" />}
                                
                                {/* Fragrance Box Trigger (Only for Relax/Active card) */}
                                {card.id === 'relax' && (
                                    <button 
                                        onClick={handleFragranceBoxClick}
                                        className="w-8 h-8 rounded-full bg-white/60 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-sm transition-all hover:scale-110 active:scale-90"
                                    >
                                        <Archive className="w-4 h-4 text-ink-gray opacity-70" strokeWidth={2} />
                                    </button>
                                )}
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center space-x-2 mb-2">
                                     {card.status === 'active' && (
                                         <span className="flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-dopamine-green opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-dopamine-green"></span>
                                          </span>
                                     )}
                                     <span className="text-[10px] font-bold text-ink-light tracking-wide uppercase">
                                        {card.status === 'active' ? `${userCounts[card.id]} 人在此刻` : 'Locked'}
                                     </span>
                                </div>
                                <h3 className="font-bold text-2xl text-ink-gray leading-none mb-1">{card.title}</h3>
                                <p className={`text-sm font-bold ${card.accent} opacity-90`}>{card.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Banner / Lifestyle Section */}
                <div>
                     <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="font-bold text-xl text-ink-gray">小屿和生活</h3>
                        <span className="text-xs font-bold text-ink-light bg-gray-100 px-3 py-1 rounded-full">Coming soon</span>
                     </div>
                     
                     <div 
                        onClick={handleLifestyleClick}
                        className="w-full bg-white rounded-[2.5rem] p-3 shadow-xl shadow-gray-100/50 cursor-pointer active:scale-95 transition-transform"
                     >
                        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden">
                             <img 
                                src="https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/xiaoyuAnd.jpg" 
                                className="w-full h-full object-cover"
                                alt="Lifestyle"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                             <div className="absolute bottom-4 left-6 text-white">
                                <p className="font-bold text-lg leading-tight">{DASHBOARD_DATA.lifestyle.title}</p>
                             </div>
                        </div>
                        
                        <div className="p-5">
                             <p className="text-sm text-ink-gray font-medium leading-relaxed mb-4 line-clamp-2">
                                {DASHBOARD_DATA.lifestyle.subtitle}
                             </p>
                             <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {["衣","食","住"][i-1]}
                                        </div>
                                    ))}
                                </div>
                                <button className="w-12 h-12 bg-ink-gray rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform active:scale-95">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                             </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Float Alert */}
            {activeAlert && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-ink-gray/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-gentle z-[60]">
                    <Sparkles className="w-4 h-4 text-dopamine-yellow" />
                    <span className="text-sm font-bold tracking-wide whitespace-nowrap">{activeAlert}</span>
                </div>
            )}

            {/* Mood Map Modal */}
            {showMoodMap && (
                <>
                    <div 
                        className="fixed inset-0 bg-ink-gray/20 backdrop-blur-sm z-[60] animate-fade-in"
                        onClick={() => setShowMoodMap(false)}
                    />
                    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-surface-white/95 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] p-8 transform animate-fade-in max-h-[85vh] overflow-y-auto no-scrollbar border-t border-white/60">
                        
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                             <div>
                                <h3 className="font-bold text-2xl text-ink-gray flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-dopamine-purple" />
                                    心情足迹
                                </h3>
                                <p className="text-xs text-ink-light mt-1 font-medium">记录每一个真实的当下</p>
                             </div>
                             <button onClick={() => setShowMoodMap(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-ink-gray" />
                             </button>
                        </div>

                        {/* View Switcher (Tabs) */}
                        <div className="bg-gray-100/80 p-1.5 rounded-2xl flex items-center mb-8 relative">
                            <div 
                                className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-spring ${moodMapView === 'calendar' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
                            />
                            <button 
                                onClick={() => setMoodMapView('calendar')}
                                className={`flex-1 relative z-10 py-2.5 text-xs font-bold transition-colors ${moodMapView === 'calendar' ? 'text-ink-gray' : 'text-ink-light'}`}
                            >
                                心情日历
                            </button>
                            <button 
                                onClick={() => setMoodMapView('echoes')}
                                className={`flex-1 relative z-10 py-2.5 text-xs font-bold transition-colors ${moodMapView === 'echoes' ? 'text-ink-gray' : 'text-ink-light'}`}
                            >
                                留下的光
                            </button>
                        </div>

                        {moodMapView === 'calendar' ? (
                            // --- VIEW 1: CALENDAR & RECENT ---
                            <div className="animate-fade-in">
                                {/* Calendar Grid */}
                                <div className="bg-white/50 rounded-[2rem] p-6 mb-8 border border-white shadow-sm">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-sm font-bold text-ink-gray">近30天</span>
                                        <span className="text-[10px] text-ink-light bg-white px-2 py-1 rounded-full">Today</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-3">
                                        {moodHistory.map((record, index) => {
                                            if (record.moodId === 'empty') {
                                                return (
                                                    <div key={index} className="aspect-square rounded-full bg-gray-100/50 flex items-center justify-center">
                                                        <span className="text-[8px] text-gray-300">{record.day}</span>
                                                    </div>
                                                );
                                            }
                                            const moodConfig = getMoodConfig(record.moodId);
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`aspect-square rounded-full flex items-center justify-center relative group cursor-pointer ${moodConfig.style.replace('bg-', 'bg-').replace('text-', 'text-')}`}
                                                >
                                                    {record.isToday && <div className="absolute inset-0 border-2 border-ink-gray rounded-full opacity-20"></div>}
                                                    <span className="text-sm">{moodConfig.icon}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Recent Highlights List */}
                                <div className="space-y-4 mb-6">
                                    <h4 className="font-bold text-ink-gray text-lg flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-dopamine-blue" />
                                        最近状态
                                    </h4>
                                    <div className="space-y-3">
                                        {recentRecords.map((record, idx) => {
                                            const mood = getMoodConfig(record.moodId);
                                            return (
                                                <div key={idx} className="flex items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mr-4 shrink-0 ${mood.style}`}>
                                                        {mood.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-ink-gray text-sm">{mood.label}</span>
                                                            <span className="text-xs text-ink-light font-mono">{record.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-ink-light">关联:</span>
                                                            <span className="text-xs font-bold text-ink-gray bg-gray-100 px-2 py-0.5 rounded-md">
                                                                {record.context}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Insight Card */}
                                <div className="bg-gradient-to-r from-dopamine-purple/10 to-dopamine-blue/10 p-5 rounded-2xl flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-dopamine-purple shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="font-bold text-dopamine-purple text-sm mb-1">小屿的观察</h5>
                                        <p className="text-xs text-ink-gray leading-relaxed opacity-80">
                                            最近虽然有一些波动，但整体状态在慢慢变好呢。
                                            不管是开心还是低落，小屿都陪着你。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // --- VIEW 2: MY ECHOES (User Content) ---
                            <div className="animate-fade-in space-y-4 pb-8">
                                <div className="flex items-center gap-2 mb-2 px-2 opacity-60">
                                    <Feather className="w-4 h-4 text-ink-gray" />
                                    <span className="text-xs font-bold text-ink-gray">我发出的治愈药方</span>
                                </div>
                                
                                {MY_SUBMISSIONS_MOCK.map((echo) => {
                                    const moodConfig = getMoodConfig(echo.mood);
                                    return (
                                        <div key={echo.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                                            {/* Decorative Quote Mark */}
                                            <Quote className="absolute top-4 left-4 w-6 h-6 text-gray-100 fill-current -z-0" />
                                            
                                            <div className="relative z-10">
                                                <p className="font-serif text-ink-gray text-[15px] leading-7 text-justify mb-4 opacity-90">
                                                    {echo.content}
                                                </p>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${moodConfig.style}`}>
                                                            {moodConfig.icon}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-ink-light/70">{echo.date}</span>
                                                            <span className="text-[9px] text-ink-light/50">{echo.time}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1.5 bg-dopamine-pink/5 px-2.5 py-1 rounded-full border border-dopamine-pink/10">
                                                        <Heart className="w-3.5 h-3.5 text-dopamine-pink fill-dopamine-pink" />
                                                        <span className="text-xs font-bold text-dopamine-pink">{echo.hugs}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="text-center py-6 opacity-40">
                                    <p className="text-[10px] text-ink-light font-serif">你的每一次分享，都点亮了某人的夜</p>
                                </div>
                            </div>
                        )}

                    </div>
                </>
            )}

            {/* Fragrance Box Modal (Drawer) */}
            {showFragranceBox && (
                <>
                    <div 
                        className="fixed inset-0 bg-ink-gray/30 backdrop-blur-sm z-[80] animate-fade-in"
                        onClick={() => setShowFragranceBox(false)}
                    />
                    {/* Drawer Container */}
                    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-surface-white/95 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-30px_80px_rgba(0,0,0,0.15)] pt-8 transform animate-slide-up transition-transform duration-300 border-t border-white/60 h-[85vh] flex flex-col">
                         
                         {/* Drawer Handle */}
                         <div className="flex justify-center mb-2 shrink-0">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full opacity-50"></div>
                         </div>
                         
                         {showStory ? (
                             // --- VIEW: Perfumer Story (Deep Dive) ---
                             <div className="animate-fade-in flex flex-col h-full overflow-hidden relative">
                                 {/* Scrollable Story Content */}
                                 <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
                                     {/* Top Nav: Back to Details */}
                                     <div className="flex items-center gap-2 mb-6 cursor-pointer opacity-70 hover:opacity-100" onClick={() => setShowStory(false)}>
                                        <div className="p-1 rounded-full bg-gray-100"><ArrowRight className="w-4 h-4 text-ink-gray rotate-180" /></div>
                                        <span className="text-sm font-bold text-ink-gray">返回详情</span>
                                     </div>
                                     
                                     <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100/50 mb-10 animate-fade-in">
                                        <div className="flex flex-col items-center mb-6">
                                            <Quote className="w-8 h-8 text-dopamine-orange opacity-30 mb-2 fill-current" />
                                            <h3 className="text-xl font-bold text-ink-gray">{TEXT_CONTENT.product.modal.story.title}</h3>
                                            <p className="text-xs text-ink-light tracking-widest mt-1 uppercase">{TEXT_CONTENT.product.modal.story.subtitle}</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {TEXT_CONTENT.product.modal.story.content.map((paragraph, idx) => (
                                                <p key={idx} className="font-serif text-ink-gray leading-loose text-justify text-base opacity-90">
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>

                                        <div className="mt-8 flex justify-center">
                                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=perfumer" alt="Perfumer" className="w-10 h-10 rounded-full bg-white p-1 border border-orange-100 shadow-sm opacity-80" />
                                        </div>
                                     </div>
                                 </div>

                                 {/* Return Handle (Up Arrow) - Fixed Bottom */}
                                 <div 
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-10 pb-8 flex justify-center cursor-pointer z-10"
                                    onClick={() => setShowStory(false)}
                                 >
                                     <div className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity animate-bounce-gentle">
                                         <ChevronUp className="w-5 h-5 text-ink-gray" />
                                         <span className="text-[10px] text-ink-light tracking-widest uppercase">收起故事</span>
                                     </div>
                                 </div>
                             </div>
                         ) : showFragranceDetail ? (
                             // --- VIEW: Product Details ---
                             <div className="animate-fade-in flex flex-col h-full relative">
                                 {/* Scrollable Ingredients Area */}
                                 <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
                                     <div className="flex items-center gap-2 mb-6 cursor-pointer opacity-70 hover:opacity-100" onClick={() => setShowFragranceDetail(false)}>
                                        <div className="p-1 rounded-full bg-gray-100"><ArrowRight className="w-4 h-4 text-ink-gray rotate-180" /></div>
                                        <span className="text-sm font-bold text-ink-gray">返回香匣</span>
                                     </div>

                                     <h3 className="text-center font-bold text-2xl text-ink-gray mb-8 flex items-center justify-center gap-2">
                                         <Leaf className="w-6 h-6 text-dopamine-green" />
                                         {TEXT_CONTENT.product.modal.title}
                                     </h3>
                                     <p className="font-medium text-base text-ink-gray leading-loose mb-10 text-justify opacity-80">
                                         {TEXT_CONTENT.product.modal.origin.part1} <b className="text-dopamine-green bg-green-50 px-1 rounded">{TEXT_CONTENT.product.modal.origin.highlight}</b> {TEXT_CONTENT.product.modal.origin.part2}
                                     </p>
                                     <div className="space-y-4 mb-12">
                                         {TEXT_CONTENT.product.modal.ingredients.list.map((item, idx) => (
                                             <div key={idx} className="flex justify-between items-center bg-gray-50/80 p-5 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                                 <span className="text-base font-bold text-ink-gray">{item.name}</span>
                                                 <span className="text-xs font-medium text-ink-light tracking-wide bg-white px-2 py-1 rounded-md shadow-sm">{item.desc}</span>
                                             </div>
                                         ))}
                                     </div>
                                     
                                     {/* Safety Warning (Moved into scroll flow) */}
                                     <p className="text-[11px] text-center text-ink-light font-medium tracking-wide opacity-40 mb-4">
                                         {TEXT_CONTENT.product.modal.footer}
                                     </p>
                                 </div>

                                 {/* FIXED BOTTOM BAR: Perfumer Story Trigger */}
                                 <div 
                                    onClick={() => setShowStory(true)}
                                    className="absolute bottom-0 left-0 right-0 bg-orange-50/90 backdrop-blur-md border-t border-orange-100/50 py-4 px-6 cursor-pointer hover:bg-orange-100/90 transition-colors z-20 group"
                                 >
                                     <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <div className="bg-white p-2 rounded-xl shadow-sm text-dopamine-orange group-hover:scale-110 transition-transform">
                                                 <Quote className="w-4 h-4" strokeWidth={2.5} />
                                             </div>
                                             <div className="flex flex-col">
                                                 <span className="font-bold text-ink-gray text-sm group-hover:text-dopamine-orange transition-colors">制香师说</span>
                                                 <span className="text-[10px] text-ink-light opacity-70 tracking-wide">午后暖阳与一杯茶</span>
                                             </div>
                                         </div>
                                         <ChevronDown className="w-5 h-5 text-ink-light group-hover:translate-y-1 transition-transform" />
                                     </div>
                                 </div>
                             </div>
                         ) : (
                             // --- VIEW: List of Fragrances ---
                             <div className="animate-fade-in flex-1 overflow-y-auto no-scrollbar p-6">
                                 <div className="flex justify-between items-start mb-8">
                                     <div>
                                         <h3 className="text-2xl font-bold text-ink-gray mb-1 flex items-center gap-2">
                                            <Archive className="w-6 h-6 text-dopamine-orange" strokeWidth={2} />
                                            小屿的香匣
                                         </h3>
                                         <p className="text-xs text-ink-light">今日，燃哪一支？</p>
                                     </div>
                                 </div>

                                 <div className="space-y-4 pb-12">
                                    {FRAGRANCE_LIST.map((fragrance) => (
                                        <div 
                                            key={fragrance.id}
                                            onClick={() => fragrance.status === 'owned' && setShowFragranceDetail(true)}
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
                                                    <div className="flex items-center gap-1 text-dopamine-orange bg-orange-50 px-2 py-1 rounded-lg">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold">已启用</span>
                                                    </div>
                                                    {/* Added visual cue to click */}
                                                    <div className="flex items-center text-[10px] text-ink-light/60 font-medium group-hover:text-dopamine-orange transition-colors">
                                                        <span>查看香方</span>
                                                        <ChevronRight className="w-3 h-3 ml-0.5" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleScanClick(fragrance.name); }}
                                                    className="flex items-center gap-1.5 bg-ink-gray text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-black transition-colors active:scale-95 shadow-lg"
                                                >
                                                    <ScanLine className="w-3.5 h-3.5" />
                                                    解锁
                                                </button>
                                            )}

                                            {/* Locked Overlay */}
                                            {fragrance.status === 'locked' && (
                                                <div className="absolute top-3 right-3">
                                                    <Lock className="w-3 h-3 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                 </div>
                             </div>
                         )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;