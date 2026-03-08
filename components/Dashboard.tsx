import React, { useState, useEffect, useMemo } from 'react';
import { Leaf, Calendar, TrendingUp, Sparkles, X, Feather, MessageCircleHeart, Quote, Check, ChevronUp, Info, ScanLine, Flame, Gift, User } from 'lucide-react';
import { MOOD_OPTIONS, CONTEXT_OPTIONS, FRAGRANCE_LIST, TEXT_CONTENT, DASHBOARD_DATA } from '../constants'; // Keep DASHBOARD_DATA import to avoid breaking if referenced elsewhere, but won't use it.
import GiftSetupModal from './GiftSetupModal';
import AuthModal from './auth/AuthModal';

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
        content: '明天就要汇报方案了，改了八版还是觉得不够好。心跳好快，手里握着热茶，希望能慢下来。',
        date: '10.24',
        time: '22:30',
        hugs: 128,
        mood: 'anxious'
    },
    {
        id: 'm2',
        content: '在这个城市搬了第五次家，打包箱子的时候突然觉得好累。想回老家晒太阳，做一只无所事事的猫。',
        date: '10.23',
        time: '19:15',
        hugs: 210,
        mood: 'tired'
    },
    {
        id: 'm3',
        content: '大家都说25岁该稳定了，可我还在想去流浪。究竟是随波逐流容易，还是坚持自己更难？脑子像一团乱麻。',
        date: '10.22',
        time: '23:45',
        hugs: 341,
        mood: 'confused'
    },
    {
        id: 'm4',
        content: '路过那家我们常去的火锅店，味道还是香的，只是对面再也不会有另外一副碗筷了。眼泪掉进调料碗里，有点咸。',
        date: '10.20',
        time: '20:00',
        hugs: 232,
        mood: 'sad'
    },
    {
        id: 'm5',
        content: '雨天，不开灯。窝在沙发里听雨打窗户的声音，像大自然在敲摩斯密码。这一刻，时间停止了。',
        date: '10.18',
        time: '14:20',
        hugs: 77,
        mood: 'calm'
    },
    {
        id: 'm6',
        content: '买咖啡时因为是第100位顾客被免单了！虽然只是一杯美式，但感觉今天的运气能通过咖啡因传遍全身。',
        date: '10.15',
        time: '09:30',
        hugs: 56,
        mood: 'joy'
    }
];

const Dashboard: React.FC<DashboardProps> = ({ onScenarioClick }) => {
    const [timeGreeting, setTimeGreeting] = useState("安好");
    const [hasNotification, setHasNotification] = useState(true);
    const [showMoodMap, setShowMoodMap] = useState(false);
    const [moodMapView, setMoodMapView] = useState<'calendar' | 'echoes'>('calendar');

    // New Scent Selection State
    const [selectedScentId, setSelectedScentId] = useState<string | null>(null);
    const [expandedScentId, setExpandedScentId] = useState<string | null>(null); // Track expanded card
    const [showFragranceDetail, setShowFragranceDetail] = useState(false); // View Details

    // Gift Modal State
    const [showGiftModal, setShowGiftModal] = useState(false);

    // Auth Modal State
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 11) setTimeGreeting("早安");
        else if (hour < 18) setTimeGreeting("午安");
        else setTimeGreeting("晚安");
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

    const handleHeartClick = () => {
        setHasNotification(false);
        setShowMoodMap(true);
        setMoodMapView('calendar');
    };

    const getMoodConfig = (id: string) => {
        return MOOD_OPTIONS.find(m => m.id === id) || { icon: '', style: 'bg-gray-100', label: '' };
    };

    const handleConfirmScent = () => {
        if (selectedScentId) {
            onScenarioClick(selectedScentId);
        }
    };

    // Handle card click for expand/collapse
    const handleCardClick = (scentId: string, status: string) => {
        if (status === 'locked') return;

        if (expandedScentId === scentId) {
            // Already expanded - collapse
            setExpandedScentId(null);
        } else {
            // Expand this card and select it
            setExpandedScentId(scentId);
            setSelectedScentId(scentId);
        }
    };

    // Get accent color class based on scent id - 低饱和度大地色调
    const getAccentColorClass = (scentId: string): string => {
        const colorMap: Record<string, string> = {
            'tinghe': 'bg-lotus-pink-dark',      // 莲粉 - #c4a5a0
            'wanxiang': 'bg-osmanthus-gold-dark', // 桂金 - #c4a890
            'xiaoyuan': 'bg-moss-green-dark',    // 苔绿 - #9aab9a
            'white_tea': 'bg-osmanthus-gold-dark',
            'osmanthus': 'bg-osmanthus-gold-dark',
            'rose': 'bg-lotus-pink-dark',
        };
        return colorMap[scentId] || 'bg-earth-taupe';
    };

    // Get gradient and theme colors for expanded card based on scent id
    // 使用低饱和度大地色调，但保持三款香的区分度
    const getScentTheme = (scentId: string): { gradient: string; bgOverlay: string; textColor: string; cardBg: string } => {
        const themeMap: Record<string, { gradient: string; bgOverlay: string; textColor: string; cardBg: string }> = {
            'tinghe': {
                // 莲粉 - 明显的粉色调
                gradient: 'linear-gradient(145deg, rgba(232, 204, 200, 0.35) 0%, rgba(196, 144, 138, 0.2) 50%, rgba(196, 144, 138, 0.15) 100%)',
                bgOverlay: 'rgba(232, 204, 200, 0.15)',
                textColor: '#c4908a', // lotus-pink-dark (更明显的粉)
                cardBg: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,245,242,0.9) 100%)'
            },
            'wanxiang': {
                // 桂金 - 明显的金色调
                gradient: 'linear-gradient(145deg, rgba(232, 220, 192, 0.35) 0%, rgba(196, 160, 96, 0.25) 50%, rgba(196, 160, 96, 0.15) 100%)',
                bgOverlay: 'rgba(232, 220, 192, 0.15)',
                textColor: '#c4a060', // osmanthus-gold-dark (更明显的金)
                cardBg: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,245,242,0.9) 100%)'
            },
            'xiaoyuan': {
                // 苔绿 - 低饱和度绿色调
                gradient: 'linear-gradient(145deg, rgba(212, 221, 212, 0.3) 0%, rgba(148, 155, 138, 0.2) 50%, rgba(154, 171, 154, 0.15) 100%)',
                bgOverlay: 'rgba(212, 221, 212, 0.1)',
                textColor: '#9aab9a', // moss-green-dark
                cardBg: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,245,242,0.9) 100%)'
            },
        };
        return themeMap[scentId] || {
            gradient: 'linear-gradient(145deg, rgba(141, 125, 119, 0.12) 0%, rgba(191, 165, 148, 0.08) 100%)',
            bgOverlay: 'rgba(141, 125, 119, 0.05)',
            textColor: '#8d7d77', // earth-taupe
            cardBg: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,245,242,0.9) 100%)'
        };
    };

    return (
        <div className="absolute inset-0 bg-background-zen z-50 overflow-hidden animate-fade-in font-sans flex flex-col">
            {/* Header */}
            <div className="flex-none px-8 py-6 flex justify-between items-center z-20">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-ink-light tracking-wider uppercase mb-1">小屿和 · 香</span>
                    <h2 className="text-3xl font-bold text-ink-gray">
                        {timeGreeting}
                    </h2>
                </div>
                {/* 右侧按钮组 */}
                <div className="flex items-center gap-3">
                    {/* 用户/登录按钮 */}
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-105 transition-transform border border-gray-100 active:scale-95 group"
                        title="登录 / 注册"
                    >
                        <User className="w-6 h-6 text-ink-gray transition-colors group-hover:text-dopamine-orange" strokeWidth={2} />
                    </button>
                    {/* 赠送按钮 */}
                    <button
                        onClick={() => setShowGiftModal(true)}
                        className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-105 transition-transform border border-gray-100 active:scale-95 group"
                        title="将疗愈歌单送给朋友"
                    >
                        <Gift className="w-6 h-6 text-ink-gray transition-colors group-hover:text-pink-500" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Main Content: Scent Selection */}
            <div className="flex-1 flex flex-col px-6 pb-8 overflow-y-auto no-scrollbar">

                <div className="mb-6 mt-4">
                    <h3 className="text-xl font-bold text-ink-gray mb-2">确认今日香型</h3>
                    <p className="text-sm text-ink-gray opacity-60">轻触确认，开启此刻的疗愈</p>
                </div>

                {/* Scent List */}
                <div className="space-y-3 pb-8">
                    {FRAGRANCE_LIST.map((scent) => {
                        const isSelected = selectedScentId === scent.id;
                        const isExpanded = expandedScentId === scent.id;
                        const isLocked = scent.status === 'locked';
                        const accentColorClass = getAccentColorClass(scent.id);

                        const theme = getScentTheme(scent.id);

                        return (
                            <div
                                key={scent.id}
                                id={`scent-card-${scent.id}`}
                                onClick={() => handleCardClick(scent.id, scent.status)}
                                style={isExpanded ? { background: theme.cardBg } : undefined}
                                className={`
                                    relative overflow-hidden transition-all duration-400 ease-out border
                                    ${isLocked ? 'opacity-60 grayscale cursor-not-allowed bg-gray-50/50 border-transparent' : 'cursor-pointer'}
                                    ${isExpanded
                                        ? 'aspect-[4/5] max-w-[85vw] mx-auto rounded-[2rem] backdrop-blur-xl border-white/60 shadow-xl animate-card-expand z-20 my-4'
                                        : 'h-20 rounded-2xl'}
                                    ${isSelected && !isExpanded
                                        ? 'bg-white border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] scale-[1.02]'
                                        : !isExpanded && 'bg-white/40 hover:bg-white/70 border-white/40 backdrop-blur-md hover:shadow-sm'}
                                `}
                            >
                                {isExpanded ? (
                                    // Expanded Card Content - Simplified elegant layout
                                    <div
                                        className="p-8 flex flex-col h-full animate-fade-in-up"
                                        style={{ background: theme.gradient }}
                                    >
                                        {/* Top Badge & Check */}
                                        <div className="flex justify-between items-start mb-auto">
                                            <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                                                {scent.ingredients.slice(0, 2).map((ing, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 rounded-full text-[10px] font-medium bg-white/40 backdrop-blur-md border border-white/50 text-[#8d7d77]"
                                                    >
                                                        {ing}
                                                    </span>
                                                ))}
                                            </div>
                                            <div
                                                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm ml-auto shrink-0"
                                            >
                                                <Check
                                                    className="w-5 h-5"
                                                    strokeWidth={2.5}
                                                    style={{ color: '#949b8a' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Main Content - Title and Story */}
                                        <div className="mt-8">
                                            <h4 className="text-3xl font-serif font-bold text-ink-gray leading-tight mb-3">
                                                {scent.name}
                                            </h4>
                                            {scent.story && (
                                                <p className="text-sm text-[#8d7d77] leading-relaxed max-w-[85%] font-serif">
                                                    {scent.story}
                                                </p>
                                            )}
                                        </div>

                                        {/* Bottom Actions: Primary Ignite + Secondary Info */}
                                        <div className="flex items-center gap-3 pt-8 mt-8">
                                            {/* Info Button (Small, Secondary) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowFragranceDetail(true);
                                                }}
                                                className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-lg shadow-ink-gray/5 border border-white/50 text-ink-gray hover:scale-105 transition-transform shrink-0"
                                            >
                                                <Info className="w-6 h-6" strokeWidth={1.5} />
                                            </button>

                                            {/* Ignite Button (Primary, Wide) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConfirmScent();
                                                }}
                                                className="flex-1 h-16 bg-[#3a3530] text-[#f2ede4] rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-[#3a3530]/90 transition-colors active:scale-95"
                                            >
                                                <Flame className="w-5 h-5" strokeWidth={1.5} />
                                                <span className="font-serif italic text-lg tracking-wide">点一支</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Collapsed Card Content
                                    <div className="h-full flex items-center px-5 gap-4">
                                        {/* Color Indicator */}
                                        <div className={`w-1.5 h-8 rounded-full ${accentColorClass} ${isLocked ? 'opacity-30' : ''}`}></div>

                                        {/* Text Content */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className={`font-bold text-lg leading-tight ${isSelected ? 'text-ink-gray' : 'text-ink-gray/80'}`}>
                                                {scent.name.split(' · ')[0]}
                                            </h4>
                                            <span className="text-xs text-ink-light font-medium tracking-widest opacity-70">
                                                {scent.desc}
                                            </span>
                                        </div>

                                        {/* Right Side: Icon/Status */}
                                        <div className="flex items-center justify-center w-[4.5rem]">
                                            {isSelected ? (
                                                <div className="bg-dopamine-orange text-white rounded-full p-1 animate-scale-in shadow-sm">
                                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                </div>
                                            ) : (
                                                !isLocked && <div className={`w-2 h-2 rounded-full ${accentColorClass} opacity-20`}></div>
                                            )}
                                            {isLocked && (
                                                <div className="flex flex-col items-center gap-0.5 opacity-40">
                                                    <ScanLine className="w-4 h-4 text-ink-gray" />
                                                    <span className="text-[9px] font-bold text-ink-gray transform scale-90">待解锁</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>


            {/* Mood Map Modal (Kept from original) */}
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
                                    <span className="text-xs font-bold text-ink-gray">我的心情想法</span>
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
                                                        <MessageCircleHeart className="w-3.5 h-3.5 text-dopamine-pink" />
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

            {/* Fragrance Detail Modal - Redesigned with scent theme */}
            {showFragranceDetail && selectedScentId && (
                <div
                    className="fixed inset-0 z-[80] cursor-default"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
                        onClick={() => setShowFragranceDetail(false)}
                    />
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-surface-white/95 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-30px_80px_rgba(0,0,0,0.1)] pt-8 transform animate-slide-up transition-transform duration-300 border-t border-white/60 h-[85vh] flex flex-col"
                        style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.98) 0%, ${getScentTheme(selectedScentId).bgOverlay || 'rgba(247,245,242,0.95)'} 100%)` }}
                    >
                        <div className="flex justify-center mb-2 shrink-0">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full opacity-50"></div>
                        </div>

                        {/* Redesigned View: 制香师说 + 安心说明 */}
                        <div className="animate-fade-in flex flex-col h-full overflow-hidden relative">
                            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
                                {/* Section 1: 制香师说 (First, main content) */}
                                <div
                                    className="p-6 rounded-[2rem] mb-6"
                                    style={{
                                        background: `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, color-mix(in srgb, ${getScentTheme(selectedScentId).textColor} 8%, rgba(255,255,255,0.6)) 100%)`,
                                        borderColor: `color-mix(in srgb, ${getScentTheme(selectedScentId).textColor} 15%, transparent)`,
                                        borderWidth: '1px',
                                        borderStyle: 'solid'
                                    }}
                                >
                                    <div className="flex flex-col items-center mb-5">
                                        <Quote
                                            className="w-8 h-8 mb-2 fill-current"
                                            style={{ color: getScentTheme(selectedScentId).textColor, opacity: 0.4 }}
                                        />
                                        <h3 className="text-lg font-serif font-bold text-ink-gray">{TEXT_CONTENT.product.modal[selectedScentId]?.story?.title || TEXT_CONTENT.product.modal.tinghe.story.title}</h3>
                                        <p
                                            className="text-xs tracking-widest mt-1 uppercase"
                                            style={{ color: getScentTheme(selectedScentId).textColor, opacity: 0.7 }}
                                        >
                                            {TEXT_CONTENT.product.modal[selectedScentId]?.story?.subtitle || TEXT_CONTENT.product.modal.tinghe.story.subtitle}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {(TEXT_CONTENT.product.modal[selectedScentId]?.story?.content || TEXT_CONTENT.product.modal.tinghe.story.content).map((paragraph, idx) => (
                                            <p key={idx} className="font-serif text-ink-gray leading-relaxed text-justify text-sm opacity-90">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex justify-center">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm"
                                            style={{
                                                backgroundColor: 'white',
                                                borderColor: `color-mix(in srgb, ${getScentTheme(selectedScentId).textColor} 20%, transparent)`,
                                                borderWidth: '1px',
                                                borderStyle: 'solid'
                                            }}
                                        >👩‍🎨</div>
                                    </div>
                                </div>

                                {/* Section 2: 安心说明 (Second, smaller) */}
                                <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/40">
                                    <h4
                                        className="font-bold text-sm text-ink-gray mb-3 flex items-center gap-2"
                                        style={{ color: getScentTheme(selectedScentId).textColor }}
                                    >
                                        <Leaf className="w-4 h-4" />
                                        {TEXT_CONTENT.product.common.title}
                                    </h4>
                                    <p className="font-medium text-xs text-ink-gray leading-relaxed text-justify opacity-80">
                                        {TEXT_CONTENT.product.common.origin.part1} <b
                                            style={{ color: getScentTheme(selectedScentId).textColor }}
                                            className="px-1 rounded"
                                        >{TEXT_CONTENT.product.common.origin.highlight}</b> {TEXT_CONTENT.product.common.origin.part2}
                                    </p>
                                </div>

                                {/* Safety Warning */}
                                <p className="text-[10px] text-center text-ink-light font-medium tracking-wide opacity-40 mt-6">
                                    {TEXT_CONTENT.product.common.footer}
                                </p>
                            </div>

                            {/* Close Handle */}
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-8 pb-6 flex justify-center cursor-pointer z-10"
                                onClick={() => setShowFragranceDetail(false)}
                            >
                                <div className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                    <ChevronUp className="w-5 h-5 text-ink-gray" />
                                    <span className="text-[10px] text-ink-light tracking-widest uppercase">收起</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gift Setup Modal */}
            <GiftSetupModal
                isOpen={showGiftModal}
                onClose={() => setShowGiftModal(false)}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
};

export default Dashboard;