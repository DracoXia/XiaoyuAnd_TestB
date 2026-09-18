import { describe, expect, it } from 'vitest';
import { CONTEXT_OPTIONS, MOOD_OPTIONS } from './options';
import { FEEDBACK_LIBRARY, getNextFeedback } from './feedback';

describe('mood feedback library', () => {
  it('contains five unique messages for every mood/context combination and mood-only fallback', () => {
    const keys = MOOD_OPTIONS.flatMap((mood) => [
      ...CONTEXT_OPTIONS.map((context) => `${mood.id}:${context.id}`),
      `${mood.id}:none`,
    ]);

    expect(keys).toHaveLength(78);
    for (const key of keys) {
      const messages = FEEDBACK_LIBRARY[key];
      expect(messages, key).toHaveLength(5);
      expect(new Set(messages).size, key).toBe(5);
      expect(messages.every((message) => message.split('。').filter(Boolean).length >= 2), key).toBe(true);
    }
  });

  it('rotates all five messages before repeating a combination', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    const sequence = Array.from({ length: 6 }, () => getNextFeedback('anxious', 'recognition', storage));
    expect(new Set(sequence.slice(0, 5).map((item) => item.id)).size).toBe(5);
    expect(sequence[5].id).toBe(sequence[0].id);
  });
});
