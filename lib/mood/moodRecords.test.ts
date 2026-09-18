import { describe, expect, it } from 'vitest';
import { normalizeMoodRecord, readMoodRecords, saveMoodRecord } from './moodRecords';

describe('mood record compatibility', () => {
  it('reads a V1 timer record through the V2 public shape', () => {
    const record = normalizeMoodRecord({
      version: 1,
      id: 'legacy-1',
      createdAt: '2026-09-18T10:00:00.000Z',
      scentId: 'tinghe',
      scentName: '听荷',
      durationMinutes: 15,
      durationSeconds: 900,
      moodId: 'calm',
      mood: '平静',
      related: ['工作'],
    });

    expect(record).toMatchObject({
      version: 2,
      id: 'legacy-1',
      source: 'timer',
      moodId: 'calm',
      contextId: 'workload',
      feedbackId: 'calm-workload-1',
      scentId: 'tinghe',
      scentName: '听荷',
      durationMinutes: 15,
    });
  });

  it('saves a manual record without scent or duration fields', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    saveMoodRecord({
      version: 2,
      id: 'manual-1',
      source: 'manual',
      createdAt: '2026-09-18T11:00:00.000Z',
      moodId: 'anxious',
      mood: '焦虑',
      contextId: 'recognition',
      contextLabel: '评价认可',
      feedbackId: 'anxious-recognition-1',
    }, storage);

    const [saved] = readMoodRecords(storage);
    expect(saved).toEqual(expect.objectContaining({ id: 'manual-1', source: 'manual' }));
    expect(saved).not.toHaveProperty('scentId');
    expect(saved).not.toHaveProperty('durationMinutes');
  });
});
