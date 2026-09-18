import { describe, expect, it, vi } from 'vitest';
import { FIRST_VISIT_TOUR_STORAGE_KEY, getInitialTourStep, nextTourStep } from './firstVisitTour';

describe('first visit tour', () => {
  it('starts only for a first-time user outside review mode', () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    expect(getInitialTourStep(storage, false)).toBe('scent');
    expect(getInitialTourStep(storage, true)).toBeNull();
    storage.getItem = vi.fn().mockReturnValue('completed');
    expect(getInitialTourStep(storage, false)).toBeNull();
    expect(storage.getItem).toHaveBeenCalledWith(FIRST_VISIT_TOUR_STORAGE_KEY);
  });

  it('advances through one focused action at a time', () => {
    const sequence = ['scent', 'timer', 'timer-settings', 'story', 'story-close', 'home', 'weekly', 'record', 'mood', 'context', 'collect', 'weekly-close', 'notification'] as const;
    sequence.forEach((step, index) => {
      expect(nextTourStep(step)).toBe(sequence[index + 1] ?? null);
    });
  });
});
