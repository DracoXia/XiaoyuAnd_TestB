export type MoodRecordSource = 'timer' | 'manual';

export type MoodRecordV2 = {
  version: 2;
  id: string;
  source: MoodRecordSource;
  createdAt: string;
  moodId: string;
  mood: string;
  contextId: string | null;
  contextLabel: string | null;
  feedbackId: string;
  scentId?: string;
  scentName?: string;
  durationMinutes?: number;
};

type MoodStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const MOOD_RECORD_STORAGE_KEY = 'xiaoyu_scent_mood_records_v1';

type LegacyMoodRecord = {
  version: 1;
  id: string;
  createdAt: string;
  scentId: string;
  scentName: string;
  durationMinutes: number;
  moodId: string;
  mood: string;
  related?: string[];
};

const LEGACY_CONTEXT_IDS: Record<string, string> = {
  工作: 'workload',
  家人: 'family',
  关系: 'colleagues',
  睡眠: 'sleep',
  身体: 'body',
  未来: 'career-future',
  自己: 'unclear',
  '说不清': 'unclear',
};

export const normalizeMoodRecord = (value: unknown): MoodRecordV2 | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as Partial<Omit<MoodRecordV2, 'version'>> & {
    version?: number;
    related?: LegacyMoodRecord['related'];
  };

  if (record.version === 2 && record.id && record.createdAt && record.moodId && record.mood) {
    return record as MoodRecordV2;
  }

  if (record.version !== 1 || !record.id || !record.createdAt || !record.moodId || !record.mood) {
    return null;
  }

  const related = Array.isArray(record.related) ? record.related[0] : undefined;
  const contextId = related ? LEGACY_CONTEXT_IDS[related] ?? 'unclear' : null;

  return {
    version: 2,
    id: record.id,
    source: 'timer',
    createdAt: record.createdAt,
    moodId: record.moodId,
    mood: record.mood,
    contextId,
    contextLabel: related ?? null,
    feedbackId: `${record.moodId}-${contextId ?? 'none'}-1`,
    scentId: record.scentId,
    scentName: record.scentName,
    durationMinutes: record.durationMinutes,
  };
};

const getDefaultStorage = (): MoodStorage | null => (
  typeof window === 'undefined' ? null : window.localStorage
);

export const readMoodRecords = (storage: MoodStorage | null = getDefaultStorage()): MoodRecordV2[] => {
  if (!storage) return [];

  try {
    const raw = storage.getItem(MOOD_RECORD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeMoodRecord).filter((record): record is MoodRecordV2 => Boolean(record));
  } catch {
    return [];
  }
};

export const saveMoodRecord = (
  record: MoodRecordV2,
  storage: MoodStorage | null = getDefaultStorage(),
) => {
  if (!storage) return;
  storage.setItem(MOOD_RECORD_STORAGE_KEY, JSON.stringify([record, ...readMoodRecords(storage)]));
};
