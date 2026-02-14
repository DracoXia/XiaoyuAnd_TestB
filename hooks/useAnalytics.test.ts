import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalytics, setAnalyticsService, type AnalyticsService } from './useAnalytics';

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

describe('useAnalytics', () => {
  let mockAnalyticsService: AnalyticsService;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();

    // Reset the service instance
    setAnalyticsService(null);

    mockAnalyticsService = {
      getOrCreateUser: vi.fn().mockResolvedValue({ id: 'user-1' }),
      startSession: vi.fn().mockResolvedValue('session-1'),
      endSession: vi.fn().mockResolvedValue(undefined),
      updateAudioMode: vi.fn().mockResolvedValue(undefined),
      trackEvent: vi.fn().mockResolvedValue(undefined),
      recordMood: vi.fn().mockResolvedValue(undefined),
      updateMoodSelfEvaluation: vi.fn().mockResolvedValue(undefined),
      getCurrentSessionId: vi.fn().mockReturnValue(null),
      clearSession: vi.fn(),
    };
  });

  describe('initialization', () => {
    it('should initialize user on mount', async () => {
      setAnalyticsService(mockAnalyticsService);

      const { result } = renderHook(() => useAnalytics());

      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(mockAnalyticsService.getOrCreateUser).toHaveBeenCalled();
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.userId).toBe('user-1');
    });

    it('should handle missing service gracefully', async () => {
      // Don't set a service

      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.userId).toBe(null);
    });
  });

  describe('startSession', () => {
    it('should start a session and return session ID', async () => {
      setAnalyticsService(mockAnalyticsService);

      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      let sessionId: string = '';
      await act(async () => {
        sessionId = await result.current.startSession('tinghe', 'dashboard');
      });

      expect(mockAnalyticsService.startSession).toHaveBeenCalledWith('tinghe', 'dashboard');
      expect(sessionId).toBe('session-1');
    });
  });

  describe('endSession', () => {
    it('should end the current session', async () => {
      setAnalyticsService(mockAnalyticsService);

      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await act(async () => {
        await result.current.endSession('session-1', 300, true);
      });

      expect(mockAnalyticsService.endSession).toHaveBeenCalledWith('session-1', 300, true);
    });
  });

  describe('trackEvent', () => {
    it('should track an event', async () => {
      setAnalyticsService(mockAnalyticsService);

      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await act(async () => {
        await result.current.trackEvent({
          eventType: 'mood_select',
          mood: '有点累',
        });
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith({
        eventType: 'mood_select',
        mood: '有点累',
      });
    });
  });

  describe('recordMood', () => {
    it('should record mood with context', async () => {
      setAnalyticsService(mockAnalyticsService);

      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await act(async () => {
        await result.current.recordMood('session-1', '有点累', '工作/学业');
      });

      expect(mockAnalyticsService.recordMood).toHaveBeenCalledWith('session-1', '有点累', '工作/学业');
    });
  });

  describe('recordMoodSelfEvaluation', () => {
    it('should update mood self evaluation', async () => {
      setAnalyticsService(mockAnalyticsService);

      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await act(async () => {
        await result.current.recordMoodSelfEvaluation('session-1', 'much_better');
      });

      expect(mockAnalyticsService.updateMoodSelfEvaluation).toHaveBeenCalledWith('session-1', 'much_better');
    });
  });

  describe('getCurrentSessionId', () => {
    it('should return current session ID', async () => {
      vi.mocked(mockAnalyticsService.getCurrentSessionId).mockReturnValue('current-session');
      setAnalyticsService(mockAnalyticsService);

      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.getCurrentSessionId()).toBe('current-session');
    });
  });
});
