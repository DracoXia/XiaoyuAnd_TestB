import { useState, useEffect, useCallback, useRef } from 'react';
import type { EntryType, MoodSelfEvaluation } from '../lib/analytics/types';

/**
 * 分析服务接口（用于 Hook）
 */
export interface AnalyticsService {
  getOrCreateUser(): Promise<{ id: string }>;
  startSession(fragranceId: string, entryType: EntryType): Promise<string>;
  endSession(sessionId: string, durationSeconds: number, audioCompleted: boolean): Promise<void>;
  trackEvent(eventData: any): Promise<void>;
  recordMood(sessionId: string, mood: string, context: string | null): Promise<void>;
  updateMoodSelfEvaluation(sessionId: string, evaluation: MoodSelfEvaluation): Promise<void>;
  getCurrentSessionId(): string | null;
  clearSession(): void;
}

// 全局服务实例（可被测试覆盖）
let _serviceInstance: AnalyticsService | null = null;
let _initPromise: Promise<AnalyticsService | null> | null = null;

/**
 * 设置分析服务实例（用于测试或初始化）
 */
export function setAnalyticsService(service: AnalyticsService | null): void {
  _serviceInstance = service;
}

/**
 * 获取分析服务实例（同步版本，可能返回 null）
 */
export function getAnalyticsService(): AnalyticsService | null {
  return _serviceInstance;
}

/**
 * 初始化并获取分析服务实例（异步版本）
 */
export async function initAnalyticsService(): Promise<AnalyticsService | null> {
  if (_serviceInstance) {
    return _serviceInstance;
  }

  // 避免重复初始化
  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = (async () => {
    try {
      // 使用动态 import（ESM 兼容）
      const { getAnalyticsService: getService } = await import('../lib/analytics');
      _serviceInstance = getService();
      return _serviceInstance;
    } catch (error) {
      console.warn('Analytics service not available:', error);
      return null;
    }
  })();

  return _initPromise;
}

/**
 * 分析埋点 Hook 返回值
 */
export interface UseAnalyticsReturn {
  isInitialized: boolean;
  userId: string | null;
  startSession: (fragranceId: string, entryType: EntryType) => Promise<string>;
  endSession: (sessionId: string, durationSeconds: number, audioCompleted: boolean) => Promise<void>;
  trackEvent: (eventData: any) => Promise<void>;
  recordMood: (sessionId: string, mood: string, context: string | null) => Promise<void>;
  recordMoodSelfEvaluation: (sessionId: string, evaluation: MoodSelfEvaluation) => Promise<void>;
  getCurrentSessionId: () => string | null;
}

/**
 * 分析埋点 Hook
 *
 * 提供便捷的埋点功能，自动处理用户初始化
 *
 * @example
 * ```tsx
 * const analytics = useAnalytics();
 *
 * // 开始会话
 * const sessionId = await analytics.startSession('tinghe', 'dashboard');
 *
 * // 追踪事件
 * await analytics.trackEvent({ eventType: 'mood_select', mood: '有点累' });
 *
 * // 结束会话
 * await analytics.endSession(sessionId, 300, true);
 * ```
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const serviceRef = useRef<AnalyticsService | null>(null);

  // 初始化用户
  useEffect(() => {
    let mounted = true;

    async function initUser() {
      // 使用异步初始化
      const service = await initAnalyticsService();
      if (!service) {
        if (mounted) {
          setIsInitialized(true);
        }
        return;
      }

      serviceRef.current = service;

      try {
        const user = await service.getOrCreateUser();

        if (mounted) {
          setUserId(user.id);
          setIsInitialized(true);
        }
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    }

    initUser();

    return () => {
      mounted = false;
    };
  }, []);

  const startSession = useCallback(async (fragranceId: string, entryType: EntryType): Promise<string> => {
    if (!serviceRef.current) {
      console.warn('Analytics service not initialized');
      return '';
    }
    return serviceRef.current.startSession(fragranceId, entryType);
  }, []);

  const endSession = useCallback(async (
    sessionId: string,
    durationSeconds: number,
    audioCompleted: boolean
  ): Promise<void> => {
    if (!serviceRef.current) {
      console.warn('Analytics service not initialized');
      return;
    }
    return serviceRef.current.endSession(sessionId, durationSeconds, audioCompleted);
  }, []);

  const trackEvent = useCallback(async (eventData: any): Promise<void> => {
    if (!serviceRef.current) {
      console.warn('Analytics service not initialized');
      return;
    }
    return serviceRef.current.trackEvent(eventData);
  }, []);

  const recordMood = useCallback(async (
    sessionId: string,
    mood: string,
    context: string | null
  ): Promise<void> => {
    if (!serviceRef.current) {
      console.warn('Analytics service not initialized');
      return;
    }
    return serviceRef.current.recordMood(sessionId, mood, context);
  }, []);

  const recordMoodSelfEvaluation = useCallback(async (
    sessionId: string,
    evaluation: MoodSelfEvaluation
  ): Promise<void> => {
    if (!serviceRef.current) {
      console.warn('Analytics service not initialized');
      return;
    }
    return serviceRef.current.updateMoodSelfEvaluation(sessionId, evaluation);
  }, []);

  const getCurrentSessionId = useCallback((): string | null => {
    if (!serviceRef.current) {
      return null;
    }
    return serviceRef.current.getCurrentSessionId();
  }, []);

  return {
    isInitialized,
    userId,
    startSession,
    endSession,
    trackEvent,
    recordMood,
    recordMoodSelfEvaluation,
    getCurrentSessionId,
  };
}

export default useAnalytics;
