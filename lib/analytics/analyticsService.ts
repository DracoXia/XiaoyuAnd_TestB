import type {
  User,
  Session,
  EntryType,
  AnalyticsEventType,
  AnalyticsEventData,
  MoodSelfEvaluation,
  IAnalyticsService,
} from './types';
import { UserService } from './userService';

const SESSION_STORAGE_KEY = 'xiaoyu_current_session';

/**
 * Supabase 客户端接口
 */
interface SupabaseClient {
  from(table: string): SupabaseQueryBuilder;
}

interface SupabaseQueryBuilder {
  insert(data: any): SupabaseQueryBuilder;
  select(columns?: string): SupabaseQueryBuilder;
  update(data: any): SupabaseQueryBuilder;
  eq(column: string, value: any): SupabaseQueryBuilder;
  single(): Promise<{ data: any; error: any }>;
}

/**
 * 分析服务 - 处理所有埋点事件
 */
export class AnalyticsService implements IAnalyticsService {
  private userService: UserService;
  private supabase: SupabaseClient;
  private currentSessionId: string | null = null;

  constructor(supabaseClient: SupabaseClient) {
    this.userService = new UserService();
    this.supabase = supabaseClient;
    // 将 Supabase 客户端传递给 UserService，以便用户数据能写入数据库
    this.userService.setSupabaseClient(supabaseClient);
    this.loadSessionFromStorage();
  }

  // === 用户管理 ===

  async getOrCreateUser(): Promise<User> {
    return this.userService.getOrCreateUser();
  }

  getCurrentUser(): User | null {
    return this.userService.getCurrentUser();
  }

  // === 会话管理 ===

  async startSession(fragranceId: string, entryType: EntryType): Promise<string> {
    const user = await this.getOrCreateUser();

    const sessionData = {
      user_id: user.id,
      fragrance_id: fragranceId,
      entry_type: entryType,
      started_at: new Date().toISOString(),
      fragrance_switched: false,
    };

    const { data, error } = await this.supabase
      .from('sessions')
      .insert(sessionData)
      .select('id')
      .single();

    if (error || !data) {
      throw new Error(`Failed to start session: ${error?.message || 'Unknown error'}`);
    }

    this.currentSessionId = data.id;
    this.saveSessionToStorage(data.id);

    return data.id;
  }

  async endSession(
    sessionId: string,
    durationSeconds: number,
    audioCompleted: boolean
  ): Promise<void> {
    const updateData = {
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      audio_completed: audioCompleted,
    };

    await this.supabase.from('sessions').update(updateData).eq('id', sessionId);

    this.clearSession();
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  clearSession(): void {
    this.currentSessionId = null;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear session from storage:', error);
    }
  }

  // === 事件追踪 ===

  async trackEvent(
    eventData: Omit<AnalyticsEventData, 'userId' | 'sessionId' | 'timestamp'>
  ): Promise<void> {
    try {
      const user = await this.getOrCreateUser();

      const eventRecord = {
        user_id: user.id,
        session_id: this.currentSessionId,
        event_type: eventData.eventType,
        event_data: this.extractEventData(eventData),
        created_at: new Date().toISOString(),
      };

      await this.supabase.from('analytics_events').insert(eventRecord);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // === 心情记录 ===

  async recordMood(sessionId: string, mood: string, context: string | null): Promise<void> {
    const user = await this.getOrCreateUser();

    const moodRecord = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      user_id: user.id,
      mood_after: mood,
      context: context,
      self_evaluation: null,
      created_at: new Date().toISOString(),
    };

    await this.supabase.from('mood_records').insert(moodRecord);
  }

  async updateMoodSelfEvaluation(
    sessionId: string,
    evaluation: MoodSelfEvaluation
  ): Promise<void> {
    await this.supabase
      .from('mood_records')
      .update({ self_evaluation: evaluation })
      .eq('session_id', sessionId);
  }

  // === 私有方法 ===

  private extractEventData(
    eventData: Omit<AnalyticsEventData, 'userId' | 'sessionId' | 'timestamp'>
  ): Record<string, any> {
    const { eventType, ...rest } = eventData as any;
    return rest;
  }

  private loadSessionFromStorage(): void {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentSessionId = parsed.sessionId;
      }
    } catch (error) {
      console.warn('Failed to load session from storage:', error);
    }
  }

  private saveSessionToStorage(sessionId: string): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ sessionId }));
    } catch (error) {
      console.warn('Failed to save session to storage:', error);
    }
  }
}

// 导出工厂函数，用于创建带真实 Supabase 客户端的实例
export function createAnalyticsService(supabaseClient: SupabaseClient): AnalyticsService {
  return new AnalyticsService(supabaseClient);
}
