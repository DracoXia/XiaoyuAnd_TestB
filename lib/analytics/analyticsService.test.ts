import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AnalyticsService } from './analyticsService';
import type { AnalyticsEventData, EntryType } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock crypto.randomUUID
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => `uuid-${++uuidCounter}`),
  },
  writable: true,
});

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
});

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockSupabaseClient: {
    from: vi.Mock;
    insert: vi.Mock;
    select: vi.Mock;
    single: vi.Mock;
    update: vi.Mock;
    eq: vi.Mock;
  };

  beforeEach(() => {
    localStorageMock.clear();
    uuidCounter = 0;
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      from: vi.fn(() => mockSupabaseClient),
      insert: vi.fn(() => mockSupabaseClient),
      select: vi.fn(() => mockSupabaseClient),
      single: vi.fn(() => Promise.resolve({ data: { id: 'session-uuid-1' }, error: null })),
      update: vi.fn(() => mockSupabaseClient),
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    };

    analyticsService = new AnalyticsService(mockSupabaseClient as any);
  });

  describe('getOrCreateUser', () => {
    it('should create a new user on first call', async () => {
      const user = await analyticsService.getOrCreateUser();

      expect(user).toBeDefined();
      expect(user.deviceId).toBe('uuid-1');
      expect(user.id).toBe('uuid-1');
    });

    it('should return existing user on subsequent calls', async () => {
      const firstUser = await analyticsService.getOrCreateUser();
      const secondUser = await analyticsService.getOrCreateUser();

      expect(secondUser.id).toBe(firstUser.id);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user exists', () => {
      expect(analyticsService.getCurrentUser()).toBeNull();
    });

    it('should return user after getOrCreateUser', async () => {
      await analyticsService.getOrCreateUser();
      expect(analyticsService.getCurrentUser()).not.toBeNull();
    });
  });

  describe('startSession', () => {
    it('should create a session and return session ID', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'new-session-id' },
        error: null,
      });

      const sessionId = await analyticsService.startSession('tinghe', 'dashboard');

      expect(sessionId).toBe('new-session-id');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should store session ID in localStorage', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'stored-session-id' },
        error: null,
      });

      await analyticsService.startSession('tinghe', 'nfc');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'xiaoyu_current_session',
        expect.stringContaining('stored-session-id')
      );
    });

    it('should throw error if Supabase fails', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: new Error('DB error'),
      });

      await expect(analyticsService.startSession('tinghe', 'dashboard')).rejects.toThrow();
    });
  });

  describe('endSession', () => {
    it('should update session with end time and duration', async () => {
      // Start a session first
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'test-session' },
        error: null,
      });
      await analyticsService.startSession('tinghe', 'dashboard');

      // End session
      await analyticsService.endSession('test-session', 300, true);

      expect(mockSupabaseClient.update).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'test-session');
    });
  });

  describe('getCurrentSessionId', () => {
    it('should return null when no session exists', () => {
      expect(analyticsService.getCurrentSessionId()).toBeNull();
    });

    it('should return session ID after startSession', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'my-session' },
        error: null,
      });

      await analyticsService.startSession('tinghe', 'dashboard');

      expect(analyticsService.getCurrentSessionId()).toBe('my-session');
    });
  });

  describe('trackEvent', () => {
    it('should track session_start event', async () => {
      await analyticsService.getOrCreateUser();

      await analyticsService.trackEvent({
        eventType: 'session_start',
        fragranceId: 'tinghe',
        entryType: 'dashboard',
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('analytics_events');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'session_start',
          event_data: expect.objectContaining({
            fragranceId: 'tinghe',
            entryType: 'dashboard',
          }),
        })
      );
    });

    it('should track mood_select event', async () => {
      await analyticsService.getOrCreateUser();

      await analyticsService.trackEvent({
        eventType: 'mood_select',
        mood: '有点累',
      });

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'mood_select',
          event_data: expect.objectContaining({
            mood: '有点累',
          }),
        })
      );
    });

    it('should track give_hug event', async () => {
      await analyticsService.getOrCreateUser();

      await analyticsService.trackEvent({
        eventType: 'give_hug',
        targetEchoId: 'echo-123',
      });

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'give_hug',
          event_data: expect.objectContaining({
            targetEchoId: 'echo-123',
          }),
        })
      );
    });

    it('should include user ID in all events', async () => {
      const user = await analyticsService.getOrCreateUser();

      await analyticsService.trackEvent({
        eventType: 'audio_toggle',
        isPlaying: false,
        wasManuallyToggled: true,
      });

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: user.id,
        })
      );
    });

    it('should handle errors gracefully', async () => {
      await analyticsService.getOrCreateUser();

      mockSupabaseClient.insert.mockImplementationOnce(() => {
        throw new Error('Network error');
      });

      // Should not throw
      await expect(analyticsService.trackEvent({
        eventType: 'mood_select',
        mood: '有点累',
      })).resolves.not.toThrow();

      // Should log error
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('recordMood', () => {
    it('should insert mood record', async () => {
      await analyticsService.getOrCreateUser();

      await analyticsService.recordMood('session-1', '有点累', '工作/学业');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('mood_records');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'session-1',
          mood_after: '有点累',
          context: '工作/学业',
        })
      );
    });

    it('should allow null context', async () => {
      await analyticsService.getOrCreateUser();

      await analyticsService.recordMood('session-1', '想静静', null);

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          context: null,
        })
      );
    });
  });

  describe('updateMoodSelfEvaluation', () => {
    it('should update mood record with self evaluation', async () => {
      await analyticsService.getOrCreateUser();

      await analyticsService.updateMoodSelfEvaluation('session-1', 'much_better');

      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          self_evaluation: 'much_better',
        })
      );
    });
  });

  describe('clearSession', () => {
    it('should clear session from localStorage', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'to-clear' },
        error: null,
      });

      await analyticsService.startSession('tinghe', 'dashboard');
      analyticsService.clearSession();

      expect(analyticsService.getCurrentSessionId()).toBeNull();
    });
  });
});
