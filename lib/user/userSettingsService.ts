/**
 * NFC 用户设置服务
 *
 * 功能：
 * 1. 通过 NFC ID 获取/创建用户
 * 2. 管理用户偏好设置
 * 3. 关联 NFC 到用户账号
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  favorite_fragrance?: string;
  audio_mode?: 'silent' | 'natural' | 'pink' | 'brown';
  notifications?: boolean;
  custom_playlist_id?: string;
  [key: string]: unknown;
}

/**
 * NFC 关联结果
 */
export interface NFCLinkResult {
  success: boolean;
  nfcId?: string;
  error?: string;
}

/**
 * 用户信息
 */
export interface UserWithSettings {
  id: string;
  deviceId?: string;
  nfcId?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastActiveAt: Date;
}

/**
 * 获取/创建用户结果
 */
export interface GetOrCreateResult {
  isNewUser: boolean;
  user: UserWithSettings;
}

/**
 * 用户设置服务
 */
export class UserSettingsService {
  private supabase: SupabaseClient | null = null;

  /**
   * 设置 Supabase 客户端
   */
  setSupabaseClient(client: SupabaseClient): void {
    this.supabase = client;
  }

  /**
   * 通过 NFC ID 获取或创建用户
   */
  async getOrCreateUserByNFC(nfcId: string): Promise<GetOrCreateResult> {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }

    // 先尝试查找现有用户
    const { data: existingUser, error: findError } = await this.supabase
      .from('users')
      .select('id, nfc_id, device_id, preferences, created_at, last_active_at')
      .eq('nfc_id', nfcId)
      .single();

    if (existingUser && !findError) {
      // 用户存在，更新最后活跃时间
      await this.supabase
        .from('users')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', existingUser.id);

      return {
        isNewUser: false,
        user: this.mapDbUserToUser(existingUser),
      };
    }

    // 创建新用户
    const newUserData = {
      nfc_id: nfcId,
      device_id: this.generateDeviceId(),
      preferences: {},
      is_anonymous: true,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    };

    const { data: newUser, error: insertError } = await this.supabase
      .from('users')
      .insert(newUserData)
      .select('id, nfc_id, device_id, preferences, created_at, last_active_at')
      .single();

    if (insertError || !newUser) {
      throw new Error(`Failed to create user: ${insertError?.message || 'Unknown error'}`);
    }

    return {
      isNewUser: true,
      user: this.mapDbUserToUser(newUser),
    };
  }

  /**
   * 获取用户偏好
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Failed to get preferences:', error);
      return {};
    }

    return data?.preferences || {};
  }

  /**
   * 更新用户偏好
   */
  async updatePreference(
    userId: string,
    key: string,
    value: unknown
  ): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }

    // 先获取当前偏好
    const currentPrefs = await this.getPreferences(userId);

    // 合并更新
    const updatedPrefs = {
      ...currentPrefs,
      [key]: value,
    };

    const { error } = await this.supabase
      .from('users')
      .update({ preferences: updatedPrefs })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update preference: ${error.message}`);
    }
  }

  /**
   * 将 NFC ID 关联到用户
   */
  async linkNFCtoUser(userId: string, nfcId: string): Promise<NFCLinkResult> {
    if (!this.supabase) {
      return {
        success: false,
        error: 'Supabase client not configured',
      };
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ nfc_id: nfcId })
        .eq('id', userId)
        .select('id, nfc_id')
        .single();

      if (error) {
        // PostgreSQL unique violation (23505) 表示 NFC ID 已被使用
        if (error.code === '23505') {
          return {
            success: false,
            error: 'NFC ID already linked to another user',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        nfcId: data.nfc_id,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * 生成设备 ID
   */
  private generateDeviceId(): string {
    return crypto.randomUUID();
  }

  /**
   * 将数据库用户映射到用户对象
   */
  private mapDbUserToUser(dbUser: Record<string, unknown>): UserWithSettings {
    return {
      id: dbUser.id as string,
      deviceId: dbUser.device_id as string | undefined,
      nfcId: dbUser.nfc_id as string | undefined,
      preferences: (dbUser.preferences as UserPreferences) || {},
      createdAt: new Date(dbUser.created_at as string),
      lastActiveAt: new Date(dbUser.last_active_at as string),
    };
  }
}

// 导出单例实例
export const userSettingsService = new UserSettingsService();
