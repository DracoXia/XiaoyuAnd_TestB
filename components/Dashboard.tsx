import React, { useState, useEffect } from 'react';
import { Leaf, Flame, Moon, Snowflake, ArrowRight, Heart, Sparkles, Lock } from 'lucide-react';
import { DASHBOARD_DATA } from '../constants';

interface DashboardProps {
    onScenarioClick: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onScenarioClick }) => {
    const [activeAlert, setActiveAlert] = useState<string | null>(null);
    const [timeGreeting, setTimeGreeting] = useState("安好");
    const [userCounts, setUserCounts] = useState<Record<string, number>>({});
    const [hasNotification, setHasNotification] = useState(true);

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

    const handleCardClick = (card: any) => {
        if (card.status === 'locked') {
            setActiveAlert(`${card.title}模式 即将上线`);
            setTimeout(() => setActiveAlert(null), 2500);
        } else {
            if (card.id === 'relax') {
                onScenarioClick(card.id);
            }
        }
    };

    const handleLifestyleClick = () => {
        setActiveAlert("小屿和生活 即将上线");
        setTimeout(() => setActiveAlert(null), 2500);
    };

    const handleHeartClick = () => {
        if (hasNotification) {
            setHasNotification(false);
            setActiveAlert("已收取今日能量 ✨");
            setTimeout(() => setActiveAlert(null), 3000);
        } else {
             setActiveAlert("能量满满，明天再来哦 💖");
             setTimeout(() => setActiveAlert(null), 2000);
        }
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
                    className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-105 transition-transform border border-gray-100 active:scale-95"
                >
                    <div className="relative">
                         {hasNotification && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-dopamine-pink rounded-full border-2 border-white animate-pulse"></div>
                         )}
                         <Heart className={`w-6 h-6 ${hasNotification ? 'text-ink-gray' : 'text-dopamine-pink fill-dopamine-pink'}`} strokeWidth={2} />
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
                            onClick={() => handleCardClick(card)}
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
        </div>
    );
};

export default Dashboard;