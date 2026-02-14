/**
 * 小屿和数据埋点系统 - 类型定义
 * 用于验证 PRD 中定义的核心假设
 */

// === 用户相关 ===

export interface User {
  id: string;
  deviceId: string;
  createdAt: Date;
  lastActiveAt: Date;
}

// === 会话相关 ===

export type EntryType = 'nfc' | 'dashboard';

export interface Session {
  id: string;
  userId: string;
  fragranceId: string;
  entryType: EntryType;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number | null;
  audioCompleted: boolean | null;
  ambianceMode: string | null;
  fragranceSwitched: boolean;
}

// === 事件类型 ===

export type AnalyticsEventType =
  // 入口与启动
  | 'nfc_trigger'
  | 'session_start'
  | 'fragrance_confirm'  // 香型确认点击（漏斗关键节点）
  | 'fragrance_switch'
  // 沉浸过程
  | 'ritual_complete'
  | 'session_end'
  | 'audio_toggle'
  | 'ambiance_change'
  // 心情记录
  | 'mood_select'
  | 'context_select'
  | 'mood_self_eval'
  // 社交互动
  | 'medicine_submit'
  | 'give_hug'
  | 'receive_echo';

// === 事件数据结构 ===

export interface BaseEventData {
  userId: string;
  sessionId?: string | null;
  timestamp: Date;
}

export interface NFCTriggerEventData extends BaseEventData {
  eventType: 'nfc_trigger';
  fragranceId: string;
}

export interface SessionStartEventData extends BaseEventData {
  eventType: 'session_start';
  fragranceId: string;
  entryType: EntryType;
}

export interface FragranceConfirmEventData extends BaseEventData {
  eventType: 'fragrance_confirm';
  fragranceId: string;
  entryType: EntryType;
  wasSwitched: boolean;  // 是否切换过香型（One-Tap Success 指标）
}

export interface FragranceSwitchEventData extends BaseEventData {
  eventType: 'fragrance_switch';
  fromFragranceId: string;
  toFragranceId: string;
}

export interface RitualCompleteEventData extends BaseEventData {
  eventType: 'ritual_complete';
  fragranceId: string;
}

export interface SessionEndEventData extends BaseEventData {
  eventType: 'session_end';
  durationSeconds: number;
  audioCompleted: boolean;
}

export interface AudioToggleEventData extends BaseEventData {
  eventType: 'audio_toggle';
  isPlaying: boolean;
  wasManuallyToggled: boolean;
}

export interface AmbianceChangeEventData extends BaseEventData {
  eventType: 'ambiance_change';
  fromMode: string;
  toMode: string;
}

export interface MoodSelectEventData extends BaseEventData {
  eventType: 'mood_select';
  mood: string;
}

export interface ContextSelectEventData extends BaseEventData {
  eventType: 'context_select';
  context: string;
  mood: string;
}

export interface MoodSelfEvalEventData extends BaseEventData {
  eventType: 'mood_self_eval';
  evaluation: 'much_better' | 'better' | 'same' | 'worse';
}

export interface MedicineSubmitEventData extends BaseEventData {
  eventType: 'medicine_submit';
  contentLength: number;
}

export interface GiveHugEventData extends BaseEventData {
  eventType: 'give_hug';
  targetEchoId: string;
}

export interface ReceiveEchoEventData extends BaseEventData {
  eventType: 'receive_echo';
  echoId: string;
  matchedMood: string;
  matchedContext: string;
}

// 联合类型
export type AnalyticsEventData =
  | NFCTriggerEventData
  | SessionStartEventData
  | FragranceConfirmEventData
  | FragranceSwitchEventData
  | RitualCompleteEventData
  | SessionEndEventData
  | AudioToggleEventData
  | AmbianceChangeEventData
  | MoodSelectEventData
  | ContextSelectEventData
  | MoodSelfEvalEventData
  | MedicineSubmitEventData
  | GiveHugEventData
  | ReceiveEchoEventData;

// === 心情记录 ===

export type MoodSelfEvaluation = 'much_better' | 'better' | 'same' | 'worse';

export interface MoodRecord {
  id: string;
  sessionId: string;
  userId: string;
  moodAfter: string;
  context: string | null;
  selfEvaluation: MoodSelfEvaluation | null;
  createdAt: Date;
}

// === 社交互动 ===

export type SocialInteractionType = 'medicine_submit' | 'give_hug' | 'receive_echo';

export interface SocialInteraction {
  id: string;
  userId: string;
  sessionId: string;
  interactionType: SocialInteractionType;
  targetId: string | null;
  createdAt: Date;
}

// === 分析服务接口 ===

export interface IAnalyticsService {
  // 用户管理
  getOrCreateUser(): Promise<User>;
  getCurrentUser(): User | null;

  // 会话管理
  startSession(fragranceId: string, entryType: EntryType): Promise<string>;
  endSession(sessionId: string, durationSeconds: number, audioCompleted: boolean): Promise<void>;
  getCurrentSessionId(): string | null;

  // 事件追踪
  trackEvent(eventData: Omit<AnalyticsEventData, 'userId' | 'sessionId' | 'timestamp'>): Promise<void>;

  // 心情记录
  recordMood(sessionId: string, mood: string, context: string | null): Promise<void>;
  updateMoodSelfEvaluation(sessionId: string, evaluation: MoodSelfEvaluation): Promise<void>;
}

// === 配置 ===

export interface AnalyticsConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableDebugLogging: boolean;
}

// === 入口检测 ===

export interface EntryDetectionResult {
  type: EntryType;
  fragranceId?: string;
  isFromNFC: boolean;
}

// NFC URL 有效时间窗口（5分钟）
export const NFC_VALID_WINDOW_MS = 5 * 60 * 1000;
