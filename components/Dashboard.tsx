import React, { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, CloudRain, Leaf, MessageCircleMore, Moon, Pause, Play, Timer, X } from 'lucide-react';
import { FRAGRANCE_LIST, TEXT_CONTENT } from '../constants';
import MoodRecorderSheet, { type MoodRecorderStep } from './MoodRecorderSheet';
import FirstVisitTour from './FirstVisitTour';
import { FIRST_VISIT_TOUR_STORAGE_KEY, getInitialTourStep, nextTourStep, type FirstVisitTourStep } from '../lib/onboarding/firstVisitTour';
import { CONTEXT_OPTIONS, MOOD_OPTIONS, type MoodContextId, type MoodId } from '../lib/mood/options';
import { FEEDBACK_LIBRARY, getNextFeedback } from '../lib/mood/feedback';
import { readMoodRecords, saveMoodRecord, type MoodRecordSource, type MoodRecordV2 } from '../lib/mood/moodRecords';
import { buildWeeklyInsight } from '../lib/mood/weeklySummary';
import { getSortedUpdates, UPDATE_READ_STORAGE_KEY } from '../lib/updates/appUpdates';
import { cancelTimerNotification, getOrCreateDeviceToken, requestNotificationPermission, scheduleTimerNotification, subscribeForNotifications, TIMER_NOTIFICATION_ENABLED_KEY, UPDATE_NOTIFICATION_ENABLED_KEY, type NotificationOptInResult } from '../lib/notifications/pushClient';

interface DashboardProps {
    onScenarioClick: (id: string) => void;
    activeScentId?: string | null;
    isPlaying?: boolean;
    onPlaybackToggle?: () => void;
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
const STORY_SHEET_TITLES: Record<string, string> = {
    tinghe: '和清净在一起',
    wanxiang: '和温柔在一起',
    xiaoyuan: '和自在在一起',
};
const BRAND_LOGO_SRC = '/xiaoyuhe-logo.png';

type WeekDayMoodSummary = {
    key: string;
    date: Date;
    weekday: string;
    dayLabel: string;
    records: MoodRecordV2[];
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

const getRecentWeekSummaries = (records: MoodRecordV2[]): WeekDayMoodSummary[] => {
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
        quote: '雨后初晴的清冽与草木回甘',
        number: '01',
        gradient: 'linear-gradient(135deg, #f4e1dc 0%, #e8bab1 100%)',
        glow: 'rgba(226, 156, 146, 0.32)',
        progressColor: '#cb877c',
        Icon: CloudRain,
    },
    wanxiang: {
        englishName: 'Evening Alley',
        quote: '暮色浸染的木质微光',
        number: '02',
        gradient: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
        glow: 'rgba(255, 224, 178, 0.42)',
        progressColor: '#d8aa66',
        Icon: Moon,
    },
    xiaoyuan: {
        englishName: 'Small Yard',
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
    onPlaybackToggle,
    onClosePlayer,
    onTimerComplete,
    initialRemainingSeconds: initialRemainingSecondsProp,
    previewMoodRecordStep,
    previewMoodRecordMoodId,
}) => {
    const initialRemainingSeconds = Math.max(0, initialRemainingSecondsProp ?? DEFAULT_DURATION_MINUTES * 60);
    const reviewParams = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
    const isReviewPreview = import.meta.env.DEV && Boolean(reviewParams?.get('preview'));
    const [tourStep, setTourStep] = useState<FirstVisitTourStep | null>(() => (
        getInitialTourStep(window.localStorage, isReviewPreview || Boolean(reviewParams?.get('review')))
    ));
    const [localActiveScentId, setLocalActiveScentId] = useState<string | null>(null);
    const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MINUTES);
    const [pendingDurationMinutes, setPendingDurationMinutes] = useState(DEFAULT_DURATION_MINUTES);
    const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
    const [showTimerSettings, setShowTimerSettings] = useState(false);
    const [showStory, setShowStory] = useState(false);
    const [isStoryClosing, setIsStoryClosing] = useState(false);
    const [showMoodRecorder, setShowMoodRecorder] = useState(false);
    const [moodRecordStep, setMoodRecordStep] = useState<MoodRecorderStep>('mood');
    const [selectedMoodId, setSelectedMoodId] = useState<MoodId | null>(null);
    const [moodRecordSource, setMoodRecordSource] = useState<MoodRecordSource>('timer');
    const [feedbackText, setFeedbackText] = useState<string | null>(null);
    const [returnToWeekly, setReturnToWeekly] = useState(false);
    const [showWeeklyMood, setShowWeeklyMood] = useState(false);
    const [showUpdateCenter, setShowUpdateCenter] = useState(false);
    const [notificationOptInStatus, setNotificationOptInStatus] = useState<NotificationOptInResult | 'idle'>('idle');
    const [lastSeenUpdateId, setLastSeenUpdateId] = useState(() => (
        typeof window === 'undefined' ? null : window.localStorage.getItem(UPDATE_READ_STORAGE_KEY)
    ));
    const [weeklyMoodRecords, setWeeklyMoodRecords] = useState<MoodRecordV2[]>([]);
    const [selectedWeekDayKey, setSelectedWeekDayKey] = useState<string | null>(null);
    const completionNotifiedRef = useRef(false);
    const clientTimerIdRef = useRef<string | null>(null);
    const storyCloseTimeoutRef = useRef<number | null>(null);

    const playerScentId = activeScentId !== undefined ? activeScentId : localActiveScentId;
    const activeScent = FRAGRANCE_LIST.find((scent) => scent.id === playerScentId) ?? null;
    const activeVisual = activeScent ? SCENT_VISUALS[activeScent.id] ?? FALLBACK_VISUAL : FALLBACK_VISUAL;
    const playerIsPlaying = isPlaying ?? Boolean(activeScent);
    const storyContent = activeScent
        ? TEXT_CONTENT.product.modal[activeScent.id]?.story?.content ?? [activeScent.story || activeVisual.quote]
        : [];
    const focusCopyLines = storyContent.length > 0
        ? storyContent.slice(0, 2)
        : activeScent?.story
            ? activeScent.story.split('\n\n').filter(Boolean).slice(0, 2)
            : [activeVisual.quote];
    const ingredientTags = activeScent?.ingredients ?? [];
    const storyOccasionLead =
        activeScent?.vibe && activeScent.vibe.includes('：')
            ? activeScent.vibe.split('：')[1]
            : activeScent?.vibe ?? '';
    const storyOccasionBody = activeScent ? STORY_OCCASIONS[activeScent.id] ?? '适合想把自己慢慢放回当下的时候。' : '';
    const storySheetTitle = activeScent ? STORY_SHEET_TITLES[activeScent.id] ?? `${activeScent.name}的制香师说` : '制香师说';
    const timeParts = formatTime(remainingSeconds);
    const selectedMood = selectedMoodId ? MOOD_OPTIONS.find((option) => option.id === selectedMoodId) ?? null : null;
    const weekSummaries = getRecentWeekSummaries(weeklyMoodRecords);
    const weeklyInsight = buildWeeklyInsight(weeklyMoodRecords);
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
    const updates = getSortedUpdates();
    const latestUpdateId = updates[0]?.id ?? null;
    const hasUnreadUpdate = reviewParams?.get('fixture') === 'unread'
        || Boolean(latestUpdateId && lastSeenUpdateId !== latestUpdateId);

    const finishTour = () => {
        window.localStorage.setItem(FIRST_VISIT_TOUR_STORAGE_KEY, 'completed');
        setTourStep(null);
    };

    const advanceTour = (expected: FirstVisitTourStep) => {
        setTourStep((current) => current === expected ? nextTourStep(current) : current);
    };

    const clearStoryCloseTimeout = () => {
        if (storyCloseTimeoutRef.current !== null) {
            window.clearTimeout(storyCloseTimeoutRef.current);
            storyCloseTimeoutRef.current = null;
        }
    };

    const resetMoodRecorder = () => {
        setShowMoodRecorder(false);
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
        setFeedbackText(null);
        setReturnToWeekly(false);
    };

    const openStorySheet = () => {
        clearStoryCloseTimeout();
        setIsStoryClosing(false);
        setShowStory(true);
        advanceTour('story');
    };

    const closeStorySheet = () => {
        if (!showStory || isStoryClosing) return;

        clearStoryCloseTimeout();
        setIsStoryClosing(true);
        storyCloseTimeoutRef.current = window.setTimeout(() => {
            setShowStory(false);
            setIsStoryClosing(false);
            storyCloseTimeoutRef.current = null;
            advanceTour('story-close');
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
        completionNotifiedRef.current = false;
    }, [activeScent?.id, initialRemainingSeconds]);

    useEffect(() => {
        return () => {
            clearStoryCloseTimeout();
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
        if (!activeScent || isReviewPreview || window.localStorage.getItem(TIMER_NOTIFICATION_ENABLED_KEY) !== 'true') return;
        const deviceToken = getOrCreateDeviceToken();
        clientTimerIdRef.current ??= `timer-${activeScent.id}-${Date.now()}`;
        if (playerIsPlaying && remainingSeconds > 0) {
            void scheduleTimerNotification({
                clientTimerId: clientTimerIdRef.current,
                deviceToken,
                dueAt: new Date(Date.now() + remainingSeconds * 1000).toISOString(),
                scentId: activeScent.id,
            }).catch(() => undefined);
        } else {
            void cancelTimerNotification(clientTimerIdRef.current, deviceToken).catch(() => undefined);
        }
    }, [activeScent?.id, durationMinutes, isReviewPreview, playerIsPlaying]);

    useEffect(() => {
        if (!activeScent || remainingSeconds > 0 || completionNotifiedRef.current) return;

        completionNotifiedRef.current = true;
        setShowTimerSettings(false);
        setShowStory(false);
        setIsStoryClosing(false);
        clearStoryCloseTimeout();
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
        setMoodRecordSource('timer');
        setFeedbackText(null);
        setReturnToWeekly(false);
        setShowMoodRecorder(true);
        onTimerComplete?.();
    }, [activeScent, onTimerComplete, remainingSeconds]);

    useEffect(() => {
        if (!activeScent || !previewMoodRecordStep) return;

        const previewMoodId = MOOD_OPTIONS.some((option) => option.id === previewMoodRecordMoodId)
            ? previewMoodRecordMoodId as MoodId
            : MOOD_OPTIONS[0]?.id ?? null;

        setShowTimerSettings(false);
        setShowStory(false);
        setIsStoryClosing(false);
        clearStoryCloseTimeout();
        setShowMoodRecorder(true);
        setMoodRecordSource('timer');

        if (previewMoodRecordStep === 'context' && previewMoodId) {
            setSelectedMoodId(previewMoodId);
            setMoodRecordStep('context');
            return;
        }

        setSelectedMoodId(null);
        setMoodRecordStep('mood');
    }, [activeScent, previewMoodRecordMoodId, previewMoodRecordStep]);

    useEffect(() => {
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('open') === 'updates') {
            setShowUpdateCenter(true);
            if (latestUpdateId) {
                window.localStorage.setItem(UPDATE_READ_STORAGE_KEY, latestUpdateId);
                setLastSeenUpdateId(latestUpdateId);
            }
        }
    }, [latestUpdateId]);

    useEffect(() => {
        if (!import.meta.env.DEV || typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const preview = params.get('preview');
        if (!preview || preview === 'timer-ended') return;

        if (preview === 'updates' || preview === 'notification-opt-in') {
            setShowUpdateCenter(true);
            return;
        }
        if (preview === 'weekly-summary') {
            const now = Date.now();
            const records: MoodRecordV2[] = [
                { version: 2, id: 'review-1', source: 'manual', createdAt: new Date(now - 60_000).toISOString(), moodId: 'contented', mood: '满足', contextId: 'recognition', contextLabel: '评价认可', feedbackId: 'contented-recognition-1' },
                { version: 2, id: 'review-2', source: 'timer', createdAt: new Date(now - 86_400_000).toISOString(), moodId: 'anxious', mood: '焦虑', contextId: 'recognition', contextLabel: '评价认可', feedbackId: 'anxious-recognition-1', scentId: 'tinghe', scentName: '听荷', durationMinutes: 15 },
                { version: 2, id: 'review-3', source: 'manual', createdAt: new Date(now - 172_800_000).toISOString(), moodId: 'tired', mood: '疲惫', contextId: 'workload', contextLabel: '工作量', feedbackId: 'tired-workload-1' },
            ];
            setWeeklyMoodRecords(records);
            const summaries = getRecentWeekSummaries(records);
            setSelectedWeekDayKey(summaries[summaries.length - 1]?.key ?? null);
            setShowWeeklyMood(true);
            return;
        }
        if (preview === 'mood-record') {
            setMoodRecordSource('manual');
            setMoodRecordStep('mood');
            setShowMoodRecorder(true);
            return;
        }
        const mood = MOOD_OPTIONS.some((option) => option.id === params.get('mood')) ? params.get('mood') as MoodId : 'anxious';
        if (preview === 'mood-context') {
            setMoodRecordSource('manual');
            setSelectedMoodId(mood);
            setMoodRecordStep('context');
            setShowMoodRecorder(true);
            return;
        }
        if (preview === 'mood-feedback') {
            const context = params.get('context') ?? 'recognition';
            const variant = Math.max(0, Number(params.get('variant') ?? '1') - 1);
            setMoodRecordSource('manual');
            setSelectedMoodId(mood);
            setFeedbackText(FEEDBACK_LIBRARY[`${mood}:${context}`]?.[variant] ?? FEEDBACK_LIBRARY[`${mood}:none`][0]);
            setMoodRecordStep('feedback');
            setShowMoodRecorder(true);
        }
    }, []);

    const handleOpenScent = (scentId: string) => {
        setLocalActiveScentId(scentId);
        onScenarioClick(scentId);
        advanceTour('scent');
    };

    const handleClosePlayer = () => {
        if (clientTimerIdRef.current && window.localStorage.getItem(TIMER_NOTIFICATION_ENABLED_KEY) === 'true') {
            void cancelTimerNotification(clientTimerIdRef.current, getOrCreateDeviceToken()).catch(() => undefined);
        }
        clientTimerIdRef.current = null;
        setLocalActiveScentId(null);
        setShowTimerSettings(false);
        setShowStory(false);
        setIsStoryClosing(false);
        setShowMoodRecorder(false);
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
        clearStoryCloseTimeout();
        onClosePlayer?.();
        advanceTour('home');
    };

    const handleConfirmDuration = () => {
        setDurationMinutes(pendingDurationMinutes);
        setRemainingSeconds(pendingDurationMinutes * 60);
        completionNotifiedRef.current = false;
        setShowTimerSettings(false);
        advanceTour('timer-settings');
    };

    const handleMoodSelect = (moodId: MoodId) => {
        setSelectedMoodId(moodId);
        setMoodRecordStep('context');
        advanceTour('mood');
    };

    const handleSaveMoodRecord = (contextId: MoodContextId | null) => {
        if (!selectedMood) return;

        const context = contextId ? CONTEXT_OPTIONS.find((option) => option.id === contextId) ?? null : null;
        const feedback = getNextFeedback(selectedMood.id, contextId);
        const createdAt = new Date().toISOString();
        const record: MoodRecordV2 = {
            version: 2,
            id: `${createdAt}-${moodRecordSource}`,
            source: moodRecordSource,
            createdAt,
            moodId: selectedMood.id,
            mood: selectedMood.label,
            contextId,
            contextLabel: context?.label ?? null,
            feedbackId: feedback.id,
            ...(moodRecordSource === 'timer' && activeScent ? {
                scentId: activeScent.id,
                scentName: activeScent.name,
                durationMinutes,
            } : {}),
        };

        if (!isReviewPreview) saveMoodRecord(record);
        setWeeklyMoodRecords(isReviewPreview ? [record, ...weeklyMoodRecords] : readMoodRecords());
        setFeedbackText(feedback.text);
        setMoodRecordStep('feedback');
        advanceTour('context');
    };

    const handleContextSelect = (contextId: MoodContextId) => {
        handleSaveMoodRecord(contextId);
    };

    const handleSkipMoodRecord = () => {
        resetMoodRecorder();
    };

    const handleSkipMoodContext = () => {
        handleSaveMoodRecord(null);
    };

    const handleCollectFeedback = () => {
        setShowMoodRecorder(false);
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
        setFeedbackText(null);
        if (returnToWeekly) {
            const records = readMoodRecords();
            setWeeklyMoodRecords(records);
            const summaries = getRecentWeekSummaries(records);
            setSelectedWeekDayKey(summaries[summaries.length - 1]?.key ?? null);
            setShowWeeklyMood(true);
        }
        setReturnToWeekly(false);
        advanceTour('collect');
    };

    const openWeeklyMoodSheet = () => {
        const storedRecords = readMoodRecords();
        const summaries = getRecentWeekSummaries(storedRecords);
        const latestRecordedDay = [...summaries].reverse().find((day) => day.records.length > 0);
        const fallbackDay = summaries[summaries.length - 1] ?? null;

        setWeeklyMoodRecords(storedRecords);
        setSelectedWeekDayKey((latestRecordedDay ?? fallbackDay)?.key ?? null);
        setShowWeeklyMood(true);
        advanceTour('weekly');
    };

    const closeWeeklyMoodSheet = () => {
        setShowWeeklyMood(false);
        advanceTour('weekly-close');
    };

    const openManualMoodRecord = () => {
        setShowWeeklyMood(false);
        setMoodRecordSource('manual');
        setMoodRecordStep('mood');
        setSelectedMoodId(null);
        setFeedbackText(null);
        setReturnToWeekly(true);
        setShowMoodRecorder(true);
        advanceTour('record');
    };

    const openUpdateCenter = () => {
        setShowUpdateCenter(true);
        if (tourStep === 'notification') finishTour();
        if (latestUpdateId && !isReviewPreview) {
            window.localStorage.setItem(UPDATE_READ_STORAGE_KEY, latestUpdateId);
            setLastSeenUpdateId(latestUpdateId);
        }
    };

    const handleNotificationOptIn = async () => {
        if (isReviewPreview) return;
        const result = await requestNotificationPermission();
        setNotificationOptInStatus(result);
        if (result !== 'granted') return;
        window.localStorage.setItem(UPDATE_NOTIFICATION_ENABLED_KEY, 'true');
        window.localStorage.setItem(TIMER_NOTIFICATION_ENABLED_KEY, 'true');
        const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!publicKey || !('serviceWorker' in navigator)) return;
        try {
            await subscribeForNotifications({
                serviceWorker: navigator.serviceWorker,
                fetcher: window.fetch.bind(window),
                publicKey,
                deviceToken: getOrCreateDeviceToken(),
            });
        } catch {
            // 系统通知是增强能力，订阅失败不阻断计时与心绪记录。
        }
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
                                data-tour-target="story"
                                onClick={openStorySheet}
                                className="mt-6 flex w-fit items-center gap-2 text-[15px] font-medium uppercase tracking-[0.16em] text-slate-600 transition hover:text-slate-900"
                            >
                                <MessageCircleMore className="h-5 w-5" strokeWidth={1.6} />
                                <span>制香师说</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            aria-label="关闭播放页"
                            data-tour-target="home"
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
                        <div className="mx-auto flex max-w-[13.5rem] items-center justify-between rounded-full border border-white/60 bg-white/40 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-2xl">
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
                                data-tour-target="timer"
                                onClick={() => {
                                    setPendingDurationMinutes(durationMinutes);
                                    setShowTimerSettings(true);
                                    advanceTour('timer');
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
                            data-tour-target="timer-settings"
                            className="w-full rounded-t-[2rem] border border-white/80 bg-[#fffaf8] px-6 pb-8 pt-6 shadow-[0_-28px_90px_rgba(94,69,72,0.12)]"
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
                            className={`no-scrollbar max-h-[80vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/80 bg-[#fffaf7] px-6 pb-10 pt-6 shadow-[0_-28px_90px_rgba(94,69,72,0.12)] ${
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
                                        data-tour-target="story-close"
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
                    <MoodRecorderSheet
                        step={moodRecordStep}
                        selectedMoodId={selectedMoodId}
                        feedbackText={feedbackText}
                        onMoodSelect={handleMoodSelect}
                        onContextSelect={handleContextSelect}
                        onSkipContext={handleSkipMoodContext}
                        onBack={() => setMoodRecordStep('mood')}
                        onClose={handleSkipMoodRecord}
                        onCollect={handleCollectFeedback}
                    />
                )}
                {tourStep && <FirstVisitTour step={tourStep} onSkip={finishTour} />}
            </div>
        );
    }

    return (
        <div
            className="no-scrollbar absolute inset-0 z-50 overflow-y-auto bg-[#f5f0f7] text-[#1d1b20] font-sans"
            style={{
                paddingLeft: 'env(safe-area-inset-left, 0px)',
                paddingRight: 'env(safe-area-inset-right, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#dfeeea]/70 blur-[90px]" />
                <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-[#ffe8c8]/70 blur-[100px]" />
                <div className="absolute bottom-[-9rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#e9ddff]/55 blur-[120px]" />
            </div>

            <header
                className="sticky top-0 z-20 backdrop-blur-xl"
                style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
            >
                <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-5 pb-4 sm:px-6 sm:pb-5">
                    <img
                        src={BRAND_LOGO_SRC}
                        alt="小屿和品牌 Logo"
                        className="h-auto w-[10.4rem] object-contain opacity-80 sm:w-[10.9rem]"
                    />
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="查看这一周的心绪"
                            data-tour-target="weekly"
                            onClick={openWeeklyMoodSheet}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/65 bg-white/45 px-3 py-2 text-[12px] font-medium text-[#665f6c] shadow-[0_10px_30px_rgba(58,50,65,0.06)] backdrop-blur-xl transition hover:bg-white/70 active:scale-95"
                        >
                            <CalendarDays className="h-4 w-4" strokeWidth={1.7} />
                            <span>一周心绪</span>
                        </button>
                        <button
                            type="button"
                            aria-label="查看更新通知"
                            data-tour-target="notification"
                            data-unread={hasUnreadUpdate ? 'true' : 'false'}
                            onClick={openUpdateCenter}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-white/45 text-[#665f6c] shadow-[0_10px_30px_rgba(58,50,65,0.06)] backdrop-blur-xl transition hover:bg-white/70 active:scale-95"
                        >
                            <Bell className="h-4 w-4" strokeWidth={1.7} />
                            {hasUnreadUpdate && <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#d97777] ring-2 ring-[#f7f2f8]" />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-60px)] w-full max-w-[480px] flex-col px-5 pb-5 sm:min-h-[calc(100dvh-72px)] sm:px-6 sm:pb-8">
                <section className="shrink-0 pb-4 pt-2 sm:pb-6 sm:pt-4">
                    <h1 className="whitespace-nowrap text-[32px] font-semibold leading-[1.02] tracking-[-0.07em] text-[#201d24] sm:text-[42px] sm:leading-[1.05] sm:tracking-[-0.06em]">
                        听，香的味道
                    </h1>
                    <p className="ml-1 mt-3 max-w-[16rem] text-[14px] leading-6 text-[#655f6c]/78 sm:ml-1.5 sm:mt-4 sm:max-w-[18rem] sm:text-[15px] sm:leading-7">
                        一支香，一段往事。
                    </p>
                </section>

                <section aria-label="香味选择" className="flex min-h-0 flex-1 flex-col gap-3 pb-2 sm:gap-4">
                    {FRAGRANCE_LIST.map((scent) => {
                        const visual = SCENT_VISUALS[scent.id] ?? FALLBACK_VISUAL;
                        const isLocked = scent.status === 'locked';

                        return (
                            <button
                                key={scent.id}
                                data-tour-target={scent.id === FRAGRANCE_LIST.find((item) => item.status !== 'locked')?.id ? 'scent' : undefined}
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
                                    className="pointer-events-none absolute right-3 top-3 h-24 w-24 opacity-82 rounded-full blur-[48px] transition-opacity duration-500 group-hover:opacity-95 sm:right-4 sm:top-4 sm:h-32 sm:w-32 sm:blur-[56px]"
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
                        className="max-h-[94dvh] w-full overflow-y-auto rounded-t-[2rem] border border-white/80 bg-[#fffaf8] px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.75rem)] pt-5 shadow-[0_-28px_90px_rgba(94,69,72,0.12)] animate-fade-in-up"
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
                                    data-tour-target="weekly-close"
                                    onClick={closeWeeklyMoodSheet}
                                    className="rounded-full bg-slate-900/5 p-2 text-slate-700 transition hover:bg-slate-900/10 active:scale-95"
                                >
                                    <X className="h-5 w-5" strokeWidth={1.6} />
                                </button>
                            </div>

                            <button
                                type="button"
                                data-tour-target="record"
                                onClick={openManualMoodRecord}
                                className="mt-5 w-full rounded-full bg-[#6f5b68] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(111,91,104,0.18)] active:scale-[0.99]"
                            >
                                记录此刻
                            </button>

                            <section aria-label="最近七天总结" className="mt-5 grid grid-cols-2 gap-2">
                                <div className="rounded-[1.25rem] border border-white/75 bg-white/58 p-3">
                                    <p className="text-[11px] text-slate-400">最舒展的一次</p>
                                    <p className="mt-1 text-sm font-medium text-slate-700">{weeklyInsight.mostExpansive?.mood ?? '记录还比较集中'}</p>
                                </div>
                                <div className="rounded-[1.25rem] border border-white/75 bg-white/58 p-3">
                                    <p className="text-[11px] text-slate-400">最难熬的一次</p>
                                    <p className="mt-1 text-sm font-medium text-slate-700">{weeklyInsight.hardest?.mood ?? '暂不判断'}</p>
                                </div>
                                <div className="col-span-2 rounded-[1.25rem] border border-white/75 bg-white/58 p-3">
                                    <p className="text-[11px] text-slate-400">最常出现的关联</p>
                                    <p className="mt-1 text-sm font-medium text-slate-700">{weeklyInsight.relatedFactors.length ? weeklyInsight.relatedFactors.join('、') : '再多留几次记录，关联会更清楚'}</p>
                                </div>
                            </section>

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
                                                {selectedWeekRecord.source === 'timer' ? (
                                                    <>
                                                        <div className="rounded-[1rem] bg-white/52 px-3 py-2">
                                                            <p className="text-[11px] text-slate-400">点了什么香</p>
                                                            <p className="mt-1 text-sm font-medium text-slate-700">{selectedWeekRecord.scentName}</p>
                                                        </div>
                                                        <div className="rounded-[1rem] bg-white/52 px-3 py-2">
                                                            <p className="text-[11px] text-slate-400">点了多久</p>
                                                            <p className="mt-1 text-sm font-medium text-slate-700">{selectedWeekRecord.durationMinutes} 分钟</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="col-span-2 rounded-[1rem] bg-white/52 px-3 py-2">
                                                        <p className="text-[11px] text-slate-400">记录方式</p>
                                                        <p className="mt-1 text-sm font-medium text-slate-700">主动记录</p>
                                                    </div>
                                                )}
                                                <div className="rounded-[1rem] bg-white/52 px-3 py-2">
                                                    <p className="text-[11px] text-slate-400">心情如何</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-700">{selectedWeekRecord.mood}</p>
                                                </div>
                                                <div className="rounded-[1rem] bg-white/52 px-3 py-2">
                                                    <p className="text-[11px] text-slate-400">和什么有关</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-700">
                                                        {selectedWeekRecord.contextLabel ?? '未选择'}
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
            {showUpdateCenter && (
                <div className="fixed inset-0 z-50 flex items-end bg-[#fbf3f4]/68 backdrop-blur-[10px]" onClick={() => setShowUpdateCenter(false)}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="更新通知"
                        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-white/80 bg-[#fffaf8] px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.75rem)] pt-5 shadow-[0_-28px_90px_rgba(94,69,72,0.12)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-300/70" />
                        <div className="mx-auto max-w-md">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">WHAT'S NEW</p>
                                    <h2 className="mt-2 text-2xl font-medium text-slate-800">更新通知</h2>
                                </div>
                                <button type="button" aria-label="关闭更新通知" onClick={() => setShowUpdateCenter(false)} className="rounded-full bg-slate-900/5 p-2 text-slate-700">
                                    <X className="h-5 w-5" strokeWidth={1.6} />
                                </button>
                            </div>
                            <div className="mt-6 space-y-3">
                                <section aria-label="系统通知设置" className="rounded-[1.5rem] border border-[#eadfe6] bg-[#f8f0f4] p-4">
                                    <p className="text-sm font-medium text-slate-800">在系统通知里收到新消息</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">由你决定是否开启；我们只会在点击按钮后申请浏览器权限。</p>
                                    <button type="button" onClick={handleNotificationOptIn} className="mt-3 rounded-full bg-[#6f5b68] px-4 py-2 text-xs font-medium text-white">
                                        开启系统通知
                                    </button>
                                    {notificationOptInStatus === 'denied' && <p className="mt-2 text-xs text-slate-500">浏览器没有允许通知，应用内功能仍可正常使用。</p>}
                                    {notificationOptInStatus === 'unsupported' && <p className="mt-2 text-xs text-slate-500">当前浏览器不支持系统通知，应用内功能仍可正常使用。</p>}
                                    {notificationOptInStatus === 'granted' && <p className="mt-2 text-xs text-slate-500">系统通知已开启。</p>}
                                </section>
                                {updates.map((update) => (
                                    <article key={update.id} className="rounded-[1.5rem] border border-white/80 bg-white/62 p-4 shadow-[0_16px_44px_rgba(94,69,72,0.07)]">
                                        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
                                            <span>v{update.version}</span>
                                            <time dateTime={update.publishedAt}>{update.publishedAt}</time>
                                        </div>
                                        <h3 className="mt-3 text-lg font-medium text-slate-800">{update.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{update.summary}</p>
                                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                                            {update.details.map((detail) => <li key={detail}>· {detail}</li>)}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showMoodRecorder && !activeScent && (
                <MoodRecorderSheet
                    step={moodRecordStep}
                    selectedMoodId={selectedMoodId}
                    feedbackText={feedbackText}
                    onMoodSelect={handleMoodSelect}
                    onContextSelect={handleContextSelect}
                    onSkipContext={handleSkipMoodContext}
                    onBack={() => setMoodRecordStep('mood')}
                    onClose={handleSkipMoodRecord}
                    onCollect={handleCollectFeedback}
                />
            )}
            {tourStep && <FirstVisitTour step={tourStep} onSkip={finishTour} />}
        </div>
    );
};

export default Dashboard;
