import type { MoodRecordV2 } from './moodRecords';

const MOOD_RANK: Record<string, number> = {
  low: 0,
  anxious: 1,
  tired: 2,
  calm: 3,
  relaxed: 4,
  contented: 5,
};

export type WeeklyInsight = {
  records: MoodRecordV2[];
  mostExpansive: MoodRecordV2 | null;
  hardest: MoodRecordV2 | null;
  relatedFactors: string[];
};

export const buildWeeklyInsight = (records: MoodRecordV2[], now = new Date()): WeeklyInsight => {
  const end = now.getTime();
  const start = end - (7 * 24 * 60 * 60 * 1000);
  const recent = records
    .filter((record) => {
      const timestamp = new Date(record.createdAt).getTime();
      return Number.isFinite(timestamp) && timestamp >= start && timestamp <= end;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const factorCounts = new Map<string, number>();
  if (recent.length >= 3) {
    recent.forEach((record) => {
      if (!record.contextLabel || record.contextId === 'unclear') return;
      factorCounts.set(record.contextLabel, (factorCounts.get(record.contextLabel) ?? 0) + 1);
    });
  }
  const relatedFactors = [...factorCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label]) => label);

  const ranked = recent.filter((record) => record.moodId in MOOD_RANK);
  const distinctRanks = new Set(ranked.map((record) => MOOD_RANK[record.moodId]));
  if (distinctRanks.size < 2) {
    return { records: recent, mostExpansive: null, hardest: null, relatedFactors };
  }

  const maxRank = Math.max(...ranked.map((record) => MOOD_RANK[record.moodId]));
  const minRank = Math.min(...ranked.map((record) => MOOD_RANK[record.moodId]));
  return {
    records: recent,
    mostExpansive: ranked.find((record) => MOOD_RANK[record.moodId] === maxRank) ?? null,
    hardest: ranked.find((record) => MOOD_RANK[record.moodId] === minRank) ?? null,
    relatedFactors,
  };
};
