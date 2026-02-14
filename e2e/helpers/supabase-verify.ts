/**
 * Supabase 数据验证辅助工具
 *
 * 用于 E2E 测试中验证数据是否正确写入 Supabase 数据库
 *
 * 注意：这个文件提供了验证接口，实际验证通过以下方式完成：
 * 1. Playwright 测试运行后，使用 Supabase MCP 工具查询数据库
 * 2. 在测试中使用 API 直接查询（需要 service role key）
 * 3. 通过 console 日志验证前端发送了正确的请求
 */

import { test, expect } from '@playwright/test';

/**
 * 分析事件类型
 */
export type AnalyticsEventType =
  | 'session_start'
  | 'session_end'
  | 'fragrance_switch'
  | 'ambiance_change'
  | 'audio_toggle'
  | 'mood_select'
  | 'context_select'
  | 'medicine_submit'
  | 'give_hug'
  | 'ritual_complete';

/**
 * 预期的分析事件
 */
export interface ExpectedAnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp?: number; // 事件发生的大致时间
  data?: Record<string, any>; // 预期的附加数据
}

/**
 * Supabase 验证器类
 * 在 E2E 测试中收集和验证分析事件
 */
export class SupabaseVerifier {
  private events: Array<{ type: string; data: any; timestamp: number }> = [];
  private page: any;

  constructor(page: any) {
    this.page = page;
    this.setupListeners();
  }

  /**
   * 设置控制台和网络监听器
   */
  private setupListeners() {
    // 监听控制台日志
    this.page.on('console', (msg: any) => {
      const text = msg.text();

      // 捕获 Analytics 相关日志
      if (text.includes('[Analytics]')) {
        console.log(`📊 Analytics Log: ${text}`);

        // 解析事件类型
        const eventMatch = text.match(/event_type[=:]\s*['"]?(\w+)['"]?/);
        if (eventMatch) {
          this.events.push({
            type: eventMatch[1],
            data: {},
            timestamp: Date.now(),
          });
        }
      }
    });

    // 监听网络请求
    this.page.on('request', (request: any) => {
      const url = request.url();

      // 捕获发送到 Supabase 的请求
      if (url.includes('supabase.co') && url.includes('/rest/v1/')) {
        const method = request.method();
        const postData = request.postData();

        if (method === 'POST' && postData) {
          try {
            const data = JSON.parse(postData);
            console.log(`📤 Supabase POST to ${url.split('/').pop()}:`, data);

            this.events.push({
              type: `db_insert_${url.split('/').pop()}`,
              data,
              timestamp: Date.now(),
            });
          } catch {
            // Ignore parse errors
          }
        }
      }
    });
  }

  /**
   * 获取所有捕获的事件
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * 获取特定类型的事件
   */
  getEventsByType(type: string) {
    return this.events.filter(e => e.type === type || e.type.includes(type));
  }

  /**
   * 验证是否有特定类型的事件
   */
  hasEvent(type: string): boolean {
    return this.events.some(e => e.type === type || e.type.includes(type));
  }

  /**
   * 等待特定事件出现
   */
  async waitForEvent(type: string, timeout = 5000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (this.hasEvent(type)) {
        return true;
      }
      await this.page.waitForTimeout(100);
    }

    return false;
  }

  /**
   * 清除所有事件
   */
  clear() {
    this.events = [];
  }

  /**
   * 打印事件摘要
   */
  printSummary() {
    console.log('\n📊 Analytics Events Summary:');
    console.log('═'.repeat(50));

    const eventCounts: Record<string, number> = {};
    for (const event of this.events) {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
    }

    for (const [type, count] of Object.entries(eventCounts)) {
      console.log(`  ${type}: ${count}`);
    }

    console.log('═'.repeat(50));
    console.log(`Total: ${this.events.length} events\n`);
  }
}

/**
 * 创建验证器实例
 */
export function createVerifier(page: any): SupabaseVerifier {
  return new SupabaseVerifier(page);
}

/**
 * Supabase 数据库查询辅助函数
 * 这些函数用于生成验证查询语句，可以在测试后手动执行
 */
export const SupabaseQueries = {
  /**
   * 查询最近的会话
   */
  getRecentSessions: `
    SELECT id, user_id, fragrance_id, entry_type, started_at, ended_at, duration_seconds
    FROM sessions
    ORDER BY started_at DESC
    LIMIT 10;
  `,

  /**
   * 查询最近的分析事件
   */
  getRecentEvents: `
    SELECT id, user_id, session_id, event_type, event_data, created_at
    FROM analytics_events
    ORDER BY created_at DESC
    LIMIT 20;
  `,

  /**
   * 查询特定用户的所有事件
   */
  getUserEvents: (userId: string) => `
    SELECT * FROM analytics_events
    WHERE user_id = '${userId}'
    ORDER BY created_at DESC;
  `,

  /**
   * 查询特定会话的所有事件
   */
  getSessionEvents: (sessionId: string) => `
    SELECT * FROM analytics_events
    WHERE session_id = '${sessionId}'
    ORDER BY created_at;
  `,

  /**
   * 统计各类型事件数量
   */
  getEventTypeCounts: `
    SELECT event_type, COUNT(*) as count
    FROM analytics_events
    GROUP BY event_type
    ORDER BY count DESC;
  `,

  /**
   * 查询最近的心情记录
   */
  getRecentMoodRecords: `
    SELECT id, session_id, mood_after, context, self_evaluation, created_at
    FROM mood_records
    ORDER BY created_at DESC
    LIMIT 10;
  `,

  /**
   * 计算今日活跃用户数
   */
  getDailyActiveUsers: `
    SELECT COUNT(DISTINCT user_id) as active_users
    FROM sessions
    WHERE started_at >= CURRENT_DATE;
  `,

  /**
   * 漏斗分析：完成各步骤的用户数
   */
  getFunnelStats: `
    SELECT
      (SELECT COUNT(DISTINCT user_id) FROM sessions) as total_sessions,
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_type = 'mood_select') as mood_selected,
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_type = 'medicine_submit') as submitted_medicine,
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_type = 'give_hug') as gave_hug;
  `,
};

/**
 * 验证数据库中存在特定事件
 * 使用 Supabase MCP 工具执行
 */
export async function verifyEventInDatabase(
  eventType: AnalyticsEventType,
  options?: {
    userId?: string;
    sessionId?: string;
    minCount?: number;
    timeRange?: { start: Date; end: Date };
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  // 这个函数需要在测试外部使用 Supabase MCP 工具执行
  // 这里返回一个提示信息
  return {
    success: false,
    message: `请在测试完成后使用 Supabase MCP 工具执行以下查询来验证 ${eventType} 事件：\n${SupabaseQueries.getRecentEvents}`,
  };
}

/**
 * 测试辅助：验证事件流程
 */
export async function verifyEventFlow(
  verifier: SupabaseVerifier,
  expectedEvents: AnalyticsEventType[]
): Promise<{ passed: boolean; missing: string[] }> {
  const missing: string[] = [];

  for (const eventType of expectedEvents) {
    if (!verifier.hasEvent(eventType)) {
      missing.push(eventType);
    }
  }

  return {
    passed: missing.length === 0,
    missing,
  };
}
