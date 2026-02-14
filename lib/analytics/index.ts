/**
 * 小屿和数据埋点系统
 *
 * 导出所有公共 API
 */

// 类型
export type {
  User,
  Session,
  EntryType,
  AudioMode,
  AnalyticsEventType,
  AnalyticsEventData,
  AnalyticsConfig,
  MoodSelfEvaluation,
  MoodRecord,
  SocialInteraction,
  SocialInteractionType,
  IAnalyticsService,
  FragranceConfirmEventData,
  EntryDetectionResult,
} from './types';

// 常量
export { NFC_VALID_WINDOW_MS } from './types';

// 入口检测工具
export {
  detectEntryType,
  clearNFCParams,
  checkAndLogNFCEntry,
} from './entryDetection';

// 服务
export { UserService, userService } from './userService';
export { AnalyticsService, createAnalyticsService } from './analyticsService';

// Supabase 客户端
export {
  getSupabaseConfig,
  validateConfig,
  createSupabaseClient,
  getSupabaseClient,
  resetSupabaseClient,
} from './supabaseClient';

// 测试工具
export { testSupabaseConnection } from './test-connection';

// 便捷追踪函数
import { getSupabaseClient } from './supabaseClient';
import { AnalyticsService } from './analyticsService';

let _analyticsService: AnalyticsService | null = null;

/**
 * 获取分析服务单例
 */
export function getAnalyticsService(): AnalyticsService {
  if (!_analyticsService) {
    const client = getSupabaseClient();
    _analyticsService = new AnalyticsService(client);
  }
  return _analyticsService;
}

/**
 * 重置分析服务（用于测试）
 */
export function resetAnalyticsService(): void {
  _analyticsService = null;
}
