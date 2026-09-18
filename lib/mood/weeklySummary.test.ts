import { describe, expect, it } from 'vitest';
import type { MoodRecordV2 } from './moodRecords';
import { buildWeeklyInsight } from './weeklySummary';

const record = (overrides: Partial<MoodRecordV2>): MoodRecordV2 => ({
  version: 2,
  id: overrides.id ?? 'record',
  source: overrides.source ?? 'manual',
  createdAt: overrides.createdAt ?? '2026-09-18T10:00:00.000Z',
  moodId: overrides.moodId ?? 'calm',
  mood: overrides.mood ?? '平静',
  contextId: overrides.contextId ?? null,
  contextLabel: overrides.contextLabel ?? null,
  feedbackId: overrides.feedbackId ?? 'calm-none-1',
  ...overrides,
});

describe('weekly mood insight', () => {
  it('finds the most expansive and hardest recent records across manual and timer sources', () => {
    const insight = buildWeeklyInsight([
      record({ id: 'manual-low', source: 'manual', moodId: 'low', mood: '低落', createdAt: '2026-09-17T09:00:00.000Z' }),
      record({ id: 'timer-calm', source: 'timer', moodId: 'calm', mood: '平静', createdAt: '2026-09-18T09:00:00.000Z', scentId: 'tinghe', scentName: '听荷', durationMinutes: 15 }),
      record({ id: 'manual-contented', source: 'manual', moodId: 'contented', mood: '满足', createdAt: '2026-09-18T10:00:00.000Z' }),
    ], new Date('2026-09-18T12:00:00.000Z'));

    expect(insight.mostExpansive?.id).toBe('manual-contented');
    expect(insight.hardest?.id).toBe('manual-low');
  });

  it('does not force peaks when the week contains only one mood level', () => {
    const insight = buildWeeklyInsight([
      record({ id: 'calm-1', moodId: 'calm', mood: '平静' }),
      record({ id: 'calm-2', moodId: 'calm', mood: '平静', createdAt: '2026-09-18T11:00:00.000Z' }),
    ], new Date('2026-09-18T12:00:00.000Z'));

    expect(insight.mostExpansive).toBeNull();
    expect(insight.hardest).toBeNull();
  });

  it('shows at most two repeated factors and ignores unclear or skipped entries', () => {
    const insight = buildWeeklyInsight([
      record({ id: 'a', contextId: 'recognition', contextLabel: '评价认可' }),
      record({ id: 'b', contextId: 'recognition', contextLabel: '评价认可', moodId: 'tired', mood: '疲惫' }),
      record({ id: 'c', contextId: 'workload', contextLabel: '工作量', moodId: 'relaxed', mood: '轻松' }),
      record({ id: 'd', contextId: 'workload', contextLabel: '工作量', moodId: 'anxious', mood: '焦虑' }),
      record({ id: 'e', contextId: 'unclear', contextLabel: '说不清', moodId: 'low', mood: '低落' }),
      record({ id: 'f', contextId: null, contextLabel: null, moodId: 'contented', mood: '满足' }),
    ], new Date('2026-09-18T12:00:00.000Z'));

    expect(insight.relatedFactors).toEqual(['评价认可', '工作量']);
  });
});
