import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, CloudRain, Leaf, MessageCircleMore, Moon, Pause, Play, Timer, Volume2, VolumeX, X } from 'lucide-react';
import { FRAGRANCE_LIST, TEXT_CONTENT } from '../constants';

interface DashboardProps {
    onScenarioClick: (id: string) => void;
    activeScentId?: string | null;
    isPlaying?: boolean;
    isMuted?: boolean;
    onPlaybackToggle?: () => void;
    onMuteToggle?: () => void;
    onClosePlayer?: () => void;
    onTimerComplete?: () => void;
    initialRemainingSeconds?: number;
    previewMoodRecordStep?: 'mood' | 'context' | null;
    previewMoodRecordMoodId?: string | null;
}

type ScentVisual = {
    englishName: string;
    quote: string;
    number: string;
    gradient: string;
    glow: string;
    progressColor: string;
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const DEFAULT_DURATION_MINUTES = 15;
const TIMER_OPTIONS = [10, 15, 20, 30];
const STORY_SHEET_EXIT_MS = 220;
const MOOD_SAVED_DISMISS_MS = 1500;
const MOOD_RECORD_STORAGE_KEY = 'xiaoyu_scent_mood_records_v1';
const STORY_SHEET_TITLES: Record<string, string> = {
    tinghe: '和清净在一起',
    wanxiang: '和温柔在一起',
    xiaoyuan: '和自在在一起',
};
const BRAND_LOGO_SRC = '/xiaoyuhe-logo.png';

type MoodRecordStep = 'mood' | 'context' | 'saved';

type MoodRecordOption = {
    id: string;
    label: string;
    note: string;
    positionClassName: string;
    orbClassName: string;
    labelClassName?: string;
};

type MoodContextOption = {
    id: string;
    label: string;
};

type StoredMoodRecord = {
    version: 1;
    id: string;
    createdAt: string;
    scentId: string;
    scentName: string;
    durationMinutes: number;
    durationSeconds: number;
    moodId: string;
    mood: string;
    related: string[];
};

type WeekDayMoodSummary = {
    key: string;
    date: Date;
    weekday: string;
    dayLabel: string;
    records: StoredMoodRecord[];
};

const MOOD_RECORD_OPTIONS: MoodRecordOption[] = [
    {
        id: 'calm',
        label: '平静',
        note: '想先把心放平一点。',
        positionClassName: 'left-4 top-3 z-10 w-20',
        orbClassName: 'h-[4.75rem] w-[4.75rem] bg-[#e7f0dd] shadow-[#d8e9cd]/45',
        labelClassName: 'text-[15px] font-semibold text-slate-700',
    },
    {
        id: 'contented',
        label: '满足',
        note: '好像有一点刚刚好。',
        positionClassName: 'right-4 top-4 z-10 w-20',
        orbClassName: 'h-[4.75rem] w-[4.75rem] bg-[#f4eadb] shadow-[#ebddc4]/45',
        labelClassName: 'text-[15px] font-semibold text-slate-700',
    },
    {
        id: 'relaxed',
        label: '轻松',
        note: '身上松下来了一点。',
        positionClassName: 'left-1/2 top-[4.75rem] z-10 w-20 -translate-x-1/2',
        orbClassName: 'h-[4.25rem] w-[4.25rem] bg-[#e1edf2] shadow-[#d4e6ed]/45',
        labelClassName: 'text-[15px] font-semibold text-slate-700',
    },
    {
        id: 'tired',
        label: '疲惫',
        note: '今天已经用掉很多力气。',
        positionClassName: 'right-6 top-[9.75rem] z-0 w-[4.5rem]',
        orbClassName: 'h-16 w-16 bg-[#dbe5f3] shadow-[#d5deef]/45',
    },
    {
        id: 'anxious',
        label: '焦虑',
        note: '脑子和心都还有点悬着。',
        positionClassName: 'left-1/2 top-[11.25rem] z-0 w-[4.5rem] -translate-x-1/2',
        orbClassName: 'h-14 w-14 bg-[#f5dfd9] shadow-[#edd1c9]/45',
    },
    {
        id: 'low',
        label: '低落',
        note: '情绪有点往下沉。',
        positionClassName: 'left-6 top-[9.75rem] z-0 w-[4.5rem]',
        orbClassName: 'h-16 w-16 bg-[#eee1ef] shadow-[#e6d5e7]/45',
    },
];

const MOOD_CONTEXT_OPTIONS: MoodContextOption[] = [
    { id: 'work', label: '工作' },
    { id: 'family', label: '家人' },
    { id: 'relationship', label: '关系' },
    { id: 'sleep', label: '睡眠' },
    { id: 'body', label: '身体' },
    { id: 'money', label: '钱' },
    { id: 'future', label: '未来' },
    { id: 'self', label: '自己' },
    { id: 'weather', label: '天气' },
    { id: 'room', label: '房间' },
    { id: 'sentence', label: '一句话' },
    { id: 'unclear', label: '说不清' },
];

const readStoredMoodRecords = (): StoredMoodRecord[] => {
    if (typeof window === 'undefined') return [];

    try {
        const rawRecords = window.localStorage.getItem(MOOD_RECORD_STORAGE_KEY);
        if (!rawRecords) return [];

        const parsedRecords = JSON.parse(rawRecords);
        return Array.isArray(parsedRecords) ? parsedRecords : [];
    } catch {
        return [];
    }
};

const saveMoodRecord = (record: StoredMoodRecord) => {
    if (typeof window === 'undefined') return;

    const existingRecords = readStoredMoodRecords();
    window.localStorage.setItem(MOOD_RECORD_STORAGE_KEY, JSON.stringify([record, ...existingRecords]));
};

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;

const isValidDate = (date: Date) => Number.isFinite(date.getTime());

const getMoodVisual = (moodId: string) => {
    switch (moodId) {
        case 'calm':
            return { dot: '#a8b995', glow: 'rgba(168, 185, 149, 0.35)', wash: 'rgba(231, 240, 221, 0.68)' };
        case 'contented':
            return { dot: '#d8aa66', glow: 'rgba(216, 170, 102, 0.35)', wash: 'rgba(244, 234, 219, 0.72)' };
        case 'relaxed':
            return { dot: '#90b8c6', glow: 'rgba(144, 184, 198, 0.35)', wash: 'rgba(225, 237, 242, 0.72)' };
        case 'tired':
            return { dot: '#9aa9bf', glow: 'rgba(154, 169, 191, 0.32)', wash: 'rgba(219, 229, 243, 0.68)' };
        case 'anxious':
            return { dot: '#d99b91', glow: 'rgba(217, 155, 145, 0.34)', wash: 'rgba(245, 223, 217, 0.72)' };
        case 'low':
            return { dot: '#bfa8c8', glow: 'rgba(191, 168, 200, 0.34)', wash: 'rgba(238, 225, 239, 0.72)' };
        default:
            return { dot: '#b7abbc', glow: 'rgba(183, 171, 188, 0.28)', wash: 'rgba(255, 255, 255, 0.58)' };
    }
};

const getRecentWeekSummaries = (records: StoredMoodRecord[]): WeekDayMoodSummary[] => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setHours(0, 0, 0, 0);
        date.setDate(today.getDate() - (6 - index));
        const key = formatDateKey(date);
        const recordsForDay = records.filter((record) => {
            const recordDate = new Date(record.createdAt);
            return isValidDate(recordDate) && formatDateKey(recordDate) === key;
        });

        return {
            key,
            date,
            weekday: WEEKDAY_LABELS[date.getDay()],
            dayLabel: formatDisplayDate(date),
            records: recordsForDay,
        };
    });
};

const SCENT_VISUALS: Record<string, ScentVisual> = {
    tinghe: {
        englishName: 'Listening to Lotus',
        quote: '雨后初晴的清冽与苦涩',
        number: '01',
        gradient: 'linear-gradient(135deg, #f4e1dc 0%, #e8bab1 100%)',
        glow: 'rgba(226, 156, 146, 0.32)',
        progressColor: '#cb877c',
        Icon: CloudRain,
    },
    wanxiang: {
        englishName: 'Evening Lane',
        quote: '暮色浸染的木质微光',
        number: '02',
        gradient: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
        glow: 'rgba(255, 224, 178, 0.42)',
        progressColor: '#d8aa66',
        Icon: Moon,
    },
    xiaoyuan: {
        englishName: 'Small Courtyard',
        quote: '青苔漫过石阶的呼吸',
        number: '03',
        gradient: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)',
        glow: 'rgba(220, 237, 200, 0.42)',
        progressColor: '#9eb68a',
        Icon: Leaf,
    },
};

const FALLBACK_VISUAL: ScentVisual = {
    englishName: 'Scent Story',
    quote: '打开这一支香的气味故事',
    number: '00',
    gradient: 'linear-gradient(135deg, #f8f2fa 0%, #e6e0e9 100%)',
    glow: 'rgba(230, 224, 233, 0.36)',
    progressColor: '#c8a0f0',
    Icon: Leaf,
};

const STORY_OCCASIONS: Record<string, string> = {
    tinghe: '适合一个人静静坐一会儿，或想把房间里的杂音慢慢放低的时候。',
    wanxiang: '适合傍晚回家、洗完澡、或想让心先落回身体里的时候。',
    xiaoyuan: '适合午后透气、开窗发呆、或想把呼吸重新拉长一点的时候。',
};

const formatTime = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return {
        minutes: String(minutes),
        seconds: `:${String(seconds).padStart(2, '0')}`,
    };
};

const Dashboard: React.FC<DashboardProps> = ({
    onScenarioClick,
    activeScentId,
    isPlaying,
    isMuted = false,
    onPlaybackToggle,
    onMuteToggle,
    onClosePlayer,
    onTimerComplete,
    initialRemainingSeconds: initialRemainingSecondsProp,
    previewMoodRecordStep,
    previewMoodRecordMoodId,
}) => {
    const initialRemainingSeconds = Math.max(0, initialRemainingSecondsProp ?? DEFAULT_DURATION_MINUTES * 60);
    const [localActiveScentId, setLocalActiveScentId] = useState<string | null>(null);
    const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MINUTES);
    const [pendingDurationMinutes, setPendingDurationMinutes] = useState(DEFAULT_DURATION_MINUTES);
    const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
    const [showTimerSettings, setShowTimerSettings] = useState(false);
    const [showStory, setShowStory] = useState(false);
    const [isStoryClosing, setIsStoryClosing] = useState(false);
    const [showMoodRecorder, setShowMoodRecorder] = useState(false);
    const [moodRecordStep, setMoodRecordStep] = useState<MoodRecordStep>('mood');
    const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
    const [showWeeklyMood, setShowWeeklyMood] = useState(false);
    const [weeklyMoodRecords, setWeeklyMoodRecords] = useState<StoredMoodRecord[]>([]);
    const [selectedWeekDayKey, setSelectedWeekDayKey] = useState<string | null>(null);
    const completionNotifiedRef = useRef(false);
    const storyCloseTimeoutRef = useRef<number | null>(null);
    const moodSavedTimeoutRef = useRef<number | null>(null);

    const playerScentId = activeScentId !== undefined ? activeScentId : localActiveScentId;
    const activeScent = FRAGRANCE_LIST.find((scent) => scent.id === playerScentId) ?? null;
    const activeVisual = activeScent ? SCENT_VISUALS[activeScent.id] ?? FALLBACK_VISUAL : FALLBACK_VISUAL;
    const playerIsPlaying = isPlaying ?? Boolean(activeScent);
    const activeModalContent = activeScent ? TEXT_CONTENT.product.modal[activeScent.id] : null;
    const storyContent = activeScent
        ? TEXT_CONTENT.product.modal[activeScent.id]?.story?.content ?? [activeScent.story || activeVisual.quote]
        : [];
    const focusCopyLines = storyContent.length > 0
        ? storyContent.slice(0, 2)
        : activeScent?.story
            ? activeScent.story.split('\n\n').filter(Boolean).slice(0, 2)
            : [activeVisual.quote];
    const ingredientTags = activeScent?.ingredients ?? [];
    const storyIngredientList =
        activeModalContent?.ingredients?.list ??
        ingredientTags.map((ingredient) => ({
            name: ingredient,
            desc: '',
        }));
    const storyOccasionLead =
        activeScent?.vibe && activeScent.vibe.includes('：')
            ? activeScent.vibe.split('：')[1]
            : activeScent?.vibe ?? '';
    const storyOccasionBody = activeScent ? STORY_OCCASIONS[activeScent.id] ?? '适合想把自己慢慢放回当下的时候。' : '';
    const storySheetTitle = activeScent ? STORY_SHEET_TITLES[activeScent.id] ?? `${activeScent.name}的制香师说` : '制香师说';
    const timeParts = formatTime(remainingSeconds);
    const selectedMood = selectedMoodId ? MOOD_RECORD_OPTIONS.find((option) => option.id === selectedMoodId) ?? null : null;
    const weekSummaries = getRecentWeekSummaries(weeklyMoodRecords);
    const selectedWeekDay =
        weekSummaries.find((day) => day.key === selectedWeekDayKey) ?? weekSummaries[weekSummaries.length - 1] ?? null;
    const selectedWeekRecords = selectedWeekDay?.records ?? [];
    const selectedWeekRecord = selectedWeekRecords[0] ?? null;
    const selectedWeekRecordDate = selectedWeekRecord ? new Date(selectedWeekRecord.createdAt) : null;
    const selectedWeekRecordTime =
        selectedWeekRecordDate && isValidDate(selectedWeekRecordDate)
            ? selectedWeekRecordDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            : '刚刚';
    const selectedWeekRecordVisual = selectedWeekRecord ? getMoodVisual(selectedWeekRecord.moodId) : null;
    const weeklyRecordCount = weekSummaries.reduce((total, day) => total + day.records.length, 0);

    const clearStoryCloseTimeout = () => {
        if (storyCloseTimeoutRef.current !== null) {
            window.clearTimeout(storyCloseTimeoutRef.current);
            storyCloseTimeoutRef.current = null;
        }
    };

    const clearMoodSavedTimeout = () => {
        if (moodSavedTimeoutRef.current !== null) {
            window.clearTimeout(moodSavedTimeoutRef.current);
            moodSavedTimeoutRef.current = null;
        }
    };

    const resetMoodRecorder = () => {
        clearMoodSavedTimeout();
        setShowMoodRecorder(false);
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
    };

    const scheduleMoodSavedDismiss = () => {
        clearMoodSavedTimeout();
        moodSavedTimeoutRef.current = window.setTimeout(() => {
            moodSavedTimeoutRef.current = null;
            resetMoodRecorder();
        }, MOOD_SAVED_DISMISS_MS);
    };

    const openStorySheet = () => {
        clearStoryCloseTimeout();
        setIsStoryClosing(false);
        setShowStory(true);
    };

    const closeStorySheet = () => {
        if (!showStory || isStoryClosing) return;

        clearStoryCloseTimeout();
        setIsStoryClosing(true);
        storyCloseTimeoutRef.current = window.setTimeout(() => {
            setShowStory(false);
            setIsStoryClosing(false);
            storyCloseTimeoutRef.current = null;
        }, STORY_SHEET_EXIT_MS);
    };

    useEffect(() => {
        if (!activeScent) return;

        setDurationMinutes(DEFAULT_DURATION_MINUTES);
        setPendingDurationMinutes(DEFAULT_DURATION_MINUTES);
        setRemainingSeconds(initialRemainingSeconds);
        setShowTimerSettings(false);
        setShowStory(false);
        setIsStoryClosing(false);
        setShowMoodRecorder(false);
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
        clearStoryCloseTimeout();
        clearMoodSavedTimeout();
        completionNotifiedRef.current = false;
    }, [activeScent?.id, initialRemainingSeconds]);

    useEffect(() => {
        return () => {
            clearStoryCloseTimeout();
            clearMoodSavedTimeout();
        };
    }, []);

    useEffect(() => {
        if (!activeScent || !playerIsPlaying || remainingSeconds <= 0) return;

        const intervalId = window.setInterval(() => {
            setRemainingSeconds((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [activeScent, playerIsPlaying, remainingSeconds]);

    useEffect(() => {
        if (!activeScent || remainingSeconds > 0 || completionNotifiedRef.current) return;

        completionNotifiedRef.current = true;
        setShowTimerSettings(false);
        setShowStory(false);
        setIsStoryClosing(false);
        clearStoryCloseTimeout();
        clearMoodSavedTimeout();
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
        setShowMoodRecorder(true);
        onTimerComplete?.();
    }, [activeScent, onTimerComplete, remainingSeconds]);

    useEffect(() => {
        if (!activeScent || !previewMoodRecordStep) return;

        const previewMoodId = MOOD_RECORD_OPTIONS.some((option) => option.id === previewMoodRecordMoodId)
            ? previewMoodRecordMoodId
            : MOOD_RECORD_OPTIONS[0]?.id ?? null;

        setShowTimerSettings(false);
        setShowStory(false);
        setIsStoryClosing(false);
        clearStoryCloseTimeout();
        clearMoodSavedTimeout();
        setShowMoodRecorder(true);

        if (previewMoodRecordStep === 'context' && previewMoodId) {
            setSelectedMoodId(previewMoodId);
            setMoodRecordStep('context');
            return;
        }

        setSelectedMoodId(null);
        setMoodRecordStep('mood');
    }, [activeScent, previewMoodRecordMoodId, previewMoodRecordStep]);

    const handleOpenScent = (scentId: string) => {
        setLocalActiveScentId(scentId);
        onScenarioClick(scentId);
    };

    const handleClosePlayer = () => {
        setLocalActiveScentId(null);
        setShowTimerSettings(false);
        setShowStory(false);
        setIsStoryClosing(false);
        setShowMoodRecorder(false);
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
        clearStoryCloseTimeout();
        clearMoodSavedTimeout();
        onClosePlayer?.();
    };

    const handleConfirmDuration = () => {
        setDurationMinutes(pendingDurationMinutes);
        setRemainingSeconds(pendingDurationMinutes * 60);
        completionNotifiedRef.current = false;
        setShowTimerSettings(false);
    };

    const handleMoodSelect = (moodId: string) => {
        setSelectedMoodId(moodId);
        setMoodRecordStep('context');
    };

    const handleSaveMoodRecord = (contextIds: string[]) => {
        if (!activeScent || !selectedMood) return;

        const related = contextIds
            .map((contextId) => MOOD_CONTEXT_OPTIONS.find((option) => option.id === contextId)?.label)
            .filter((label): label is string => Boolean(label));
        const createdAt = new Date().toISOString();

        const record: StoredMoodRecord = {
            version: 1,
            id: `${createdAt}-${activeScent.id}`,
            createdAt,
            scentId: activeScent.id,
            scentName: activeScent.name,
            durationMinutes,
            durationSeconds: durationMinutes * 60,
            moodId: selectedMood.id,
            mood: selectedMood.label,
            related,
        };

        saveMoodRecord(record);
        setWeeklyMoodRecords(readStoredMoodRecords());
        setMoodRecordStep('saved');
        scheduleMoodSavedDismiss();
    };

    const handleContextSelect = (contextId: string) => {
        handleSaveMoodRecord([contextId]);
    };

    const handleSkipMoodRecord = () => {
        resetMoodRecorder();
    };

    const handleSkipMoodContext = () => {
        handleSaveMoodRecord([]);
    };

    const openWeeklyMoodSheet = () => {
        const storedRecords = readStoredMoodRecords();
        const summaries = getRecentWeekSummaries(storedRecords);
        const latestRecordedDay = [...summaries].reverse().find((day) => day.records.length > 0);
        const fallbackDay = summaries[summaries.length - 1] ?? null;

        setWeeklyMoodRecords(storedRecords);
        setSelectedWeekDayKey((latestRecordedDay ?? fallbackDay)?.key ?? null);
        setShowWeeklyMood(true);
    };

    const closeWeeklyMoodSheet = () => {
        setShowWeeklyMood(false);
    };

    if (activeScent) {
        return (
            <div className="absolute inset-0 z-50 overflow-hidden bg-[#fdfbfd] text-[#1e293b] font-sans">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#f3e8ff_0%,#fdfbfd_70%)] opacity-90" />
                <div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
                    style={{ backgroundColor: activeVisual.glow }}
                />

                <main className="relative z-10 mx-auto flex h-full w-full max-w-[480px] flex-col px-6">
                    <section className="flex items-start justify-between gap-5 py-8 animate-fade-in-up">
                        <div className="max-w-[76%]">
                            <div className="flex items-baseline gap-2">
                                <h1 className="text-xl font-medium tracking-[-0.03em] text-slate-800">
                                    {activeScent.name}
                                </h1>
                                <span className="text-[11px] font-light uppercase tracking-[0.18em] text-slate-500">
                                    {activeVisual.englishName}
                                </span>
                            </div>

                            <div className="mt-4 max-w-[18rem] space-y-3 text-[22px] font-light italic leading-[1.55] tracking-[-0.03em] text-slate-500 sm:max-w-[20rem] sm:text-[24px]">
                                {focusCopyLines.map((line, index) => (
                                    <p key={`${activeScent.id}-focus-line-${index}`}>{line}</p>
                                ))}
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {ingredientTags.map((ingredient) => (
                                    <span
                                        key={`${activeScent.id}-ingredient-${ingredient}`}
                                        className="rounded-full border border-white/70 bg-white/50 px-3 py-1.5 text-[11px] font-medium tracking-[0.08em] text-slate-500 backdrop-blur-xl"
                                    >
                                        {ingredient}
                                    </span>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={openStorySheet}
                                className="mt-6 flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-600 transition hover:text-slate-900"
                            >
                                <MessageCircleMore className="h-4 w-4" strokeWidth={1.6} />
                                <span>制香师说</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            aria-label="关闭播放页"
                            onClick={handleClosePlayer}
                            className="rounded-full border border-slate-900/10 bg-slate-900/5 p-2 text-slate-800 transition hover:bg-slate-900/10 active:scale-95"
                        >
                            <X className="h-5 w-5" strokeWidth={1.6} />
                        </button>
                    </section>

                    <section className="flex flex-1 items-end pb-6">
                        <div className="w-full">
                            <div className="flex justify-center px-1">
                                <span className="text-[28px] font-extralight leading-none tracking-[-0.06em] text-slate-600 tabular-nums">
                                    {timeParts.minutes}
                                    {timeParts.seconds}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="pb-10">
                        <div className="mx-auto flex max-w-xs items-center justify-between rounded-full border border-white/60 bg-white/40 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-2xl">
                            <button
                                type="button"
                                aria-label={isMuted ? '取消静音' : '静音'}
                                onClick={onMuteToggle}
                                className="p-3 text-slate-500 transition hover:text-slate-800 active:scale-95"
                            >
                                {isMuted ? <VolumeX className="h-6 w-6" strokeWidth={1.5} /> : <Volume2 className="h-6 w-6" strokeWidth={1.5} />}
                            </button>

                            <button
                                type="button"
                                aria-label={playerIsPlaying ? '暂停播放' : '继续播放'}
                                onClick={onPlaybackToggle}
                                className="flex h-14 w-14 items-center justify-center rounded-full border border-[#e8d0ff] bg-[#f8f0ff] text-[#4d2a73] shadow-[0_4px_12px_rgba(200,160,240,0.2)] transition hover:scale-105 active:scale-95"
                            >
                                {playerIsPlaying ? <Pause className="h-7 w-7 fill-current" strokeWidth={1.4} /> : <Play className="h-7 w-7 fill-current" strokeWidth={1.4} />}
                            </button>

                            <button
                                type="button"
                                aria-label="设置燃香时间"
                                onClick={() => {
                                    setPendingDurationMinutes(durationMinutes);
                                    setShowTimerSettings(true);
                                }}
                                className="p-3 text-slate-500 transition hover:text-slate-800 active:scale-95"
                            >
                                <Timer className="h-6 w-6" strokeWidth={1.5} />
                            </button>
                        </div>
                    </section>
                </main>

                {showTimerSettings && (
                    <div className="absolute inset-0 z-30 flex items-end bg-[#fbf3f4]/50 backdrop-blur-[8px]" onClick={() => setShowTimerSettings(false)}>
                        <div
                            data-sheet-panel="timer-settings"
                            className="w-full rounded-t-[2rem] border border-white/80 bg-[#fffaf8]/98 px-6 pb-8 pt-6 shadow-[0_-28px_90px_rgba(94,69,72,0.12)] backdrop-blur-3xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300/70" />
                            <h2 className="text-center text-xl font-medium text-slate-800">想让这段声音陪你多久？</h2>
                            <p className="mt-2 text-center text-sm text-slate-500">这里只调整声音陪伴的时长，不影响你手中的香。</p>

                            <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
                                {TIMER_OPTIONS.map((minutes) => (
                                    <button
                                        key={minutes}
                                        type="button"
                                        aria-label={`${minutes} 分钟`}
                                        onClick={() => setPendingDurationMinutes(minutes)}
                                        className={`rounded-2xl border px-4 py-4 text-sm font-medium transition active:scale-95 ${
                                            pendingDurationMinutes === minutes
                                                ? 'border-[#c8a0f0] bg-[#f8f0ff] text-[#4d2a73]'
                                                : 'border-white/70 bg-white/55 text-slate-600 hover:bg-white'
                                        }`}
                                    >
                                        {minutes} 分钟
                                    </button>
                                ))}
                            </div>

                            <div className="mx-auto mt-6 flex max-w-sm gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTimerSettings(false)}
                                    className="flex-1 rounded-full bg-white/60 px-5 py-3 text-sm font-medium text-slate-500 transition hover:bg-white active:scale-95"
                                >
                                    取消
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDuration}
                                    className="flex-1 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 active:scale-95"
                                >
                                    确认
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showStory && (
                    <div
                        data-sheet-overlay="story"
                        className={`absolute inset-0 z-30 flex items-end backdrop-blur-[10px] ${
                            isStoryClosing
                                ? 'bg-[#f8f1f2]/0 opacity-0 transition-opacity duration-200 ease-out'
                                : 'bg-[#f8f1f2]/76 opacity-100 animate-fade-in'
                        }`}
                        onClick={closeStorySheet}
                    >
                        <div
                            data-sheet-panel="story"
                            data-state={isStoryClosing ? 'closing' : 'open'}
                            className={`no-scrollbar max-h-[80vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/80 bg-[#fffaf7]/98 px-6 pb-10 pt-6 shadow-[0_-28px_90px_rgba(94,69,72,0.12)] backdrop-blur-3xl ${
                                isStoryClosing
                                    ? 'translate-y-6 opacity-0 transition-all duration-200 ease-out'
                                    : 'translate-y-0 opacity-100 animate-fade-in-up'
                            }`}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300/70" />
                            <div className="mx-auto max-w-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{activeVisual.englishName}</p>
                                        <h2 className="mt-2 text-2xl font-medium text-slate-800">{storySheetTitle}</h2>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="关闭制香师说"
                                        onClick={closeStorySheet}
                                        className="rounded-full bg-slate-900/5 p-2 text-slate-700"
                                    >
                                        <X className="h-5 w-5" strokeWidth={1.6} />
                                    </button>
                                </div>

                                <div className="mt-6 space-y-6">
                                    <section>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">[ 气味印象 ]</p>
                                        <div className="mt-3 text-[15px] leading-8 text-slate-600">
                                            <p className="text-[18px] font-light italic leading-8 tracking-[-0.03em] text-slate-500">{activeVisual.quote}</p>
                                        </div>
                                    </section>

                                    <section>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">[ 用了什么原材 ]</p>
                                        <div className="mt-3 grid gap-3">
                                            {storyIngredientList.map((item) => (
                                                <div
                                                    key={`${activeScent.id}-story-ingredient-${item.name}`}
                                                    className="rounded-[1.35rem] border border-white/75 bg-white/72 px-4 py-3 shadow-[0_10px_28px_rgba(255,255,255,0.16)]"
                                                >
                                                    <p className="text-sm font-medium text-slate-700">{item.name}</p>
                                                    {item.desc ? <p className="mt-1 text-sm text-slate-500">{item.desc}</p> : null}
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">[ 为什么这样调 ]</p>
                                        <div data-story-section="reason" className="mt-3 space-y-3 text-[15px] leading-7 tracking-[-0.03em] text-slate-600">
                                            {storyContent.map((paragraph, index) => (
                                                <p key={`${activeScent.id}-story-${index}`}>{paragraph}</p>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">[ 适合什么时候点 ]</p>
                                        <div data-story-section="occasion" className="mt-3 space-y-2 text-[15px] leading-7 tracking-[-0.03em] text-slate-600">
                                            {storyOccasionLead ? <p>{storyOccasionLead}</p> : null}
                                            <p>{storyOccasionBody}</p>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showMoodRecorder && (
                    <div
                        data-sheet-overlay="mood-record"
                        className="absolute inset-0 z-40 flex items-end bg-[#fbf3f4]/70 backdrop-blur-[10px] animate-fade-in"
                        onClick={handleSkipMoodRecord}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="记录此刻心情"
                            data-sheet-panel="mood-record"
                            data-step={moodRecordStep}
                            className="w-full rounded-t-[2rem] border border-white/80 bg-[#fffaf8]/96 px-6 pb-8 pt-6 shadow-[0_-28px_90px_rgba(94,69,72,0.12)] backdrop-blur-3xl animate-fade-in-up"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300/70" />

                            {moodRecordStep === 'mood' && (
                                <div className="mx-auto max-w-md">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">MOMENT CHECK</p>
                                            <h2 className="mt-2 text-2xl font-medium text-slate-800">你现在感受如何？</h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-500">现在的你，更接近哪一种？</p>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label="先不记"
                                            onClick={handleSkipMoodRecord}
                                            className="rounded-full bg-slate-900/5 p-2 text-slate-700 transition hover:bg-slate-900/10 active:scale-95"
                                        >
                                            <X className="h-5 w-5" strokeWidth={1.6} />
                                        </button>
                                    </div>

                                    <div
                                        aria-label="心情气泡"
                                        className="relative mx-auto mt-6 h-[17rem] max-w-[330px] overflow-visible"
                                    >
                                        {MOOD_RECORD_OPTIONS.map((mood) => (
                                            <button
                                                key={mood.id}
                                                type="button"
                                                aria-label={mood.label}
                                                onClick={() => handleMoodSelect(mood.id)}
                                                className={`group absolute flex flex-col items-center gap-2 text-slate-500 outline-none transition duration-500 active:scale-95 ${mood.positionClassName}`}
                                            >
                                                <span
                                                    className={`block rounded-full border border-white/60 blur-[1px] shadow-xl transition duration-500 group-hover:scale-110 group-hover:blur-0 ${mood.orbClassName}`}
                                                />
                                                <span className={`relative z-10 text-sm font-medium tracking-[0.04em] text-slate-600 drop-shadow-[0_2px_10px_rgba(255,255,255,0.96)] transition group-hover:text-slate-800 ${mood.labelClassName ?? ''}`}>
                                                    {mood.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSkipMoodRecord}
                                        className="mx-auto mt-2 block rounded-full bg-white/55 px-5 py-3 text-sm font-medium text-slate-500 transition hover:bg-white active:scale-95"
                                    >
                                        先不记
                                    </button>
                                </div>
                            )}

                            {moodRecordStep === 'context' && selectedMood && (
                                <div className="mx-auto max-w-md">
                                    <button
                                        type="button"
                                        onClick={() => setMoodRecordStep('mood')}
                                        className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 transition hover:text-slate-700"
                                    >
                                        返回
                                    </button>

                                    <h2 className="mt-6 text-2xl font-medium text-slate-800">这份感觉和什么有关？</h2>

                                    <div className="mt-5 flex flex-wrap gap-2.5">
                                        {MOOD_CONTEXT_OPTIONS.map((context) => (
                                            <button
                                                key={context.id}
                                                type="button"
                                                onClick={() => handleContextSelect(context.id)}
                                                className="inline-flex items-center rounded-full border border-white/70 bg-white/58 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:border-[#d99b91]/40 hover:bg-white hover:text-[#7a4038] active:scale-95"
                                            >
                                                {context.label}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSkipMoodContext}
                                        className="mt-7 rounded-full bg-white/58 px-5 py-3 text-sm font-medium text-slate-500 transition hover:bg-white active:scale-95"
                                    >
                                        跳过
                                    </button>
                                </div>
                            )}

                            {moodRecordStep === 'saved' && (
                                <div className="mx-auto max-w-md py-10 text-center">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-[#f4ddd8] text-[#7a4038] shadow-[0_18px_48px_rgba(217,155,145,0.22)]">
                                            <Check className="h-7 w-7" strokeWidth={1.8} />
                                        </div>
                                    <h2 className="text-2xl font-medium text-slate-800">已经记录</h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-500">这次记录已存在本地浏览器里。</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="no-scrollbar absolute inset-0 z-50 overflow-y-auto bg-[#f5f0f7] text-[#1d1b20] font-sans">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#dfeeea]/70 blur-[90px]" />
                <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-[#ffe8c8]/70 blur-[100px]" />
                <div className="absolute bottom-[-9rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#e9ddff]/55 blur-[120px]" />
            </div>

            <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
                <img
                    src={BRAND_LOGO_SRC}
                    alt="小屿和品牌 Logo"
                    className="h-auto w-[10.4rem] object-contain opacity-80 sm:w-[10.9rem]"
                />
                <button
                    type="button"
                    aria-label="查看这一周的心绪"
                    onClick={openWeeklyMoodSheet}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/65 bg-white/45 px-3 py-2 text-[12px] font-medium text-[#665f6c] shadow-[0_10px_30px_rgba(58,50,65,0.06)] backdrop-blur-xl transition hover:bg-white/70 active:scale-95"
                >
                    <CalendarDays className="h-4 w-4" strokeWidth={1.7} />
                    <span>一周心绪</span>
                </button>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-60px)] w-full max-w-[480px] flex-col px-5 pb-5 sm:min-h-[calc(100dvh-72px)] sm:px-6 sm:pb-8">
                <section className="shrink-0 pb-4 pt-2 sm:pb-6 sm:pt-4">
                    <h1 className="max-w-[9ch] text-[36px] font-semibold leading-[0.98] tracking-[-0.07em] text-[#201d24] sm:max-w-[11ch] sm:text-[42px] sm:leading-[1.05] sm:tracking-[-0.06em]">
                        找到你手里的那支香
                    </h1>
                    <p className="mt-3 max-w-[16rem] text-[14px] leading-6 text-[#655f6c]/78 sm:mt-4 sm:max-w-[18rem] sm:text-[15px] sm:leading-7">
                        每一支香，都有一段可打开的气味故事。
                    </p>
                </section>

                <section aria-label="香味选择" className="flex min-h-0 flex-1 flex-col gap-3 pb-2 sm:gap-4">
                    {FRAGRANCE_LIST.map((scent) => {
                        const visual = SCENT_VISUALS[scent.id] ?? FALLBACK_VISUAL;
                        const isLocked = scent.status === 'locked';

                        return (
                            <button
                                key={scent.id}
                                type="button"
                                disabled={isLocked}
                                aria-label={isLocked ? `${scent.name}暂未开放` : `打开${scent.name}`}
                                onClick={() => {
                                    if (!isLocked) {
                                        handleOpenScent(scent.id);
                                    }
                                }}
                                className={`
                                    group relative flex min-h-[142px] flex-1 flex-col justify-between overflow-hidden rounded-[1.45rem] border border-white/70
                                    bg-[#fdf7ff]/72 p-4 text-left shadow-[0_18px_55px_rgba(58,50,65,0.07)]
                                    backdrop-blur-2xl transition duration-500 ease-out
                                    sm:min-h-[156px] sm:rounded-[1.65rem] sm:p-5
                                    hover:-translate-y-1 hover:bg-white/86 hover:shadow-[0_24px_70px_rgba(58,50,65,0.12)]
                                    active:translate-y-0 active:scale-[0.985]
                                    disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0
                                `}
                            >
                                <div
                                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-[52px] transition-opacity duration-500 group-hover:opacity-95 sm:-right-12 sm:-top-12 sm:h-36 sm:w-36 sm:blur-[58px]"
                                    style={{ backgroundColor: visual.glow }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#766f7d]/70 sm:text-[11px] sm:tracking-[0.22em]">
                                        <span>{visual.number}</span>
                                        <span>{visual.englishName}</span>
                                    </div>
                                    <h2 className="mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.04em] text-[#201d24] sm:mt-2 sm:text-[28px]">
                                        {scent.name}
                                    </h2>
                                </div>

                                <div className="relative z-10 mt-3 flex h-7 items-center sm:mt-4 sm:h-8">
                                    <div
                                        className="relative h-[10px] w-full overflow-hidden rounded-full shadow-[0_8px_18px_rgba(255,255,255,0.28)] sm:h-3"
                                        style={{ background: visual.gradient }}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.16),rgba(255,255,255,0.62),rgba(255,255,255,0.18))] opacity-75 transition duration-700 group-hover:translate-x-2" />
                                    </div>
                                </div>

                                <div className="relative z-10 mt-3 flex items-end justify-between gap-3 sm:mt-4">
                                    <p className="text-[14px] leading-[1.45] text-[#5d5663]/76 sm:text-[15px] sm:leading-6">
                                        {visual.quote || scent.desc}
                                    </p>
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/58 text-[#665f6c] transition group-hover:bg-white group-hover:text-[#201d24] sm:h-9 sm:w-9">
                                        <Play className="h-[14px] w-[14px] fill-current sm:h-4 sm:w-4" strokeWidth={1.8} />
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </section>
            </main>

            {showWeeklyMood && (
                <div
                    data-sheet-overlay="weekly-mood"
                    className="fixed inset-0 z-40 flex items-end bg-[#fbf3f4]/68 backdrop-blur-[10px] animate-fade-in"
                    onClick={closeWeeklyMoodSheet}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="这一周的心绪"
                        data-sheet-panel="weekly-mood"
                        className="w-full rounded-t-[2rem] border border-white/80 bg-[#fffaf8]/96 px-6 pb-7 pt-5 shadow-[0_-28px_90px_rgba(94,69,72,0.12)] backdrop-blur-3xl animate-fade-in-up"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300/70" />

                        <div className="mx-auto max-w-md">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">MOMENT TRACE</p>
                                    <h2 className="mt-2 text-2xl font-medium text-slate-800">这一周的心绪</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        最近 7 天，记录了 {weeklyRecordCount} 次。
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    aria-label="关闭这一周的心绪"
                                    onClick={closeWeeklyMoodSheet}
                                    className="rounded-full bg-slate-900/5 p-2 text-slate-700 transition hover:bg-slate-900/10 active:scale-95"
                                >
                                    <X className="h-5 w-5" strokeWidth={1.6} />
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-7 gap-2">
                                {weekSummaries.map((day) => {
                                    const latestRecord = day.records[0] ?? null;
                                    const moodVisual = getMoodVisual(latestRecord?.moodId ?? '');
                                    const isSelected = selectedWeekDay?.key === day.key;

                                    return (
                                        <button
                                            key={day.key}
                                            type="button"
                                            aria-label={`${day.dayLabel} 周${day.weekday}${day.records.length ? `，${day.records.length} 次记录` : '，暂无记录'}`}
                                            onClick={() => setSelectedWeekDayKey(day.key)}
                                            className={`flex flex-col items-center gap-2 rounded-[1.2rem] px-1.5 py-2 text-center transition active:scale-95 ${
                                                isSelected ? 'bg-white/68 shadow-[0_12px_32px_rgba(94,69,72,0.08)]' : 'hover:bg-white/40'
                                            }`}
                                        >
                                            <span className="text-[11px] font-medium text-slate-400">周{day.weekday}</span>
                                            <span
                                                className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                                    isSelected ? 'border-white bg-white shadow-[0_8px_20px_rgba(94,69,72,0.12)]' : 'border-white/70 bg-white/42'
                                                }`}
                                                style={{
                                                    boxShadow: latestRecord ? `0 0 22px ${moodVisual.glow}` : undefined,
                                                }}
                                            >
                                                <span
                                                    className={`block rounded-full ${latestRecord ? 'h-4 w-4' : 'h-2 w-2 border border-dashed border-slate-300'}`}
                                                    style={{ backgroundColor: latestRecord ? moodVisual.dot : 'transparent' }}
                                                />
                                            </span>
                                            <span className="text-[10px] text-slate-400">{day.dayLabel}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 rounded-[1.6rem] border border-white/75 bg-white/58 p-4 shadow-[0_18px_54px_rgba(94,69,72,0.08)]">
                                {selectedWeekDay && selectedWeekRecord && selectedWeekRecordVisual ? (
                                    <div>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                {selectedWeekDay.dayLabel} · 周{selectedWeekDay.weekday}
                                            </p>
                                            <span className="rounded-full bg-white/65 px-3 py-1 text-[11px] font-medium text-slate-400">
                                                {selectedWeekRecords.length} 次
                                            </span>
                                        </div>

                                        <article
                                            className="mt-4 rounded-[1.25rem] border border-white/75 p-4"
                                            style={{ backgroundColor: selectedWeekRecordVisual.wash }}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-[12px] font-medium text-slate-400">最后一条</p>
                                                <p className="text-[12px] text-slate-400">{selectedWeekRecordTime}</p>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                <div className="rounded-[1rem] bg-white/52 px-3 py-2">
                                                    <p className="text-[11px] text-slate-400">点了什么香</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-700">{selectedWeekRecord.scentName}</p>
                                                </div>
                                                <div className="rounded-[1rem] bg-white/52 px-3 py-2">
                                                    <p className="text-[11px] text-slate-400">点了多久</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-700">{selectedWeekRecord.durationMinutes} 分钟</p>
                                                </div>
                                                <div className="rounded-[1rem] bg-white/52 px-3 py-2">
                                                    <p className="text-[11px] text-slate-400">心情如何</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-700">{selectedWeekRecord.mood}</p>
                                                </div>
                                                <div className="rounded-[1rem] bg-white/52 px-3 py-2">
                                                    <p className="text-[11px] text-slate-400">和什么有关</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-700">
                                                        {selectedWeekRecord.related?.length > 0 ? selectedWeekRecord.related.join('、') : '未选择'}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <p className="text-lg font-medium text-slate-700">这一天还没有记录。</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">等一支香结束后，这里会留下一个小点。</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
