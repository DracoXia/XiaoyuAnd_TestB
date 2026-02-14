import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsConfig } from './types';

/**
 * 获取 Supabase 配置
 * 从环境变量读取 URL 和 Key
 */
export function getSupabaseConfig(): AnalyticsConfig {
  const env = import.meta.env;

  // 获取 URL
  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    (env as any).NEXT_PUBLIC_SUPABASE_URL ||
    '';

  // 获取 Key - 支持多种命名格式
  const supabaseKey =
    (env as any).VITE_SUPABASE_PUBLISHABLE_KEY ||
    (env as any).VITE_SUPABASE_ANON_KEY ||
    (env as any).VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    (env as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    '';

  // Debug logging in development
  if (env.DEV) {
    console.log('[Analytics] Config loaded:', {
      url: supabaseUrl,
      hasKey: !!supabaseKey,
      keyPrefix: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'none',
    });
  }

  return {
    supabaseUrl,
    supabaseAnonKey: supabaseKey,
    enableDebugLogging: env.DEV || false,
  };
}

/**
 * 验证配置是否有效
 */
export function validateConfig(config: AnalyticsConfig): boolean {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.error('[Analytics] Missing URL or Key');
    return false;
  }

  // 验证 URL 格式
  try {
    new URL(config.supabaseUrl);
  } catch {
    console.error('[Analytics] Invalid URL format');
    return false;
  }

  return true;
}

/**
 * 创建 Supabase 客户端 (使用 @supabase/ssr)
 */
export function createSupabaseClient(url: string, key: string): SupabaseClient {
  if (!url || !key) {
    throw new Error('Supabase URL and Key are required');
  }

  // 使用 SSR 包的 createBrowserClient
  return createBrowserClient(url, key);
}

// 单例客户端实例
let _client: SupabaseClient | null = null;

/**
 * 获取 Supabase 客户端单例
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) {
    return _client;
  }

  const config = getSupabaseConfig();

  if (!validateConfig(config)) {
    throw new Error(
      'Invalid Supabase configuration. Please check your .env.local file has VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY'
    );
  }

  _client = createSupabaseClient(config.supabaseUrl, config.supabaseAnonKey);

  if (config.enableDebugLogging) {
    console.log('[Analytics] Supabase client created successfully');
  }

  return _client;
}

/**
 * 重置客户端（用于测试）
 */
export function resetSupabaseClient(): void {
  _client = null;
}
